# 03 – Plan: Slice 02 „Zum Kalender“

**Datum:** 01.10.2026
**Phase:** 3 von 4 (Brainstorm ✅ → Align ✅ → **Plan** → Umsetzung)
**Grundlage:** `02-align.md` (Abschnitt „Kalender (.ics)“), `03-plan-slice-01.md` (beide in der Git-Historie: `git show 96fb1ac`)

---

## Warum dieser Slice jetzt?

Slice 01 sagt dir in der App, welche Mail fällig ist. Damit du nicht jeden Morgen selbst nachsehen musst, braucht es die **Erinnerungen im iPhone-Kalender**. Außerdem steckt hier das größte technische Risiko des Projekts: die **Zeitzone mit der Umstellung am 25.10.2026** und das **Verhalten von .ics-Dateien auf iOS**. Je früher wir das sehen, desto besser.

---

## Umfang Slice 02

### Drin
1. **Knopf „Zum Kalender“** an jedem Termin in der Liste
2. Tipp lädt **eine .ics-Datei** `P-07.ics` mit bis zu **4 Einträgen**:

| Eintrag | Titel | Zeit | Ort | Alarm |
|---------|-------|------|-----|-------|
| Messung | `Messung P-07` | Datum + Uhrzeit, Länge = Dauer | home of vitality, Große Bleiche 18–20, 55116 Mainz (Eingang links neben Netto, 2. Stock) | 1 h vorher |
| Mail 1 | `P-07 Mail 1` | 3 Tage vorher, 6:30–6:45 | – | zur Startzeit |
| Mail 2 | `P-07 Mail 2` | Vortag, 6:30–6:45 | – | zur Startzeit |
| Mail 3 | `P-07 Mail 3` | Tag danach, 6:30–6:45 | – | zur Startzeit |

3. **Kurzfristige Termine:** Ist der Zeitpunkt einer Mail-Erinnerung (Tag + 6:30) schon vorbei, wird sie **nicht weggelassen**, sondern auf **5–10 Min nach dem Export** gelegt (nächste volle 5 Minuten + 5). So kommt das Pop-up trotzdem, und du entscheidest selbst *(geändert gegenüber `02-align.md`, Entscheidung 01.10.2026)*. Eine Mail, die schon als **gesendet** abgehakt ist, bekommt keine Erinnerung.
   - **Pop-up bleibt stehen:** lässt sich nicht über die .ics steuern, sondern am iPhone: Einstellungen → Mitteilungen → Kalender → Banner-Stil „Dauerhaft“. Ab Slice 06 (feste Adresse) kann jeder Eintrag einen Link zur App bekommen.
4. **Zeitzone:** Alle Zeiten mit `TZID=Europe/Berlin` plus eingebetteter Zeitzonen-Definition (Sommer-/Winterzeit). So steht eine Messung am 27.10. um 10:00 auch nach der Umstellung auf 10:00.
5. **Feste Kennung (UID) pro Eintrag**, z. B. `P-07-messung@messtermine`. Exportierst du denselben Termin zweimal, kann der Kalender den Eintrag wiedererkennen statt ihn zu verdoppeln (verhält sich je nach Kalender-App unterschiedlich, siehe unten).
6. Im Kalender stehen **nur IDs**, keine Namen.

### Bewusst nicht drin
- Einträge aktualisieren oder löschen, wenn sich ein Termin ändert (laut Align: löschst du von Hand)
- Merker „schon im Kalender“ am Termin
- Alle Termine auf einmal exportieren
- Uhrzeit 6:30 einstellbar machen → Slice 04 (hier fest im Code, wie die Offsets in Slice 01)

---

## Technik

- Neue Datei **`ics.js`**: reine Funktionen, kein DOM, „jetzt“ wird übergeben (wie `logic.js`). Nutzt `addDays` und `MAIL_OFFSETS` aus `logic.js`.
- In **`app.js`** nur: Knopf rendern, beim Tipp Datei als `Blob` (`text/calendar`) erzeugen und mit `<a download="P-07.ics">` herunterladen.
- **Datenmodell unverändert.**

### Funktionen in `ics.js`

