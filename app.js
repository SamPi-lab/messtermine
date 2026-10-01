// Oberfläche der App. Jede Aktion folgt demselben Muster:
//   Zustand ändern → save() → render()
// render() baut beide Listen (aktuell, vergangen & abgesagt) aus dem Zustand neu auf.
// Das Formular oben dient zum Anlegen und, mit editingId, zum Bearbeiten.
// Die Einstellungen sind eine eigene Ansicht unter #einstellungen über der Liste.
// Die Fachregeln (Fälligkeit, Vorlagen füllen, mailto) stehen in logic.js,
// die Kalender-Datei in ics.js, Standardwerte und Prüfung der Einstellungen in settings.js.

import {
  suggestNextId, sortAppointments, dueDate, dueMails, formatDateDe,
  fillTemplate, mailtoHref, todayStr, isArchived, validateAppointment, applyEdit,
} from './logic.js';
import { buildIcs } from './ics.js';
import {
  DEFAULT_SETTINGS, withAppointmentDefaults, withDefaults, validateSettings,
} from './settings.js';
import { TEMPLATES } from './templates.js';

const STORAGE_KEY = 'probanden-termine';

const form = document.getElementById('appointment-form');
const formTitle = document.getElementById('form-title');
const formError = document.getElementById('form-error');
const statusField = document.getElementById('status-field');
const cancelEdit = document.getElementById('cancel-edit');
const deleteButton = document.getElementById('delete-appointment');
const formPanel = document.getElementById('form-panel');
const list = document.getElementById('appointment-list');
const empty = document.getElementById('empty');
const archive = document.getElementById('archive');
const archiveTitle = document.getElementById('archive-title');
const archiveList = document.getElementById('archive-list');
const openSettingsLink = document.getElementById('open-settings');
const settingsView = document.getElementById('settings-view');
const settingsBack = document.getElementById('settings-back');
const settingsForm = document.getElementById('settings-form');
const settingsError = document.getElementById('settings-error');
const templateFields = document.getElementById('template-fields');

// --- Zustand: lesen und speichern -----------------------------------------
// Im localStorage steht { version: 1, appointments: [Termin, …], settings }.
// settings: siehe DEFAULT_SETTINGS in settings.js. Ein Termin:
//   id          'P-07'
//   date, time  '2026-10-14', '09:30' (Ortszeit)
//   durationMin 60
//   location    'home of vitality, Große Bleiche …'
//   status      'geplant' | 'durchgeführt' | 'abgesagt'
//   mailOffsets { 1: -3, 2: -1, 3: 1 }  Tage zum Messtermin, beim Anlegen aus den Einstellungen
//   sent        { 1: false, 2: false, 3: false }  Mail-Nr. → gesendet (Nummern wie in templates.js)

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (data && data.version === 1 && Array.isArray(data.appointments)) {
      return {
        ...data,
        appointments: data.appointments.map(withAppointmentDefaults),
        settings: withDefaults(data.settings),
      };
    }
  } catch {
    // ungültige oder fehlende Daten: leer starten
  }
  return { version: 1, appointments: [], settings: withDefaults() };
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = load();
let editingId = null; // ID des Termins im Formular, null = neuer Termin

// --- Aktionen ---------------------------------------------------------------

function addAppointment({ id, date, time, durationMin, location }) {
  state.appointments.push({
    id, date, time, durationMin, location, status: 'geplant',
    mailOffsets: { ...state.settings.mailOffsets }, sent: { 1: false, 2: false, 3: false },
  });
  save();
  render();
}

// Gibt zurück, ob die Kalendereinträge geprüft werden müssen
function updateAppointment(oldId, changes) {
  const index = state.appointments.findIndex((a) => a.id === oldId);
  const { appointment, checkCalendar } = applyEdit(state.appointments[index], changes);
  state.appointments[index] = appointment;
  save();
  render();
  return checkCalendar;
}

function deleteAppointment(id) {
  state.appointments = state.appointments.filter((a) => a.id !== id);
  save();
  render();
}

function setSent(id, nr, value) {
  const appointment = state.appointments.find((a) => a.id === id);
  appointment.sent[nr] = value;
  save();
  render();
}

