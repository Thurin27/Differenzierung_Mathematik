// Lerntagebuch Mathe-Aufbaukurs – Word-Vorlage zum Ausdrucken
// Hausstil: Arial 11 pt, A4 hoch, 2 cm Ränder, Überschriften dunkel-/mittelblau, Tabellenzeilen abwechselnd hinterlegt
const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle,
  ShadingType, AlignmentType, VerticalAlign, PageBreak, Footer, Header, PageNumber,
  LevelFormat, TabStopType, HeightRule
} = require('docx');

const OUT = process.argv[2] || 'lerntagebuch-mathe-aufbaukurs.docx';
const LQ = '„', RQ = '“';           // „ “
const BOX = '☐';                          // ☐
const STAR = '★';                         // ★
const NAVY = '1B3A6B', BLUE = '2F6DB5', SOFT = 'E5EDF8', GREY = '6B7686', LINE = '9AA6B8';
const FONT = 'Arial', SYM = 'Segoe UI Symbol';
const CM = 567;                                // 1 cm in DXA
const W = 17 * CM;                             // nutzbare Breite bei 2 cm Rand (A4: 21 cm)

const run = (text, o = {}) => new TextRun({ text, font: FONT, size: 22, ...o });
const box = (o = {}) => new TextRun({ text: BOX, font: SYM, size: o.size || 24, color: o.color });
const p = (children, o = {}) => new Paragraph({ children: Array.isArray(children) ? children : [run(children)], ...o });
const h1 = t => new Paragraph({ children: [new TextRun({ text: t, font: FONT, size: 40, bold: true, color: NAVY })], spacing: { after: 120 } });
const h2 = t => new Paragraph({ children: [new TextRun({ text: t, font: FONT, size: 28, bold: true, color: NAVY })], spacing: { before: 240, after: 120 } });
const h3 = (t, o = {}) => new Paragraph({ children: [new TextRun({ text: t, font: FONT, size: 23, bold: true, color: BLUE })], spacing: { before: o.before ?? 220, after: 40 }, keepNext: true });
const hint = t => new Paragraph({ children: [new TextRun({ text: t, font: FONT, size: 18, italics: true, color: GREY })], spacing: { after: 0 }, keepNext: true });
// Schreiblinien für Handschrift: einspaltige Tabelle, nur untere Linien (Absatzlinien würden zusammengefasst)
const NONE_B = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const lines = (n, h = 0.95) => new Table({
  width: { size: W, type: WidthType.DXA }, columnWidths: [W],
  rows: Array.from({ length: n }, () => new TableRow({
    height: { value: Math.round(h * 567), rule: HeightRule.EXACT },
    children: [new TableCell({ width: { size: W, type: WidthType.DXA }, children: [new Paragraph({ children: [] })],
      borders: { top: NONE_B, left: NONE_B, right: NONE_B, bottom: { style: BorderStyle.SINGLE, size: 4, color: '9AA6B8' } } })]
  }))
});

const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const thin = { style: BorderStyle.SINGLE, size: 4, color: 'B8C3D3' };
const cellBorders = { top: thin, bottom: thin, left: thin, right: thin };

function cell(children, width, o = {}) {
  return new TableCell({
    children: Array.isArray(children) ? children : [children],
    width: { size: width, type: WidthType.DXA },
    shading: o.fill ? { type: ShadingType.CLEAR, color: 'auto', fill: o.fill } : undefined,
    verticalAlign: o.v || VerticalAlign.CENTER,
    margins: { top: o.mt ?? 60, bottom: o.mb ?? 60, left: 100, right: 100 },
    columnSpan: o.span, rowSpan: o.rowSpan,
    borders: o.borders || cellBorders
  });
}

