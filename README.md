# Messtermine

Web-App für die Messtermine meiner Masterarbeit: Termine mit Probanden-ID anlegen, fällige Mails sehen, per Tipp in Apple Mail öffnen. Läuft komplett im Browser, keine Namen oder Adressen gespeichert. Hintergrund und Entscheidungen: `01-brainstorm.md`, `02-align.md`, `03-plan-slice-*.md`.

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
