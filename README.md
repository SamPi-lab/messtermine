# Messtermine

Web-App für die Messtermine meiner Masterarbeit: Termine mit Probanden-ID und Ort anlegen, bearbeiten und mit Status versehen, fällige Mails sehen, per Tipp in Apple Mail öffnen, Messung und Mail-Erinnerungen in den Kalender übernehmen, Mail-Tage, Uhrzeit und Vorlagen selbst einstellen, Backup speichern und wiederherstellen. Läuft komplett im Browser, keine Namen oder Adressen gespeichert. Die Phasen-Dokumente liegen in der Git-Historie: Brainstorm, Align und Plan für Slice 01 unter `git show 96fb1ac`, Plan und Ergebnis für Slice 02 unter `git show 99ab894:03-plan-slice-02.md`, für Slice 03 unter `git show 997f17a:03-plan-slice-03.md`, für Slice 04 unter `git show 3b4c758:03-plan-slice-04.md`, für Slice 05 unter `git show 031b92a:03-plan-slice-05.md`.

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
| `app.js` | Oberfläche: Formular (Anlegen und Bearbeiten), Liste, „Vergangen & abgesagt“, Seite „Einstellungen“ (`#einstellungen`), Speichern im `localStorage`; Datenmodell eines Termins oben im Abschnitt „Zustand“ |
| `logic.js` | Fachregeln ohne Oberfläche: ID-Vorschlag, Prüfung der Eingaben, Bearbeiten (Häkchen zurücksetzen), Fälligkeit, Archiv-Regel, Vorlagen füllen, `mailto:`-Link |
| `settings.js` | Standardwerte der Einstellungen (Mail-Tage, Uhrzeit, Dauer, Ort, Vorlagen), Ergänzen fehlender Werte, Prüfung |
| `backup.js` | Backup-Datei erzeugen und beim Wiederherstellen prüfen, Alter des letzten Backups, Hinweis „Backup fällig“ |
| `templates.js` | Die drei Standard-Vorlagen (Titel fest, Betreff und Text in den Einstellungen änderbar) |
| `ics.js` | Kalender-Datei pro Termin: Messung mit Ort (Alarm 1 h vorher) + 3 Mail-Erinnerungen zur eingestellten Uhrzeit, Zeitzone Europe/Berlin |
| `tests/*.test.js` | Tests für `logic.js`, `ics.js`, `settings.js` und `backup.js` |

Ablauf: Formular → `addAppointment()` → `localStorage` → `render()` → `dueMails()` + `fillTemplate()` + `mailtoHref()` → Liste mit „Öffnen“ → Häkchen → `setSent()` → `render()`. „Zum Kalender“ → `buildIcs()` → Download `P-07.ics`. „Bearbeiten“ → Formular oben → `validateAppointment()` → `applyEdit()` → ggf. Hinweis „Kalender prüfen“. „⚙︎ Einstellungen“ → `#einstellungen` → `validateSettings()` → `state.settings`. Neue Termine übernehmen Ort, Dauer und Mail-Tage aus den Einstellungen; geänderte Mail-Tage gelten nur für neue Termine. „Backup speichern“ / „Jetzt sichern“ → `createBackup()` → Teilen-Menü (iPhone) oder Download (Mac) → `lastBackupAt`. „Backup wiederherstellen“ → `parseBackup()` → Rückfrage → ersetzt alles.

## Auf dem iPhone einstellen

Damit die Kalender-Erinnerung um 6:30 stehen bleibt, bis du sie wegwischst: Einstellungen → Mitteilungen → Kalender → Banner-Stil „Dauerhaft“.

## Backup

- **Speichern:** Einstellungen → „Backup speichern“ (oder „Jetzt sichern“ im gelben Hinweis, der erscheint, wenn das letzte Backup älter als 3 Tage ist). Auf dem iPhone öffnet sich das Teilen-Menü: „In Dateien sichern“ → iCloud Drive → Claude → Backup App. Auf dem Mac landet die Datei im Download-Ordner.
- **Wiederherstellen:** Einstellungen → „Backup wiederherstellen“ → Datei `messtermine-backup-JJJJ-MM-TT.json` wählen → bestätigen. Ersetzt alle Termine und Einstellungen.
- **Vor dem Umzug auf GitHub Pages (Slice 06):** hier ein Backup speichern und dort wiederherstellen, denn die neue Adresse startet mit leerem Speicher.

## Nächste Schritte

| Slice | Inhalt |
|-------|--------|
| 06 | PWA (offline, Home-Bildschirm) + GitHub Pages + Umzug der Daten per Backup + Test auf dem iPhone (inkl. .ics-Import und Teilen-Menü beim Backup), Link zur App in den Kalendereinträgen |

Offene Risiken: Browser zeigt nach einem Update noch alte Dateien aus dem Cache (in Slice 06 mit dem Offline-Speicher lösen) · .ics-Download im PWA-Modus von iOS · Löschung der Browserdaten durch iOS (`navigator.storage.persist()`) · Darstellung der Mail in Apple Mail auf dem iPhone · Doppelter .ics-Export: ersetzt oder verdoppelt Apple Kalender die Einträge?