/* ---------- Seite 1: Deckblatt und Anleitung ---------- */
const fieldRow = (label, width2) => new TableRow({
  height: { value: 620, rule: HeightRule.ATLEAST },
  children: [
    cell(p([run(label, { bold: true, color: NAVY })]), 4 * CM, { borders: { top: none, left: none, right: none, bottom: none } }),
    cell(p(''), W - 4 * CM, { borders: { top: none, left: none, right: none, bottom: { style: BorderStyle.SINGLE, size: 4, color: LINE } } })
  ]
});
const fields = new Table({
  width: { size: W, type: WidthType.DXA }, columnWidths: [4 * CM, W - 4 * CM],
  rows: [fieldRow('Name'), fieldRow('Klasse'), fieldRow('Schuljahr'),
    new TableRow({ height: { value: 620, rule: HeightRule.ATLEAST }, children: [
      cell(p([run('Fachrichtung', { bold: true, color: NAVY })]), 4 * CM, { borders: { top: none, left: none, right: none, bottom: none }, v: VerticalAlign.BOTTOM }),
      cell([p([box(), run(' Abwasserbewirtschaftung      '), box(), run(' Wasserversorgung')], { spacing: { after: 60 } }), p([box(), run(' Kreislauf- und Abfallwirtschaft')])], W - 4 * CM, { borders: { top: none, left: none, right: none, bottom: none }, v: VerticalAlign.BOTTOM })
    ] })]
});
const fachrichtung = p('', { spacing: { after: 120 } });

const numbering = {
  config: [
    { reference: 'steps', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 420, hanging: 360 } }, run: { font: FONT, bold: true, color: BLUE } } }] },
    { reference: 'bul', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 420, hanging: 300 } } } }] }
  ]
};
const step = children => new Paragraph({ children, numbering: { reference: 'steps', level: 0 }, spacing: { after: 100 } });
const bul = children => new Paragraph({ children, numbering: { reference: 'bul', level: 0 }, spacing: { after: 80 } });

const cover = [
  p([new TextRun({ text: 'MATHE-AUFBAUKURS UMWELTTECHNIK', font: FONT, size: 20, bold: true, color: GREY, characterSpacing: 40 })], { spacing: { after: 60 } }),
  h1('Mein Lerntagebuch'),
  p([run('Differenzierungsfach Unterstufe · Umwelttechnolog(inn)en · Hans-Schwier-Berufskolleg Gelsenkirchen', { color: GREY, size: 20 })], { spacing: { after: 360 } }),
  fields,
  fachrichtung,
  h2('So arbeitest du mit dem Lerntagebuch'),
  step([run('Am Ende jeder Stunde öffnest du im Kurs die Seite '), run(LQ + 'Mein Fortschritt' + RQ, { bold: true }), run('.')]),
  step([run('Auf der '), run('Übersicht', { bold: true }), run(' (nächste Seite) hakst du ab, welche Niveaustufen du '), run('begonnen', { bold: true }), run(' und welche du '), run('geschafft', { bold: true }), run(' hast – jeweils mit Datum.')]),
  step([run('Dann füllst du die '), run('Seite für den heutigen Termin', { bold: true }), run(' aus. Das dauert etwa fünf Minuten.')]),
  step([run('Das Lerntagebuch bleibt in deinem Ordner und kommt zu jedem Termin mit. Die Lehrkraft schaut regelmäßig hinein.')]),
  h2('Gut zu wissen'),
  bul([run('Eine Stufe ist '), run('geschafft', { bold: true }), run(', wenn du im Trainer 5 Aufgaben beim ersten Versuch richtig hast und 3 Rechenaufgaben ohne Lösungsanzeige gelöst hast.')]),
  bul([run('Der Fortschritt auf der Website wird nur im Browser gespeichert. '), run('Dein Nachweis ist dieses Lerntagebuch.', { bold: true })]),
  bul([run('Ziel für alle: '), run(STAR + ' Pflicht', { bold: true }), run(' = mindestens Standard geschafft, '), run(STAR + ' Pflicht (Basis)', { bold: true }), run(' = Basis reicht. Wer schneller ist, macht mit 8 – 10 weiter.')]),
  bul([run('Rundungsregel: Ergebnisse mit 4 signifikanten Stellen, z. B. 4034,56 → 4035 oder 0,000785467 → 0,0007855.')]),
  bul([run('Den Rechenweg schreibst du immer ins Heft: Gegeben – Gesucht – Formel – Umstellung – Rechnung – Antwortsatz.')]),
  p([run('Kurs im Browser:  ', { bold: true, color: NAVY }), run('_______________________________________________', { color: LINE })], { spacing: { before: 320 } }),
];

