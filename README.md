# Mathe-Aufbaukurs Umwelttechnik

Selbstlernkurs (Differenzierungsfach, ca. 20 UStd.) für die Unterstufen der Umwelttechnolog(inn)en aller Fachrichtungen.
Hans-Schwier-Berufskolleg Gelsenkirchen, Fachbereich Umweltschutztechnik.

Alle Aufgaben spielen im fiktiven Schwierbach (Kläranlage Schwierbach mit Pumpwerk Talstraße, Abfall- & Energiezentrum Schwierbach, Wasserwerk, Kanalnetz) – konsistent mit den PLS-Simulationen.
Anwendungsbereiche (Etikett an jeder Aufgabe): Abwasser, Wasserversorgung, Kreislauf & Abfall, Rohrleitungsnetze, Elektrotechnik.
Formelzeichen Elektrotechnik: U, R, I (Stromstärke; im Code `Ic`, weil `I` der Formel-Helfer ist), P, ρ (Ω·mm²/m), cos φ. Gefälle hat das Zeichen J.

Reine statische Website: kein Build-Schritt, keine Abhängigkeiten außer Google Fonts.

## Inhalt

| Datei | Inhalt |
|---|---|
| `index.html` | Startseite: Ablauf, Niveaus, Modulübersicht mit Status (angefangen/geschafft) |
| `fortschritt.html` | Mein Fortschritt: alle Module × Niveaus mit Status und Datum (begonnen/geschafft) aus dem Browser-Speicher |
| `rechenweg.html` | Modul 0: Die sechs Schritte des Rechenwegs, Musterlösung, typische Fehler, Rechenweg-Detektiv, Checkliste |
| `modul-01.html` | Modul 1: Zahlen & Rechenregeln (inkl. ×10-Anzeige lesen, Rundungsregel, Taschenrechner-Führerschein) |
| `modul-02.html` | Modul 2: Einheiten umrechnen |
| `modul-03.html` | Modul 3: Dreisatz, Prozent, Verhältnisse |
| `modul-04.html` | Modul 4: Formeln umstellen |
| `modul-05.html` | Modul 5: Mit Formeln rechnen (Einheiten angleichen, Einheitenkontrolle, Plausibilität) |
| `modul-06.html` | Modul 6: Flächen |
| `modul-07.html` | Modul 7: Volumen & Masse |
| `modul-08.html` | Modul 8: Diagramme lesen (Ganglinie, Kennlinien, Betriebspunkt, Steigung; Ablese-Aufgaben mit Toleranz) |
| `modul-09.html` | Modul 9: Die Berufsformeln (Formelübersicht je Bereich, Formel finden, mehrstufige Aufgaben) |
| `modul-10.html` | Modul 10: Funktionen – Vertiefung (linear/4–20 mA, Anlagenkennlinie mit Kennlinien-Labor, Halbwertszeit, pH) |
| `einfach/` | **Mathe einfach**: reduzierte Version in einfacher Sprache (Start + Schritt 0–7), feste Stufe Basis, Vorlese-Funktion |
| `material/lerntagebuch-mathe-aufbaukurs.docx` | Lerntagebuch zum Ausdrucken: Übersicht zum Abhaken, 10 Terminseiten mit Reflexion |
| `assets/kurs.css` | Gemeinsames Layout (hell/dunkel) |
| `assets/kurs.js` | Gemeinsame Bausteine: Niveau-Wahl, Schritt-für-Schritt, Trainer, Aufgabengenerator, Lernstand |

## Auf GitHub Pages veröffentlichen

1. Neues Repository anlegen, z. B. `mathe-aufbaukurs`.
2. Alle Dateien und den Ordner `assets` hochladen (inkl. der leeren Datei `.nojekyll`).
3. *Settings → Pages → Build and deployment*: Source „Deploy from a branch“, Branch `main`, Ordner `/ (root)`.
4. Nach ca. 1 Minute erreichbar unter `https://<benutzername>.github.io/mathe-aufbaukurs/`.

Lokal testen: `index.html` einfach im Browser öffnen.

## Lernstand

Der Fortschritt wird nur im `localStorage` des Browsers gespeichert (Schlüssel `mak-…`).
Alle Repos eines GitHub-Kontos teilen sich dieselbe Domain – das Präfix `mak-` verhindert Überschneidungen mit anderen Kursseiten.
Heft-Hinweis: Über der Ergebnis-Eingabe steht „Zuerst ins Heft …“. In `rwe`, `m1`–`m7` muss vor dem Prüfen „Mein Rechenweg steht im Heft“ angehakt werden (Option `heft:'check'`), in M8–M10 nur ein kurzer Hinweis (`heft:'hint'`). Per `K.module({heft:…})` überschreibbar.

Eine Stufe gilt als geschafft bei 5 Trainer-Aufgaben (erster Versuch richtig) und 3 gelösten Rechenaufgaben (ohne Lösungsanzeige).

## Mathe einfach (Ordner `einfach/`)

Für die schwächsten Lernenden, auch mit Sprachschwierigkeiten. Der Link wird gezielt ausgegeben (auf der Startseite nur in den Hinweisen für die Lernbegleitung).

