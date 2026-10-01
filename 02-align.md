# 02 – Align: Gemeinsames Verständnis

**Datum:** 30.09.2026
**Phase:** 2 von 4 (Brainstorm ✅ → Align ✅ → Plan → Umsetzung)
**Methode:** Strukturiertes Interview (7 Fragerunden) auf Basis der offenen Punkte aus `01-brainstorm.md`

---

## Kontext

- **Zweck:** Messtermine für meine **Masterarbeit** (Thema: unterer Rückenschmerz) verwalten und die drei Standard-Mails pro Proband per Tipp vorbereiten
- **Umfang:** Ziel **100 Probanden** bis **Ende November 2026**, also ca. 2–3 Termine pro Tag
- **1 Proband = genau 1 Messtermin**
- **Terminvereinbarung** läuft außerhalb der App: Ich führe eine **Excel-Liste** (mit Namen + E-Mail) und trage die Termine **von Hand** in die App ein
- **Gerät:** iPhone, **Apple Mail** als Mail-App

---

## Entscheidungen

### Daten & Datenschutz
| Thema | Entscheidung |
|-------|--------------|
| Gespeicherte Daten | Nur **Probanden-ID, Datum, Uhrzeit, Dauer, Status**. Keine Namen, keine E-Mail-Adressen. |
| ID-Format | `P-01`, `P-02` … Die App **schlägt die nächste freie ID vor** (überschreibbar). |
| Anrede in Mails | Vorlage enthält `Hallo Herr/Frau …,`. **Namen und Empfänger ergänze ich in Apple Mail** aus meiner Excel-Liste. |
| Speicherort | Lokal im Browser (Safari) |

### Termin
| Thema | Entscheidung |
|-------|--------------|
| Ort | **Fest:** home of vitality, Große Bleiche 18–20, 55116 Mainz (Eingang links neben Netto, 2. Stock). Kein Ortsfeld pro Termin. Seltene Ausnahmen passe ich **von Hand in der Mail** an. |
| Dauer | Standard **60 Min**, pro Termin änderbar (real 40–60 Min) |
| Terminstatus | **geplant / durchgeführt / abgesagt**. Bei „abgesagt“ zeigt die App keine fälligen Mails mehr an. |
| Absage/Verschiebung | App ändert nur den Status bzw. die Daten. **Kalendereinträge lösche ich von Hand.** |

### Die drei Mails: Zeitpunkte
| Nr. | Mail | Fällig | Kalender-Erinnerung |
|-----|------|--------|---------------------|
| 1 | Vorbereitung / Infos | **3 Tage vorher** | 6:30 Uhr |
| 2 | Erinnerung | **am Vortag** | 6:30 Uhr |
| 3 | Dank + Video | **am Tag danach** | 6:30 Uhr |

- Zählung **stur nach Kalendertagen**, auch Samstag/Sonntag
- Alle Zeitpunkte (Tage + Uhrzeit 6:30) sind **in den Einstellungen änderbar**
- **Kurzfristiger Termin** (Fälligkeit liegt schon in der Vergangenheit): Mail ist **sofort fällig**, es wird keine Kalender-Erinnerung in der Vergangenheit erzeugt
- Jede Mail bekommt ein **Häkchen „gesendet“**. Danach verschwindet sie aus „fällig“.

### Video
- Das Video ist fertig und wird **von mir in Apple Mail angehängt** (`mailto:` kann technisch keine Anhänge mitgeben)
- Die App zeigt bei Mail 3 einen deutlichen Hinweis: **„📎 Video anhängen!“**

### Kalender (.ics)
| Thema | Entscheidung |
|-------|--------------|
| Export | **Pro Termin einzeln** über „Zum Kalender“. Eine .ics-Datei enthält 4 Einträge. |
| Messtermin | Titel **„Messung P-07“**, Ort = Praxis-Adresse, **Alarm 1 h vorher** |
| Mail-Erinnerungen | Titel **„P-07 Mail 1“**, **„P-07 Mail 2“**, **„P-07 Mail 3“**, jeweils um 6:30 Uhr mit Alarm |
| Personenbezug | Im Kalender stehen nur IDs |

### App-Oberfläche
| Thema | Entscheidung |
|-------|--------------|
| Startseite | **Terminliste** (chronologisch), fällige Mails als Markierung am Termin |
| Vergangene Termine | Unter „Vergangene“ **eingeklappt** |
| Mail senden | Tipp öffnet Apple Mail mit Betreff + Text (Platzhalter ersetzt), Empfänger leer |
| Vorlagen | In der App **bearbeitbar** |

### Backup & Hosting
| Thema | Entscheidung |
|-------|--------------|
| Backup | Export/Import als Datei (z. B. in iCloud Drive). **Hinweis-Banner, wenn das letzte Backup älter als 3 Tage ist.** |
| Hosting | **GitHub Pages** (kostenlos, https, auf Home-Bildschirm installierbar). Code ist öffentlich, die **Daten bleiben nur auf dem iPhone**. |
| GitHub-Account | Noch nicht vorhanden. Anlegen wird im Plan Schritt für Schritt beschrieben. |

---

## Umfang erster Wurf

**Drin:**
- Termin anlegen/bearbeiten/löschen (ID mit Vorschlag, Datum, Uhrzeit, Dauer)
- Terminstatus geplant/durchgeführt/abgesagt
- 3 bearbeitbare Mail-Vorlagen mit Platzhaltern, Öffnen per `mailto:`
- Häkchen „gesendet“ pro Mail
- .ics pro Termin (Messung + 3 Mail-Erinnerungen)
- Terminliste mit Fällig-Markierung, Vergangene eingeklappt
- Einstellungen: Zeitpunkte der Mails, Uhrzeit der Erinnerung, Standarddauer
- Export/Import + Backup-Hinweis nach 3 Tagen
- PWA: auf Home-Bildschirm installierbar, funktioniert offline

