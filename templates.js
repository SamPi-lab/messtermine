// Freigegebene Vorlagen (Wortlaut: git show 96fb1ac:02-align.md), Schlüssel = Mail-Nr.
// Wann welche Mail fällig ist, steht in MAIL_OFFSETS (logic.js).

export const TEMPLATES = {
  1: {
    title: 'Vorbereitung',
    subject: 'Ihr Messtermin am {Datum} – Infos zur Vorbereitung',
    body: `Hallo Herr/Frau …,

vielen Dank, dass Sie an meiner Untersuchung teilnehmen. Hier erhalten Sie die letzten Informationen zu unserem gemeinsamen Termin.

Wir treffen uns am {Datum} um {Uhrzeit} Uhr in der Praxis von home of vitality, Große Bleiche 18–20 in Mainz. Der Eingang befindet sich links neben Netto, die Messung findet im 2. Stock statt. Insgesamt dauert sie ca. 40–60 Minuten.

Bitte beachten Sie am Tag vor der Messung und am Tag der Messung Folgendes:
- Normale Schlafroutine einhalten
- Am Tag vor der Messung kein intensives Training
- 24 Stunden vor der Messung kein Alkohol
- 2 Stunden vor der Messung nichts essen
- 2 Stunden vor der Messung kein Koffein/Teein
- 2 Stunden vor der Messung nicht rauchen

Darüber hinaus müssen Sie nichts zur Messung mitbringen.

Bis dahin und viele Grüße
Samuel Paulus`,
  },
  2: {
    title: 'Erinnerung',
    subject: 'Erinnerung: Ihr Messtermin morgen um {Uhrzeit} Uhr',
    body: `Hallo Herr/Frau …,

vielen Dank, dass Sie an meiner Studie teilnehmen. Unser gemeinsamer Termin findet wie geplant morgen, am {Datum}, um {Uhrzeit} Uhr statt.

Denken Sie bitte an die Vorgaben zur Untersuchung aus meiner letzten Mail.

Ich freue mich auf Sie. Bis morgen!

Samuel Paulus`,
  },
  3: {
    title: 'Dank + Video',
    subject: 'Vielen Dank für Ihre Teilnahme',
    body: `Hallo Herr/Frau …,

ich danke Ihnen ganz herzlich für Ihre Unterstützung bei meiner Masterarbeit.

Wie angekündigt sende ich Ihnen im Anhang ein kurzes Video mit grundlegenden Informationen zu Schmerzen im unteren Rücken.

Wenn Sie nach unserem Termin noch Fragen haben, melden Sie sich gerne bei mir. Sollten Sie darüber hinaus professionelle Hilfe benötigen, wenden Sie sich bitte an geeignetes Fachpersonal.

Vielen Dank und alles Gute
Samuel Paulus`,
  },
};
