# Messtermine

Web-App für die Messtermine meiner Masterarbeit: Termine mit Probanden-ID und Ort anlegen, bearbeiten und mit Status versehen, fällige Mails sehen, per Tipp in Apple Mail öffnen, Messung und Mail-Erinnerungen in den Kalender übernehmen, Mail-Tage, Uhrzeit und Vorlagen selbst einstellen, Backup speichern und wiederherstellen. Läuft komplett im Browser, auch offline, als App auf dem Home-Bildschirm des iPhones. Keine Namen oder Adressen gespeichert.

**App:** https://sampi-lab.github.io/messtermine/ (Code: https://github.com/SamPi-lab/messtermine) Die Phasen-Dokumente liegen in der Git-Historie: Brainstorm, Align und Plan für Slice 01 unter `git show 96fb1ac`, Plan und Ergebnis für Slice 02 unter `git show 99ab894:03-plan-slice-02.md`, für Slice 03 unter `git show 997f17a:03-plan-slice-03.md`, für Slice 04 unter `git show 3b4c758:03-plan-slice-04.md`, für Slice 05 unter `git show 031b92a:03-plan-slice-05.md`, für Slice 06 unter `git show 873d686:03-plan-slice-06.md`.

## Auf dem iPhone installieren

1. In **Safari** https://sampi-lab.github.io/messtermine/ öffnen.
2. Teilen-Knopf → „Zum Home-Bildschirm“ → „Hinzufügen“ (falls gefragt: „Als Web-App öffnen“ eingeschaltet lassen).
3. Ab jetzt **nur noch über das Symbol „Messtermine“** öffnen. Die App vom Home-Bildschirm hat einen eigenen Speicher, getrennt von Safari: In Safari siehst du deine Termine nicht.
4. Daten holen: in der App Einstellungen → „Backup wiederherstellen“ → iCloud Drive → Claude → Backup App → neuestes Backup.

Das iPhone ist das Original. Mac und iPhone gleichen sich nicht ab; auf dem Mac nur noch ein Backup ansehen, dort aber nichts mehr ändern.

## Update veröffentlichen

Nach einem Commit:
```bash
git push
```
GitHub Pages ist nach 1–2 Minuten aktuell. Die App holt sich mit Netz immer die neuesten Dateien (Service Worker „erst Netz, sonst Speicher“); einmal schließen und neu öffnen reicht. Neue Dateien der App in `APP_FILES` in `sw.js` eintragen – `node --test` meldet es sonst.

## Lokal starten (zum Entwickeln)

```bash
python3 -m http.server 8123
```
Dann http://localhost:8123 öffnen. Ein Doppelklick auf `index.html` reicht nicht, weil der Browser JavaScript-Module nur über einen Server lädt. Die Daten unter `localhost` sind getrennt von der echten App.

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
| `ics.js` | Kalender-Datei pro Termin: Messung mit Ort (Alarm 1 h vorher) + 3 Mail-Erinnerungen zur eingestellten Uhrzeit mit Notiz „Messtermine-App öffnen“, Zeitzone Europe/Berlin |
| `sw.js` | Service Worker: speichert die Dateien in `APP_FILES` für den Offline-Start, mit Netz immer die neueste Version |
| `manifest.webmanifest` / `icons/` | Name, Symbol und Vollbild für den Home-Bildschirm |
| `.nojekyll` | GitHub Pages liefert die Dateien unverändert aus |
| `tests/*.test.js` | Tests für `logic.js`, `ics.js`, `settings.js` und `backup.js`; `sw.test.js` prüft, dass jede Datei der App offline gespeichert wird und alle Pfade relativ sind |

Ablauf: Formular → `addAppointment()` → `localStorage` → `render()` → `dueMails()` + `fillTemplate()` + `mailtoHref()` → Liste mit „Öffnen“ → Häkchen → `setSent()` → `render()`. „Zum Kalender“ → `buildIcs()` → Download `P-07.ics`. „Bearbeiten“ → Formular oben → `validateAppointment()` → `applyEdit()` → ggf. Hinweis „Kalender prüfen“. „⚙︎ Einstellungen“ → `#einstellungen` → `validateSettings()` → `state.settings`. Neue Termine übernehmen Ort, Dauer und Mail-Tage aus den Einstellungen; geänderte Mail-Tage gelten nur für neue Termine. „Backup speichern“ / „Jetzt sichern“ → `createBackup()` → Teilen-Menü (iPhone) oder Download (Mac) → `lastBackupAt`. „Backup wiederherstellen“ → `parseBackup()` → Rückfrage → ersetzt alles.

## Auf dem iPhone einstellen

Damit die Kalender-Erinnerung um 6:30 stehen bleibt, bis du sie wegwischst: Einstellungen → Mitteilungen → Kalender → Banner-Stil „Dauerhaft“.

## Backup

- **Speichern:** Einstellungen → „Backup speichern“ (oder „Jetzt sichern“ im gelben Hinweis, der erscheint, wenn das letzte Backup älter als 3 Tage ist). Auf dem iPhone öffnet sich das Teilen-Menü: „In Dateien sichern“ → iCloud Drive → Claude → Backup App. Auf dem Mac landet die Datei im Download-Ordner.
- **Wiederherstellen:** Einstellungen → „Backup wiederherstellen“ → Datei `messtermine-backup-JJJJ-MM-TT.json` wählen → bestätigen. Ersetzt alle Termine und Einstellungen.

## Offene Punkte

Alle geplanten Slices sind umgesetzt. Auf dem iPhone noch zu prüfen: „Zum Kalender“ in der Home-Bildschirm-App (erscheint „Alle hinzufügen“? sonst auf das Teilen-Menü umbauen) · Darstellung der Mail in Apple Mail · doppelter .ics-Export: ersetzt oder verdoppelt Apple Kalender die Einträge? · Start im Flugmodus.
