import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  suggestNextId, formatDateDe, dueDate, dueMails, fillTemplate, mailtoHref, sortAppointments,
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
