import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SETTINGS, withDefaults, withAppointmentDefaults, validateSettings } from '../settings.js';

const settings = (changes = {}) => ({ ...withDefaults(), ...changes });

test('S4-A0 Termin aus der Zeit vor Slice 04', () => {
  const old = { id: 'P-01', date: '2026-10-04', time: '10:00', durationMin: 60, status: 'geplant', sent: {} };
  const a = withAppointmentDefaults(old);
  assert.deepEqual(a.mailOffsets, { 1: -3, 2: -1, 3: 1 });
  assert.equal(a.location, DEFAULT_SETTINGS.location);
  const own = withAppointmentDefaults({ ...old, location: 'Uni', mailOffsets: { 1: -5, 2: 0, 3: 2 } });
  assert.equal(own.location, 'Uni');
  assert.deepEqual(own.mailOffsets, { 1: -5, 2: 0, 3: 2 });
});

test('S4-A1 ohne gespeicherte Einstellungen: Standardwerte', () => {
  assert.deepEqual(withDefaults(undefined), DEFAULT_SETTINGS);
  assert.deepEqual(withDefaults({}), DEFAULT_SETTINGS);
  assert.deepEqual(withDefaults('kaputt'), DEFAULT_SETTINGS);
});

test('S4-A2 nur Uhrzeit gespeichert: Rest Standard', () => {
  const s = withDefaults({ reminderTime: '07:00', templates: { 2: { subject: 'Neu' } } });
  assert.equal(s.reminderTime, '07:00');
  assert.equal(s.templates[2].subject, 'Neu');
  assert.equal(s.templates[2].body, DEFAULT_SETTINGS.templates[2].body);
  assert.deepEqual({ ...s, reminderTime: '06:30', templates: DEFAULT_SETTINGS.templates }, DEFAULT_SETTINGS);
});

test('S4-A3 ungültige Einstellungen', () => {
  const offsets = (o) => settings({ mailOffsets: { 1: -3, 2: -1, 3: 1, ...o } });
  assert.equal(validateSettings(offsets({ 1: 0 })), 'Mail 1: bitte 1 bis 14 Tage vor der Messung.');
  assert.equal(validateSettings(offsets({ 1: -1.5 })), 'Mail 1: bitte 1 bis 14 Tage vor der Messung.');
  assert.equal(validateSettings(offsets({ 2: 1 })), 'Mail 2: bitte 0 bis 14 Tage vor der Messung.');
  assert.equal(validateSettings(offsets({ 1: -2, 2: -3 })), 'Mail 2 darf nicht vor Mail 1 fällig sein.');
  assert.equal(validateSettings(offsets({ 3: 15 })), 'Mail 3: bitte 0 bis 14 Tage nach der Messung.');
  assert.equal(validateSettings(settings({ reminderTime: '' })), 'Bitte eine Uhrzeit für die Erinnerung wählen.');
  assert.equal(validateSettings(settings({ durationMin: 300 })), 'Dauer bitte zwischen 5 und 240 Minuten.');
  assert.equal(validateSettings(settings({ location: '' })), 'Bitte einen Standard-Ort eingeben.');
  const templates = { ...DEFAULT_SETTINGS.templates, 2: { subject: '', body: 'x' } };
  assert.equal(validateSettings(settings({ templates })), 'Mail 2: Bitte einen Betreff eingeben.');
  templates[3] = { subject: 'x', body: '' };
  templates[2] = { subject: 'x', body: 'x' };
  assert.equal(validateSettings(settings({ templates })), 'Mail 3: Bitte einen Text eingeben.');
});

test('S4-A4 Standardwerte und Grenzwerte sind gültig', () => {
  assert.equal(validateSettings(DEFAULT_SETTINGS), null);
  assert.equal(validateSettings(settings({ mailOffsets: { 1: -14, 2: 0, 3: 0 } })), null);
  assert.equal(validateSettings(settings({ mailOffsets: { 1: -2, 2: -2, 3: 14 } })), null);
});
