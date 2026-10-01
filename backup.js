// Backup: Datei erzeugen, beim Wiederherstellen prüfen, Hinweis „Backup fällig“.
// Reine Funktionen ohne DOM; "jetzt" wird immer übergeben.
// Die Datei ist der gespeicherte Stand aus app.js plus Kennung und Backup-Zeitpunkt.

import { addDays, formatDateDe, todayStr } from './logic.js';
import { withAppointmentDefaults, withDefaults } from './settings.js';

const APP = 'messtermine';
const HINT_AFTER_DAYS = 3;
const STATUSES = ['geplant', 'durchgeführt', 'abgesagt'];

export function backupFileName(now) {
  return `${APP}-backup-${todayStr(now)}.json`;
}

// lastBackupAt ist zugleich der Zeitpunkt in der Datei und der neue Stand in der App
export function createBackup({ appointments, settings }, now) {
  const lastBackupAt = now.toISOString();
  const text = JSON.stringify({ app: APP, version: 1, lastBackupAt, appointments, settings }, null, 2);
  return { text, lastBackupAt };
}

function isValidAppointment(a) {
  return a && typeof a === 'object'
    && typeof a.id === 'string' && a.id !== ''
    && /^\d{4}-\d{2}-\d{2}$/.test(a.date)
    && /^\d{2}:\d{2}$/.test(a.time)
    && typeof a.durationMin === 'number'
    && STATUSES.includes(a.status)
    && a.sent && typeof a.sent === 'object';
}

// { data } mit ergänzten Standardwerten oder { error }
export function parseBackup(text) {
  let file;
  try {
    file = JSON.parse(text);
  } catch {
    file = null;
  }
  if (!file || file.app !== APP || file.version !== 1 || !Array.isArray(file.appointments)) {
    return { error: 'Diese Datei ist kein Backup der Messtermine-App.' };
  }
  const broken = file.appointments.findIndex((a) => !isValidAppointment(a));
  if (broken !== -1) return { error: `Termin ${broken + 1} im Backup ist unvollständig.` };

  const lastBackupAt = Number.isNaN(Date.parse(file.lastBackupAt)) ? null : file.lastBackupAt;
  return {
    data: {
      version: 1,
      appointments: file.appointments.map(withAppointmentDefaults),
      settings: withDefaults(file.settings),
      lastBackupAt,
    },
  };
}

// Ganze Kalendertage (Ortszeit) seit dem Backup, null ohne Backup
export function backupAgeDays(lastBackupAt, now) {
  if (!lastBackupAt) return null;
  const from = todayStr(new Date(lastBackupAt));
  const to = todayStr(now);
  let days = 0;
  while (addDays(from, days) < to) days++;
  return days;
}

export function needsBackupHint({ appointments, lastBackupAt }, now) {
  if (!appointments.length) return false;
  const age = backupAgeDays(lastBackupAt, now);
  return age === null || age > HINT_AFTER_DAYS;
}

// „Donnerstag, 1. Oktober, 18:30 Uhr“
export function formatBackupTime(lastBackupAt) {
  const date = new Date(lastBackupAt);
  const time = date.toTimeString().slice(0, 5);
  return `${formatDateDe(todayStr(date))}, ${time} Uhr`;
}
