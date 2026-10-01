# 03 – Plan: Slice 06 „App auf dem iPhone (PWA + GitHub Pages)“

**Datum:** 01.10.2026
**Phase:** 3 von 4 (Brainstorm ✅ → Align ✅ → **Plan** → Umsetzung)
**Grundlage:** README „Nächste Schritte“ (Slice 06) und „Offene Risiken“

---

## Warum dieser Slice jetzt?

Bisher läuft die App nur auf dem Mac über `localhost`. Erste echte Messung ist am 04.10. – ab dann willst du Mails und Häkchen unterwegs auf dem iPhone erledigen. Dafür braucht die App eine feste Adresse im Internet (GitHub Pages, kostenlos), ein Symbol auf dem Home-Bildschirm und muss auch ohne Netz starten. Nebenbei löst der Offline-Speicher das Risiko „Browser zeigt nach einem Update alte Dateien“.

---

## Umfang Slice 06

### Drin
1. **Offline-fähig:** Ein Service Worker (`sw.js`) legt alle App-Dateien im Speicher des Browsers ab. **Mit Netz** holt er immer die neueste Version (Updates kommen beim nächsten Öffnen sofort an), **ohne Netz** startet die App aus dem Speicher.
2. **Home-Bildschirm:** `manifest.webmanifest` + App-Symbol (180 px für iOS, 192/512 px fürs Manifest). In Safari „Teilen → Zum Home-Bildschirm“ → Symbol „Messtermine“, App öffnet sich ohne Safari-Leiste, Statusleiste passt zu hell/dunkel.
3. **Speicher schützen:** Beim Start `navigator.storage.persist()` anfragen (bittet den Browser, die Daten nicht von selbst zu löschen).
4. **GitHub Pages:** Repository `messtermine` auf deinem GitHub-Konto, Veröffentlichung aus Branch `main`, Ordner `/` → Adresse `https://<dein-name>.github.io/messtermine/`. Datei `.nojekyll`, damit GitHub die Dateien unverändert ausliefert.
5. **Umzug der Daten:** Mac `localhost` → „Backup speichern“ → iCloud Drive → auf dem iPhone in der Home-Bildschirm-App „Backup wiederherstellen“. Schritt-für-Schritt-Anleitung in der README.
6. **README:** Abschnitt „Auf dem iPhone installieren“, „Update veröffentlichen“ (= `git push`), Slice 06 aus „Nächste Schritte“ raus, Risiken aktualisiert.

### Bewusst nicht drin
- Anzeige „Neue Version verfügbar“ (nicht nötig, weil mit Netz immer die neueste Version geladen wird)
- Push-Mitteilungen aus der App (Erinnerungen bleiben im Kalender)
- Abgleich zwischen Mac und iPhone (siehe Entscheidung 3)
- Eigene Domain

---

## Technik

| Datei | Änderung |
|-------|----------|
| `sw.js` (neu) | Liste `APP_FILES` aller Dateien; `install` legt sie ab, `fetch` = „erst Netz, sonst Speicher“, nur für Anfragen an die eigene Adresse; `activate` räumt alte Speicher-Versionen weg |
| `manifest.webmanifest` (neu) | Name „Messtermine“, `start_url: "./"`, `scope: "./"`, `display: "standalone"`, Farben passend zu `style.css`, Symbole |
| `icons/` (neu) | `icon-180.png`, `icon-192.png`, `icon-512.png`; einmalig mit Python (Pillow) erzeugt, Skript nicht im Repo |
| `index.html` | `<link rel="manifest">`, `apple-touch-icon`, `theme-color` (hell/dunkel), `apple-mobile-web-app-title` |
| `app.js` | Service Worker registrieren, `navigator.storage.persist()` (beide still, ohne Fehler, wenn nicht verfügbar – z. B. bei `file://`) |
| `.nojekyll` (neu) | leer |
| `tests/sw.test.js` (neu) | Prüft, dass jede Datei, die `index.html` lädt oder ein Modul importiert, in `APP_FILES` steht – sonst startet die App offline nicht. Dafür exportiert `sw.js` die Liste nicht, sondern der Test liest sie als Text heraus (der Service Worker ist kein Modul). |

**Relative Pfade überall** (`./app.js`, nicht `/app.js`), weil die App unter `/messtermine/` liegt und nicht unter `/`.

