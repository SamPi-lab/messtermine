// Reine Fachlogik ohne DOM und ohne versteckte Uhr: "heute" wird immer übergeben.
// Daten sind Kalenderdaten im Format YYYY-MM-DD; gerechnet wird in UTC,
// damit Sommerzeit-Umstellungen keine Rolle spielen.

const WEEKDAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli',
  'August', 'September', 'Oktober', 'November', 'Dezember'];

function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function toDateStr(date) {
  return date.toISOString().slice(0, 10);
}

export function todayStr(now = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function addDays(dateStr, n) {
  const date = parseDate(dateStr);
  date.setUTCDate(date.getUTCDate() + n);
  return toDateStr(date);
}

export function formatDateDe(dateStr) {
  const date = parseDate(dateStr);
  return `${WEEKDAYS[date.getUTCDay()]}, ${date.getUTCDate()}. ${MONTHS[date.getUTCMonth()]}`;
}

export function suggestNextId(appointments) {
  const numbers = appointments
    .map((a) => /^P-(\d+)$/.exec(a.id))
    .filter(Boolean)
    .map((match) => Number(match[1]));
  const next = numbers.length ? Math.max(...numbers) + 1 : 1;
  return `P-${String(next).padStart(2, '0')}`;
}

export function sortAppointments(appointments) {
  return [...appointments].sort((a, b) =>
    `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}

// Jeder Termin trägt seine Mail-Tage selbst (siehe DEFAULT_SETTINGS in settings.js)
export function dueDate(appointment, mailNr) {
  return addDays(appointment.date, appointment.mailOffsets[mailNr]);
}

// Mail 1 und 2 (Vorbereitung, Erinnerung) verfallen nach dem Messtag
// oder sobald die Messung durchgeführt ist; Mail 3 bleibt fällig, bis sie gesendet ist.
export function dueMails(appointment, today) {
  if (appointment.status === 'abgesagt') return [];
  const beforeMeasurement = appointment.status !== 'durchgeführt' && appointment.date >= today;
  return [1, 2, 3].filter((nr) =>
    !appointment.sent[nr] && dueDate(appointment, nr) <= today && (nr === 3 || beforeMeasurement));
}

// Gehört der Termin in den eingeklappten Bereich „Vergangen & abgesagt“?
export function isArchived(appointment, today) {
  if (appointment.status === 'abgesagt') return true;
  return appointment.date < today && dueMails(appointment, today).length === 0;
}

// Prüft die Eingaben aus dem Formular; ownId ist beim Bearbeiten die bisherige ID.
export function validateAppointment({ id, date, time, durationMin, location }, appointments, ownId = null) {
  if (!/^P-\d+$/.test(id)) return 'Bitte eine ID im Format P-01 eingeben.';
  if (id !== ownId && appointments.some((a) => a.id === id)) return `${id} ist bereits vergeben.`;
  if (!date) return 'Bitte ein Datum wählen.';
  if (!time) return 'Bitte eine Uhrzeit wählen.';
  if (!(durationMin >= 5 && durationMin <= 240)) return 'Dauer bitte zwischen 5 und 240 Minuten.';
  if (!location) return 'Bitte einen Ort eingeben.';
  return null;
}

// Neuer Stand eines bearbeiteten Termins. Ändern sich Datum oder Uhrzeit, stimmen
// die Mail-Texte nicht mehr: alle Häkchen werden entfernt. Bei geänderter ID, Datum,
// Uhrzeit oder geändertem Ort passen die Kalendereinträge nicht mehr (checkCalendar).
export function applyEdit(appointment, changes) {
  const moved = changes.date !== appointment.date || changes.time !== appointment.time;
  return {
    appointment: {
      ...appointment,
      ...changes,
      sent: moved ? { 1: false, 2: false, 3: false } : { ...appointment.sent },
    },
    checkCalendar: moved || changes.id !== appointment.id || changes.location !== appointment.location,
  };
}

export function fillTemplate(template, appointment) {
  const fill = (text) => text
    .replaceAll('{Datum}', formatDateDe(appointment.date))
    .replaceAll('{Uhrzeit}', appointment.time)
    .replaceAll('{Ort}', appointment.location);
  return { subject: fill(template.subject), body: fill(template.body) };
}

export function mailtoHref(subject, body) {
  const crlfBody = body.replace(/\r?\n/g, '\r\n');
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(crlfBody)}`;
}
