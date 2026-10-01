# 03 – Plan: Slice 03 „Termin bearbeiten, Status, Vergangene“

**Datum:** 01.10.2026
**Phase:** 3 von 4 (Brainstorm ✅ → Align ✅ → **Plan** → Umsetzung)
**Grundlage:** `02-align.md` (Terminstatus, Absage/Verschiebung, Vergangene eingeklappt; in der Git-Historie: `git show 96fb1ac:02-align.md`)

---

## Warum dieser Slice jetzt?

Ab dem 04.10. trägst du echte Termine ein. Ein Tippfehler im Datum lässt sich bisher nicht korrigieren, eine Absage nicht festhalten, und nach ein paar Wochen ist die Liste voll mit erledigten Terminen. Slice 03 macht die App für den Alltag mit ~100 Terminen tauglich.

---

## Umfang Slice 03

### Drin
1. **Bearbeiten:** Knopf „Bearbeiten“ an jedem Termin. Er öffnet das **bekannte Formular oben** (statt eines zweiten Formulars in der Karte), vorausgefüllt, Überschrift „P-07 bearbeiten“, die Seite scrollt hin. Änderbar: ID, Datum, Uhrzeit, Dauer, **Status**. Knöpfe: „Speichern“, „Abbrechen“, „Löschen“.
2. **Status** geplant / durchgeführt / abgesagt als Auswahlfeld im Formular (beim Anlegen nicht sichtbar, neue Termine sind immer „geplant“). Auf der Karte:
   - **geplant:** wie bisher
   - **durchgeführt:** grünes Abzeichen „durchgeführt“, Mail 1 und 2 sind nicht mehr fällig, Mail 3 wie gehabt
   - **abgesagt:** graues Abzeichen „abgesagt“, Karte blass, **keine Mail-Zeilen und kein „Zum Kalender“** (nichts mehr zu tun)
3. **Mail 1 und 2 verfallen nach dem Messtag:** Ist das Datum vorbei (oder der Status „durchgeführt“), sind Vorbereitung und Erinnerung nicht mehr fällig. Bisher würden sie nach der Messung ewig als fällig leuchten.
4. **Löschen** mit Rückfrage: „P-07 wirklich löschen? Kalendereinträge löschst du von Hand.“ (Rückfrage des Systems, funktioniert auch auf dem iPhone)
5. **„Vergangene“ eingeklappt** unter der Liste: `▸ Vergangen & abgesagt (12)`. Dorthin wandert ein Termin, wenn er **abgesagt** ist oder **sein Datum vorbei ist und keine Mail mehr fällig** ist. Ein Termin von gestern mit offener Dank-Mail bleibt also oben, bis du sie abhakst. Neueste zuerst. Auf- und Zuklappen bleibt erhalten, solange die Seite offen ist.
6. **Prüfungen beim Bearbeiten** wie beim Anlegen; die eigene ID zählt nicht als „bereits vergeben“.
7. **Datum oder Uhrzeit geändert → alle 3 Häkchen „gesendet“ werden entfernt** (die Mails enthalten Datum und Uhrzeit). Dauer oder Status ändern lässt die Häkchen stehen.
8. **Hinweis nach dem Speichern**, wenn sich ID, Datum oder Uhrzeit geändert haben: „Kalender prüfen: alte Einträge von P-07 löschen und ‚Zum Kalender‘ neu tippen.“ (Meldung des Systems)

### Bewusst nicht drin
- Kalendereinträge anpassen, wenn sich Datum/Uhrzeit ändern (laut Align: alte Einträge löschst du von Hand, dann „Zum Kalender“ neu)
- Ein-Tipp-Knopf „✓ durchgeführt“ direkt auf der Karte (wäre schnell nachrüstbar, siehe Entscheidung 3)
- Rückgängig nach dem Löschen (die Rückfrage muss reichen; Backup kommt in Slice 05)
- Fortschrittszähler „xx/100“

---

## Technik

- **Datenmodell unverändert:** `status` gibt es seit Slice 01, nur bisher immer „geplant“. Keine Umstellung gespeicherter Daten nötig.
- **`logic.js`** (testbar, ohne DOM):

| Funktion | Aufgabe |
|----------|---------|
| `dueMails(appointment, today)` | erweitert: Mail 1/2 nur bis einschließlich Messtag und nicht bei „durchgeführt“ |
| `isArchived(appointment, today)` | neu: gehört der Termin zu „Vergangen & abgesagt“? |
| `validateAppointment(input, appointments, ownId)` | neu: die Prüfungen aus dem Formular (bisher in `app.js`), gibt Fehlertext oder `null` zurück |
| `applyEdit(appointment, changes)` | neu: geänderter Termin; Häkchen zurückgesetzt, wenn Datum/Uhrzeit anders; meldet, ob der Kalender geprüft werden muss |

- **`app.js`:** `updateAppointment()`, `deleteAppointment()`, Formular im Modus „neu“ oder „bearbeiten“ (`editingId`), `render()` teilt die Liste in aktuell und vergangen.
- **`index.html`:** Status-Feld, Knöpfe „Abbrechen“/„Löschen“ im Formular, `<details>` „Vergangen & abgesagt“ mit eigener Liste.
- **`style.css`:** Abzeichen für Status, blasse Karte bei „abgesagt“, Knopfzeile.

---

## Deine Entscheidungen (bestätigt 01.10.2026)

