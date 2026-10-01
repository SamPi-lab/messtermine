# 03 – Plan: Slice 05 „Backup“

**Datum:** 01.10.2026
**Phase:** 3 von 4 (Brainstorm ✅ → Align ✅ → **Plan** → Umsetzung)
**Grundlage:** README „Nächste Schritte“ (Backup Export/Import + Hinweis nach 3 Tagen), offenes Risiko „Löschung der Browserdaten durch iOS“

---

## Warum dieser Slice jetzt?

Alle Termine, Häkchen und Einstellungen liegen nur im Speicher des Browsers. Löscht iOS die Website-Daten (z. B. nach längerer Nichtnutzung oder beim Aufräumen von Safari) oder wechselst du das Gerät, ist alles weg. Ab Slice 05 sicherst du den Stand als Datei und holst ihn bei Bedarf zurück. Vor Slice 06 (Umzug auf GitHub Pages = neue Adresse = leerer Speicher) ist das außerdem der Weg, deine echten Daten mitzunehmen.

---

## Umfang Slice 05

### Drin
1. **Bereich „Backup“ ganz oben auf der Seite „Einstellungen“** (über den Mail-Einstellungen, außerhalb des Formulars „Einstellungen speichern“). Darin:
   - Zeile „Letztes Backup: Donnerstag, 1. Oktober, 18:30“ bzw. „Noch kein Backup“.
   - Knopf **„Backup speichern“**: erzeugt die Datei `messtermine-backup-2026-10-01.json`. **iPhone:** Teilen-Menü öffnet sich → „In Dateien sichern“ → Ordner **iCloud Drive → Claude → Backup App** (iOS merkt sich den Ordner). **Mac:** normaler Download in den Download-Ordner. Brichst du das Teilen-Menü ab, gilt das Backup als nicht gemacht.
   - Knopf **„Backup wiederherstellen“**: öffnet die Dateiauswahl (dort Ordner „Backup App“). Nach der Auswahl fragt die App: „Backup vom 01.10.2026, 18:30 mit 12 Terminen wiederherstellen? Deine aktuellen 10 Termine und Einstellungen werden ersetzt.“ Bei „OK“ wird alles ersetzt, danach Meldung „Backup wiederhergestellt: 12 Termine.“
2. **Inhalt der Datei:** genau der gespeicherte Stand (Termine mit Status, Ort, Mail-Tagen, Häkchen + Einstellungen inkl. Vorlagen) und der Zeitpunkt des Backups. Keine Namen oder Adressen, weil die App keine speichert.
3. **Prüfung beim Wiederherstellen:** Ist die Datei kein Backup dieser App, kaputt oder ein Termin darin unvollständig, kommt ein Fehlertext (z. B. „Diese Datei ist kein Backup der Messtermine-App.“ / „Termin 3 im Backup ist unvollständig.“) und **nichts** wird geändert.
4. **Hinweis in der Terminliste**, ganz oben über „+ Neuer Termin“: „⚠︎ Letztes Backup vor 5 Tagen“ bzw. „⚠︎ Noch kein Backup“ mit Knopf **„Jetzt sichern“** (macht dasselbe wie „Backup speichern“). Erscheint, wenn es mindestens einen Termin gibt **und** das letzte Backup älter als 3 Tage ist (oder es keins gibt). Verschwindet sofort nach dem Sichern. Nicht wegklickbar.
5. **Nach dem Wiederherstellen** übernimmt die App auch den Backup-Zeitpunkt aus der Datei; der Hinweis richtet sich also danach, wie alt dieses Backup ist.

### Bewusst nicht drin
- Zusammenführen (Termine aus Backup und aktuellem Stand mischen) – Wiederherstellen ersetzt immer alles
- Automatisches Backup; Speicherort selbst festlegen (darf eine Web-App nicht)
- `navigator.storage.persist()` (Slice 06, wirkt erst sinnvoll als App vom Home-Bildschirm)
- Rückgängig nach dem Wiederherstellen (vorher selbst „Backup speichern“ tippen, wenn du unsicher bist)
- Hinweis abhängig davon, ob sich seit dem Backup etwas geändert hat

---

## Technik

- **Gespeichert wird weiter im selben Eintrag**, neu ist nur `lastBackupAt` (ISO-Zeitpunkt): `{ version: 1, appointments, settings, lastBackupAt }`. Fehlt er (alle bisherigen Daten), gilt „Noch kein Backup“. Keine Umstellung nötig.
- **Backup-Datei** = dieser Eintrag mit `app: 'messtermine'` und `lastBackupAt` = Zeitpunkt des Speicherns, lesbar eingerückt.
- **Neue Datei `backup.js`** (testbar, ohne DOM):

