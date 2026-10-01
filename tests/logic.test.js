import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  suggestNextId, formatDateDe, dueDate, dueMails, fillTemplate, mailtoHref, sortAppointments,
  isArchived, validateAppointment, applyEdit,
} from '../logic.js';
import { TEMPLATES } from '../templates.js';

const appt = (date, sent = {}) => ({
  id: 'P-07', date, time: '10:00', durationMin: 60, status: 'geplant',
  sent: { 1: false, 2: false, 3: false, ...sent },
});
const ids = (...list) => list.map((id) => ({ id }));

test('A1 ID-Vorschlag', () => {
  assert.equal(suggestNextId([]), 'P-01');
  assert.equal(suggestNextId(ids('P-01', 'P-02')), 'P-03');
  assert.equal(suggestNextId(ids('P-01', 'P-05')), 'P-06');
  assert.equal(suggestNextId(ids('P-99')), 'P-100');
});

test('A2 Datum formatieren', () => {
  assert.equal(formatDateDe('2026-10-14'), 'Mittwoch, 14. Oktober');
  assert.equal(formatDateDe('2026-11-01'), 'Sonntag, 1. November');
});

test('A3 Fälligkeit über Sommerzeit-Umstellung', () => {
  const a = appt('2026-10-27');
  assert.deepEqual([1, 2, 3].map((nr) => dueDate(a, nr)), ['2026-10-24', '2026-10-26', '2026-10-28']);
});

test('A4 Fälligkeit über Monatsgrenze', () => {
  const a = appt('2026-11-01');
  assert.deepEqual([1, 2, 3].map((nr) => dueDate(a, nr)), ['2026-10-29', '2026-10-31', '2026-11-02']);
});

test('A5 noch keine Mail fällig', () => {
  assert.deepEqual(dueMails(appt('2026-10-14'), '2026-10-10'), []);
});

test('A6 genau 3 Tage vorher: Mail 1 fällig', () => {
  assert.deepEqual(dueMails(appt('2026-10-14'), '2026-10-11'), [1]);
});

test('A7 kurzfristiger Termin: Mail 1 und 2 sofort fällig', () => {
  assert.deepEqual(dueMails(appt('2026-10-14'), '2026-10-13'), [1, 2]);
});

test('A8 gesendete Mail ist nicht mehr fällig', () => {
  assert.deepEqual(dueMails(appt('2026-10-14', { 1: true }), '2026-10-13'), [2]);
});

test('A9 Vorlagen füllen', () => {
  for (const nr of [1, 2, 3]) {
    const { subject, body } = fillTemplate(TEMPLATES[nr], appt('2026-10-14'));
    assert.doesNotMatch(subject + body, /[{}]/, `Mail ${nr} enthält Platzhalter`);
  }
  const m1 = fillTemplate(TEMPLATES[1], appt('2026-10-14'));
  assert.equal(m1.subject, 'Ihr Messtermin am Mittwoch, 14. Oktober – Infos zur Vorbereitung');
  assert.match(m1.body, /am Mittwoch, 14\. Oktober um 10:00 Uhr/);
  const m2 = fillTemplate(TEMPLATES[2], appt('2026-10-14'));
  assert.equal(m2.subject, 'Erinnerung: Ihr Messtermin morgen um 10:00 Uhr');
});

test('A10 mailto-Rundreise', () => {
  for (const nr of [1, 2, 3]) {
    const { subject, body } = fillTemplate(TEMPLATES[nr], appt('2026-10-14'));
    const href = mailtoHref(subject, body);
    const match = /^mailto:\?subject=([^&]*)&body=([^&]*)$/.exec(href);
    assert.ok(match, `Mail ${nr}: unerwartetes Format`);
    assert.doesNotMatch(href, /\+/, 'kein + statt Leerzeichen');
    assert.equal(decodeURIComponent(match[1]), subject);
    assert.equal(decodeURIComponent(match[2]).replaceAll('\r\n', '\n'), body);
  }
});

test('Sortierung nach Datum und Uhrzeit', () => {
  const list = [
    { id: 'P-01', date: '2026-10-05', time: '14:00' },
    { id: 'P-02', date: '2026-10-03', time: '09:00' },
    { id: 'P-03', date: '2026-10-05', time: '08:30' },
  ];
  assert.deepEqual(sortAppointments(list).map((a) => a.id), ['P-02', 'P-03', 'P-01']);
});

// --- Slice 03: Status, Vergangene, Prüfung, Bearbeiten ---------------------

const withStatus = (status, date = '2026-10-14', sent = {}) => ({ ...appt(date, sent), status });

