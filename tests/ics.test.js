import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calendarEvents, buildIcs } from '../ics.js';
import { DEFAULT_SETTINGS } from '../settings.js';

const LOCATION = DEFAULT_SETTINGS.location;
const appt = (date, time = '10:00', durationMin = 60, sent = {}) => ({
  id: 'P-07', date, time, durationMin, status: 'geplant', location: LOCATION,
  mailOffsets: { ...DEFAULT_SETTINGS.mailOffsets }, sent: { 1: false, 2: false, 3: false, ...sent },
});
// Ortszeit: Monat 1-basiert, damit die Tests lesbar bleiben
const at = (y, mo, d, h = 12, mi = 0) => new Date(y, mo - 1, d, h, mi);

// .ics-Text → Einträge als Objekte { SUMMARY: ..., 'DTSTART;TZID=Europe/Berlin': ... }
function parseEvents(ics) {
  const unfolded = ics.replace(/\r\n /g, '');
  return [...unfolded.matchAll(/BEGIN:VEVENT\r\n([\s\S]*?)END:VEVENT/g)].map(([, block]) =>
    Object.fromEntries(block.split('\r\n').filter(Boolean).map((line) => {
      const i = line.indexOf(':');
      return [line.slice(0, i), line.slice(i + 1)];
    })));
}
const start = (e) => e['DTSTART;TZID=Europe/Berlin'];
const end = (e) => e['DTEND;TZID=Europe/Berlin'];
const bySummary = (events) => Object.fromEntries(events.map((e) => [e.SUMMARY, e]));

test('A1 vier Einträge zu den richtigen Zeiten', () => {
  const e = bySummary(parseEvents(buildIcs(appt('2026-10-14'), at(2026, 10, 1))));
  assert.deepEqual(Object.keys(e), ['Messung P-07', 'P-07 Mail 1', 'P-07 Mail 2', 'P-07 Mail 3']);
  assert.equal(start(e['Messung P-07']), '20261014T100000');
  assert.equal(end(e['Messung P-07']), '20261014T110000');
  assert.equal(start(e['P-07 Mail 1']), '20261011T063000');
  assert.equal(end(e['P-07 Mail 1']), '20261011T064500');
  assert.equal(start(e['P-07 Mail 2']), '20261013T063000');
  assert.equal(start(e['P-07 Mail 3']), '20261015T063000');
});

test('A2 Sommerzeit-Umstellung: Ortszeit mit Zeitzone', () => {
  const e = bySummary(parseEvents(buildIcs(appt('2026-10-27', '10:00', 45), at(2026, 10, 1))));
  assert.equal(start(e['Messung P-07']), '20261027T100000');
  assert.equal(end(e['Messung P-07']), '20261027T104500');
  assert.equal(start(e['P-07 Mail 1']), '20261024T063000');
});

test('A3 Ende über die volle Stunde', () => {
  const [messung] = calendarEvents(appt('2026-10-14', '09:30', 45), at(2026, 10, 1));
  assert.deepEqual(messung.end, { date: '2026-10-14', time: '10:15' });
});

test('A4 kurzfristig: vergangene Erinnerungen 5–10 Min nach jetzt', () => {
  const e = bySummary(parseEvents(buildIcs(appt('2026-10-14'), at(2026, 10, 13, 7, 2))));
  assert.equal(Object.keys(e).length, 4);
  assert.equal(start(e['P-07 Mail 1']), '20261013T071000');
  assert.equal(start(e['P-07 Mail 2']), '20261013T071000');
  assert.equal(start(e['P-07 Mail 3']), '20261015T063000');
});

test('A5 Grenzfall: 6:30 liegt noch vor uns', () => {
  const e = bySummary(parseEvents(buildIcs(appt('2026-10-14'), at(2026, 10, 13, 6, 0))));
  assert.equal(start(e['P-07 Mail 1']), '20261013T061000');
  assert.equal(start(e['P-07 Mail 2']), '20261013T063000');
});

test('A5b Verschieben über Mitternacht', () => {
  const e = bySummary(parseEvents(buildIcs(appt('2026-10-14'), at(2026, 10, 13, 23, 57))));
  assert.equal(start(e['P-07 Mail 1']), '20261014T000500');
  assert.equal(end(e['P-07 Mail 1']), '20261014T002000');
});