| Funktion | Aufgabe |
|----------|---------|
| `calendarEvents(appointment, now)` | Liste der Einträge (Titel, Start, Ende, Ort, Alarm, UID); lässt gesendete Mail-Erinnerungen weg, verschiebt vergangene auf kurz nach jetzt |
| `buildIcs(appointment, now)` | fertiger Dateitext: `VCALENDAR` + `VTIMEZONE` + `VEVENT`s, Zeilenende `\r\n` |
| `escapeText(text)` | Komma, Semikolon, Backslash und Zeilenumbruch nach iCalendar-Regeln maskieren |
| `foldLine(line)` | Zeilen über 75 Byte umbrechen (wichtig für die Adresse mit „ß“ und „–“) |

---

## Arbeitsschritte

1. `ics.js` + Tests (`tests/ics.test.js`), Tests grün (~30 Min)
2. Knopf „Zum Kalender“ in `app.js` + `style.css` (~15 Min)
3. Browser-Prüfung nach den Kriterien unten (~15 Min)

**Commits:** `feat: .ics-Erzeugung für Messung und Mail-Erinnerungen` → `feat: Knopf „Zum Kalender“ am Termin` → `docs: …`

---

## Definition of Done: Woran ich selbst erkenne, dass Slice 02 fertig ist

### A. Automatische Tests (`node --test` → alle grün, Slice-01-Tests weiterhin grün)

| # | Testfall | Erwartung |
|---|----------|-----------|
| A1 | Termin `2026-10-14 10:00`, 60 Min, jetzt = `2026-10-01` | 4 Einträge; Messung `20261014T100000`–`110000`; Mail 1/2/3 am `20261011`/`20261013`/`20261015` um `063000` |
| A2 | Sommerzeit: Termin `2026-10-27 10:00`, 45 Min | Messung `DTSTART;TZID=Europe/Berlin:20261027T100000`, Ende `104500`; Mail 1 am `20261024` (vor der Umstellung) um `063000` |
| A3 | Dauer über die volle Stunde: `09:30`, 45 Min | Ende `101500` |
| A4 | Kurzfristig: Termin `2026-10-14`, jetzt = `2026-10-13 07:02` | 4 Einträge; Mail 1 **und** Mail 2 am `20261013` um `071000`, Mail 3 regulär `20261015T063000` |
| A5 | Grenzfall: jetzt = `2026-10-13 06:00` | Mail 2 regulär um `063000`, nur Mail 1 verschoben auf `061000` |
| A5b | Verschieben über Mitternacht: jetzt = `2026-10-13 23:57` | Mail 1/2 am `20261014T000500` |
| A6 | Mail 1 als gesendet markiert | keine Mail-1-Erinnerung |
| A7 | Alarme | Messung `TRIGGER:-PT1H`, Mail-Erinnerungen `TRIGGER:PT0S`, jeweils `ACTION:DISPLAY` |
| A8 | Titel, UIDs, Datenschutz | `Messung P-07`, `P-07 Mail 1…3`; UIDs eindeutig und stabil (zweimal erzeugt = gleiche UIDs); kein „Herr/Frau“ und kein Vorlagentext in der Datei |
| A9 | Dateiformat | beginnt mit `BEGIN:VCALENDAR`, endet mit `END:VCALENDAR\r\n`; jede Zeile endet mit `\r\n`; **keine Zeile über 75 Byte**; `VERSION:2.0`, `PRODID`, `DTSTAMP` vorhanden; `BEGIN`/`END` paarweise |
| A10 | Ort mit Sonderzeichen | `LOCATION` nach Entfalten + Entmaskieren exakt die Adresse inkl. „ß“, „–“ und Kommas |
| A11 | Zeitzone | genau ein `VTIMEZONE` mit `TZID:Europe/Berlin`, Sommerzeit ab letztem Sonntag im März, Winterzeit ab letztem Sonntag im Oktober |

### B. Prüfung im eingebauten Browser (lokaler Server, 375 px)