test('S3-A1 Mail 1/2 verfallen nach dem Messtag', () => {
  assert.deepEqual(dueMails(appt('2026-10-14'), '2026-10-15'), [3]);
});

test('S3-A2 am Messtag sind Mail 1/2 noch fällig', () => {
  assert.deepEqual(dueMails(appt('2026-10-14'), '2026-10-14'), [1, 2]);
});

test('S3-A3 durchgeführt: nur noch Mail 3', () => {
  assert.deepEqual(dueMails(withStatus('durchgeführt'), '2026-10-14'), []);
  assert.deepEqual(dueMails(withStatus('durchgeführt'), '2026-10-15'), [3]);
});

test('S3-A4 abgesagt: keine Mail fällig', () => {
  assert.deepEqual(dueMails(withStatus('abgesagt'), '2026-10-15'), []);
});

test('S3-A5 abgesagt in der Zukunft ist archiviert', () => {
  assert.equal(isArchived(withStatus('abgesagt', '2026-11-20'), '2026-10-01'), true);
});

test('S3-A6 gestern mit offener Dank-Mail bleibt oben', () => {
  assert.equal(isArchived(appt('2026-10-14'), '2026-10-15'), false);
  assert.equal(isArchived(appt('2026-10-14', { 3: true }), '2026-10-15'), true);
});

test('S3-A7 heute oder Zukunft, geplant: nicht archiviert', () => {
  assert.equal(isArchived(appt('2026-10-14'), '2026-10-14'), false);
  assert.equal(isArchived(appt('2026-10-14', { 1: true, 2: true, 3: true }), '2026-10-14'), false);
  assert.equal(isArchived(appt('2026-10-20'), '2026-10-14'), false);
});

const input = (changes = {}) => ({ id: 'P-08', date: '2026-10-14', time: '10:00', durationMin: 60, ...changes });

test('S3-A8 Prüfung der Eingaben', () => {
  const list = [appt('2026-10-14')];
  assert.equal(validateAppointment(input(), list), null);
  assert.equal(validateAppointment(input({ id: '7' }), list), 'Bitte eine ID im Format P-01 eingeben.');
  assert.equal(validateAppointment(input({ id: 'P-07' }), list), 'P-07 ist bereits vergeben.');
  assert.equal(validateAppointment(input({ date: '' }), list), 'Bitte ein Datum wählen.');
  assert.equal(validateAppointment(input({ time: '' }), list), 'Bitte eine Uhrzeit wählen.');
  assert.equal(validateAppointment(input({ durationMin: 300 }), list), 'Dauer bitte zwischen 5 und 240 Minuten.');
});

test('S3-A9 Bearbeiten mit eigener ID ist kein Doppel', () => {
  const list = [appt('2026-10-14'), { ...appt('2026-10-20'), id: 'P-08' }];
  assert.equal(validateAppointment(input({ id: 'P-07' }), list, 'P-07'), null);
  assert.equal(validateAppointment(input({ id: 'P-08' }), list, 'P-07'), 'P-08 ist bereits vergeben.');
});

const edit = (changes) => ({ id: 'P-07', date: '2026-10-14', time: '10:00', durationMin: 60, status: 'geplant', ...changes });

test('S3-A10 Datum oder Uhrzeit geändert: Häkchen weg, Kalender prüfen', () => {
  for (const changes of [{ date: '2026-10-16' }, { time: '11:00' }]) {
    const result = applyEdit(appt('2026-10-14', { 1: true }), edit(changes));
    assert.deepEqual(result.appointment.sent, { 1: false, 2: false, 3: false });
    assert.equal(result.checkCalendar, true);
  }
});

test('S3-A11 nur Dauer oder Status geändert: Häkchen bleiben', () => {
  for (const changes of [{ durationMin: 45 }, { status: 'durchgeführt' }]) {
    const result = applyEdit(appt('2026-10-14', { 1: true }), edit(changes));
    assert.deepEqual(result.appointment.sent, { 1: true, 2: false, 3: false });
    assert.equal(result.checkCalendar, false);
    assert.equal(result.appointment[Object.keys(changes)[0]], Object.values(changes)[0]);
  }
});

test('S3-A12 nur ID geändert: Häkchen bleiben, Kalender prüfen', () => {
  const original = appt('2026-10-14', { 1: true });
  const result = applyEdit(original, edit({ id: 'P-70' }));
  assert.equal(result.appointment.id, 'P-70');
  assert.deepEqual(result.appointment.sent, { 1: true, 2: false, 3: false });
  assert.equal(result.checkCalendar, true);
  assert.equal(original.id, 'P-07', 'Original bleibt unverändert');
});
