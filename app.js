// Oberfläche der App. Jede Aktion folgt demselben Muster:
//   Zustand ändern → save() → render()
// render() baut die komplette Liste aus dem Zustand neu auf.
// Die Fachregeln (Fälligkeit, Vorlagen füllen, mailto) stehen in logic.js.

import {
  suggestNextId, sortAppointments, dueDate, dueMails, formatDateDe,
  fillTemplate, mailtoHref, todayStr,
} from './logic.js';
import { TEMPLATES } from './templates.js';

const STORAGE_KEY = 'probanden-termine';

const form = document.getElementById('appointment-form');
const formError = document.getElementById('form-error');
const newAppointment = document.getElementById('new-appointment');
const list = document.getElementById('appointment-list');
const empty = document.getElementById('empty');

// --- Zustand: lesen und speichern -----------------------------------------

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (data && data.version === 1 && Array.isArray(data.appointments)) return data;
  } catch {
    // ungültige oder fehlende Daten: leer starten
  }
  return { version: 1, appointments: [] };
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = load();

// --- Aktionen ---------------------------------------------------------------

function addAppointment({ id, date, time, durationMin }) {
  state.appointments.push({
    id, date, time, durationMin, status: 'geplant', sent: { 1: false, 2: false, 3: false },
  });
  save();
  render();
}

function setSent(id, nr, value) {
  const appointment = state.appointments.find((a) => a.id === id);
  appointment.sent[nr] = value;
  save();
  render();
}

// --- Anzeige: Liste → Termin → Mail ----------------------------------------

function render() {
  const today = todayStr();
  const sorted = sortAppointments(state.appointments);
  list.replaceChildren(...sorted.map((a) => renderAppointment(a, today)));
  empty.hidden = sorted.length > 0;
  if (!sorted.length) newAppointment.open = true;
}

function renderAppointment(appointment, today) {
  const due = dueMails(appointment, today);
  const head = el('div', { class: 'appt-head' },
    el('span', { class: 'appt-id' }, appointment.id));
  if (due.length) {
    head.append(el('span', { class: 'badge' }, due.length === 1 ? '1 Mail fällig' : `${due.length} Mails fällig`));
  }
  head.append(el('span', { class: 'appt-when' },
    `${formatDateDe(appointment.date)} · ${appointment.time} Uhr · ${appointment.durationMin} Min`));

  const mails = el('ul', { class: 'mails' }, ...[1, 2, 3].map((nr) => renderMail(appointment, nr, due)));
  return el('li', { class: 'card', 'data-id': appointment.id }, head, mails);
}

function renderMail(appointment, nr, due) {
  const sent = appointment.sent[nr];
  const isDue = due.includes(nr);
  const { subject, body } = fillTemplate(TEMPLATES[nr], appointment);

  let stateText;
  if (sent) stateText = 'gesendet ✓';
  else if (isDue) stateText = 'fällig';
  else stateText = `fällig ab ${formatDateDe(dueDate(appointment, nr))}`;

  const info = el('div', {},
    el('div', { class: 'mail-nr' }, `Mail ${nr}`),
    el('div', { class: 'mail-title' }, TEMPLATES[nr].title),
    el('div', { class: 'mail-state' }, stateText));
  if (nr === 3 && !sent) info.append(el('div', { class: 'attach-hint' }, '📎 Video anhängen!'));

  const open = el('a', {
    class: `button ${isDue ? 'primary' : 'secondary'}`,
    href: mailtoHref(subject, body),
    'data-mail': String(nr),
  }, 'Öffnen');

  const checkbox = el('input', { type: 'checkbox', 'aria-label': `Mail ${nr} gesendet` });
  checkbox.checked = sent;
  checkbox.addEventListener('change', () => setSent(appointment.id, nr, checkbox.checked));

  const classes = ['mail', sent ? 'is-sent' : '', isDue ? 'is-due' : ''].filter(Boolean).join(' ');
  return el('li', { class: classes },
    info, open, el('label', { class: 'sent-toggle' }, checkbox, 'gesendet'));
}

// Kleiner Helfer: el('div', { class: 'x' }, 'Text', kindElement)
function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'class') node.className = value;
    else node.setAttribute(key, value);
  }
  node.append(...children);
  return node;
}

// --- Formular „Neuer Termin“ ------------------------------------------------

function resetForm() {
  form.reset();
  form.elements.id.value = suggestNextId(state.appointments);
  formError.hidden = true;
}

function showError(message) {
  formError.textContent = message;
  formError.hidden = false;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const id = form.elements.id.value.trim().toUpperCase();
  const date = form.elements.date.value;
  const time = form.elements.time.value;
  const durationMin = Number(form.elements.durationMin.value);

  if (!/^P-\d+$/.test(id)) return showError('Bitte eine ID im Format P-01 eingeben.');
  if (state.appointments.some((a) => a.id === id)) return showError(`${id} ist bereits vergeben.`);
  if (!date) return showError('Bitte ein Datum wählen.');
  if (!time) return showError('Bitte eine Uhrzeit wählen.');
  if (!(durationMin >= 5 && durationMin <= 240)) return showError('Dauer bitte zwischen 5 und 240 Minuten.');

  newAppointment.open = false;
  addAppointment({ id, date, time, durationMin });
  resetForm();
});

// --- Start ------------------------------------------------------------------

resetForm();
render();
