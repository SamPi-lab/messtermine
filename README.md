# Messtermine

Web-App für die Messtermine meiner Masterarbeit: Termine mit Probanden-ID anlegen, fällige Mails sehen, per Tipp in Apple Mail öffnen, Messung und Mail-Erinnerungen in den Kalender übernehmen. Läuft komplett im Browser, keine Namen oder Adressen gespeichert. Die ursprünglichen Phasen-Dokumente (Brainstorm, Align, Plan) liegen in der Git-Historie (`git show 96fb1ac`), der Plan für Slice 02 in `03-plan-slice-02.md`.

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
| `ics.js` | Kalender-Datei pro Termin: Messung (Alarm 1 h vorher) + 3 Mail-Erinnerungen um 6:30, Zeitzone Europe/Berlin |
| `tests/*.test.js` | Tests für `logic.js` und `ics.js` |

Ablauf: Formular → `addAppointment()` → `localStorage` → `render()` → `dueMails()` + `fillTemplate()` + `mailtoHref()` → Liste mit „Öffnen“ → Häkchen → `setSent()` → `render()`. „Zum Kalender“ → `buildIcs()` → Download `P-07.ics`.

## Nächste Schritte

| Slice | Inhalt |
|-------|--------|
| 03 | Termin bearbeiten/löschen, Status geplant/durchgeführt/abgesagt, „Vergangene“ eingeklappt |
| 04 | Einstellungen (Tage, Uhrzeit, Standarddauer) + Vorlagen bearbeiten |
| 05 | Backup Export/Import + Hinweis, wenn das letzte Backup älter als 3 Tage ist |
| 06 | PWA (offline, Home-Bildschirm) + GitHub Pages + Test auf dem iPhone (inkl. .ics-Import), Link zur App in den Kalendereinträgen |

Offene Risiken: .ics-Download im PWA-Modus von iOS · Löschung der Browserdaten durch iOS (`navigator.storage.persist()`) · Darstellung der Mail in Apple Mail auf dem iPhone · Doppelter .ics-Export: ersetzt oder verdoppelt Apple Kalender die Einträge?
