// Kalender-Datei (.ics) pro Termin: Messung + Erinnerungen für die 3 Mails.
// Reine Funktionen ohne DOM; "jetzt" wird immer übergeben.
// Alle Zeiten sind Ortszeit Europe/Berlin, die Zeitzone steht in der Datei,
// damit Termine nach der Umstellung am 25.10.2026 auf derselben Uhrzeit bleiben.

import { addDays, MAIL_OFFSETS, todayStr } from './logic.js';

export const LOCATION = 'home of vitality, Große Bleiche 18–20, 55116 Mainz (Eingang links neben Netto, 2. Stock)';
export const REMINDER_TIME = '06:30';
const REMINDER_MIN = 15;
const TZID = 'Europe/Berlin';

const VTIMEZONE = [
  'BEGIN:VTIMEZONE',
  `TZID:${TZID}`,
  'BEGIN:DAYLIGHT',
  'TZOFFSETFROM:+0100',
  'TZOFFSETTO:+0200',
  'TZNAME:CEST',
  'DTSTART:19700329T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
  'END:DAYLIGHT',
  'BEGIN:STANDARD',
  'TZOFFSETFROM:+0200',
  'TZOFFSETTO:+0100',
  'TZNAME:CET',
  'DTSTART:19701025T030000',
  'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
  'END:STANDARD',
  'END:VTIMEZONE',
];

// Ein Zeitpunkt ist hier immer { date: 'YYYY-MM-DD', time: 'HH:MM' } in Ortszeit.
const pad = (n) => String(n).padStart(2, '0');
const minutesOfDay = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

function localDateTime(now) {
  return { date: todayStr(now), time: `${pad(now.getHours())}:${pad(now.getMinutes())}` };
}

function isBefore(a, b) {
  return `${a.date} ${a.time}` < `${b.date} ${b.time}`;
}

// Zeitpunkt + Minuten, auch über Mitternacht
function addMinutes({ date, time }, minutes) {
  const total = minutesOfDay(time) + minutes;
  const inDay = total % 1440;
  return {
    date: addDays(date, Math.floor(total / 1440)),
    time: `${pad(Math.floor(inDay / 60))}:${pad(inDay % 60)}`,
  };
}

// 5–10 Min nach jetzt, auf volle 5 Minuten (07:02 → 07:10)
function soonAfter(nowLocal) {
  return addMinutes(nowLocal, 10 - (minutesOfDay(nowLocal.time) % 5));
}

export function calendarEvents(appointment, now) {
  const start = { date: appointment.date, time: appointment.time };
  const events = [{
    uid: `${appointment.id}-messung@messtermine`,
    summary: `Messung ${appointment.id}`,
    start,
    end: addMinutes(start, appointment.durationMin),
    location: LOCATION,
    trigger: '-PT1H',
  }];

  const nowLocal = localDateTime(now);
  for (const nr of [1, 2, 3]) {
    if (appointment.sent[nr]) continue;
    let reminder = { date: addDays(appointment.date, MAIL_OFFSETS[nr]), time: REMINDER_TIME };
    // Ein Alarm in der Vergangenheit meldet sich nie: dann kurz nach jetzt erinnern
    if (isBefore(reminder, nowLocal)) reminder = soonAfter(nowLocal);
    events.push({
      uid: `${appointment.id}-mail${nr}@messtermine`,
      summary: `${appointment.id} Mail ${nr}`,
      start: reminder,
      end: addMinutes(reminder, REMINDER_MIN),
      trigger: 'PT0S',
    });
  }
  return events;
}

export function escapeText(text) {
  return text
    .replaceAll('\\', '\\\\')
    .replaceAll(';', '\\;')
    .replaceAll(',', '\\,')
    .replace(/\r?\n/g, '\\n');
}

// Zeilen dürfen höchstens 75 Byte lang sein; Fortsetzungszeilen beginnen mit Leerzeichen.
// Mehrbyte-Zeichen (ß, –) werden nicht zerteilt.
export function foldLine(line) {
  const encoder = new TextEncoder();
  const parts = [];
  let current = '';
  let bytes = 0;
  for (const char of line) {
    const size = encoder.encode(char).length;
    const limit = parts.length ? 74 : 75;
    if (bytes + size > limit) {
      parts.push(current);
      current = '';
      bytes = 0;
    }
    current += char;
    bytes += size;
  }
  parts.push(current);
  return parts.join('\r\n ');
}

const icsDateTime = ({ date, time }) => `${date.replaceAll('-', '')}T${time.replace(':', '')}00`;
const icsStamp = (now) => now.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');

export function buildIcs(appointment, now) {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Messtermine//DE', 'CALSCALE:GREGORIAN', ...VTIMEZONE];
  for (const event of calendarEvents(appointment, now)) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${event.uid}`,
      `DTSTAMP:${icsStamp(now)}`,
      `DTSTART;TZID=${TZID}:${icsDateTime(event.start)}`,
      `DTEND;TZID=${TZID}:${icsDateTime(event.end)}`,
      `SUMMARY:${escapeText(event.summary)}`,
    );
    if (event.location) lines.push(`LOCATION:${escapeText(event.location)}`);
    lines.push(
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeText(event.summary)}`,
      `TRIGGER:${event.trigger}`,
      'END:VALARM',
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.map(foldLine).join('\r\n') + '\r\n';
}
