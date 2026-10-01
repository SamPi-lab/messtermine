// Einstellungen: Standardwerte, Ergänzen fehlender Werte und Prüfung.
// Reine Funktionen ohne DOM. Gespeichert werden sie in app.js neben den Terminen.

import { TEMPLATES } from './templates.js';

export const DEFAULT_SETTINGS = {
  // Tage relativ zum Messtermin, ab denen die Mail fällig ist (negativ = vorher).
  // Jeder Termin übernimmt sie beim Anlegen; Änderungen gelten nur für neue Termine.
  mailOffsets: { 1: -3, 2: -1, 3: 1 },
  reminderTime: '06:30', // Kalender-Erinnerung an die Mails
  durationMin: 60, // Vorschlag für neue Termine
  location: 'home of vitality, Große Bleiche 18–20, Mainz (Eingang links neben Netto, 2. Stock)',
  templates: Object.fromEntries([1, 2, 3].map((nr) =>
    [nr, { subject: TEMPLATES[nr].subject, body: TEMPLATES[nr].body }])),
};

// Gespeicherte Einstellungen, fehlende Werte aus DEFAULT_SETTINGS
export function withDefaults(stored) {
  const s = stored && typeof stored === 'object' ? stored : {};
  const d = DEFAULT_SETTINGS;
  return {
    mailOffsets: { ...d.mailOffsets, ...s.mailOffsets },
    reminderTime: s.reminderTime || d.reminderTime,
    durationMin: s.durationMin || d.durationMin,
    location: s.location || d.location,
    templates: Object.fromEntries([1, 2, 3].map((nr) =>
      [nr, { ...d.templates[nr], ...s.templates?.[nr] }])),
  };
}

// Termine aus der Zeit vor den Einstellungen haben weder Ort noch Mail-Tage:
// Sie bekommen die ursprünglichen Werte, nicht die aktuell eingestellten.
export function withAppointmentDefaults(appointment) {
  return {
    location: DEFAULT_SETTINGS.location,
    ...appointment,
    mailOffsets: { ...DEFAULT_SETTINGS.mailOffsets, ...appointment.mailOffsets },
  };
}

const between = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;

// Fehlertext oder null
export function validateSettings({ mailOffsets, reminderTime, durationMin, location, templates }) {
  if (!between(-mailOffsets[1], 1, 14)) return 'Mail 1: bitte 1 bis 14 Tage vor der Messung.';
  if (!between(-mailOffsets[2], 0, 14)) return 'Mail 2: bitte 0 bis 14 Tage vor der Messung.';
  if (mailOffsets[2] < mailOffsets[1]) return 'Mail 2 darf nicht vor Mail 1 fällig sein.';
  if (!between(mailOffsets[3], 0, 14)) return 'Mail 3: bitte 0 bis 14 Tage nach der Messung.';
  if (!reminderTime) return 'Bitte eine Uhrzeit für die Erinnerung wählen.';
  if (!(durationMin >= 5 && durationMin <= 240)) return 'Dauer bitte zwischen 5 und 240 Minuten.';
  if (!location) return 'Bitte einen Standard-Ort eingeben.';
  for (const nr of [1, 2, 3]) {
    if (!templates[nr].subject) return `Mail ${nr}: Bitte einen Betreff eingeben.`;
    if (!templates[nr].body) return `Mail ${nr}: Bitte einen Text eingeben.`;
  }
  return null;
}