**Veröffentlichen:** Du legst auf github.com das leere öffentliche Repository `messtermine` an (ohne README). Ich verbinde es (`git remote add origin …`) und pushe `main`; falls dein Mac noch keine GitHub-Anmeldung für `git` hat, machst du den ersten `git push` selbst im Terminal (Anmeldung im Browser). Dann unter Settings → Pages: „Deploy from a branch“, `main`, `/ (root)`.

---

## Deine Entscheidungen (bestätigt am 01.10.2026)

| # | Frage | Entscheidung |
|---|-------|----------------|
| 1 | **Öffentliches Repository** – sichtbar sind Code, Mail-Vorlagen, Ort, alte Phasen-Dokumente in der Historie und deine Mail-Adresse `paulus_samu@gmx.de` in jedem Commit (Pages ist nur bei öffentlichen Repos kostenlos). Probandendaten sind nie im Repo. | ✅ Öffentlich, so wie es ist (Probandendaten sind nie im Repo) |
| 2 | **Name / Adresse** | ✅ Repository `messtermine`; du legst zuerst ein GitHub-Konto an |
| 3 | **Ein Gerät ist „das Original“** – Mac und iPhone haben je eigenen Speicher, ohne Abgleich. | ✅ iPhone ist das Original, Mac/localhost nach dem Umzug nicht mehr benutzen |
| 4 | **Home-Bildschirm oder Safari?** Auf dem iPhone hat die Home-Bildschirm-App **einen eigenen Speicher, getrennt von Safari**. Nur sie ist von der Regel ausgenommen, dass Safari Website-Daten nach 7 Tagen ohne Besuch löscht. | ✅ Home-Bildschirm-App; ich gebe dir den Link zum Installieren |
| 5 | **Link zur App in den Kalendereinträgen** – nach meinem Wissen öffnet ein Link aus dem Kalender auf dem iPhone **Safari**, nicht die Home-Bildschirm-App, also eine leere App (Speicher siehe 4). Das wäre bei einer fälligen Mail eher verwirrend. | ✅ Kein Link, Notiz „Messtermine-App öffnen“ in den Mail-Erinnerungen |
| 6 | **Update-Verhalten** | ✅ „Erst Netz, sonst Speicher“ |
| 7 | **App-Symbol** | ✅ Dunkelblaues Quadrat, weißes Kalenderblatt mit „M“ |
| 8 | **Was wird mitveröffentlicht?** Mit „Deploy from branch“ sind auch README, Tests und `.claude/` unter der Adresse abrufbar. | ✅ Ganzer Ordner aus `main` |

---

## Arbeitsschritte

1. `sw.js`, Manifest, Symbole, Einbindung in `index.html`/`app.js`, Test `sw.test.js` (~25 Min)
2. Kalender-Notiz „Messtermine-App öffnen“ in `ics.js` + Test (~5 Min, falls 5 bestätigt)
3. Browser-Prüfung lokal (~15 Min)
4. GitHub-Repo verbinden, pushen, Pages einschalten, Prüfung unter der echten Adresse (~15 Min, mit dir zusammen)
5. README (~10 Min)

**Commits:** `feat: offline-fähig mit Service Worker` → `feat: Manifest und App-Symbol für den Home-Bildschirm` → `feat: Notiz „Messtermine-App öffnen“ in Mail-Erinnerungen` → `chore: .nojekyll für GitHub Pages` → `docs: …`

---

## Definition of Done: Woran ich selbst erkenne, dass Slice 06 fertig ist

### A. Automatische Tests (`node --test` → alle grün, bisherige 54 weiterhin grün)

| # | Testfall | Erwartung |
|---|----------|-----------|
| A1 | Jede in `index.html` verlinkte Datei (CSS, JS, Manifest, Symbol) steht in `APP_FILES` | ja |
| A2 | Jedes per `import … from './x.js'` geladene Modul (rekursiv ab `app.js`) steht in `APP_FILES` | ja |
| A3 | Jede Datei in `APP_FILES` existiert | ja |
| A4 | Alle Pfade in `index.html`, Manifest und `APP_FILES` sind relativ (kein führendes `/`) | ja |
| A5 | Mail-Erinnerung in der .ics hat `DESCRIPTION:Messtermine-App öffnen`, die Messung nicht | ja (nur bei Entscheidung 5) |