| # | Frage | Entscheidung |
|---|-------|--------------|
| 1 | Wo wird bearbeitet? | ✅ Feld „+ Neuer Termin“ oben wird zu „P-07 bearbeiten“, Seite springt hoch |
| 2 | Mail 1/2 nach dem Messtag | ✅ verfallen (nicht mehr fällig) |
| 3 | Status setzen | ✅ nur im Formular über „Bearbeiten“ |
| 4 | Was wandert nach „Vergangen“? | ✅ abgesagt oder Datum vorbei und keine Mail fällig; offene Dank-Mail bleibt oben |
| 5 | Abgesagte Karte | ✅ ohne Mails und ohne „Zum Kalender“ |
| 6 | ID änderbar? | ✅ ja, mit Prüfung auf Doppel und Hinweis „Kalender prüfen“ (auch bei Datum/Uhrzeit) |
| 7 | Häkchen nach Änderung | ✅ werden entfernt, wenn Datum oder Uhrzeit sich ändern |

---

## Arbeitsschritte

1. `logic.js` + Tests: `dueMails` erweitert, `isArchived`, `validateAppointment` (~20 Min)
2. Bearbeiten, Status, Löschen in `index.html`/`app.js`/`style.css` (~30 Min)
3. „Vergangen & abgesagt“ eingeklappt (~15 Min)
4. Browser-Prüfung nach den Kriterien unten (~15 Min)

**Commits:** `feat: Fachregeln für Status, Archiv und Prüfung` → `feat: Termin bearbeiten, Status setzen und löschen` → `feat: Vergangene und abgesagte Termine eingeklappt` → `docs: …`

---

## Definition of Done: Woran ich selbst erkenne, dass Slice 03 fertig ist

### A. Automatische Tests (`node --test` → alle grün, bisherige 23 weiterhin grün)

| # | Testfall | Erwartung |
|---|----------|-----------|
| A1 | Termin 14.10., heute 15.10., nichts gesendet | fällig nur `[3]` (Mail 1/2 verfallen) |
| A2 | Termin 14.10., heute 14.10. (Messtag), nichts gesendet | fällig `[1, 2]` |
| A3 | Status „durchgeführt“, heute 14.10. | fällig `[]`; am 15.10. `[3]` |
| A4 | Status „abgesagt“, heute 15.10. | fällig `[]` |
| A5 | `isArchived`: abgesagt in der Zukunft | `true` |
| A6 | `isArchived`: gestern, Mail 3 offen | `false`; Mail 3 gesendet → `true` |
| A7 | `isArchived`: heute oder Zukunft, geplant | `false` |
| A8 | `validateAppointment`: ID `p-7`, Datum fehlt, Dauer 300, ID doppelt | jeweils der bekannte Fehlertext |
| A9 | `validateAppointment` beim Bearbeiten mit eigener ID | `null` (kein Doppel-Fehler) |
| A10 | `applyEdit`: Datum oder Uhrzeit geändert, Mail 1 gesendet | alle Häkchen `false`, Kalender prüfen = ja |
| A11 | `applyEdit`: nur Dauer oder Status geändert | Häkchen unverändert, Kalender prüfen = nein |
| A12 | `applyEdit`: nur ID geändert | Häkchen unverändert, Kalender prüfen = ja |

### B. Prüfung im eingebauten Browser (lokaler Server, 375 px)

| # | Schritt | Erwartung |
|---|---------|-----------|
| B1 | Termin anlegen, „Bearbeiten“ tippen | Formular oben offen, vorausgefüllt, Überschrift „P-xx bearbeiten“, Status-Feld sichtbar, Seite oben |
| B2 | Datum und Dauer ändern, speichern | Karte zeigt neue Werte, Reihenfolge neu sortiert; nach Neuladen weiterhin geändert; Formular wieder „Neuer Termin“ mit nächster freier ID |
| B3 | Beim Bearbeiten ID eines anderen Termins eintragen | Fehlermeldung, nichts gespeichert |
| B3b | Datum ändern bei Termin mit abgehakter Mail 1 | Hinweis „Kalender prüfen …“ erscheint, Häkchen danach leer |
| B4 | „Abbrechen“ | nichts geändert, Formular leer im Modus „neu“ |
| B5 | Status „durchgeführt“ / „abgesagt“ | Abzeichen; abgesagt: Karte im eingeklappten Bereich, ohne Mails und Kalender-Knopf |
| B6 | Termin von vorgestern mit offener Mail 3 | oben in der Liste; Mail 3 abhaken → wandert nach „Vergangen & abgesagt (n)“, Zähler stimmt, Bereich bleibt zu/offen wie vorher |
| B7 | „Löschen“, Rückfrage verneinen / bestätigen | verneint: Termin bleibt; bestätigt: Termin weg, auch nach Neuladen |
| B8 | Konsole; Layout 375 px hell + dunkel | keine Fehler, kein horizontales Scrollen, alle Knöpfe ≥ 44 px |

### C. Aufräumen
- Kein toter Code, keine `console.log`-Reste, Testdaten im Browser entfernt
- README: Ablauf und Dateitabelle ergänzt, Slice 03 aus „Nächste Schritte“ raus
- „Ergebnis Slice 03“ unten in dieser Datei, danach Datei löschen (liegt dann in der Git-Historie)

### Nicht Teil meiner Definition of Done (prüfst du)
1. **Rückfrage beim Löschen auf dem iPhone** (erst ab Slice 06 auf dem Gerät testbar)
2. Gefühl im Alltag: Reicht „Bearbeiten → Status“ oder willst du doch den Ein-Tipp-Knopf (Entscheidung 3)?