function downloadIcs(appointment) {
  const blob = new Blob([buildIcs(appointment, new Date(), state.settings.reminderTime)], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const link = el('a', { href: url, download: `${appointment.id}.ics` });
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// --- Anzeige: Liste → Termin → Mail ----------------------------------------

function render() {
  const today = todayStr();
  const sorted = sortAppointments(state.appointments);
  const current = sorted.filter((a) => !isArchived(a, today));
  const past = sorted.filter((a) => isArchived(a, today)).reverse(); // neueste zuerst
  list.replaceChildren(...current.map((a) => renderAppointment(a, today)));
  archiveList.replaceChildren(...past.map((a) => renderAppointment(a, today)));
  archiveTitle.textContent = `Vergangen & abgesagt (${past.length})`;
  archive.hidden = past.length === 0;
  empty.hidden = sorted.length > 0;
  if (!sorted.length) formPanel.open = true;
}

const STATUS_BADGE = { durchgeführt: 'is-done', abgesagt: 'is-cancelled' };

function renderAppointment(appointment, today) {
  const due = dueMails(appointment, today);
  const cancelled = appointment.status === 'abgesagt';
  const head = el('div', { class: 'appt-head' },
    el('span', { class: 'appt-id' }, appointment.id));
  if (STATUS_BADGE[appointment.status]) {
    head.append(el('span', { class: `status ${STATUS_BADGE[appointment.status]}` }, appointment.status));
  }
  if (due.length) {
    head.append(el('span', { class: 'badge' }, due.length === 1 ? '1 Mail fällig' : `${due.length} Mails fällig`));
  }
  head.append(el('span', { class: 'appt-when' },
    `${formatDateDe(appointment.date)} · ${appointment.time} Uhr · ${appointment.durationMin} Min`),
    el('span', { class: 'appt-where' }, appointment.location));

  const edit = el('button', { type: 'button', class: 'secondary' }, 'Bearbeiten');
  edit.addEventListener('click', () => startEdit(appointment));
  const actions = el('div', { class: 'card-actions' }, edit);
  const card = el('li', { class: cancelled ? 'card is-cancelled' : 'card', 'data-id': appointment.id }, head);

  // Abgesagt: keine Mails und kein Kalender mehr, nur noch Bearbeiten (z. B. Absage zurücknehmen)
  if (!cancelled) {
    card.append(el('ul', { class: 'mails' }, ...[1, 2, 3].map((nr) => renderMail(appointment, nr, due))));
    const calendar = el('button', { type: 'button', class: 'secondary' }, '📅 Zum Kalender');
    calendar.addEventListener('click', () => downloadIcs(appointment));
    actions.prepend(calendar);
  }
  card.append(actions);
  return card;
}

function renderMail(appointment, nr, due) {
  const sent = appointment.sent[nr];
  const isDue = due.includes(nr);
  const { subject, body } = fillTemplate(state.settings.templates[nr], appointment);

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

// --- Formular „Neuer Termin“ / „P-07 bearbeiten“ ---------------------------

function setEditMode(id) {
  editingId = id;
  formTitle.textContent = id ? `${id} bearbeiten` : '+ Neuer Termin';
  statusField.hidden = cancelEdit.hidden = deleteButton.hidden = !id;
  formError.hidden = true;
}

function resetForm() {
  form.reset();
  form.elements.id.value = suggestNextId(state.appointments);
  form.elements.durationMin.value = state.settings.durationMin;
  form.elements.location.value = state.settings.location;
  setEditMode(null);
}

function startEdit(appointment) {
  for (const name of ['id', 'date', 'time', 'durationMin', 'location', 'status']) {
    form.elements[name].value = appointment[name];
  }
  setEditMode(appointment.id);
  formPanel.open = true;
  formPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeForm() {
  formPanel.open = false;
  resetForm();
}

function showError(message) {
  formError.textContent = message;
  formError.hidden = false;
}

function readForm() {
  return {
    id: form.elements.id.value.trim().toUpperCase(),
    date: form.elements.date.value,
    time: form.elements.time.value,
    durationMin: Number(form.elements.durationMin.value),
    location: form.elements.location.value.trim(),
    status: form.elements.status.value,
  };
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const input = readForm();
  const oldId = editingId;
  const error = validateAppointment(input, state.appointments, oldId);
  if (error) return showError(error);

  closeForm();
  if (!oldId) return addAppointment(input);
  const checkCalendar = updateAppointment(oldId, input);
  if (checkCalendar) alert(`Kalender prüfen: alte Einträge von ${oldId} löschen und „Zum Kalender“ neu tippen.`);
});

cancelEdit.addEventListener('click', closeForm);

deleteButton.addEventListener('click', () => {
  if (!confirm(`${editingId} wirklich löschen? Kalendereinträge löschst du von Hand.`)) return;
  const id = editingId;
  closeForm();
  deleteAppointment(id);
});

// Zuklappen beim Bearbeiten heißt Abbrechen
formPanel.addEventListener('toggle', () => {
  if (!formPanel.open && editingId) resetForm();
});

// --- Einstellungen: eigene Ansicht unter #einstellungen ----------------------
// Öffnen und Schließen laufen über die Adresse, damit auch „Zurück“ des Browsers
// funktioniert. Ungespeicherte Eingaben verfallen: Beim Öffnen wird neu gefüllt.

const SETTINGS_HASH = '#einstellungen';
let settingsOpenedFromList = false; // dann führt „‹ Termine“ per history.back() zurück

function renderTemplateFields() {
  templateFields.replaceChildren(...[1, 2, 3].map((nr) => {
    const reset = el('button', { type: 'button', class: 'secondary' }, 'Standardtext');
    reset.addEventListener('click', () => {
      settingsForm.elements[`subject${nr}`].value = DEFAULT_SETTINGS.templates[nr].subject;
      settingsForm.elements[`body${nr}`].value = DEFAULT_SETTINGS.templates[nr].body;
    });
    return el('section', { class: 'card' },
      el('h2', {}, `Mail ${nr} · ${TEMPLATES[nr].title}`),
      el('label', {}, 'Betreff', el('input', { name: `subject${nr}`, autocomplete: 'off' })),
      el('label', {}, 'Text', el('textarea', { name: `body${nr}` })),
      reset);
  }));
}

function fillSettingsForm(settings) {
  const f = settingsForm.elements;
  f.days1.value = -settings.mailOffsets[1];
  f.days2.value = -settings.mailOffsets[2];
  f.days3.value = settings.mailOffsets[3];
  f.reminderTime.value = settings.reminderTime;
  f.durationMin.value = settings.durationMin;
  f.location.value = settings.location;
  for (const nr of [1, 2, 3]) {
    f[`subject${nr}`].value = settings.templates[nr].subject;
    f[`body${nr}`].value = settings.templates[nr].body;
  }
}

function readSettingsForm() {
  const f = settingsForm.elements;
  const number = (name) => (f[name].value === '' ? NaN : Number(f[name].value));
  return {
    mailOffsets: { 1: 0 - number('days1'), 2: 0 - number('days2'), 3: number('days3') },
    reminderTime: f.reminderTime.value,
    durationMin: number('durationMin'),
    location: f.location.value.trim(),
    templates: Object.fromEntries([1, 2, 3].map((nr) => [nr, {
      subject: f[`subject${nr}`].value.trim(),
      body: f[`body${nr}`].value.trim(),
    }])),
  };
}

function openSettings() {
  fillSettingsForm(state.settings);
  settingsError.hidden = true;
  settingsView.classList.remove('is-leaving');
  settingsView.hidden = false;
  settingsView.scrollTop = 0;
  document.documentElement.classList.add('settings-open');
}

function closeSettings() {
  settingsOpenedFromList = false;
  document.documentElement.classList.remove('settings-open');
  if (settingsView.hidden) return;
  settingsView.classList.add('is-leaving'); // schiebt nach rechts hinaus, dann animationend
  // Ohne Animation („Bewegung reduzieren“) kommt kein animationend: sofort ausblenden
  if (getComputedStyle(settingsView).animationName === 'none') settingsView.hidden = true;
}

function leaveSettings() {
  if (settingsOpenedFromList) return history.back(); // löst hashchange aus
  history.replaceState(null, '', location.pathname + location.search);
  closeSettings();
}

settingsView.addEventListener('animationend', () => {
  if (!settingsView.classList.contains('is-leaving')) return;
  settingsView.classList.remove('is-leaving');
  settingsView.hidden = true;
});

window.addEventListener('hashchange', () => {
  if (location.hash === SETTINGS_HASH) openSettings();
  else closeSettings();
});

openSettingsLink.addEventListener('click', () => { settingsOpenedFromList = true; });
settingsBack.addEventListener('click', leaveSettings);

settingsForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const input = readSettingsForm();
  const error = validateSettings(input);
  if (error) {
    settingsError.textContent = error;
    settingsError.hidden = false;
    return;
  }
  state.settings = input;
  save();
  render();
  if (!editingId) resetForm(); // neue Standarddauer und neuen Ort ins Formular übernehmen
  leaveSettings();
});

// --- Start ------------------------------------------------------------------

renderTemplateFields();
resetForm();
render();
if (location.hash === SETTINGS_HASH) openSettings();
