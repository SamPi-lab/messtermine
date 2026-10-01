# 03 – Plan: Slice 04 „Einstellungen und Vorlagen bearbeiten“

**Datum:** 01.10.2026
**Phase:** 3 von 4 (Brainstorm ✅ → Align ✅ → **Plan** → Umsetzung)
**Grundlage:** README „Nächste Schritte“, Entscheidungen aus `git show 96fb1ac:02-align.md` (Mails 3 Tage vorher / 1 Tag vorher / 1 Tag nachher, Erinnerung 6:30, Vorlagentexte)

---

## Warum dieser Slice jetzt?

Bisher stehen Mail-Tage, Erinnerungszeit, Standarddauer, Ort und die drei Vorlagen fest im Code. Fällt dir im Alltag ein Tippfehler in einer Mail auf oder willst du die Erinnerung lieber um 7:00, musst du mich fragen. Nach Slice 04 änderst du das selbst in der App.

---

## Umfang Slice 04

### Drin
1. **Eigene Seite „Einstellungen“:** Knopf „⚙︎ Einstellungen“ ganz unten unter der Liste. Er öffnet eine eigene Seite, die wie auf dem iPhone von rechts hereinschiebt. Oben links „‹ Termine“ führt zurück; die Zurück-Geste bzw. der Zurück-Knopf des Browsers tut dasselbe (Adresse `#einstellungen`). Ungespeicherte Änderungen werden beim Zurückgehen verworfen. Wischen mit dem Finger ist nicht nötig und nicht geplant.
2. **Mail-Tage:** Mail 1 „… Tage vor der Messung“ (Standard 3), Mail 2 „… Tage vor der Messung“ (Standard 1), Mail 3 „… Tage nach der Messung“ (Standard 1).
3. **Uhrzeit der Mail-Erinnerung** im Kalender (Standard 06:30).
4. **Standarddauer** neuer Termine (Standard 60 Min), wird im Formular „+ Neuer Termin“ vorausgefüllt.
5. **Ort pro Termin:** neues Feld „Ort“ im Termin-Formular, vorausgefüllt mit dem **Standard-Ort** aus den Einstellungen (Standard: „Große Bleiche 18–20, Mainz“), pro Termin änderbar. Der Ort steht auf der Karte unter Datum und Uhrzeit und als Ort im Kalendereintrag „Messung“. Bestehende Termine ohne Ort zeigen den Standard-Ort. Ändert sich der Ort beim Bearbeiten, kommt der Hinweis „Kalender prüfen“ (wie bei Datum/Uhrzeit); die Häkchen bleiben stehen.
6. **Platzhalter {Ort}** für die Vorlagen; Mail 1 setzt den Ort des Termins ein, damit ein geänderter Ort automatisch in der Mail steht (Wortlaut siehe Entscheidung 7).
7. **Vorlagen bearbeiten:** pro Mail Betreff und Text. Hinweis darüber: „Platzhalter: {Datum}, {Uhrzeit}, {Ort}“. Pro Vorlage ein Knopf „Standardtext“, der den Originaltext ins Feld zurückholt (wird erst mit „Speichern“ übernommen).
8. **Ein Knopf „Einstellungen speichern“** für alles. Prüfung vorher (siehe Entscheidung 4), Fehlertext wie im Termin-Formular.
9. **Wirkung:** Neue Mail-Tage gelten **nur für Termine, die du danach anlegst**: Jeder Termin merkt sich beim Anlegen die Tage, die gerade gelten. Bestehende Termine (auch alle aus der Zeit vor Slice 04) behalten 3 / 1 / 1, ihre Kalendereinträge passen also weiter. Neue Erinnerungs-Uhrzeit gilt für jede Kalender-Datei, die du ab jetzt erzeugst; schon importierte Einträge bleiben, wie sie sind. Neue Texte gelten für alle Mails, die du ab jetzt öffnest. Häkchen „gesendet“ bleiben stehen.
10. **Kein Hinweis nach dem Speichern** nötig, weil bestehende Termine ihre Tage behalten.

### Bewusst nicht drin
- Mail-Tage eines bestehenden Termins nachträglich ändern
- Vorlagen-Titel („Vorbereitung“, „Erinnerung“, „Dank + Video“) und der Hinweis „📎 Video anhängen!“ bleiben fest
- Weitere Platzhalter (z. B. Probanden-ID, Dauer)
- Standard-Ort nachträglich in bestehende Termine schreiben (wer einen eigenen Ort hat, behält ihn)
- Einstellungen pro Termin
- Rückgängig nach dem Speichern (Standardtext-Knopf reicht für die Vorlagen; Backup kommt in Slice 05)