- Linearer Pfad: Schritt 0 Rechenweg, 1 Rechnen/Runden/Taschenrechner, 2 Einheiten, 3 Dreisatz und Prozent, 4 Umstellen (mit Formeldreieck), 5 Mit Formeln rechnen, 6 Flächen, 7 Volumen und Masse.
- Kurze Sätze, Wörter-Box je Seite, Aufgaben als Liste („Das weißt du“, „Frage“, Satzanfang für den Antwortsatz), einfache Rückmeldungen.
- Vorlesen über die Sprachausgabe des Browsers (Web Speech API, deutsche Stimme, Einheiten werden ausgesprochen). Fehlt die Funktion im Browser, werden die Knöpfe ausgeblendet.
- Fortschritt zählt in dieselben Module des normalen Kurses, Stufe Basis (Schritt 0 unter `mak-rwe`; zählt als „Rechenweg geschafft“). Wer fertig ist, macht im normalen Kurs mit Standard weiter.
- Technik: dieselbe Engine mit `K.module({lock:'B', simple:true, root:'../'})`, Helfer in `einfach/einfach.js` (`K.E.tx`, `K.E.T`, `K.E.run`). Elemente mit `class="sayable"` bekommen einen Vorlese-Knopf (Text aus `data-say` oder dem sichtbaren Text).

## Neues Modul anlegen

1. `modul-04.html` kopieren, z. B. als `modul-07.html`. Kopf, Ziele und Erklärteil anpassen.
2. Im Skript am Ende drei Listen füllen und `K.module({id:'m7', nr:7, examples, trainer, tasks})` aufrufen.
3. In `index.html` die Modulkarte von `<div class="mod later">` auf `<a class="mod" href="modul-08.html" data-mod="m8">` umstellen und das Modul in `K.MODS` (assets/kurs.js) ergänzen – dann erscheint es auch auf „Mein Fortschritt“.
4. Die Navigation im Seitenkopf aller Seiten und die Weiter-Links am Seitenende ergänzen.

Zahleneingaben akzeptieren Komma oder Punkt, Tausenderpunkte und Zehnerpotenzen (`2,4·10^5`, `2,4e5`).

### Rundung

Kursweit gilt: Ergebnisse mit **4 signifikanten Stellen** (`K.r4`, Anzeige mit `K.fmt` / `K.res`). Geht ein Wert genau auf, werden keine Nullen angehängt (2,5 statt 2,500); ab 1000 wird die ganze Zahl angezeigt (123 576).
Die Prüfung akzeptiert genauere Angaben und Abweichungen bis 3 Einheiten in der 4. Stelle (gerundete Zwischenergebnisse, anderer Rechenweg). Zu grob gerundete Werte werden zurückgemeldet.
Optional kann eine Aufgabe `diag:x=>'Hinweis'` mitbringen, um typische Fehleingaben gezielt zu erkennen (z. B. übersehene ×10ⁿ-Anzeige in Modul 1).

Ausnahmen pro Aufgabe:
- `exact:true` – Ergebnis geht genau auf (Umrechnungen); genauer Wert oder 4-Stellen-Wert werden akzeptiert.
- `fix:true, dc:2` – feste Nachkommastellen (Geldbeträge), Anzeige mit `K.fix` / `K.resFix`.
- `sig:true, raw:…` – Rundungsübung selbst (Modul 1); verlangt exakt den auf 4 Stellen gerundeten Wert.
- `tol:…` (optional `tolText`) – feste Toleranz für Ablese-Aufgaben aus Diagrammen (Modul 8).

Diagramme: `K.plot({x0,x1,dx,mx,y0,y1,dy,my,xl,yl,series:[{f|pts}],points,guides,hl})` erzeugt ein SVG mit Haupt- und Feinraster (mx/my Kästchen je Hauptteilung), Farben aus dem Theme.

### Trainer-Aufgabe (Multiple Choice)

```js
{L:'B', n:'Volumen', prompt:'1 m³ = ?', ask:'Welche Angabe ist richtig?',
 ok:'1000 L', w:['100 L','10 L','10 000 L'], h:'Tipp, der nach einer Antwort erscheint'}
```

Für Umstellaufgaben gibt es die Kurzform `K.umstell(L, name, linkeSeite, rechteSeite, gesucht, richtig, [falsch…], tipp)`.

### Rechenaufgabe (Generator)

Jede Aufgabe ist eine Funktion `g()`, die bei jedem Aufruf neue Zahlen erzeugt und Folgendes zurückgibt:

```js
{tag:'Abwasser', ti:'Titel', tx:'Aufgabentext', x:K.I('v'), un:'m/s',
 a:ergebnis,                  // ungerundet; geprüft wird auf 4 signifikante Stellen
 geg:'Gegeben-Zeile', steps:[['Formel',…],['Umstellung',…]],
 ein:'eingesetzte Werte', s:'Rechnung mit Ergebnis', satz:'Antwortsatz'}
```

`steps` und `ein` werden nacheinander als Tipp 1–3 gezeigt. Die Lösung erscheint immer im Rechenweg-Schema
(Gegeben – Gesucht – Formel – Umstellung – Rechnung – Antwort).

Formelbausteine: `K.I('c','zu')` (Variable mit Index), `K.fr(z,n)` (Bruch), `K.sq(x)` (Wurzel), `K.F(...)` (Formelzeile), `K.q(zahl,'m³')` (Zahl mit Einheit), `K.res(x,dc,'m')` (doppelt unterstrichenes Ergebnis).
