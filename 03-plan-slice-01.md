# 03 – Plan: Slice 01 „Termin rein, fällige Mail raus“

**Datum:** 30.09.2026
**Phase:** 3 von 4 (Brainstorm ✅ → Align ✅ → **Plan** → Umsetzung)
**Grundlage:** `01-brainstorm.md`, `02-align.md`

---

## Warum dieser Slice zuerst?

Ein Vertical Slice geht einmal durch alle Schichten (Eingabe → Speicher → Logik → Anzeige → Aktion). Slice 01 deckt den **Kern-Nutzen** der App ab: *nicht mehr daran denken müssen, wann welche Mail fällig ist, und nicht mehr tippen.*

Gleichzeitig räumt er zwei Grundlagen aus dem Weg, auf die alle weiteren Slices aufbauen:
- **Fälligkeitslogik** (Kalendertage, Sommerzeit am 25.10.2026, kurzfristige Termine)
- **`mailto:`-Kodierung** (Umlaute, Zeilenumbrüche, Aufzählung; Risiko 3 aus `02-align.md`)

Nach Slice 01 ist die App schon im Alltag nutzbar, nur noch ohne Kalender-Export, Backup und Installation.

### Slice-Fahrplan (Überblick)

| Slice | Inhalt | Schätzung |
|-------|--------|-----------|
| **01** | **Termin anlegen → Liste → fällige Mail per Tipp öffnen → ✓ gesendet** | **~1,5 h** |
| 02 | „Zum Kalender“: .ics mit Messung + 3 Mail-Erinnerungen (Europe/Berlin, Sommerzeit) | ~1 h |
| 03 | Termin bearbeiten/löschen, Status geplant/durchgeführt/abgesagt, „Vergangene“ eingeklappt | ~0,75 h |
| 04 | Einstellungen (Tage, 6:30 Uhr, Standarddauer) + Vorlagen bearbeiten | ~0,75 h |
| 05 | Backup Export/Import + Hinweis-Banner nach 3 Tagen | ~0,5 h |
| 06 | PWA (Manifest, Offline, `storage.persist()`) + GitHub Pages + iPhone-Test | ~0,75 h |

*Reihenfolge von 02–06 wird nach jedem Slice kurz überprüft. Slice 02 kommt früh, weil das .ics-Verhalten im PWA-Modus das größte technische Risiko ist.*

---

## Umfang Slice 01

### Drin
1. **Termin anlegen:** Formular mit Probanden-ID (Vorschlag = höchste vorhandene Nummer + 1, z. B. `P-03`, überschreibbar), Datum, Uhrzeit, Dauer (Standard 60 Min)
2. **Speichern** lokal im Browser (`localStorage`), überlebt Neuladen
3. **Terminliste** chronologisch (Datum + Uhrzeit), pro Termin: ID, „Mittwoch, 14. Oktober, 10:00 Uhr“, Dauer
4. **Fällig-Markierung** am Termin für Mail 1/2/3:
   - fällig ab: Mail 1 = 3 Tage vorher, Mail 2 = Vortag, Mail 3 = Tag danach (reine Kalendertage, auch Wochenende)
   - kurzfristiger Termin → Mail sofort fällig
   - Mails, die noch nicht fällig sind, werden nicht als fällig markiert
5. **Mail per Tipp öffnen:** `mailto:` mit leerem Empfänger, Betreff + Text aus den freigegebenen Vorlagen, `{Datum}`/`{Uhrzeit}` ersetzt
6. **Mail 3:** deutlicher Hinweis **„📎 Video anhängen!“**
7. **Häkchen „gesendet“** pro Mail → Mail verschwindet aus „fällig“, bleibt nach Neuladen gespeichert

### Bewusst nicht drin (spätere Slices)
Bearbeiten/Löschen, Terminstatus, Vergangene einklappen, .ics, Einstellungen, Vorlagen bearbeiten (Vorlagen sind in Slice 01 fest im Code), Backup, PWA/Offline, Hosting.

*Zum Testen ohne Löschfunktion: Daten lassen sich in den Browser-Entwicklertools leeren. Löschen folgt in Slice 03.*

---

## Technik

- **Reines HTML/CSS/JavaScript**, keine Frameworks, kein Build-Schritt → später 1:1 auf GitHub Pages
- **Fachlogik getrennt von der Oberfläche**, damit sie automatisch testbar ist. Alle Funktionen, die „heute“ brauchen, bekommen das Datum als Parameter (keine versteckte Uhr).
- Datumsrechnung **nur mit Kalenderdaten** (`YYYY-MM-DD`), nicht mit Millisekunden → Sommerzeit kann nicht dazwischenfunken
- Tests mit dem eingebauten Test-Runner von Node (`node --test`, Node 24 ist installiert)
- Lokaler Server für den Browser-Test: `python3 -m http.server` (über `.claude/launch.json`)

### Dateien

```
4. Projekt/
├── index.html          Grundgerüst, Formular, Liste
├── style.css           mobil zuerst (iPhone-Breite)
├── app.js              Oberfläche: Formular, Liste, Klicks, localStorage
├── logic.js            reine Funktionen (siehe unten)
├── templates.js        die 3 freigegebenen Vorlagen aus 02-align.md
├── tests/logic.test.js automatische Tests
└── .claude/launch.json lokaler Server für die Vorschau
```