---

## Technik

- **Gespeichert wird im selben Speicher-Eintrag** wie die Termine: `{ version: 1, appointments: [...], settings: {...} }`, jeder Termin bekommt `location`. Fehlen `settings` oder `location` (alle bisherigen Daten), gelten die Standardwerte, keine Umstellung nötig. Vorteil für Slice 05: Das Backup enthält die Einstellungen automatisch.
- **Neue Datei `settings.js`** (testbar, ohne DOM):

| Funktion / Wert | Aufgabe |
|-----------------|---------|
| `DEFAULT_SETTINGS` | Tage `{ 1: -3, 2: -1, 3: 1 }`, Uhrzeit `06:30`, Dauer 60, Ort „Große Bleiche 18–20, Mainz“, Vorlagen aus `templates.js` |
| `withDefaults(stored)` | ergänzt fehlende oder kaputte Werte aus den Standardwerten |
| `validateSettings(input)` | Fehlertext oder `null` |

- **Termin speichert seine Mail-Tage** als `mailOffsets` beim Anlegen.
- **`logic.js`:** `validateAppointment` prüft den Ort (nicht leer), `applyEdit` meldet „Kalender prüfen“ auch bei geändertem Ort, `fillTemplate` ersetzt {Ort}. `dueDate` nimmt die Tage aus dem Termin (`mailOffsets`, sonst Standard 3 / 1 / 1), damit die alten Tests unverändert gelten. `MAIL_OFFSETS` wandert nach `settings.js`.
- **`ics.js`:** `calendarEvents`/`buildIcs` nehmen die Tage aus dem Termin und die Uhrzeit aus den Einstellungen; Ort aus dem Termin statt `LOCATION`.
- **`templates.js`:** bleibt als Standardtexte, Kommentar angepasst.
- **`app.js`:** Einstellungen laden/speichern, Formular „Einstellungen“ füllen und lesen, `render()` und Mails nutzen `state.settings`.
- **`index.html` / `style.css`:** zweite Ansicht `<section id="settings-view">` neben der Terminliste (kein zweites HTML, damit es offline und als App vom Home-Bildschirm in Slice 06 einfach bleibt). Umschalten über die Adresse `#einstellungen` (`hashchange`), Hereinschieben per CSS-Animation, die bei „Bewegung reduzieren“ entfällt. Mehrzeilige Textfelder für die Vorlagen.

---

## Deine Entscheidungen (bitte bestätigen oder ändern)

| # | Frage | Mein Vorschlag |
|---|-------|----------------|
| 1 | Wo liegen die Einstellungen? | ✅ eigene Seite über Knopf „⚙︎ Einstellungen“ unten, schiebt von rechts herein, „‹ Termine“ zurück |
| 2 | Gelten neue Tage auch für bestehende Termine? | ✅ nein, nur für neu angelegte Termine; jeder Termin speichert seine Tage (`mailOffsets`), alte Termine ohne Angabe nutzen 3 / 1 / 1 |
| 3 | Was ist an den Vorlagen änderbar? | ✅ Betreff und Text; Titel und Video-Hinweis bleiben fest |
| 4 | Erlaubte Werte | ✅ Mail 1: 1–14 Tage vorher · Mail 2: 0–14 Tage vorher (0 = am Messtag) und nicht früher als Mail 1 · Mail 3: 0–14 Tage nachher · Dauer 5–240 Min · Betreff und Text nicht leer |
| 5 | Text von Mail 2 sagt „morgen“ | ✅ bleibt so, Mail 2 geht standardmäßig am Tag vorher raus; wer die Tage ändert, passt den Text selbst an |
| 6 | Speichern | ✅ ein Knopf für alles; „Standardtext“ pro Vorlage |
| 7 | Ort | ✅ pro Termin, auf Karte, im Kalender und in Mail 1. Vorschlag Wortlaut (offen): Standard-Ort „home of vitality, Große Bleiche 18–20, Mainz (Eingang links neben Netto, 2. Stock)“, Satz in Mail 1: „Wir treffen uns am {Datum} um {Uhrzeit} Uhr hier: {Ort}. Insgesamt dauert die Messung ca. 40–60 Minuten.“ |

---

## Arbeitsschritte

1. `settings.js` + Tests; `logic.js` und `ics.js` auf übergebene Einstellungen umstellen (~25 Min)
2. Bereich „Einstellungen“ in `index.html`/`app.js`/`style.css` (~30 Min)
3. Browser-Prüfung nach den Kriterien unten (~15 Min)