/* ---------- Seite 2: Übersicht zum Abhaken ---------- */
const MODS = [
  [0, 'Der Rechenweg', 'Pflicht', true],
  [1, 'Zahlen & Rechenregeln', 'Pflicht (Basis)'],
  [2, 'Einheiten umrechnen', 'Pflicht'],
  [3, 'Dreisatz, Prozent, Verhältnisse', 'Pflicht'],
  [4, 'Formeln umstellen', 'Pflicht'],
  [5, 'Mit Formeln rechnen', 'Pflicht'],
  [6, 'Flächen', 'Pflicht (Basis)'],
  [7, 'Volumen & Masse', 'Pflicht'],
  [8, 'Diagramme lesen'],
  [9, 'Die Berufsformeln'],
  [10, 'Funktionen (Vertiefung)'],
];
const MW = Math.round(4.4 * CM), LW = Math.round(4.2 * CM);               // Modulspalte + 3 Niveauspalten = 17 cm
const tick = (label) => p([box({ size: 22 }), run(' ' + label, { size: 18 }), new TextRun({ text: '\t____.____.', font: FONT, size: 20, color: LINE })], { spacing: { before: 50, after: 50 }, tabStops: [{ type: TabStopType.RIGHT, position: LW - 230 }] });
const levelCell = (fill) => cell([tick('begonnen'), tick('geschafft ')], LW, { fill, v: VerticalAlign.CENTER, mt: 70, mb: 70 });
const headCell = (t, w) => cell(p([run(t, { bold: true, color: 'FFFFFF', size: 20 })], { alignment: AlignmentType.CENTER }), w, { fill: NAVY });

const overviewRows = [
  new TableRow({ tableHeader: true, children: [headCell('Modul', MW), headCell('Basis', LW), headCell('Standard', LW), headCell('Vertiefung', LW)] }),
  ...MODS.map(([nr, t, pf, rw], i) => {
    const fill = i % 2 ? SOFT : 'FFFFFF';
    const name = cell([
      p([run(`${nr}  `, { bold: true, color: BLUE, size: 26 }), run(t, { bold: true, size: 21 })], { spacing: { after: 20 } }),
      ...(pf ? [p([run(STAR + ' ' + pf, { size: 16, color: NAVY, bold: true })])] : [])
    ], MW, { fill });
    if (rw) {
      return new TableRow({ cantSplit: true, children: [name, cell([p([box({ size: 22 }), run(' begonnen  ', { size: 18 }), run('____.____.', { size: 20, color: LINE }), run('          '), box({ size: 22 }), run(' geschafft  ', { size: 18 }), run('____.____.', { size: 20, color: LINE })]), p([run('geschafft = alle 4 Fälle im Rechenweg-Detektiv gelöst (Mathe einfach: Schritt 0 geschafft)', { size: 16, color: GREY })], { spacing: { before: 40 } })], 3 * LW, { fill, span: 3 })] });
    }
    return new TableRow({ cantSplit: true, height: { value: Math.round(1.35 * CM), rule: HeightRule.ATLEAST }, children: [name, levelCell(fill), levelCell(fill), levelCell(fill)] });
  })
];
const overview = [
  new Paragraph({ children: [new PageBreak()] }),
  h1('Übersicht zum Abhaken'),
  p([run('Hake ab und trage das Datum ein. Die Daten zeigt dir auch die Seite ' + LQ + 'Mein Fortschritt' + RQ + '.', { color: GREY, size: 20 })], { spacing: { after: 160 } }),
  new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [MW, LW, LW, LW], rows: overviewRows }),
  p([run('begonnen', { bold: true, size: 18 }), run(' = mindestens eine Aufgabe in dieser Stufe gelöst  ·  ', { size: 18, color: GREY }), run('geschafft', { bold: true, size: 18 }), run(' = 5 Trainer-Aufgaben und 3 Rechenaufgaben', { size: 18, color: GREY })], { spacing: { before: 120 } }),
];

