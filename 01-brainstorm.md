# 01 – Brainstorm: Termin- & Kommunikations-Web-App für Probanden-Messungen

**Datum:** 30.09.2026
**Phase:** 1 von 4 (Brainstorm ✅ → Align → Plan → Umsetzung)
**Methode:** Sechs Denkhüte + MoSCoW-Priorisierung
*(gewählt, weil die Idee bereits konkret ist: erst aus sechs Blickwinkeln prüfen, dann für das 3–5 h-Budget priorisieren)*

---

## Die Idee in einem Satz

Eine Web-App auf dem iPhone-Home-Bildschirm, mit der ich die Messtermine meiner Studie verwalte. Sie erinnert mich an fällige E-Mails (Vorab-Info, Erinnerung, Dank + Video), öffnet sie vorausgefüllt aus Vorlagen und übernimmt die Termine in meinen iPhone-Kalender.

## Ausgangslage

- **Problem:** Die Termine vieler Probanden zu koordinieren ist aufwendig. Pro Termin fallen drei ähnliche E-Mails an, die ich jedes Mal von Hand schreibe.
- **Nutzer:** Nur ich (Versuchsleiter). Die Probanden bekommen E-Mails, nutzen die App aber nicht.
- **Plattform:** Web-App (PWA), auf dem iPhone zum Home-Bildschirm hinzugefügt
- **Budget:** max. 3–5 Stunden Umsetzung

### E-Mail-Ablauf pro Termin

| # | Zeitpunkt | Inhalt |
|---|-----------|--------|
| 1 | Ein paar Tage vorher | Vorbereitung: „An was muss ich denken?“ (Checkliste, Ort, Dauer) |
| 2 | Kurz vorher (z. B. am Vortag) | Erinnerung an Datum, Uhrzeit, Ort |
| 3 | Danach | Dank + Link zum Video |

---

## Entscheidungen

| Thema | Entscheidung |
|-------|--------------|
| Plattform | ✅ **Web-App (PWA)**: kein Apple-Developer-Account nötig, kein 7-Tage-Ablauf, später um ein Buchungssystem erweiterbar |
| E-Mail-Versand | ✅ **Halbautomatisch**: Erinnerung, dann öffnet ein Tipp die vorausgefüllte Vorlage in der Mail-App |
| Empfängeradresse | ✅ **Wird nicht in der App gespeichert.** Ich pflege die Adressen separat und füge sie beim Senden selbst ein. |
| Datenschutz | ✅ **Nur Probanden-IDs**, in der App und im Kalender. Keine Namen, keine E-Mail-Adressen in der App. |
| Buchungssystem | ⏸ **Zurückgestellt**, spätere Ausbaustufe |

---

## Sechs Denkhüte

### ⚪ Weißer Hut: Fakten
- Drei E-Mail-Typen pro Termin mit immer ähnlichem Inhalt → ideal für Vorlagen mit Platzhaltern
- Kalender-Übernahme ins iPhone über .ics-Dateien („Zum Kalender hinzufügen“)
- Eine Web-App kann per `mailto:`-Link die Mail-App mit Betreff und Text vorausgefüllt öffnen
- Eine Web-App kann ohne Server keine zeitgesteuerten Push-Nachrichten senden → Erinnerung läuft über den Kalender

### 🔴 Roter Hut: Bauchgefühl
- Die Hauptentlastung ist, **nicht mehr daran denken zu müssen**, wann welche Mail fällig ist, und **nicht jedes Mal neu zu tippen**.
- Das Buchungssystem ist verlockend, aber zu viel für den ersten Wurf.

### ⚫ Schwarzer Hut: Risiken & Grenzen
1. **Kein vollautomatischer Versand:** Dafür bräuchte es einen Server und einen E-Mail-Dienst. Das ist bewusst ausgeschlossen, Lösung ist der halbautomatische Versand.
2. **Daten liegen nur im Browser:** Wenn Safari-Daten gelöscht werden, sind die Termine weg. → **Export/Import (Backup) ist Pflicht.**
3. **Termin ändert sich:** Bereits exportierte Kalendereinträge aktualisieren sich nicht automatisch. → Ggf. neu exportieren bzw. alten Eintrag von Hand löschen.
4. **Zeitbudget:** 3–5 h reichen für eine schlanke Web-App, aber nicht für Server oder Buchungsseite.