| Funktion | Aufgabe |
|----------|---------|
| `backupFileName(now)` | `messtermine-backup-2026-10-01.json` |
| `createBackup(state, now)` | `{ text, lastBackupAt }` – JSON-Text der Datei |
| `parseBackup(text)` | `{ data }` mit ergänzten Standardwerten (`withDefaults`, `withAppointmentDefaults`) oder `{ error }` |
| `backupAgeDays(lastBackupAt, now)` | ganze Tage seit dem Backup, `null` ohne Backup |
| `needsBackupHint(state, now)` | `true`, wenn ≥ 1 Termin und Backup fehlt oder > 3 Tage alt |

- **Prüfung eines Termins im Backup:** `id` Text, `date` `YYYY-MM-DD`, `time` `HH:MM`, `durationMin` Zahl, `status` einer der drei Werte, `sent` Objekt. Ort und Mail-Tage dürfen fehlen (alte Daten).
- **`app.js`:** `load()` liest `lastBackupAt` mit; `exportBackup()` erzeugt die Datei; auf Touch-Geräten mit `navigator.canShare({ files })` über `navigator.share`, sonst Download (gleicher Weg wie „Zum Kalender“, Helfer `download()` für beide). Erst danach (bzw. nicht bei Abbruch) `lastBackupAt` setzen und speichern; `importBackup(file)` liest die Datei, fragt nach, ersetzt `state`, füllt Formular und Einstellungen neu. `render()` zeigt/versteckt den Hinweis und schreibt „Letztes Backup: …“.
- **`index.html` / `style.css`:** Hinweis-Leiste über dem Formular, Karte „Backup“ in den Einstellungen, verstecktes `<input type="file" accept=".json,application/json">` hinter dem Knopf „Backup wiederherstellen“.

---

## Deine Entscheidungen (bitte bestätigen oder ändern)

| # | Frage | Mein Vorschlag |
|---|-------|----------------|
| 1 | Wo liegen die Knöpfe? | ✅ Karte „Backup“ ganz oben in den Einstellungen; zusätzlich „Jetzt sichern“ im Hinweis über der Liste |
| 2 | Was passiert beim Wiederherstellen? | ✅ Alles ersetzen (Termine **und** Einstellungen) nach Rückfrage mit Anzahl; kein Zusammenführen |
| 3 | Wann erscheint der Hinweis? | ✅ Wenn ≥ 1 Termin existiert und das letzte Backup älter als 3 Tage ist oder fehlt; nicht wegklickbar |
| 4 | Speichern auf dem iPhone | ✅ Teilen-Menü → „In Dateien sichern“ → iCloud Drive/Claude/Backup App; Mac: Download |
| 5 | Dateiname | ✅ `messtermine-backup-JJJJ-MM-TT.json`, mehrere Backups am selben Tag bekommen vom System „-1“, „-2“ angehängt |
| 6 | Backup-Zeitpunkt nach dem Wiederherstellen | ✅ Der aus der Datei (nicht „jetzt“), damit der Hinweis ehrlich bleibt |

---

## Arbeitsschritte

1. `backup.js` + Tests (~20 Min)
2. Hinweis, Karte „Backup“, Export und Import in `index.html`/`app.js`/`style.css` (~25 Min)
3. Browser-Prüfung nach den Kriterien unten (~15 Min)

**Commits:** `feat: Backup als Fachlogik (Datei erzeugen, prüfen, Hinweis)` → `feat: Backup speichern und wiederherstellen, Hinweis über der Liste` → `docs: …`

---

## Definition of Done: Woran ich selbst erkenne, dass Slice 05 fertig ist

### A. Automatische Tests (`node --test` → alle grün, bisherige 46 weiterhin grün)

| # | Testfall | Erwartung |
|---|----------|-----------|
| A1 | `backupFileName` am 01.10.2026 | `messtermine-backup-2026-10-01.json` |
| A2 | `createBackup` → `parseBackup` (Hin und zurück) | gleiche Termine, Einstellungen, Backup-Zeitpunkt |
| A3 | `parseBackup` mit kaputtem JSON, fremder JSON-Datei, falscher `version` | jeweils `error`, kein `data` |
| A4 | `parseBackup` mit Termin ohne Datum / mit Status „egal“ | `error` nennt die Nummer des Termins |
| A5 | `parseBackup` mit Termin ohne Ort und Mail-Tage, ohne `settings` | Standard-Ort, 3 / 1 / 1, Standard-Einstellungen |
| A6 | `parseBackup` mit 0 Terminen | gültig, leere Liste |
| A7 | `needsBackupHint`: keine Termine | `false` |
| A8 | `needsBackupHint`: Termine, kein Backup | `true` |
| A9 | `needsBackupHint`: Backup vor 3 Tagen / vor 4 Tagen | `false` / `true` |
| A10 | `backupAgeDays` über die Zeitumstellung 25.10. | ganze Kalendertage, kein Versatz |