/* ---------- Ab Seite 3: eine Seite pro Termin ---------- */
const TERMINE = 10;
function termin(n) {
  const headRow = new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: [7 * CM, 10 * CM],
    rows: [new TableRow({ children: [
      cell(p([new TextRun({ text: `Termin ${n}`, font: FONT, size: 34, bold: true, color: 'FFFFFF' })]), 7 * CM, { fill: NAVY, borders: { top: none, bottom: none, left: none, right: none }, mt: 100, mb: 100 }),
      cell(p([run('Datum  ', { bold: true, color: NAVY }), run('______________', { color: LINE })], { alignment: AlignmentType.RIGHT }), 10 * CM, { fill: SOFT, borders: { top: none, bottom: none, left: none, right: none } })
    ] })]
  });
  const bearbeitet = [
    h3('Heute bearbeitet', { before: 260 }),
    p([run('Modul  '), run('_____', { color: LINE }), run('    Niveau:  '), box(), run(' Basis   '), box(), run(' Standard   '), box(), run(' Vertiefung')], { spacing: { before: 80, after: 60 } }),
    p([run('Teil:  '), box(), run(' Erklärung/Beispiel   '), box(), run(' Trainer   '), box(), run(' Rechenaufgaben   '), box(), run(' Rechenweg im Heft')], { spacing: { after: 60 } }),
  ];
  return [
    new Paragraph({ children: [new PageBreak()] }),
    headRow,
    ...bearbeitet,
    h3('Das habe ich heute gelernt'),
    hint('z. B.: Ich kann jetzt … / Ich habe verstanden, dass … / Neu war für mich …'),
    lines(5),
    h3('Hier bin ich noch unsicher'),
    hint('z. B.: Bei … mache ich noch Fehler. / Ich verstehe noch nicht, warum …'),
    lines(4),
    h3('Das nehme ich mir für das nächste Mal vor'),
    hint('z. B.: Ich wiederhole … / Ich gehe auf Standard. / Ich frage … nach …'),
    lines(3),
    h3('So lief es heute'),
    p([box(), run(' sehr gut   '), box(), run(' gut   '), box(), run(' geht so   '), box(), run(' schwierig')], { spacing: { before: 60 } }),
    p([run('Hilfe genutzt:  '), box(), run(' Tipps   '), box(), run(' Lösung angesehen   '), box(), run(' Stammgruppe   '), box(), run(' Lehrkraft')], { spacing: { before: 80 } }),
    h3('Rückmeldung Lehrkraft (optional)', { before: 300 }),
    lines(2),
    p([run('Kürzel  ', { size: 18, color: GREY }), run('________', { size: 18, color: LINE })], { alignment: AlignmentType.RIGHT, spacing: { before: 60 } }),
  ];
}

const footer = new Footer({ children: [p([
  new TextRun({ text: 'Mathe-Aufbaukurs Umwelttechnik · Lerntagebuch', font: FONT, size: 16, color: GREY }),
  new TextRun({ children: ['\tSeite ', PageNumber.CURRENT], font: FONT, size: 16, color: GREY })
], { tabStops: [{ type: TabStopType.RIGHT, position: W }] })] });

const doc = new Document({
  creator: 'Hans-Schwier-Berufskolleg Gelsenkirchen',
  title: 'Lerntagebuch Mathe-Aufbaukurs Umwelttechnik',
  styles: { default: { document: { run: { font: FONT, size: 22 } } } },
  numbering,
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 2 * CM, bottom: 2 * CM, left: 2 * CM, right: 2 * CM, footer: CM } } },
    footers: { default: footer },
    children: [...cover, ...overview, ...Array.from({ length: TERMINE }, (_, i) => termin(i + 1)).flat()]
  }]
});

Packer.toBuffer(doc).then(buf => { fs.writeFileSync(OUT, buf); console.log('geschrieben:', OUT); });
