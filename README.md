# Messtermine

Web-App für die Messtermine meiner Masterarbeit: Termine mit Probanden-ID anlegen, fällige Mails sehen, per Tipp in Apple Mail öffnen. Läuft komplett im Browser, keine Namen oder Adressen gespeichert. Die ursprünglichen Phasen-Dokumente (Brainstorm, Align, Plan) liegen in der Git-Historie (`git show 96fb1ac`).

## Starten

```bash
python3 -m http.server 8123
```
Dann http://localhost:8123 öffnen. Ein Doppelklick auf `index.html` reicht nicht, weil der Browser JavaScript-Module nur über einen Server lädt.

## Testen

```bash
node --test
```

## Dateien

| Datei | Aufgabe |
|-------|---------|
| `index.html` / `style.css` | Grundgerüst und Aussehen |
| `app.js` | Oberfläche: Formular, Liste, Speichern im `localStorage` |
| `logic.js` | Fachregeln ohne Oberfläche: ID-Vorschlag, Fälligkeit, Vorlagen füllen, `mailto:`-Link |
| `templates.js` | Die drei Mail-Vorlagen |
| `tests/logic.test.js` | Tests für `logic.js` |

Ablauf: Formular → `addAppointment()` → `localStorage` → `render()` → `dueMails()` + `fillTemplate()` + `mailtoHref()` → Liste mit „Öffnen“ → Häkchen → `setSent()` → `render()`.

## Nächste Schritte

| Slice | Inhalt |
|-------|--------|
| 02 | „Zum Kalender“: .ics pro Termin mit Messung (Alarm 1 h vorher) + 3 Mail-Erinnerungen um 6:30 |
| 03 | Termin bearbeiten/löschen, Status geplant/durchgeführt/abgesagt, „Vergangene“ eingeklappt |
| 04 | Einstellungen (Tage, Uhrzeit, Standarddauer) + Vorlagen bearbeiten |
| 05 | Backup Export/Import + Hinweis, wenn das letzte Backup älter als 3 Tage ist |
| 06 | PWA (offline, Home-Bildschirm) + GitHub Pages + Test auf dem iPhone |

Offene Risiken: .ics-Download im PWA-Modus von iOS · Löschung der Browserdaten durch iOS (`navigator.storage.persist()`) · Zeitzone Europe/Berlin in .ics (Umstellung 25.10.2026) · Darstellung der Mail in Apple Mail auf dem iPhone.