### Datenmodell (`localStorage`, Schlüssel `probanden-termine`)

```json
{
  "version": 1,
  "appointments": [
    {
      "id": "P-07",
      "date": "2026-10-14",
      "time": "10:00",
      "durationMin": 60,
      "status": "geplant",
      "sent": { "1": false, "2": false, "3": false }
    }
  ]
}
```
Keine Namen, keine E-Mail-Adressen, keine weiteren Felder. `status` ist schon angelegt (immer „geplant“), damit Slice 03 kein neues Format braucht.

### Funktionen in `logic.js`

| Funktion | Aufgabe |
|----------|---------|
| `suggestNextId(appointments)` | `[]` → `P-01`; `P-01, P-02` → `P-03`; `P-01, P-05` → `P-06`; ab 100 dreistellig (`P-100`) |
| `addDays(dateStr, n)` | Kalendertage addieren, über Monats- und Sommerzeitgrenzen hinweg |
| `formatDateDe(dateStr)` | `2026-10-14` → „Mittwoch, 14. Oktober“ |
| `dueDate(appointment, mailNr)` | Fälligkeitsdatum nach Offsets −3 / −1 / +1 |
| `dueMails(appointment, today)` | Liste der fälligen, noch nicht gesendeten Mails |
| `fillTemplate(template, appointment)` | Platzhalter ersetzen → `{ subject, body }` |
| `mailtoHref(subject, body)` | `mailto:?subject=…&body=…` mit `encodeURIComponent`, Zeilenumbrüche als `%0D%0A` |

---

## Arbeitsschritte

1. `logic.js` + Tests schreiben, Tests grün (~30 Min)
2. `templates.js` mit den Texten aus `02-align.md` 1:1 übernehmen (~5 Min)
3. `index.html` / `style.css` / `app.js`: Formular, Liste, Fällig-Markierung, Mail-Knopf, Häkchen (~40 Min)
4. `.claude/launch.json` + Browser-Prüfung nach den Kriterien unten (~15 Min)

---

## Definition of Done: Woran ich selbst erkenne, dass Slice 01 fertig ist

Jedes Kriterium prüfe ich **selbst** (Terminal oder eingebauter Browser) und hake es erst ab, wenn es nachweislich erfüllt ist. Schlägt eines fehl, ist der Slice nicht fertig.

### A. Automatische Tests (`node --test` → alle grün, 0 Fehler)

| # | Testfall | Erwartung |
|---|----------|-----------|
| A1 | ID-Vorschlag: leer / `P-01,P-02` / `P-01,P-05` / `P-99` | `P-01` / `P-03` / `P-06` / `P-100` |
| A2 | Datum formatieren: `2026-10-14`, `2026-11-01` | „Mittwoch, 14. Oktober“, „Sonntag, 1. November“ |
| A3 | Fälligkeit über Sommerzeit: Termin `2026-10-27` | Mail 1 `2026-10-24` (Sa), Mail 2 `2026-10-26`, Mail 3 `2026-10-28` |
| A4 | Fälligkeit über Monatsgrenze: Termin `2026-11-01` | Mail 1 `2026-10-29`, Mail 2 `2026-10-31`, Mail 3 `2026-11-02` |
| A5 | Fällig-Liste, heute = `2026-10-10`, Termin `2026-10-14` | keine Mail fällig |
| A6 | heute = `2026-10-11` (genau 3 Tage vorher) | Mail 1 fällig |
| A7 | kurzfristig: heute = `2026-10-13`, Termin `2026-10-14` | Mail 1 **und** Mail 2 fällig (sofort) |
| A8 | Mail 1 als gesendet markiert, heute = `2026-10-13` | nur Mail 2 fällig |
| A9 | Vorlagen füllen, alle 3 Mails | kein `{` oder `}` mehr in Betreff/Text; Datum + Uhrzeit korrekt eingesetzt |
| A10 | `mailto`-Rundreise | `decodeURIComponent` von Betreff/Text ergibt exakt den gefüllten Text, inkl. ä/ö/ü/ß, „–“, Aufzählungszeichen und Leerzeilen; kein `+` statt Leerzeichen |

### B. Prüfung im eingebauten Browser (lokaler Server, iPhone-Breite 375 px)