### B. Prüfung im eingebauten Browser (lokaler Server, 375 px)

| # | Schritt | Erwartung |
|---|---------|-----------|
| B1 | Seite laden | Service Worker aktiv, alle `APP_FILES` im Speicher, keine Konsolenfehler |
| B2 | Manifest | wird geladen, Symbole 180/192/512 erreichbar und richtig groß |
| B3 | Server stoppen, neu laden | App startet, Termine sichtbar, Anlegen klappt |
| B4 | Server wieder starten, Text in `index.html` ändern, neu laden | Änderung sofort sichtbar (kein alter Stand) – danach zurückändern |
| B5 | Unter einem Unterpfad testen (`/messtermine/` wie bei GitHub Pages) | App lädt vollständig, Service Worker gilt nur für diesen Pfad |
| B6 | Bestehende Abläufe: Termin anlegen, Mail „Öffnen“, „Zum Kalender“, Backup speichern | wie vorher |

### C. Unter der echten Adresse (nach dem Push)
- `https://<dein-name>.github.io/messtermine/` lädt ohne Fehler, Service Worker aktiv, Manifest erkannt

### D. Aufräumen
- Kein toter Code, keine `console.log`-Reste, Testdaten im Browser entfernt
- README aktualisiert; „Ergebnis Slice 06“ unten in dieser Datei, danach Datei löschen

### Nicht Teil meiner Definition of Done (prüfst du auf dem iPhone)
1. Safari → Adresse öffnen → „Zum Home-Bildschirm“ → Symbol und Name stimmen, App öffnet ohne Safari-Leiste
2. Backup vom Mac (localhost) in der Home-Bildschirm-App wiederherstellen → Termine da
3. „Zum Kalender“ in der Home-Bildschirm-App: Erscheint der Dialog „Alle hinzufügen“? (offenes Risiko; falls nicht, baue ich auf das Teilen-Menü um)
4. Mail „Öffnen“ → Apple Mail mit Betreff und Text; Darstellung ok?
5. „Backup speichern“ → Teilen-Menü → Ordner „Backup App“
6. Flugmodus → App startet trotzdem
7. Dieselbe .ics zweimal importieren → ersetzt oder doppelt? (offenes Risiko, nur beobachten)

---

## Ergebnis Slice 06

**Stand:** 01.10.2026 · Tests: 60 grün (54 bisher + 5 in `tests/sw.test.js` + 1 in `tests/ics.test.js`) · App: https://sampi-lab.github.io/messtermine/

- **A1–A5:** als automatische Tests umgesetzt und grün. Gegenprobe: `backup.js` aus `APP_FILES` entfernt → Test meldet „backup.js fehlt in APP_FILES“.
- **B/C:** Die lokale Prüfung entfiel, weil keine Vorschau-Server mehr frei waren (5 aus älteren Chats). Stattdessen direkt unter der echten Adresse geprüft (das ist zugleich der Unterpfad `/messtermine/`, B5): Service Worker aktiv mit Geltungsbereich `/messtermine/`, alle 13 Dateien im Offline-Speicher (B1), Manifest „Messtermine“ geladen (B2), Termin anlegen, Mail-Link, „Zum Kalender“ mit 3 Notizen „Messtermine-App öffnen“ (B6), keine Konsolenfehler, kein horizontales Scrollen bei 375 px.
- **Nicht geprüft von mir:** B3 (Start ohne Netz) – im eingebauten Browser lässt sich GitHub nicht abschalten; prüfst du im Flugmodus auf dem iPhone. B4 (Update kommt an) über den README-Push geprüft, siehe unten.
- **Abweichung vom Plan:** Nur ein Speicher (`messtermine`), deshalb kein Aufräumen alter Speicher-Versionen in `activate` nötig. `navigator.storage.persist()` antwortet im Browser „nein“; auf dem iPhone ist die Home-Bildschirm-App ohnehin von der 7-Tage-Löschung ausgenommen. GitHub Pages wurde per `gh api` eingeschaltet, `gh` ist jetzt auf dem Mac installiert und angemeldet.
- **Prüfst du:** die Liste „Nicht Teil meiner Definition of Done“ oben.