**Commits:** `feat: Einstellungen als Fachlogik, Mail-Tage und Uhrzeit übergeben` → `feat: Bereich Einstellungen mit bearbeitbaren Vorlagen` → `docs: …`

---

## Definition of Done: Woran ich selbst erkenne, dass Slice 04 fertig ist

### A. Automatische Tests (`node --test` → alle grün, bisherige 35 weiterhin grün)

| # | Testfall | Erwartung |
|---|----------|-----------|
| A0 | Termin ohne `mailOffsets` (alte Daten) | Tage 3 / 1 / 1 |
| A1 | `withDefaults(undefined)` und `withDefaults({})` | genau `DEFAULT_SETTINGS` |
| A2 | `withDefaults` mit nur geänderter Uhrzeit | Uhrzeit übernommen, Rest Standard |
| A3 | `validateSettings`: Mail 1 = 0, Mail 2 früher als Mail 1, Mail 3 = 15, Dauer 300, leerer Betreff | jeweils ein Fehlertext |
| A4 | `validateSettings` mit Standardwerten | `null` |
| A5 | `dueMails` mit am Termin gespeicherten Tagen `{1: -5, 2: 0, 3: 2}`, Termin 14.10. | 09.10. → `[1]`; 14.10. → `[1, 2]`; 15.10. → `[]`; 16.10. → `[3]` |
| A6 | `calendarEvents` mit Uhrzeit 07:00 und Tagen `{1: -5, …}` | Erinnerung Mail 1 am 09.10. um 07:00 |
| A7 | `fillTemplate` mit geänderter Vorlage und {Ort} | Platzhalter ersetzt |
| A8 | `validateAppointment` mit leerem Ort | Fehlertext |
| A9 | `applyEdit`: nur Ort geändert | Häkchen unverändert, Kalender prüfen = ja |
| A10 | `calendarEvents` mit eigenem Ort | Messung hat diesen Ort |

### B. Prüfung im eingebauten Browser (lokaler Server, 375 px)

| # | Schritt | Erwartung |
|---|---------|-----------|
| B1 | Ohne gespeicherte Einstellungen „⚙︎ Einstellungen“ tippen | eigene Seite schiebt herein, Adresse `#einstellungen`; dort 3 / 1 / 1, 06:30, 60, Große Bleiche und die bisherigen Texte |
| B1b | „‹ Termine“ und Zurück des Browsers; Feld ändern ohne Speichern, zurück, wieder öffnen | jeweils zurück zur Liste an derselben Stelle; Änderung verworfen |
| B1c | Seite mit `#einstellungen` neu laden | Einstellungen direkt offen |
| B2 | Mail 1 auf 5 Tage, speichern, neuen Termin anlegen | kein Hinweis; bestehende Karten unverändert „fällig ab“ 3 Tage vorher, neuer Termin 5 Tage vorher; nach Neuladen weiterhin so |
| B3 | Standarddauer 45, speichern | „+ Neuer Termin“ zeigt 45 |
| B4 | Betreff Mail 2 ändern, speichern, „Öffnen“-Link prüfen | Link enthält den neuen Betreff mit eingesetztem Datum |
| B5 | „Standardtext“ bei Mail 2, speichern | wieder der Originalbetreff |
| B6 | Ungültige Werte (Mail 1 = 0, leerer Text) | Fehlermeldung, nichts gespeichert |
| B7 | Texte geändert | Häkchen unverändert |
| B8 | Kalender-Datei nach Uhrzeit 07:00 | Erinnerungen um 07:00 |
| B9 | Neuer Termin | Feld „Ort“ zeigt „Große Bleiche 18–20, Mainz“, Karte zeigt den Ort; Ort ändern → Karte, Kalender-Datei und Hinweis „Kalender prüfen“ |
| B10 | Termin aus der Zeit vor Slice 04 (ohne Ort) | Karte zeigt Standard-Ort, keine Fehler |
| B11 | Konsole; Layout 375 px hell + dunkel | keine Fehler, kein horizontales Scrollen, alle Knöpfe ≥ 44 px, Textfelder gut lesbar |

### C. Aufräumen
- Kein toter Code, keine `console.log`-Reste, Testdaten und Testeinstellungen im Browser entfernt
- README: Dateitabelle und Ablauf ergänzt, Slice 04 aus „Nächste Schritte“ raus
- „Ergebnis Slice 04“ unten in dieser Datei, danach Datei löschen (liegt dann in der Git-Historie)

### Nicht Teil meiner Definition of Done (prüfst du)
1. Bedienung der großen Textfelder auf dem iPhone (Slice 06)
2. Ob du die Texte nach den ersten echten Mails anpassen willst