| # | Schritt | Erwartung |
|---|---------|-----------|
| B1 | App leer öffnen | Formular sichtbar, ID-Vorschlag `P-01`, Dauer 60 |
| B2 | Termin übermorgen speichern | erscheint in der Liste mit korrektem deutschen Datum, nur Mail 1 fällig |
| B3 | Zweiten Termin anlegen | Vorschlag `P-02`; Liste nach Datum + Uhrzeit sortiert, auch wenn später angelegt aber früher stattfindend |
| B4 | Termin **morgen** ansehen *(korrigiert, siehe Ergebnis)* | „Mail 1 fällig“ und „Mail 2 fällig“ sichtbar (kurzfristig), Mail 3 nicht |
| B5 | `href` des Mail-1-Knopfs auslesen und dekodieren | beginnt mit `mailto:?`, Empfänger leer, Betreff + Text = Vorlage mit eingesetztem Datum/Uhrzeit |
| B6 | Mail-3-Knopf eines Termins, dessen Mail 3 fällig ist | Hinweis „📎 Video anhängen!“ sichtbar |
| B7 | Mail 1 „gesendet“ abhaken, Seite neu laden | Mail 1 nicht mehr fällig, Häkchen bleibt gesetzt, beide Termine noch da |
| B8 | `localStorage` inspizieren | nur Felder aus dem Datenmodell, keine Namen/E-Mails |
| B9 | Konsole | keine Fehler, keine Warnungen aus eigenem Code |
| B10 | Layout bei 375 px | kein horizontales Scrollen, Knöpfe mit dem Daumen gut tippbar (≥ 44 px hoch) |

### C. Aufräumen
- Kein toter Code, keine `console.log`-Reste
- Test-Daten aus dem Browser wieder entfernt
- Kurzer Abschnitt „Ergebnis Slice 01“ unten in dieser Datei ergänzt (was geprüft, was aufgefallen, was in den nächsten Slice wandert)

### Nicht Teil meiner Definition of Done (kann ich nicht selbst prüfen)
- **Wie Apple Mail auf dem iPhone den Text tatsächlich darstellt** (Zeilenumbrüche, Aufzählung). Das prüfst du, sobald die App erreichbar ist: spätestens in Slice 06 (GitHub Pages), optional schon vorher über den Mac im selben WLAN. Bis dahin gilt A10 + B5 als bestmöglicher Nachweis.

---

## Ergebnis Slice 01

**Status: ✅ fertig** (01.10.2026). Alle Kriterien aus A, B und C sind nachweislich erfüllt.

### Nachweise
- **A:** `node --test` → 11/11 grün (A1–A10 + Sortierung)
- **B** (eingebauter Browser, 375 px, heute = 01.10.2026), Testtermine über das Formular angelegt:
  - P-01 Sa 03.10. 10:00 (übermorgen) → nur Mail 1 fällig, Mail 2 „fällig ab Freitag, 2. Oktober“
  - P-02 Fr 02.10. 09:00 (morgen, später angelegt) → Mail 1 + 2 fällig, in der Liste vor P-01
  - P-03 Mi 30.09. 14:30, 45 Min (gestern) → alle 3 fällig, „📎 Video anhängen!“ sichtbar, Liste ganz oben
  - Vorschlag nach jedem Speichern korrekt (P-02, P-03, P-04); Eingabe `p-01` wird abgelehnt: „P-01 ist bereits vergeben.“
  - Alle 9 `mailto:`-Links ausgelesen und dekodiert: Betreff und Text identisch mit Vorlage, Empfänger leer
  - P-02 Mail 1 abgehakt → nach Neuladen weiter ✓, Badge „1 Mail fällig“, alle 3 Termine vorhanden
  - `localStorage`: ein Schlüssel `probanden-termine`, nur Felder `id, date, time, durationMin, status, sent`
  - Konsole leer; kein horizontales Scrollen; kleinste Tippfläche 44 px; hell und dunkel geprüft
- **C:** keine `console.log`-Reste, Testdaten im Browser gelöscht

### Aufgefallen
- **B4 war im Plan falsch formuliert:** Bei einem Termin *übermorgen* ist Mail 2 erst *morgen* fällig. „Mail 1 + 2 sofort fällig“ gilt für einen Termin *morgen*. Kriterium korrigiert und so geprüft.
- **Layout:** Mail-Titel brachen bei 375 px unschön um. Jetzt zweizeilig („MAIL 1“ klein, darunter der Titel). Im Dunkelmodus hatte der blaue Knopf zu wenig Kontrast, jetzt iOS-Dunkelblau.
- Zusätzlich zum Plan: doppelte IDs werden abgelehnt, Kleinschreibung (`p-01`) wird zu `P-01`. Bei abgesagten Terminen sind keine Mails fällig; die Logik dafür ist schon drin, die Bedienung kommt in Slice 03.
- Mails sind auch vor ihrer Fälligkeit über „Öffnen“ erreichbar (umrandeter Knopf), falls du früher senden willst.

### Mitnehmen in spätere Slices
- **Slice 03:** Ohne Löschfunktion lässt sich ein vertippter Termin aktuell nicht korrigieren. Deshalb Slice 03 ggf. vor Slice 02 ziehen, falls du die App schon produktiv nutzt.
- **Slice 06 / Abnahme durch dich:** Darstellung des Mail-Texts in Apple Mail auf dem iPhone prüfen.

### Erster Praxistest (01.10.2026)
P-01 (So 04.10., 09:00) in Safari auf dem Mac angelegt, Mail 1 war am selben Tag fällig. „Öffnen“ hat Apple Mail mit Betreff und Text geöffnet ✅.

### Starten
Lokal: `python3 -m http.server 8123` im Projektordner, dann http://localhost:8123 öffnen. Tests: `node --test`.
