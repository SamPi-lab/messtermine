// Reine Fachlogik ohne DOM und ohne versteckte Uhr: "heute" wird immer übergeben.
// Daten sind Kalenderdaten im Format YYYY-MM-DD; gerechnet wird in UTC,
// damit Sommerzeit-Umstellungen keine Rolle spielen.

const WEEKDAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli',
  'August', 'September', 'Oktober', 'November', 'Dezember'];

// Tage relativ zum Messtermin, ab denen die Mail fällig ist
export const MAIL_OFFSETS = { 1: -3, 2: -1, 3: 1 };

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

export function dueDate(appointment, mailNr) {
  return addDays(appointment.date, MAIL_OFFSETS[mailNr]);
}

export function dueMails(appointment, today) {
  if (appointment.status === 'abgesagt') return [];
  return [1, 2, 3].filter((nr) =>
    !appointment.sent[nr] && dueDate(appointment, nr) <= today);
}

export function fillTemplate(template, appointment) {
  const fill = (text) => text
    .replaceAll('{Datum}', formatDateDe(appointment.date))
    .replaceAll('{Uhrzeit}', appointment.time);
  return { subject: fill(template.subject), body: fill(template.body) };
}

export function mailtoHref(subject, body) {
  const crlfBody = body.replace(/\r?\n/g, '\r\n');
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(crlfBody)}`;
}
