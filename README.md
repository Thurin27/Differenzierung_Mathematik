# Mathe-Aufbaukurs Umwelttechnik

Selbstlernkurs (Differenzierungsfach, ca. 20 UStd.) für die Unterstufen der Umwelttechnolog(inn)en aller Fachrichtungen.
Hans-Schwier-Berufskolleg Gelsenkirchen, Fachbereich Umweltschutztechnik.

Reine statische Website: kein Build-Schritt, keine Abhängigkeiten außer Google Fonts.

## Inhalt

| Datei | Inhalt |
|---|---|
| `index.html` | Startseite: Ablauf, Niveaus, Modulübersicht mit Lernstand, Gesamtcode für den Laufzettel |
| `rechenweg.html` | Modul 0: Die sechs Schritte des Rechenwegs, Musterlösung, typische Fehler, Rechenweg-Detektiv, Checkliste |
| `modul-02.html` | Modul 2: Einheiten umrechnen |
| `modul-04.html` | Modul 4: Formeln umstellen |
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
Eine Stufe gilt als geschafft bei 5 Trainer-Aufgaben (erster Versuch richtig) und 3 gelösten Rechenaufgaben (ohne Lösungsanzeige).

## Neues Modul anlegen

1. `modul-04.html` kopieren, z. B. als `modul-07.html`. Kopf, Ziele und Erklärteil anpassen.
2. Im Skript am Ende drei Listen füllen und `K.module({id:'m7', nr:7, examples, trainer, tasks})` aufrufen.
3. In `index.html` die Modulkarte von `<div class="mod later">` auf `<a class="mod" href="modul-07.html" data-mod="m7">` umstellen und `{id:'m7',nr:7}` in `K.overview([...])` ergänzen.
4. Die Navigation im Seitenkopf aller Seiten und die Weiter-Links am Seitenende ergänzen.

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
 a:ergebnis, dc:2,            // Nachkommastellen; alternativ exact:true für exakte Umrechnungen
 geg:'Gegeben-Zeile', steps:[['Formel',…],['Umstellung',…]],
 ein:'eingesetzte Werte', s:'Rechnung mit Ergebnis', satz:'Antwortsatz'}
```

`steps` und `ein` werden nacheinander als Tipp 1–3 gezeigt. Die Lösung erscheint immer im Rechenweg-Schema
(Gegeben – Gesucht – Formel – Umstellung – Rechnung – Antwort).

Formelbausteine: `K.I('c','zu')` (Variable mit Index), `K.fr(z,n)` (Bruch), `K.sq(x)` (Wurzel), `K.F(...)` (Formelzeile), `K.q(zahl,'m³')` (Zahl mit Einheit), `K.res(x,dc,'m')` (doppelt unterstrichenes Ergebnis).