### 🟡 Gelber Hut: Nutzen
- Pro Termin werden drei Mails zu je einem Tipp statt Neuschreiben
- Das iPhone erinnert mich selbst, wann welche Mail raus muss
- Einheitliche, professionelle Kommunikation mit allen Probanden
- Überblick über den Studienfortschritt
- Datensparsam: nur IDs, keine personenbezogenen Daten in der App

### 🟢 Grüner Hut: Ideen
- **Erinnerung über den Kalender:** Beim Anlegen eines Termins erzeugt die App zusätzlich Kalendereinträge mit Alarm, z. B. „📧 Vorab-Mail an P-07 senden“, „📧 Erinnerung an P-07“, „📧 Dank + Video an P-07“. So erinnert das iPhone ohne Server.
- **Vorlagen mit Platzhaltern:** `{ID}`, `{Datum}`, `{Uhrzeit}`, `{Ort}`, `{Videolink}`, einmal schreiben und immer wiederverwenden
- **„Fällig“-Ansicht** in der App: Ich öffne die App nach der Kalender-Erinnerung und sehe sofort die passende Mail.
- **Status-Häkchen** pro Mail, damit nichts doppelt oder gar nicht rausgeht
- **Später:** Buchungsseite für Probanden (eigene Seite oder externes Tool wie Cal.com)

### 🔵 Blauer Hut: Zusammenfassung
Kern für 3–5 h ist eine **statische Web-App** ohne Server, deren Daten lokal im Browser liegen. Sie bietet Terminverwaltung mit IDs, drei E-Mail-Vorlagen, halbautomatischen Versand über `mailto:`, Kalenderexport inklusive Erinnerungsterminen und ein Backup per Export/Import.

---

## MoSCoW-Priorisierung (für 3–5 h)

### Must have
- Termin anlegen/bearbeiten: Probanden-ID, Datum, Uhrzeit, Ort
- 3 E-Mail-Vorlagen mit Platzhaltern (bearbeitbar)
- Mail per Tipp öffnen: Betreff + Text vorausgefüllt, Empfänger trage ich selbst ein
- Termin als .ics in den iPhone-Kalender übernehmen, inklusive Erinnerungseinträgen für die drei Mails
- Übersicht: anstehende Termine + fällige Mails
- Daten lokal im Browser speichern
- Export/Import als Backup
- Auf dem iPhone zum Home-Bildschirm hinzufügbar

### Should have
- Status pro Mail (gesendet ✓ / offen)
- Einstellbare Zeitpunkte (z. B. „3 Tage vorher“, „1 Tag vorher“, „1 Tag danach“)
- Terminstatus (geplant / durchgeführt / abgesagt)

### Could have
- CSV-Export der Termine
- Freie Zeitfenster zur eigenen Planung anlegen

### Won't have (diesmal)
- Vollautomatischer Mailversand (braucht Server)
- Selbstbuchung durch Probanden (spätere Ausbaustufe)
- Speicherung von Namen oder E-Mail-Adressen
- Sync zwischen mehreren Geräten

---

## Offene Punkte für Phase 2 (Align)
1. Genaue Zeitpunkte der drei Mails (wie viele Tage vorher/nachher?) und zu welcher Uhrzeit die Erinnerung kommen soll
2. Texte der drei Vorlagen: Was muss in die Vorab-Mail (Checkliste)?
3. Video: ein Link für alle oder individuell?
4. Format der Probanden-IDs (z. B. `P-01`)? Gibt es feste Messorte?
5. Hosting: GitHub Pages o. Ä., oder nur lokal öffnen?
6. Ungefähre Anzahl Probanden/Termine und Studienzeitraum