### B. Prüfung im eingebauten Browser (lokaler Server, 375 px)

| # | Schritt | Erwartung |
|---|---------|-----------|
| B1 | Leerer Speicher | kein Hinweis; Einstellungen zeigen „Noch kein Backup“ |
| B2 | Einen Termin anlegen | Hinweis „⚠︎ Noch kein Backup“ mit „Jetzt sichern“ über dem Formular |
| B3 | „Jetzt sichern“ (Browser ohne Touch → Download) | Datei `messtermine-backup-<heute>.json` mit dem Termin und den Einstellungen; Hinweis weg; Einstellungen zeigen „Letztes Backup: heute, Uhrzeit“; nach Neuladen weiterhin so |
| B4 | `lastBackupAt` auf vor 5 Tagen setzen, neu laden | „⚠︎ Letztes Backup vor 5 Tagen“ |
| B5 | Termin ändern, Häkchen setzen, Einstellung ändern, dann das Backup aus B3 wiederherstellen | Rückfrage mit beiden Anzahlen; nach OK alter Stand inkl. Einstellungen, Meldung „Backup wiederhergestellt“, ID-Vorschlag passt |
| B6 | Rückfrage mit „Abbrechen“ | nichts geändert |
| B7 | Kaputte Datei / fremde .json wählen | Fehlertext, nichts geändert |
| B8 | Dieselbe Datei zweimal hintereinander wiederherstellen | klappt beide Male |
| B8b | Teilen-Weg mit nachgebautem `navigator.share` (Touch): Erfolg / Abbruch | Erfolg → Backup-Zeitpunkt gesetzt; Abbruch → Hinweis bleibt, kein Fehler |
| B9 | Konsole; Layout 375 px hell + dunkel | keine Fehler, kein horizontales Scrollen, Knöpfe ≥ 44 px |

### C. Aufräumen
- Kein toter Code, keine `console.log`-Reste, Testdaten im Browser entfernt
- README: Dateitabelle, Ablauf, Abschnitt „Backup“ (wo die Datei landet, wie man sie zurückholt), Slice 05 aus „Nächste Schritte“ raus, Hinweis „vor dem Umzug in Slice 06 Backup speichern“
- „Ergebnis Slice 05“ unten in dieser Datei, danach Datei löschen (liegt dann in der Git-Historie)

### Nicht Teil meiner Definition of Done (prüfst du)
1. Speichern und Wiederherstellen auf dem echten iPhone (Teilen-Menü, Ordner „Backup App“)
2. Ein erstes echtes Backup deiner Daten anlegen

---

## Ergebnis Slice 05

**Stand:** 01.10.2026 · Tests: 54 grün (46 bisher + 8 neue in `tests/backup.test.js`)

- **A1–A10:** alle als automatische Tests umgesetzt und grün.
- **B1–B9:** im eingebauten Browser (375 px, hell + dunkel) geprüft. Der Teilen-Weg (B8b) lief mit nachgebautem `navigator.share`: Abbrechen lässt den Hinweis stehen und speichert keinen Backup-Zeitpunkt, Erfolg setzt ihn. Der Download-Weg lieferte `messtermine-backup-2026-10-01.json` mit Terminen und Einstellungen. Beim Wiederherstellen kamen Einstellungen, Häkchen und ID-Vorschlag zurück; Abbrechen, kaputte und fremde Dateien änderten nichts; dieselbe Datei ließ sich zweimal wählen. Keine Konsolenfehler, kein horizontales Scrollen, Knöpfe 44 px.
- **Abweichung vom Plan:** Die Zeitangaben lauten überall „Donnerstag, 1. Oktober, 18:30 Uhr“ (auch in der Rückfrage), statt zusätzlich „01.10.2026, 18:30“. Die Rückfrage heißt „… Der aktuelle Stand mit 2 Terminen und allen Einstellungen wird ersetzt.“, weil das auch bei einem einzelnen Termin grammatisch passt.
- **Prüfst du:** Teilen-Menü und Ordner „Backup App“ auf dem echten iPhone, dann ein erstes echtes Backup.