| # | Schritt | Erwartung |
|---|---------|-----------|
| B1 | Termin in 10 Tagen anlegen | Knopf „Zum Kalender“ am Termin sichtbar, ≥ 44 px hoch |
| B2 | Knopf tippen, erzeugte Datei abfangen und auslesen | Dateiname `P-xx.ics`, Typ `text/calendar`, Inhalt mit 4 `VEVENT`, Zeiten wie in A1 |
| B3 | Termin morgen anlegen, Datei auslesen | 4 Einträge, Mail 1 + 2 kurz nach jetzt, Mail 3 übermorgen 6:30 |
| B4 | Mail 1 eines Termins abhaken, Datei erneut erzeugen | ohne Mail-1-Erinnerung |
| B5 | Konsole | keine Fehler |
| B6 | Layout 375 px, hell + dunkel | kein horizontales Scrollen, Knopf passt zur Optik aus Slice 01 |

### C. Aufräumen
- Kein toter Code, keine `console.log`-Reste, Testdaten im Browser entfernt
- README: Datei `ics.js` in der Tabelle, Slice 02 aus „Nächste Schritte“ raus
- „Ergebnis Slice 02“ unten in dieser Datei

### Nicht Teil meiner Definition of Done (prüfst du)
1. **Mac:** In Safari auf „Zum Kalender“ tippen → Datei öffnen → Kalender zeigt 4 Einträge zu den richtigen Zeiten (ich öffne keine Datei in deinem echten Kalender).
2. **iPhone:** Verhalten von Download → „Alle hinzufügen“. Geht erst ab Slice 06 (GitHub Pages) oder vorher über den Mac im selben WLAN. Falls iOS die Datei nur in „Dateien“ ablegt statt den Kalender zu öffnen, bauen wir dort einen Ausweg (z. B. Öffnen als Link statt Download).
3. **Doppelter Export:** Ob Apple Kalender bei gleicher UID ersetzt oder verdoppelt, sehen wir erst bei dir.

---

## Ergebnis Slice 02

**Status: ✅ fertig** (01.10.2026). Alle Kriterien aus A, B und C sind nachweislich erfüllt.

### Nachweise
- **A:** `node --test` → 23/23 grün (12 neue für `ics.js`, 11 aus Slice 01). Zusätzlich mit `TZ=America/New_York` grün, die Tests hängen also nicht an der Zeitzone des Rechners.
- **B** (eingebauter Browser, 375 px, jetzt = 01.10.2026, 09:11), Termine über das Formular angelegt, Downloads abgefangen und ausgelesen:
  - P-01 So 11.10. 10:00 → `P-01.ics`, `text/calendar`, nur CRLF; Messung 11.10. 10:00 (Alarm −1 h), Mail 1/2/3 am 08./10./12.10. um 6:30 (Alarm zur Startzeit)
  - P-02 Fr 02.10. 09:00 (morgen) → Mail 1 + 2 um **09:20** (vergangen, also 5–10 Min nach jetzt), Mail 3 am 03.10. um 6:30
  - P-01 Mail 1 abgehakt → neue Datei ohne Mail-1-Erinnerung
  - Echter Download ohne Abfangen: keine Fehler; Konsole leer; kein horizontales Scrollen; Knopf 44 px hoch; hell und dunkel geprüft
- **C:** keine `console.log`-Reste, Testdaten im Browser gelöscht, README aktualisiert

### Aufgefallen
- **Geändert gegenüber Align:** Vergangene Mail-Erinnerungen werden nicht weggelassen, sondern kurz nach dem Export gelegt (deine Entscheidung).
- **Pop-up, das stehen bleibt:** nicht über die Datei steuerbar. Am iPhone: Einstellungen → Mitteilungen → Kalender → Banner-Stil „Dauerhaft“.
- Port 8123 war durch die Vorschau eines anderen Chats belegt. Die Vorschau nimmt jetzt einen freien Port; `python3 -m http.server 8123` funktioniert weiter wie gehabt.

### Prüfst du
1. **Mac:** Safari → „Zum Kalender“ → `P-xx.ics` öffnen → Kalender zeigt 4 Einträge zu den richtigen Zeiten, mit Alarmen.
2. **iPhone** (Slice 06): Download → „Alle hinzufügen“ und Banner-Stil „Dauerhaft“.
3. **Doppelter Export:** Ersetzt der Kalender die Einträge oder verdoppelt er sie?