**Nicht drin:**
- CSV-Import/-Export aus Excel
- Ortsfeld pro Termin
- Automatisches Aktualisieren/Löschen von Kalendereinträgen
- Vollautomatischer Versand, Buchungssystem, Namen/E-Mails, Geräte-Sync
- Fortschrittszähler (z. B. „xx/100“) ist optional, falls Zeit übrig ist

---

## Mail-Vorlagen (geglättet, freigegeben ✅)

Platzhalter: `{Datum}` (Format: „Dienstag, 14. Oktober“), `{Uhrzeit}` (z. B. „10:00“)

### Mail 1: Vorbereitung (3 Tage vorher)
**Betreff:** Ihr Messtermin am {Datum} – Infos zur Vorbereitung

> Hallo Herr/Frau …,
>
> vielen Dank, dass Sie an meiner Untersuchung teilnehmen. Hier erhalten Sie die letzten Informationen zu unserem gemeinsamen Termin.
>
> Wir treffen uns am {Datum} um {Uhrzeit} Uhr in der Praxis von home of vitality, Große Bleiche 18–20 in Mainz. Der Eingang befindet sich links neben Netto, die Messung findet im 2. Stock statt. Insgesamt dauert sie ca. 40–60 Minuten.
>
> Bitte beachten Sie am Tag vor der Messung und am Tag der Messung Folgendes:
> - Normale Schlafroutine einhalten
> - Am Tag vor der Messung kein intensives Training
> - 24 Stunden vor der Messung kein Alkohol
> - 2 Stunden vor der Messung nichts essen
> - 2 Stunden vor der Messung kein Koffein/Teein
> - 2 Stunden vor der Messung nicht rauchen
>
> Darüber hinaus müssen Sie nichts zur Messung mitbringen.
>
> Bis dahin und viele Grüße
> Samuel Paulus

### Mail 2: Erinnerung (Vortag)
**Betreff:** Erinnerung: Ihr Messtermin morgen um {Uhrzeit} Uhr

> Hallo Herr/Frau …,
>
> vielen Dank, dass Sie an meiner Studie teilnehmen. Unser gemeinsamer Termin findet wie geplant morgen, am {Datum}, um {Uhrzeit} Uhr statt.
>
> Denken Sie bitte an die Vorgaben zur Untersuchung aus meiner letzten Mail.
>
> Ich freue mich auf Sie. Bis morgen!
>
> Samuel Paulus

*Hinweis: „morgen“ steht fest im Text. Wird der Zeitpunkt in den Einstellungen geändert, muss die Vorlage angepasst werden.*

### Mail 3: Dank + Video (Tag danach)
**Betreff:** Vielen Dank für Ihre Teilnahme

> Hallo Herr/Frau …,
>
> ich danke Ihnen ganz herzlich für Ihre Unterstützung bei meiner Masterarbeit.
>
> Wie angekündigt sende ich Ihnen im Anhang ein kurzes Video mit grundlegenden Informationen zu Schmerzen im unteren Rücken.
>
> Wenn Sie nach unserem Termin noch Fragen haben, melden Sie sich gerne bei mir. Sollten Sie darüber hinaus professionelle Hilfe benötigen, wenden Sie sich bitte an geeignetes Fachpersonal.
>
> Vielen Dank und alles Gute
> Samuel Paulus

---

## Typischer Ablauf (so soll es sich anfühlen)

1. Termin mit Proband vereinbaren → in Excel eintragen
2. In der App: **+ Termin** → ID (vorgeschlagen), Datum, Uhrzeit → Speichern → **Zum Kalender** → „Alle hinzufügen“
3. 3 Tage vorher um 6:30 meldet das iPhone „P-07 Mail 1“
4. App öffnen → Termin P-07 zeigt „Mail 1 fällig“ → Tipp → Apple Mail öffnet sich → Adresse + Name aus Excel einfügen → Senden → in der App ✓ setzen
5. Am Vortag dasselbe mit Mail 2; nach der Messung Status „durchgeführt“; am Tag danach Mail 3 inklusive Video-Anhang
6. Die App erinnert per Banner, wenn das letzte Backup älter als 3 Tage ist

---

## Technische Risiken für Phase 3 (Plan) prüfen
1. **.ics aus der Home-Bildschirm-App:** Im PWA-Modus von iOS verhalten sich Downloads teils anders als in Safari. Prüfen, ob „Zum Kalender“ mit 4 Einträgen zuverlässig funktioniert, sonst Fallback über Safari.
2. **Speicher-Löschung durch iOS:** Browserdaten können bei Nichtnutzung gelöscht werden. Backup-Hinweis mindert das, `navigator.storage.persist()` prüfen.
3. **Lange `mailto:`-Texte:** Umlaute, Zeilenumbrüche und Aufzählung korrekt kodieren und in Apple Mail testen.
4. **Zeitzone/Sommerzeit:** Die Umstellung am 25.10.2026 fällt in den Studienzeitraum. .ics-Zeiten mit Zeitzone Europe/Berlin bzw. „floating“ korrekt erzeugen.

---

## Nächster Schritt
→ **Phase 3: Plan** (`03-plan.md`): Architektur, Datenmodell, Bildschirme, Aufgaben mit Zeitschätzung, GitHub-Pages-Anleitung