test('A6 gesendete Mail bekommt keine Erinnerung', () => {
  const e = bySummary(parseEvents(buildIcs(appt('2026-10-14', '10:00', 60, { 1: true }), at(2026, 10, 1))));
  assert.deepEqual(Object.keys(e), ['Messung P-07', 'P-07 Mail 2', 'P-07 Mail 3']);
});

test('A7 Alarme', () => {
  const e = bySummary(parseEvents(buildIcs(appt('2026-10-14'), at(2026, 10, 1))));
  assert.equal(e['Messung P-07'].TRIGGER, '-PT1H');
  for (const nr of [1, 2, 3]) assert.equal(e[`P-07 Mail ${nr}`].TRIGGER, 'PT0S');
  for (const event of Object.values(e)) assert.equal(event.ACTION, 'DISPLAY');
});

test('A8 Titel, stabile UIDs, keine Personendaten', () => {
  const ics1 = buildIcs(appt('2026-10-14'), at(2026, 10, 1));
  const ics2 = buildIcs(appt('2026-10-14'), at(2026, 10, 2));
  const uids = parseEvents(ics1).map((e) => e.UID);
  assert.equal(new Set(uids).size, 4);
  assert.deepEqual(parseEvents(ics2).map((e) => e.UID), uids);
  assert.doesNotMatch(ics1, /Herr|Frau|Hallo/);
});

test('A9 Dateiformat', () => {
  const ics = buildIcs(appt('2026-10-14'), at(2026, 10, 1));
  assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\n'));
  assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
  assert.doesNotMatch(ics.replaceAll('\r\n', ''), /[\r\n]/, 'nur CRLF als Zeilenende');
  const lines = ics.slice(0, -2).split('\r\n');
  for (const line of lines) {
    assert.ok(new TextEncoder().encode(line).length <= 75, `zu lang: ${line}`);
  }
  for (const key of ['VERSION:2.0', 'PRODID:', 'DTSTAMP:']) assert.ok(ics.includes(key), key);
  const begins = lines.filter((l) => l.startsWith('BEGIN:')).map((l) => l.slice(6));
  const ends = lines.filter((l) => l.startsWith('END:')).map((l) => l.slice(4));
  assert.deepEqual(begins.sort(), ends.sort());
});

test('A10 Ort mit Sonderzeichen übersteht Falten und Maskieren', () => {
  const ics = buildIcs(appt('2026-10-14'), at(2026, 10, 1));
  const location = parseEvents(ics)[0].LOCATION.replace(/\\([\\;,])/g, '$1');
  assert.equal(location, LOCATION);
  assert.ok(new TextEncoder().encode(`LOCATION:${LOCATION}`).length > 75, 'Test prüft wirklich das Falten');
});

test('A11 Zeitzone Europe/Berlin', () => {
  const ics = buildIcs(appt('2026-10-14'), at(2026, 10, 1));
  assert.equal(ics.match(/BEGIN:VTIMEZONE/g).length, 1);
  assert.match(ics, /TZID:Europe\/Berlin/);
  assert.match(ics, /BEGIN:DAYLIGHT[\s\S]*BYMONTH=3;BYDAY=-1SU[\s\S]*END:DAYLIGHT/);
  assert.match(ics, /BEGIN:STANDARD[\s\S]*BYMONTH=10;BYDAY=-1SU[\s\S]*END:STANDARD/);
});

test('S4-A6 eigene Uhrzeit und Mail-Tage', () => {
  const a = { ...appt('2026-10-14'), mailOffsets: { 1: -5, 2: -1, 3: 1 } };
  const e = bySummary(parseEvents(buildIcs(a, at(2026, 10, 1), '07:00')));
  assert.equal(start(e['P-07 Mail 1']), '20261009T070000');
  assert.equal(start(e['P-07 Mail 2']), '20261013T070000');
  assert.equal(start(e['Messung P-07']), '20261014T100000');
});

test('S4-A10 eigener Ort in der Messung', () => {
  const [messung] = calendarEvents({ ...appt('2026-10-14'), location: 'Uni Mainz, Raum 02-123' }, at(2026, 10, 1));
  assert.equal(messung.location, 'Uni Mainz, Raum 02-123');
});
