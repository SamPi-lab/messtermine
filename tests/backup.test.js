import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  backupFileName, createBackup, parseBackup, backupAgeDays, needsBackupHint,
} from '../backup.js';
import { DEFAULT_SETTINGS, withDefaults } from '../settings.js';

const appointment = (changes = {}) => ({
  id: 'P-01', date: '2026-10-04', time: '10:00', durationMin: 60, location: 'Uni',
  status: 'geplant', mailOffsets: { 1: -5, 2: 0, 3: 2 }, sent: { 1: true, 2: false, 3: false },
  ...changes,
});
const fileWith = (changes) => JSON.stringify({
  app: 'messtermine', version: 1, lastBackupAt: '2026-10-01T16:30:00.000Z',
  appointments: [appointment()], settings: DEFAULT_SETTINGS, ...changes,
});

test('S5-A1 Dateiname mit Datum', () => {
  assert.equal(backupFileName(new Date(2026, 9, 1, 18, 30)), 'messtermine-backup-2026-10-01.json');
});

test('S5-A2 Backup erzeugen und wiederherstellen ergibt denselben Stand', () => {
  const settings = { ...withDefaults(), reminderTime: '07:00' };
  const state = { version: 1, appointments: [appointment(), appointment({ id: 'P-02' })], settings };
  const now = new Date('2026-10-01T16:30:00.000Z');
  const { text, lastBackupAt } = createBackup(state, now);
  assert.equal(lastBackupAt, '2026-10-01T16:30:00.000Z');
  const { data, error } = parseBackup(text);
  assert.equal(error, undefined);
  assert.deepEqual(data, { ...state, lastBackupAt });
});

test('S5-A3 kaputte oder fremde Dateien werden abgelehnt', () => {
  for (const text of ['{kaputt', '"Text"', 'null', '{"foo": 1}', fileWith({ version: 2 }),
    fileWith({ app: 'andere' }), fileWith({ appointments: 'nein' })]) {
    const result = parseBackup(text);
    assert.equal(result.error, 'Diese Datei ist kein Backup der Messtermine-App.', text);
    assert.equal(result.data, undefined);
  }
});

test('S5-A4 unvollständiger Termin wird mit Nummer gemeldet', () => {
  const noDate = fileWith({ appointments: [appointment(), appointment({ date: undefined })] });
  assert.equal(parseBackup(noDate).error, 'Termin 2 im Backup ist unvollständig.');
  const badStatus = fileWith({ appointments: [appointment({ status: 'egal' })] });
  assert.equal(parseBackup(badStatus).error, 'Termin 1 im Backup ist unvollständig.');
});

test('S5-A5 alte Termine und fehlende Einstellungen bekommen Standardwerte', () => {
  const old = appointment();
  delete old.location;
  delete old.mailOffsets;
  const { data } = parseBackup(fileWith({ appointments: [old], settings: undefined }));
  assert.equal(data.appointments[0].location, DEFAULT_SETTINGS.location);
  assert.deepEqual(data.appointments[0].mailOffsets, { 1: -3, 2: -1, 3: 1 });
  assert.deepEqual(data.settings, DEFAULT_SETTINGS);
});

test('S5-A6 Backup ohne Termine ist gültig', () => {
  const { data } = parseBackup(fileWith({ appointments: [] }));
  assert.deepEqual(data.appointments, []);
});

test('S5-A7 bis A9 Hinweis „Backup fällig“', () => {
  const now = new Date(2026, 9, 10, 12, 0);
  const daysAgo = (n) => new Date(2026, 9, 10 - n, 20, 0).toISOString();
  assert.equal(needsBackupHint({ appointments: [], lastBackupAt: null }, now), false);
  assert.equal(needsBackupHint({ appointments: [appointment()], lastBackupAt: null }, now), true);
  assert.equal(needsBackupHint({ appointments: [appointment()], lastBackupAt: daysAgo(3) }, now), false);
  assert.equal(needsBackupHint({ appointments: [appointment()], lastBackupAt: daysAgo(4) }, now), true);
});

test('S5-A10 Alter des Backups in Kalendertagen, auch über die Zeitumstellung', () => {
  assert.equal(backupAgeDays(null, new Date()), null);
  const before = new Date(2026, 9, 24, 23, 30).toISOString();
  assert.equal(backupAgeDays(before, new Date(2026, 9, 24, 23, 59)), 0);
  assert.equal(backupAgeDays(before, new Date(2026, 9, 25, 0, 10)), 1);
  assert.equal(backupAgeDays(before, new Date(2026, 9, 26, 0, 30)), 2);
});
