// Round 56 (more findable pages): the words of the generated page families (parts, years, comparisons, the Topics hub)
// and of the topic, group and country pages in the six other site languages. Everything a page says about a country
// that is not here comes from the map in that language (seo_extract.mjs: the panel's own sentences, ranges and chance
// words); here are only the page frames, the names of the measures and parts, and the number formats.
//
// Round 57 (owner: "the versus pages is just one page with a few translations ... very little to maintain"): this file
// is the ONE translation table of the static pages. Every family (country, compare, year, part, topic and group, the
// Topics hub, the home and ranking pages) has one template in code and its phrases here, in all seven languages, as
// plain strings with {placeholders}; nothing is written per page, per country or per pair. The phrases are filled by
// one small engine (fmt below), also used by pipeline/seo_topics.json:
//   {name}              a value given by the page's code: a figure, a name from the map, the map's own words
//   {if:COND|yes|no}    words that depend on the data (round 57, owner: "sentences whose form depends on data"). COND is
//                       A OP B, or A alone (true when not zero); A and B are values given by the code (numbers) or plain
//                       numbers, at least one a value; OP one of > < >= <= == != and ~ (within 2% of the larger);
//                       abs(A) is A's size. "no" may be left out. Branches may hold placeholders and conditions.
//   {q:words}           a neutral question or topic name ("Countries helping Russia"): shown as written
// An unknown placeholder, an unknown value or a condition that cannot be read stops the build.
// Every phrase is read by the wording guard (seo_check.py wording_problems, check 48): no number, ranking, comparison,
// direction, certainty, trend or absolute word outside a placeholder or condition, so a sentence cannot go stale when
// the data change; such words come from the data ({if:...}) or the map ({word:...}, {netDir}, ...).
//
// Pure (no browser): pipeline/test_seo.mjs tests it. New strings a native speaker should read are listed in
// REVIEW at the end.

export const LANGS = ["en", "uk", "de", "fr", "pl", "nl", "es"];
const TITLE_MAX = 60, DESC_MAX = 155;
export const fit = (cands, max) => cands.find(s => s.length <= max) || cands[cands.length - 1];
const cut = (s, max) => (s.length <= max ? s : s.slice(0, max - 1).replace(/\s+\S*$/, "") + "…");
export const fitTitle = c => cut(fit(c, TITLE_MAX), TITLE_MAX);
export const fitDesc = c => cut(fit(c, DESC_MAX), DESC_MAX);
export const cap = s => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

// ----- numbers, as each language writes them (seo_check.py has the same formats) -----
const SEP = { en: ",", de: ".", es: ".", nl: ".", fr: " ", pl: " ", uk: " " };
const group = (n, l) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, SEP[l]);
const dec = (s, l) => (l === "en" ? s : s.replace(".", ","));
export function P(l, x) {
  const a = Math.abs(x), s = dec(a >= 1 ? a.toFixed(1) : a >= 0.01 ? a.toFixed(2) : "<0.01", l);
  return ["de", "fr", "es"].includes(l) ? s + " %" : s + "%";
}
// € bn: "€74.7bn", "74,7 Mrd. €" ...; under €0.1bn in millions
export function E(l, bn) {
  const a = Math.abs(bn);
  if (l === "es") return a >= 0.1 ? group(Math.round(a * 10) * 100, l) + " M€" : Math.round(a * 1000) + " M€";
  const big = a >= 0.1, s = !big ? String(Math.round(a * 1000)) : a >= 100 ? group(Math.round(a), l) : dec((a >= 1 ? a.toFixed(1) : a.toFixed(2)).replace(/\.0$/, ""), l);
  const u = { en: big ? ["€", "bn"] : ["€", "m"], de: big ? ["", " Mrd. €"] : ["", " Mio. €"], fr: big ? ["", " Md€"] : ["", " M€"],
    pl: big ? ["", " mld €"] : ["", " mln €"], nl: big ? ["€", " mld"] : ["€", " mln"], uk: big ? ["", " млрд €"] : ["", " млн €"] }[l];
  return u[0] + s + u[1];
}
// € per person
export function PP(l, x) {
  const a = Math.abs(x);
  if (a < 0.5) return l === "en" || l === "nl" ? "<€1" : "<1 €";
  const s = group(Math.round(a), l);
  return l === "en" || l === "nl" ? "€" + s : s + " €";
}
// "to August 2026": Polish and Ukrainian need the month's genitive ("do sierpnia 2026"), which the date with its day gives
const GEN = new Set(["pl", "uk"]);
const dt = (iso, l, o) => new Date(iso + "T12:00:00Z").toLocaleDateString(l === "en" ? "en-GB" : l, { ...o, timeZone: "UTC" });
export const monthYear = (iso, l) => (GEN.has(l) ? dt(iso, l, { day: "numeric", month: "long", year: "numeric" }).replace(/^\d+\.?\s*/, "") : dt(iso, l, { month: "long", year: "numeric" }));
export const monthOnly = (iso, l) => (GEN.has(l) ? dt(iso, l, { day: "numeric", month: "long" }).replace(/^\d+\.?\s*/, "") : dt(iso, l, { month: "long" }));
const AND = { en: "and", de: "und", fr: "et", es: "y", pl: "i", nl: "en", uk: "і" };
export const list3 = (l, a) => (a.length > 2 ? a.slice(0, -1).join(", ") + " " + AND[l] + " " + a[a.length - 1] : a.join(" " + AND[l] + " "));

// ----- the placeholder engine -----
const NAME = /^[A-Za-z][\w:.\-]*$/;
const OPERAND = String.raw`abs\([A-Za-z][\w:.\-]*\)|[A-Za-z][\w:.\-]*|-?\d+(?:\.\d+)?`;
const COND = new RegExp(String.raw`^\s*(${OPERAND})\s*(?:(>=|<=|==|!=|>|<|~)\s*(${OPERAND}))?\s*$`);
const closeOf = (s, i) => { let d = 0; for (let k = i; k < s.length; k++) { if (s[k] === "{") d++; else if (s[k] === "}" && --d === 0) return k; } throw new Error(`template: unclosed "{" in “${s}”`); };
const splitTop = s => { const out = []; let d = 0, cur = ""; for (const ch of s) { if (ch === "{") d++; else if (ch === "}") d--; if (ch === "|" && d === 0) { out.push(cur); cur = ""; } else cur += ch; } out.push(cur); return out; };
const isNum = x => /^-?\d+(?:\.\d+)?$/.test(x);
function parseCond(c, whole) {
  const m = COND.exec(c);
  if (!m) throw new Error(`template: cannot read the condition “${c}” in “${whole}”`);
  const ops = [m[1], m[3]].filter(x => x !== undefined);
  if (ops.every(isNum)) throw new Error(`template: the condition “${c}” does not depend on the data, in “${whole}”`);
  return { a: m[1], op: m[2] || "", b: m[3] };
}
const CACHE = new Map();
// a phrase as a list of parts: text, { ph }, { if, yes, no }, { q }
export function parseTpl(str) {
  if (CACHE.has(str)) return CACHE.get(str);
  const out = []; let i = 0, buf = "";
  while (i < str.length) {
    const ch = str[i];
    if (ch === "{") {
      const j = closeOf(str, i), body = str.slice(i + 1, j);
      if (buf) { out.push(buf); buf = ""; }
      if (body.startsWith("if:")) {
        const parts = splitTop(body.slice(3));
        if (parts.length < 2 || parts.length > 3) throw new Error(`template: {if:...} needs a condition and one or two branches, in “${str}”`);
        out.push({ if: parseCond(parts[0], str), yes: parseTpl(parts[1]), no: parseTpl(parts[2] ?? "") });
      } else if (body.startsWith("q:")) out.push({ q: parseTpl(body.slice(2)) });
      else if (NAME.test(body)) out.push({ ph: body });
      else throw new Error(`template: bad placeholder {${body}} in “${str}”`);
      i = j + 1;
    } else if (ch === "}") throw new Error(`template: stray "}" in “${str}”`);
    else { buf += ch; i++; }
  }
  if (buf) out.push(buf);
  CACHE.set(str, out);
  return out;
}
// fill a phrase. vars: { name: text } or a function; nums: { name: number } or a function (numbers in vars count too)
export function fmt(str, vars = {}, nums = {}) {
  const get = typeof vars === "function" ? vars : k => vars[k];
  const num = k => {
    let v = typeof nums === "function" ? nums(k) : nums[k];
    if (v === undefined) { const w = get(k); if (typeof w === "number" || typeof w === "boolean") v = w; }
    if (typeof v === "boolean") v = v ? 1 : 0;
    if (typeof v !== "number" || Number.isNaN(v)) throw new Error(`template: unknown value “${k}” in “${str}”`);
    return v;
  };
  const val = o => (isNum(o) ? +o : o.startsWith("abs(") ? Math.abs(num(o.slice(4, -1))) : num(o));
  const test = c => {
    const a = val(c.a);
    if (!c.op) return a !== 0;
    const b = val(c.b);
    return { ">": a > b, "<": a < b, ">=": a >= b, "<=": a <= b, "==": a === b, "!=": a !== b, "~": Math.abs(a - b) <= 0.02 * Math.max(Math.abs(a), Math.abs(b)) }[c.op];
  };
  const run = parts => parts.map(p => {
    if (typeof p === "string") return p;
    if (p.ph) { const v = get(p.ph); if (v === undefined || v === null) throw new Error(`template: unknown placeholder {${p.ph}} in “${str}”`); return String(v); }
    if (p.q) return run(p.q);
    return run(test(p.if) ? p.yes : p.no);
  }).join("");
  return run(parseTpl(str));
}
const fmtAll = (x, vars, nums) => (Array.isArray(x) ? x : [x]).map(s => fmt(s, vars, nums));

// ----- country names: the map's own (site/i18n.js regionName: the browser's Intl.DisplayNames in each language, with
// its one small table of fixes, NAME_FIX); here only English's "the" before a name inside a sentence -----
const THE = /^(United |Central African Republic|Dominican Republic|Gambia|Bahamas|Philippines|Maldives|Comoros|Seychelles|Netherlands|Czech Republic)|Islands$/;
export const inSentence = (l, name) => (l === "en" && THE.test(name) ? "the " + name : name);

// ----- the page frames' words -----
export const S = {
  en: { rankByYear: "Sorted by “{m}” {unit}, {order}, in {y}.", topics: "Topics", allTopics: "All topics", ranking: "Ranking", members: "Members", country: "Country", small: "small economy", related: "Related", questions: "Questions",
    totals: "Totals: the {n} members' best estimates added up, and as a share of their combined GDP. Each member's range and chance are on its row.",
    eachRow: "Each row: the best estimate, then its range and the chance of its direction, as in the country's panel.",
    eachRowYear: "Each row: that year's amount, a best estimate. The ranges and chances are for the totals since 2022, on each country's page.",
    moneyOnly: "These numbers measure money: aid to Ukraine and the change in what Russia keeps from trade, against a world without the war. Weapons sent, troops and diplomacy are not in them.",
    moneyMil: "These numbers measure money. Weapons and troops sent to Russia count in the totals for the countries that sent them, as the method page explains; diplomacy is not in them.",
    party: "Party to the war (with Russia), not ranked", sides: "{x}: a side the money is measured toward, so no figure of its own.", russia: "Russia", ukraine: "Ukraine",
    noData: "No data", noDataText: "No observation of their own for the war years: not ranked.", outside: "Outside the totals",
    rankBy: "Sorted by “{m}” {unit}, {order}, February 2022 to {to}.", unit: { gdp: "as a share of one year's GDP", eur: "in euros", pp: "per person" },
    order: { hiLo: "high to low", bySize: "by size, either way", uaRu: "from the Ukraine side to the Russia side", ruUa: "from the Russia side to the Ukraine side", keptMoreLess: "from where Russia kept more to where it kept less", keptLessMore: "from where Russia kept less to where it kept more" },
    minGdp: "Economies under {gdpMin} of GDP are left out, as in the map's ranking.",
    legendKept: "more or less: how much more or less Russia kept (taxes and profit, not sales) than in a world without the war", legendSigned: "+ toward Ukraine, − toward Russia",
    ofGdp: "of GDP", perPerson: "per person", ofCombined: "of the members' combined GDP",
    figKept: "{s} {if:x>=0|less|more}", totRus: "Russia kept {v} {if:x>=0|less|more} than without the war", totNet: "{v} {if:x>=0|toward Ukraine|toward Russia}",
    chanceSide: "{if:ukr|toward Ukraine|toward Russia}",
    totUa: "{v} in support", totFrozen: "{v} return lost", groupTotals: "Group totals",
    notInTotals: "Not in the totals: shown for information (the cost view, kept in the full data download).",
    fuelShare: "of what it bought from Russia", openMap: "Open in the map", map: "Map",
    yearTo: "{y} (to {month})",
    more_about: "More about {name}", groups: "Groups", compared: "Compared with", partsRanked: "Its parts, ranked against other countries", byYearPages: "Every country, by year",
    hubParts: "Each part on its own", hubYears: "By year", hubCompare: "Countries compared", hubGroups: "Groups", hubTopics: "Topics", hubRankings: "Rankings", hubCountries: "Every country",
    sideBySide: "Side by side", theParts: "What makes up each number", yearByYear: "Year by year", measure: "Measure",
    rankings: [["Ranking", "/ranking/"], ["Support for Ukraine by country", "/support-for-ukraine/"], ["Trade with Russia by country", "/trade-with-russia/"]] },
  de: { rankByYear: "Sortiert nach „{m}“ {unit}, {order}, im Jahr {y}.", topics: "Themen", allTopics: "Alle Themen", ranking: "Rangliste", members: "Mitglieder", country: "Land", small: "kleine Volkswirtschaft", related: "Verwandte Seiten", questions: "Fragen",
    totals: "Summen: die besten Schätzungen der {n} Mitglieder addiert und als Anteil an ihrem gemeinsamen BIP. Spanne und Wahrscheinlichkeit jedes Mitglieds stehen in seiner Zeile.",
    eachRow: "Jede Zeile: die beste Schätzung, dann ihre Spanne und die Wahrscheinlichkeit der Richtung, wie im Bereich des Landes auf der Karte.",
    eachRowYear: "Jede Zeile: der Betrag dieses Jahres, eine beste Schätzung. Spannen und Wahrscheinlichkeiten gelten für die Summen seit 2022 auf der Seite jedes Landes.",
    moneyOnly: "Diese Zahlen messen Geld: Hilfe für die Ukraine und die Veränderung dessen, was Russland am Handel verdient, verglichen mit einer Welt ohne Krieg. Waffenlieferungen, Truppen und Diplomatie sind nicht enthalten.",
    moneyMil: "Diese Zahlen messen Geld. Waffen und Truppen für Russland zählen in den Summen bei den Ländern, die sie geschickt haben, wie auf der Methodenseite erklärt; Diplomatie ist nicht enthalten.",
    party: "Kriegspartei (mit Russland), nicht gereiht", sides: "{x}: eine Seite, zu der das Geld gemessen wird, daher ohne eigene Zahl.", russia: "Russland", ukraine: "Ukraine",
    noData: "Keine Daten", noDataText: "Keine eigene Beobachtung für die Kriegsjahre: nicht gereiht.", outside: "Außerhalb der Summen",
    rankBy: "Sortiert nach „{m}“ {unit}, {order}, Februar 2022 bis {to}.", unit: { gdp: "als Anteil an einem Jahres-BIP", eur: "in Euro", pp: "pro Kopf" },
    order: { hiLo: "von hoch nach niedrig", bySize: "nach Größe, in beide Richtungen", uaRu: "von der Seite der Ukraine zur Seite Russlands", ruUa: "von der Seite Russlands zur Seite der Ukraine", keptMoreLess: "von dort, wo Russland mehr behielt, bis dort, wo es weniger behielt", keptLessMore: "von dort, wo Russland weniger behielt, bis dort, wo es mehr behielt" },
    minGdp: "Volkswirtschaften unter {gdpMin} BIP sind ausgelassen, wie in der Rangliste der Karte.",
    legendKept: "mehr oder weniger: wie viel mehr oder weniger Russland behielt (Steuern und Gewinn, nicht der Umsatz) als ohne Krieg", legendSigned: "+ Richtung Ukraine, − Richtung Russland",
    ofGdp: "des BIP", perPerson: "pro Kopf", ofCombined: "des gemeinsamen BIP der Mitglieder",
    figKept: "{s} {if:x>=0|weniger|mehr}", totRus: "Russland behielt {v} {if:x>=0|weniger|mehr} als ohne Krieg", totNet: "{v} {if:x>=0|Richtung Ukraine|Richtung Russland}",
    chanceSide: "{if:ukr|Richtung Ukraine|Richtung Russland}",
    totUa: "{v} Unterstützung", totFrozen: "{v} entgangener Ertrag", groupTotals: "Summen der Gruppe",
    notInTotals: "Nicht in den Summen: zur Information (Kostenansicht, im vollständigen Datendownload).",
    fuelShare: "seiner Käufe aus Russland", openMap: "Auf der Karte öffnen", map: "Karte",
    yearTo: "{y} (bis {month})",
    more_about: "Mehr zu {name}", groups: "Gruppen", compared: "Im Vergleich mit", partsRanked: "Seine Teile im Ländervergleich", byYearPages: "Jedes Land nach Jahr",
    hubParts: "Jeder Teil einzeln", hubYears: "Nach Jahr", hubCompare: "Länder im Vergleich", hubGroups: "Gruppen", hubTopics: "Themen", hubRankings: "Ranglisten", hubCountries: "Länder",
    sideBySide: "Nebeneinander", theParts: "Woraus sich jede Zahl zusammensetzt", yearByYear: "Jahr für Jahr", measure: "Größe",
    rankings: [["Rangliste", "/ranking/"]] },
  fr: { rankByYear: "Trié selon « {m} » {unit}, {order}, en {y}.", topics: "Thèmes", allTopics: "Tous les thèmes", ranking: "Classement", members: "Membres", country: "Pays", small: "petite économie", related: "Pages liées", questions: "Questions",
    totals: "Totaux : les meilleures estimations des {n} membres additionnées, et en part de leur PIB cumulé. La fourchette et la probabilité de chaque membre figurent sur sa ligne.",
    eachRow: "Chaque ligne : la meilleure estimation, puis sa fourchette et la probabilité du sens, comme dans le panneau du pays.",
    eachRowYear: "Chaque ligne : le montant de l'année, une meilleure estimation. Fourchettes et probabilités portent sur les totaux depuis 2022, sur la page de chaque pays.",
    moneyOnly: "Ces chiffres mesurent de l'argent : l'aide à l'Ukraine et la variation de ce que la Russie tire du commerce, par rapport à un monde sans guerre. Armes envoyées, troupes et diplomatie n'y figurent pas.",
    moneyMil: "Ces chiffres mesurent de l'argent. Les armes et troupes envoyées à la Russie comptent dans les totaux pour les pays qui les ont envoyées, comme l'explique la page de méthode ; la diplomatie n'y figure pas.",
    party: "Partie au conflit (avec la Russie), non classée", sides: "{x} : un côté vers lequel l'argent est mesuré, donc sans chiffre propre.", russia: "Russie", ukraine: "Ukraine",
    noData: "Pas de données", noDataText: "Aucune observation propre pour les années de guerre : non classés.", outside: "Hors des totaux",
    rankBy: "Trié selon « {m} » {unit}, {order}, de février 2022 à {to}.", unit: { gdp: "en part d'une année de PIB", eur: "en euros", pp: "par habitant" },
    order: { hiLo: "par ordre décroissant", bySize: "par taille, dans un sens ou l'autre", uaRu: "du côté ukrainien au côté russe", ruUa: "du côté russe au côté ukrainien", keptMoreLess: "de là où la Russie a gardé plus à là où elle a gardé moins", keptLessMore: "de là où la Russie a gardé moins à là où elle a gardé plus" },
    minGdp: "Les économies de moins de {gdpMin} de PIB sont exclues, comme dans le classement de la carte.",
    legendKept: "en plus ou en moins : l'écart entre ce que la Russie a gardé (impôts et profits, pas les ventes) et ce qu'elle aurait gardé sans la guerre", legendSigned: "+ vers l'Ukraine, − vers la Russie",
    ofGdp: "du PIB", perPerson: "par habitant", ofCombined: "du PIB cumulé des membres",
    figKept: "{s} {if:x>=0|de moins|de plus}", totRus: "la Russie a gardé {v} {if:x>=0|de moins|de plus} que sans la guerre", totNet: "{v} {if:x>=0|vers l'Ukraine|vers la Russie}",
    chanceSide: "{if:ukr|vers l'Ukraine|vers la Russie}",
    totUa: "{v} de soutien", totFrozen: "{v} de rendement perdu", groupTotals: "Totaux du groupe",
    notInTotals: "Hors des totaux : à titre d'information (vue des coûts, dans le téléchargement complet des données).",
    fuelShare: "de ses achats à la Russie", openMap: "Ouvrir sur la carte", map: "Carte",
    yearTo: "{y} (jusqu'à {month})",
    more_about: "En savoir plus : {name}", groups: "Groupes", compared: "Comparé à", partsRanked: "Ses composantes, comparées aux autres pays", byYearPages: "Chaque pays, par année",
    hubParts: "Chaque composante à part", hubYears: "Par année", hubCompare: "Pays comparés", hubGroups: "Groupes", hubTopics: "Thèmes", hubRankings: "Classements", hubCountries: "Pays",
    sideBySide: "Côte à côte", theParts: "Ce qui compose chaque chiffre", yearByYear: "Année par année", measure: "Mesure",
    rankings: [["Classement", "/ranking/"]] },
  es: { rankByYear: "Ordenado por «{m}» {unit}, {order}, en {y}.", topics: "Temas", allTopics: "Todos los temas", ranking: "Clasificación", members: "Miembros", country: "País", small: "economía pequeña", related: "Páginas relacionadas", questions: "Preguntas",
    totals: "Totales: las mejores estimaciones de los {n} miembros sumadas, y como parte de su PIB conjunto. El rango y la probabilidad de cada miembro están en su fila.",
    eachRow: "Cada fila: la mejor estimación, luego su rango y la probabilidad de su dirección, como en el panel del país.",
    eachRowYear: "Cada fila: el importe de ese año, una mejor estimación. Los rangos y probabilidades son de los totales desde 2022, en la página de cada país.",
    moneyOnly: "Estas cifras miden dinero: la ayuda a Ucrania y el cambio en lo que Rusia obtiene del comercio, frente a un mundo sin guerra. No incluyen armas enviadas, tropas ni diplomacia.",
    moneyMil: "Estas cifras miden dinero. Las armas y tropas enviadas a Rusia cuentan en los totales para los países que las enviaron, como explica la página de método; la diplomacia no se incluye.",
    party: "Parte en la guerra (con Rusia), sin clasificar", sides: "{x}: un lado hacia el que se mide el dinero, sin cifra propia.", russia: "Rusia", ukraine: "Ucrania",
    noData: "Sin datos", noDataText: "Sin observación propia para los años de guerra: sin clasificar.", outside: "Fuera de los totales",
    rankBy: "Ordenado por «{m}» {unit}, {order}, de febrero de 2022 a {to}.", unit: { gdp: "como parte de un año de PIB", eur: "en euros", pp: "por persona" },
    order: { hiLo: "de más a menos", bySize: "por tamaño, en cualquier sentido", uaRu: "del lado ucraniano al lado ruso", ruUa: "del lado ruso al lado ucraniano", keptMoreLess: "de donde Rusia ganó más a donde ganó menos", keptLessMore: "de donde Rusia ganó menos a donde ganó más" },
    minGdp: "Se excluyen las economías con menos de {gdpMin} de PIB, como en la clasificación del mapa.",
    legendKept: "más o menos: cuánto más o menos se quedó Rusia (impuestos y beneficios, no ventas) que en un mundo sin guerra", legendSigned: "+ hacia Ucrania, − hacia Rusia",
    ofGdp: "del PIB", perPerson: "por persona", ofCombined: "del PIB conjunto de los miembros",
    figKept: "{s} {if:x>=0|menos|más}", totRus: "Rusia se quedó con {v} {if:x>=0|menos|más} que sin la guerra", totNet: "{v} {if:x>=0|hacia Ucrania|hacia Rusia}",
    chanceSide: "{if:ukr|hacia Ucrania|hacia Rusia}",
    totUa: "{v} de apoyo", totFrozen: "{v} de rendimiento perdido", groupTotals: "Totales del grupo",
    notInTotals: "Fuera de los totales: como información (vista de costes, en la descarga completa de datos).",
    fuelShare: "de lo que compró a Rusia", openMap: "Abrir en el mapa", map: "Mapa",
    yearTo: "{y} (hasta {month})",
    more_about: "Más sobre {name}", groups: "Grupos", compared: "Comparado con", partsRanked: "Sus partes, frente a otros países", byYearPages: "Cada país, por año",
    hubParts: "Cada parte por separado", hubYears: "Por año", hubCompare: "Países comparados", hubGroups: "Grupos", hubTopics: "Temas", hubRankings: "Clasificaciones", hubCountries: "Países",
    sideBySide: "Lado a lado", theParts: "De qué se compone cada cifra", yearByYear: "Año por año", measure: "Medida",
    rankings: [["Clasificación", "/ranking/"]] },
  pl: { rankByYear: "Według „{m}” {unit}, {order}, w {y} r.", topics: "Tematy", allTopics: "Wszystkie tematy", ranking: "Ranking", members: "Członkowie", country: "Kraj", small: "mała gospodarka", related: "Powiązane strony", questions: "Pytania",
    totals: "Sumy: najlepsze szacunki {n} członków zsumowane i jako udział w ich łącznym PKB. Przedział i szansa każdego członka są w jego wierszu.",
    eachRow: "Każdy wiersz: najlepszy szacunek, potem jego przedział i szansa kierunku, jak w panelu kraju.",
    eachRowYear: "Każdy wiersz: kwota z danego roku, najlepszy szacunek. Przedziały i szanse dotyczą sum od 2022 r., na stronie każdego kraju.",
    moneyOnly: "Te liczby mierzą pieniądze: pomoc dla Ukrainy i zmianę tego, co Rosja zatrzymuje z handlu, w porównaniu ze światem bez wojny. Nie obejmują wysłanej broni, wojsk ani dyplomacji.",
    moneyMil: "Te liczby mierzą pieniądze. Broń i wojska wysłane do Rosji liczą się w sumach dla krajów, które je wysłały, jak wyjaśnia strona metody; dyplomacja nie jest uwzględniona.",
    party: "Strona wojny (z Rosją), poza rankingiem", sides: "{x}: strona, względem której mierzone są pieniądze, więc bez własnej liczby.", russia: "Rosja", ukraine: "Ukraina",
    noData: "Brak danych", noDataText: "Brak własnych obserwacji za lata wojny: poza rankingiem.", outside: "Poza sumami",
    rankBy: "Według „{m}” {unit}, {order}, od lutego 2022 do {to}.", unit: { gdp: "jako udział w rocznym PKB", eur: "w euro", pp: "na osobę" },
    order: { hiLo: "malejąco", bySize: "według wielkości, w obie strony", uaRu: "od strony ukraińskiej do rosyjskiej", ruUa: "od strony rosyjskiej do ukraińskiej", keptMoreLess: "od krajów, gdzie Rosja zatrzymała więcej, do tych, gdzie mniej", keptLessMore: "od krajów, gdzie Rosja zatrzymała mniej, do tych, gdzie więcej" },
    minGdp: "Gospodarki z PKB poniżej {gdpMin} są pominięte, jak w rankingu na mapie.",
    legendKept: "więcej lub mniej: o ile więcej lub mniej Rosja zatrzymała (podatki i zysk, nie sprzedaż) niż w świecie bez wojny", legendSigned: "+ na rzecz Ukrainy, − na rzecz Rosji",
    ofGdp: "PKB", perPerson: "na osobę", ofCombined: "łącznego PKB członków",
    figKept: "{s} {if:x>=0|mniej|więcej}", totRus: "Rosja zatrzymała {v} {if:x>=0|mniej|więcej} niż bez wojny", totNet: "{v} {if:x>=0|na rzecz Ukrainy|na rzecz Rosji}",
    chanceSide: "{if:ukr|na rzecz Ukrainy|na rzecz Rosji}",
    totUa: "{v} wsparcia", totFrozen: "{v} utraconego zwrotu", groupTotals: "Sumy grupy",
    notInTotals: "Poza sumami: informacyjnie (widok kosztów, w pełnym pliku danych).",
    fuelShare: "jego zakupów z Rosji", openMap: "Otwórz na mapie", map: "Mapa",
    yearTo: "{y} (do {month})",
    more_about: "Więcej: {name}", groups: "Grupy", compared: "W porównaniu z", partsRanked: "Jego składniki na tle innych krajów", byYearPages: "Każdy kraj według roku",
    hubParts: "Każdy składnik osobno", hubYears: "Według roku", hubCompare: "Porównania krajów", hubGroups: "Grupy", hubTopics: "Tematy", hubRankings: "Rankingi", hubCountries: "Kraje",
    sideBySide: "Obok siebie", theParts: "Z czego składa się każda liczba", yearByYear: "Rok po roku", measure: "Miara",
    rankings: [["Ranking", "/ranking/"]] },
  nl: { rankByYear: "Gesorteerd op ‘{m}’ {unit}, {order}, in {y}.", topics: "Onderwerpen", allTopics: "Alle onderwerpen", ranking: "Ranglijst", members: "Leden", country: "Land", small: "kleine economie", related: "Verwante pagina's", questions: "Vragen",
    totals: "Totalen: de beste schattingen van de {n} leden opgeteld, en als aandeel van hun gezamenlijke bbp. Bandbreedte en kans van elk lid staan in zijn rij.",
    eachRow: "Elke rij: de beste schatting, dan de bandbreedte en de kans op de richting, zoals in het paneel van het land.",
    eachRowYear: "Elke rij: het bedrag van dat jaar, een beste schatting. Bandbreedtes en kansen gelden voor de totalen sinds 2022, op de pagina van elk land.",
    moneyOnly: "Deze cijfers meten geld: steun aan Oekraïne en de verandering in wat Rusland aan handel overhoudt, vergeleken met een wereld zonder oorlog. Geleverde wapens, troepen en diplomatie zitten er niet in.",
    moneyMil: "Deze cijfers meten geld. Wapens en troepen voor Rusland tellen in de totalen mee bij de landen die ze stuurden, zoals de methodepagina uitlegt; diplomatie zit er niet in.",
    party: "Partij in de oorlog (met Rusland), niet gerangschikt", sides: "{x}: een kant waarnaar het geld gemeten wordt, dus zonder eigen cijfer.", russia: "Rusland", ukraine: "Oekraïne",
    noData: "Geen gegevens", noDataText: "Geen eigen waarneming voor de oorlogsjaren: niet gerangschikt.", outside: "Buiten de totalen",
    rankBy: "Gesorteerd op ‘{m}’ {unit}, {order}, februari 2022 tot {to}.", unit: { gdp: "als aandeel van een jaar bbp", eur: "in euro", pp: "per persoon" },
    order: { hiLo: "van hoog naar laag", bySize: "naar grootte, beide kanten op", uaRu: "van de Oekraïense naar de Russische kant", ruUa: "van de Russische naar de Oekraïense kant", keptMoreLess: "van waar Rusland meer overhield naar waar het minder overhield", keptLessMore: "van waar Rusland minder overhield naar waar het meer overhield" },
    minGdp: "Economieën onder {gdpMin} bbp zijn weggelaten, zoals in de ranglijst van de kaart.",
    legendKept: "meer of minder: hoeveel meer of minder Rusland overhield (belasting en winst, geen omzet) dan zonder oorlog", legendSigned: "+ richting Oekraïne, − richting Rusland",
    ofGdp: "van het bbp", perPerson: "per persoon", ofCombined: "van het gezamenlijke bbp van de leden",
    figKept: "{s} {if:x>=0|minder|meer}", totRus: "Rusland hield {v} {if:x>=0|minder|meer} over dan zonder oorlog", totNet: "{v} {if:x>=0|richting Oekraïne|richting Rusland}",
    chanceSide: "{if:ukr|richting Oekraïne|richting Rusland}",
    totUa: "{v} aan steun", totFrozen: "{v} gederfd rendement", groupTotals: "Totalen van de groep",
    notInTotals: "Niet in de totalen: ter informatie (kostenweergave, in de volledige datadownload).",
    fuelShare: "van wat het van Rusland kocht", openMap: "Openen op de kaart", map: "Kaart",
    yearTo: "{y} (tot {month})",
    more_about: "Meer over {name}", groups: "Groepen", compared: "Vergeleken met", partsRanked: "Zijn onderdelen, naast andere landen", byYearPages: "Elk land per jaar",
    hubParts: "Elk onderdeel apart", hubYears: "Per jaar", hubCompare: "Landen vergeleken", hubGroups: "Groepen", hubTopics: "Onderwerpen", hubRankings: "Ranglijsten", hubCountries: "Landen",
    sideBySide: "Naast elkaar", theParts: "Waaruit elk getal bestaat", yearByYear: "Jaar na jaar", measure: "Maat",
    rankings: [["Ranglijst", "/ranking/"]] },
  uk: { rankByYear: "Відсортовано за показником «{m}» {unit}, {order}, у {y} році.", topics: "Теми", allTopics: "Усі теми", ranking: "Рейтинг", members: "Члени", country: "Країна", small: "мала економіка", related: "Пов'язані сторінки", questions: "Запитання",
    totals: "Підсумки: найкращі оцінки {n} членів разом і як частка їхнього спільного ВВП. Діапазон і шанс кожного члена — у його рядку.",
    eachRow: "Кожен рядок: найкраща оцінка, далі її діапазон і шанс напрямку, як на панелі країни.",
    eachRowYear: "Кожен рядок: сума за цей рік, найкраща оцінка. Діапазони й шанси стосуються підсумків з 2022 року, на сторінці кожної країни.",
    moneyOnly: "Ці числа вимірюють гроші: допомогу Україні та зміну того, що Росія отримує від торгівлі, порівняно зі світом без війни. Надіслана зброя, війська й дипломатія сюди не входять.",
    moneyMil: "Ці числа вимірюють гроші. Зброя і війська, надіслані Росії, враховані в підсумках для країн, що їх надіслали, як пояснює сторінка методики; дипломатія сюди не входить.",
    party: "Сторона війни (разом із Росією), поза рейтингом", sides: "{x}: сторона, щодо якої вимірюються гроші, тому без власного числа.", russia: "Росія", ukraine: "Україна",
    noData: "Немає даних", noDataText: "Власних спостережень за роки війни немає: поза рейтингом.", outside: "Поза підсумками",
    rankBy: "Відсортовано за показником «{m}» {unit}, {order}, з лютого 2022 до {to}.", unit: { gdp: "як частка річного ВВП", eur: "у євро", pp: "на особу" },
    order: { hiLo: "за спаданням", bySize: "за розміром, в обидва боки", uaRu: "від українського боку до російського", ruUa: "від російського боку до українського", keptMoreLess: "від країн, де Росія отримала більше, до країн, де менше", keptLessMore: "від країн, де Росія отримала менше, до країн, де більше" },
    minGdp: "Економіки з ВВП менше {gdpMin} не враховано, як у рейтингу на карті.",
    legendKept: "більше чи менше: на скільки більше чи менше Росія отримала (податки й прибуток, не продажі), ніж у світі без війни", legendSigned: "+ на користь України, − на бік Росії",
    ofGdp: "ВВП", perPerson: "на особу", ofCombined: "спільного ВВП членів",
    figKept: "{s} {if:x>=0|менше|більше}", totRus: "Росія отримала на {v} {if:x>=0|менше|більше}, ніж без війни", totNet: "{v} {if:x>=0|на користь України|на бік Росії}",
    chanceSide: "{if:ukr|на користь України|на бік Росії}",
    totUa: "{v} підтримки", totFrozen: "{v} втраченого доходу", groupTotals: "Підсумки групи",
    notInTotals: "Поза підсумками: для інформації (вигляд витрат, у повному завантаженні даних).",
    fuelShare: "її закупівель у Росії", openMap: "Відкрити на карті", map: "Карта",
    yearTo: "{y} (до {month})",
    more_about: "Більше про: {name}", groups: "Групи", compared: "У порівнянні з", partsRanked: "Її складники порівняно з іншими країнами", byYearPages: "Кожна країна за роками",
    hubParts: "Кожен складник окремо", hubYears: "За роками", hubCompare: "Порівняння країн", hubGroups: "Групи", hubTopics: "Теми", hubRankings: "Рейтинги", hubCountries: "Країни",
    sideBySide: "Поруч", theParts: "З чого складається кожне число", yearByYear: "Рік за роком", measure: "Показник",
    rankings: [["Рейтинг", "/ranking/"]] },
};
// a frame's words, filled (a list or a set of words is given as it is)
export const s = (l, k, vars, nums) => { const x = (S[l] && S[l][k] !== undefined ? S[l] : S.en)[k]; return typeof x === "string" ? fmt(x, vars || {}, nums || {}) : x; };

// ----- the measures a page can rank by -----
export const MEASURE = {
  en: { net: "Net", ua: "Support for Ukraine", rus: "Russia kept from trade, vs no war", frozen: "Russian money frozen (return lost)", paid: "Paid Russia since 2022", paidGain: "Russia kept from its purchases, vs no war", aid: "Aid counted here", kiel: "Kiel Institute figure", fuelShare: "Fuel share of purchases, 2018–2021", armed: "Full value of deliveries" },
  de: { net: "Saldo", ua: "Unterstützung für die Ukraine", rus: "Russlands Handelsgewinn ggü. ohne Krieg", frozen: "Eingefrorenes russisches Geld (entgangener Ertrag)", paid: "An Russland gezahlt seit 2022", paidGain: "Russlands Gewinn aus seinen Käufen ggü. ohne Krieg", aid: "Hier gezählte Hilfe", kiel: "Zahl des Kiel Instituts", fuelShare: "Brennstoffanteil der Käufe 2018–2021", armed: "Voller Wert der Lieferungen" },
  fr: { net: "Solde", ua: "Soutien à l'Ukraine", rus: "Gain russe sur le commerce, vs sans guerre", frozen: "Avoirs russes gelés (rendement perdu)", paid: "Payé à la Russie depuis 2022", paidGain: "Gain russe sur ses achats, vs sans guerre", aid: "Aide comptée ici", kiel: "Chiffre de l'Institut de Kiel", fuelShare: "Part des combustibles dans ses achats, 2018–2021", armed: "Valeur totale des livraisons" },
  es: { net: "Neto", ua: "Apoyo a Ucrania", rus: "Ganancia rusa del comercio, vs sin guerra", frozen: "Dinero ruso congelado (rendimiento perdido)", paid: "Pagado a Rusia desde 2022", paidGain: "Ganancia rusa de sus compras, vs sin guerra", aid: "Ayuda contada aquí", kiel: "Cifra del Instituto de Kiel", fuelShare: "Peso de los combustibles en sus compras, 2018–2021", armed: "Valor total de las entregas" },
  pl: { net: "Saldo", ua: "Wsparcie dla Ukrainy", rus: "Zysk Rosji z handlu wobec braku wojny", frozen: "Zamrożone rosyjskie środki (utracony zwrot)", paid: "Zapłacono Rosji od 2022", paidGain: "Zysk Rosji z jego zakupów wobec braku wojny", aid: "Pomoc liczona tutaj", kiel: "Dane Instytutu Kilońskiego", fuelShare: "Udział paliw w zakupach 2018–2021", armed: "Pełna wartość dostaw" },
  nl: { net: "Saldo", ua: "Steun aan Oekraïne", rus: "Ruslands handelswinst t.o.v. geen oorlog", frozen: "Bevroren Russisch geld (gederfd rendement)", paid: "Aan Rusland betaald sinds 2022", paidGain: "Ruslands winst op zijn aankopen t.o.v. geen oorlog", aid: "Hier getelde hulp", kiel: "Cijfer van het Kiel Instituut", fuelShare: "Aandeel brandstof in aankopen 2018–2021", armed: "Volle waarde van de leveringen" },
  uk: { net: "Нетто", ua: "Підтримка України", rus: "Прибуток Росії від торгівлі проти світу без війни", frozen: "Заморожені російські кошти (втрачений дохід)", paid: "Сплачено Росії з 2022", paidGain: "Прибуток Росії з її закупівель проти світу без війни", aid: "Допомога, врахована тут", kiel: "Дані Кільського інституту", fuelShare: "Частка палива в закупівлях 2018–2021", armed: "Повна вартість поставок" },
};

// ----- the parts of the panel, one neutral name each (the panel's own names change with the sign) -----
export const PART = {
  en: { othsp: "Aid spent here on energy, relief and rebuilding", arms: "Arms Ukraine bought here", aid: "Government aid to Ukraine", euaid: "Share of EU aid to Ukraine", ref: "Cost of hosting refugees from Ukraine", priv: "Private donations to Ukraine", multilat: "Share of IMF and World Bank lending to Ukraine",
    undisc: "Undisclosed military aid to Ukraine", buy: "Extra purchases from Ukraine", refsp: "Refugee spending kept in the host economy", own: "Aid to Ukraine spent at home",
    purl: "Other countries' aid to Ukraine spent here", sell: "Extra sales to Ukraine", svcukr: "Extra services sold to Ukraine", paid: "Russia's gain on fuel and goods it sold",
    windfall: "Russia's gain from war-time fuel prices", laund: "Russian oil bought via other countries", sold: "Sellers' gain on sales to Russia", premium: "Extra price Russia paid because of sanctions",
    tax: "Company taxes paid in Russia", coprofits: "Company profits in Russia", lngpartners: "Stakes in Russian oil and gas projects", svcpaid: "Services bought from Russia", svcsold: "Services sold to Russia",
    ship: "Shipping and insuring Russian oil", hidden: "Gold and hidden payments to Russia", agents: "Payment agents settling Russia's trade", rusfirms: "Profits of Russian-owned companies abroad",
    rusarms: "Weapons bought from Russia", statefin: "Rosatom projects and Russian state loans", wagner: "Russian forces paid (Wagner, Africa Corps)", mil: "Weapons and troops sent to Russia",
    frozen: "Frozen Russian central bank reserves", frozen_priv: "Frozen Russian private assets", prem: "Cost of replacing Russian energy", disc: "Discount gained on Russian oil",
    seized: "Company assets seized by Russia", exits: "Companies' cost of leaving Russia", trapped: "Company profits trapped in Russia" },
  de: { othsp: "Hier ausgegebene Hilfe für Energie, Nothilfe und Wiederaufbau", arms: "Hier gekaufte Waffen der Ukraine", aid: "Staatliche Hilfe für die Ukraine", euaid: "Anteil an der EU-Hilfe für die Ukraine", ref: "Kosten der Aufnahme ukrainischer Geflüchteter", priv: "Private Spenden für die Ukraine", multilat: "Anteil an IWF- und Weltbankkrediten für die Ukraine",
    undisc: "Nicht veröffentlichte Militärhilfe für die Ukraine", buy: "Zusätzliche Käufe aus der Ukraine", refsp: "Flüchtlingsausgaben, die im Aufnahmeland bleiben", own: "Ukraine-Hilfe, im eigenen Land ausgegeben",
    purl: "Ukraine-Hilfe anderer Länder, hier ausgegeben", sell: "Zusätzliche Verkäufe an die Ukraine", svcukr: "Zusätzliche Dienstleistungen für die Ukraine", paid: "Russlands Gewinn aus verkauften Brennstoffen und Waren",
    windfall: "Russlands Gewinn aus kriegsbedingten Energiepreisen", laund: "Russisches Öl über Drittländer gekauft", sold: "Gewinn der Verkäufer aus Exporten nach Russland", premium: "Sanktionsaufschlag, den Russland zahlte",
    tax: "Unternehmenssteuern in Russland", coprofits: "Unternehmensgewinne in Russland", lngpartners: "Beteiligungen an russischen Öl- und Gasprojekten", svcpaid: "Dienstleistungen aus Russland", svcsold: "Dienstleistungen für Russland",
    ship: "Transport und Versicherung russischen Öls", hidden: "Gold und verdeckte Zahlungen an Russland", agents: "Zahlungsagenten für Russlands Handel", rusfirms: "Gewinne russischer Firmen im Ausland",
    rusarms: "Waffenkäufe in Russland", statefin: "Rosatom-Projekte und russische Staatskredite", wagner: "Bezahlte russische Truppen (Wagner, Africa Corps)", mil: "Waffen und Truppen für Russland",
    frozen: "Eingefrorene russische Zentralbankreserven", frozen_priv: "Eingefrorene russische Privatvermögen", prem: "Kosten des Ersatzes russischer Energie", disc: "Rabatt auf russisches Öl",
    seized: "Von Russland beschlagnahmte Firmenvermögen", exits: "Kosten des Rückzugs aus Russland", trapped: "In Russland festsitzende Firmengewinne" },
  fr: { othsp: "Aide dépensée ici pour l'énergie, les secours et la reconstruction", arms: "Armes achetées ici par l'Ukraine", aid: "Aide publique à l'Ukraine", euaid: "Part de l'aide de l'UE à l'Ukraine", ref: "Coût de l'accueil des réfugiés ukrainiens", priv: "Dons privés à l'Ukraine", multilat: "Part des prêts du FMI et de la Banque mondiale à l'Ukraine",
    undisc: "Aide militaire non publiée à l'Ukraine", buy: "Achats supplémentaires à l'Ukraine", refsp: "Dépenses pour les réfugiés restées dans le pays d'accueil", own: "Aide à l'Ukraine dépensée sur place",
    purl: "Aide d'autres pays à l'Ukraine dépensée ici", sell: "Ventes supplémentaires à l'Ukraine", svcukr: "Services supplémentaires vendus à l'Ukraine", paid: "Gain russe sur les combustibles et biens vendus",
    windfall: "Gain russe tiré des prix de guerre de l'énergie", laund: "Pétrole russe acheté via des pays tiers", sold: "Gain des vendeurs sur les ventes à la Russie", premium: "Surcoût payé par la Russie à cause des sanctions",
    tax: "Impôts des entreprises en Russie", coprofits: "Bénéfices des entreprises en Russie", lngpartners: "Participations dans des projets pétroliers et gaziers russes", svcpaid: "Services achetés à la Russie", svcsold: "Services vendus à la Russie",
    ship: "Transport et assurance du pétrole russe", hidden: "Or et paiements cachés à la Russie", agents: "Agents de paiement du commerce russe", rusfirms: "Bénéfices des entreprises russes à l'étranger",
    rusarms: "Armes achetées à la Russie", statefin: "Projets Rosatom et prêts d'État russes", wagner: "Forces russes payées (Wagner, Africa Corps)", mil: "Armes et troupes envoyées à la Russie",
    frozen: "Réserves gelées de la banque centrale russe", frozen_priv: "Avoirs privés russes gelés", prem: "Coût du remplacement de l'énergie russe", disc: "Rabais obtenu sur le pétrole russe",
    seized: "Actifs d'entreprises saisis par la Russie", exits: "Coût du départ de Russie pour les entreprises", trapped: "Bénéfices bloqués en Russie" },
  es: { othsp: "Ayuda gastada aquí en energía, socorro y reconstrucción", arms: "Armas compradas aquí por Ucrania", aid: "Ayuda pública a Ucrania", euaid: "Parte de la ayuda de la UE a Ucrania", ref: "Coste de acoger a refugiados ucranianos", priv: "Donaciones privadas a Ucrania", multilat: "Parte de los préstamos del FMI y el Banco Mundial a Ucrania",
    undisc: "Ayuda militar no publicada a Ucrania", buy: "Compras adicionales a Ucrania", refsp: "Gasto en refugiados que queda en el país de acogida", own: "Ayuda a Ucrania gastada en casa",
    purl: "Ayuda de otros países a Ucrania gastada aquí", sell: "Ventas adicionales a Ucrania", svcukr: "Servicios adicionales vendidos a Ucrania", paid: "Ganancia rusa por combustibles y bienes vendidos",
    windfall: "Ganancia rusa por los precios de guerra de la energía", laund: "Petróleo ruso comprado vía terceros países", sold: "Ganancia de los vendedores en ventas a Rusia", premium: "Sobreprecio pagado por Rusia por las sanciones",
    tax: "Impuestos de empresas en Rusia", coprofits: "Beneficios de empresas en Rusia", lngpartners: "Participaciones en proyectos rusos de petróleo y gas", svcpaid: "Servicios comprados a Rusia", svcsold: "Servicios vendidos a Rusia",
    ship: "Transporte y seguro del petróleo ruso", hidden: "Oro y pagos ocultos a Rusia", agents: "Agentes de pago del comercio ruso", rusfirms: "Beneficios de empresas rusas en el extranjero",
    rusarms: "Armas compradas a Rusia", statefin: "Proyectos de Rosatom y préstamos estatales rusos", wagner: "Fuerzas rusas pagadas (Wagner, Africa Corps)", mil: "Armas y tropas enviadas a Rusia",
    frozen: "Reservas congeladas del banco central ruso", frozen_priv: "Activos privados rusos congelados", prem: "Coste de sustituir la energía rusa", disc: "Descuento obtenido en el petróleo ruso",
    seized: "Activos de empresas incautados por Rusia", exits: "Coste de salir de Rusia para las empresas", trapped: "Beneficios bloqueados en Rusia" },
  pl: { othsp: "Pomoc wydana tutaj na energię, pomoc doraźną i odbudowę", arms: "Broń kupiona tutaj przez Ukrainę", aid: "Pomoc rządowa dla Ukrainy", euaid: "Udział w pomocy UE dla Ukrainy", ref: "Koszt przyjęcia uchodźców z Ukrainy", priv: "Darowizny prywatne dla Ukrainy", multilat: "Udział w pożyczkach MFW i Banku Światowego dla Ukrainy",
    undisc: "Nieujawniona pomoc wojskowa dla Ukrainy", buy: "Dodatkowe zakupy z Ukrainy", refsp: "Wydatki na uchodźców pozostające w kraju przyjmującym", own: "Pomoc dla Ukrainy wydana w kraju",
    purl: "Pomoc innych krajów dla Ukrainy wydana tutaj", sell: "Dodatkowa sprzedaż do Ukrainy", svcukr: "Dodatkowe usługi sprzedane Ukrainie", paid: "Zysk Rosji na sprzedanych paliwach i towarach",
    windfall: "Zysk Rosji z wojennych cen energii", laund: "Rosyjska ropa kupowana przez kraje trzecie", sold: "Zysk sprzedawców na sprzedaży do Rosji", premium: "Dopłata Rosji z powodu sankcji",
    tax: "Podatki firm w Rosji", coprofits: "Zyski firm w Rosji", lngpartners: "Udziały w rosyjskich projektach naftowych i gazowych", svcpaid: "Usługi kupione od Rosji", svcsold: "Usługi sprzedane Rosji",
    ship: "Transport i ubezpieczenie rosyjskiej ropy", hidden: "Złoto i ukryte płatności do Rosji", agents: "Pośrednicy płatności w handlu z Rosją", rusfirms: "Zyski rosyjskich firm za granicą",
    rusarms: "Broń kupiona od Rosji", statefin: "Projekty Rosatomu i rosyjskie pożyczki państwowe", wagner: "Opłacone rosyjskie siły (Wagner, Africa Corps)", mil: "Broń i wojska wysłane do Rosji",
    frozen: "Zamrożone rezerwy rosyjskiego banku centralnego", frozen_priv: "Zamrożone rosyjskie aktywa prywatne", prem: "Koszt zastąpienia rosyjskiej energii", disc: "Rabat na rosyjską ropę",
    seized: "Majątek firm przejęty przez Rosję", exits: "Koszt wyjścia firm z Rosji", trapped: "Zyski firm zablokowane w Rosji" },
  nl: { othsp: "Hier bestede hulp voor energie, noodhulp en wederopbouw", arms: "Wapens die Oekraïne hier kocht", aid: "Overheidssteun aan Oekraïne", euaid: "Aandeel in de EU-steun aan Oekraïne", ref: "Kosten van de opvang van Oekraïense vluchtelingen", priv: "Particuliere giften aan Oekraïne", multilat: "Aandeel in leningen van IMF en Wereldbank aan Oekraïne",
    undisc: "Niet-openbare militaire steun aan Oekraïne", buy: "Extra aankopen uit Oekraïne", refsp: "Uitgaven aan vluchtelingen die in het opvangland blijven", own: "Steun aan Oekraïne in eigen land besteed",
    purl: "Steun van andere landen aan Oekraïne hier besteed", sell: "Extra verkoop aan Oekraïne", svcukr: "Extra diensten verkocht aan Oekraïne", paid: "Ruslands winst op verkochte brandstof en goederen",
    windfall: "Ruslands winst door oorlogsprijzen voor energie", laund: "Russische olie gekocht via derde landen", sold: "Winst van verkopers op verkoop aan Rusland", premium: "Meerprijs die Rusland betaalde door sancties",
    tax: "Bedrijfsbelastingen in Rusland", coprofits: "Bedrijfswinsten in Rusland", lngpartners: "Belangen in Russische olie- en gasprojecten", svcpaid: "Diensten gekocht van Rusland", svcsold: "Diensten verkocht aan Rusland",
    ship: "Vervoer en verzekering van Russische olie", hidden: "Goud en verborgen betalingen aan Rusland", agents: "Betaalagenten voor Ruslands handel", rusfirms: "Winsten van Russische bedrijven in het buitenland",
    rusarms: "Wapens gekocht van Rusland", statefin: "Rosatom-projecten en Russische staatsleningen", wagner: "Betaalde Russische troepen (Wagner, Africa Corps)", mil: "Wapens en troepen naar Rusland",
    frozen: "Bevroren reserves van de Russische centrale bank", frozen_priv: "Bevroren Russische privétegoeden", prem: "Kosten van het vervangen van Russische energie", disc: "Korting op Russische olie",
    seized: "Bedrijfsbezit in beslag genomen door Rusland", exits: "Kosten van vertrek uit Rusland voor bedrijven", trapped: "Bedrijfswinsten vast in Rusland" },
  uk: { othsp: "Допомога, витрачена тут на енергетику, гуманітарну допомогу й відбудову", arms: "Зброя, куплена тут Україною", aid: "Державна допомога Україні", euaid: "Частка допомоги ЄС Україні", ref: "Витрати на прийом українських біженців", priv: "Приватні пожертви Україні", multilat: "Частка кредитів МВФ і Світового банку Україні",
    undisc: "Неоприлюднена військова допомога Україні", buy: "Додаткові закупівлі в України", refsp: "Витрати на біженців, що лишаються в країні прийому", own: "Допомога Україні, витрачена вдома",
    purl: "Допомога інших країн Україні, витрачена тут", sell: "Додаткові продажі Україні", svcukr: "Додаткові послуги, продані Україні", paid: "Прибуток Росії з проданого палива й товарів",
    windfall: "Прибуток Росії з воєнних цін на енергоносії", laund: "Російська нафта, куплена через треті країни", sold: "Прибуток продавців від продажів Росії", premium: "Надбавка, яку Росія платила через санкції",
    tax: "Податки компаній у Росії", coprofits: "Прибутки компаній у Росії", lngpartners: "Частки в російських нафтогазових проєктах", svcpaid: "Послуги, куплені в Росії", svcsold: "Послуги, продані Росії",
    ship: "Перевезення й страхування російської нафти", hidden: "Золото й приховані платежі Росії", agents: "Платіжні агенти російської торгівлі", rusfirms: "Прибутки російських компаній за кордоном",
    rusarms: "Зброя, куплена в Росії", statefin: "Проєкти Росатома й російські державні кредити", wagner: "Оплачені російські сили (Вагнер, Африканський корпус)", mil: "Зброя і війська, надіслані Росії",
    frozen: "Заморожені резерви російського центробанку", frozen_priv: "Заморожені російські приватні активи", prem: "Вартість заміни російських енергоносіїв", disc: "Знижка на російську нафту",
    seized: "Майно компаній, захоплене Росією", exits: "Вартість виходу компаній з Росії", trapped: "Прибутки компаній, заблоковані в Росії" },
};
export const partName = (l, k) => (PART[l] && PART[l][k]) || PART.en[k] || k;
export const measureName = (l, k) => (k.startsWith("part:") ? partName(l, k.slice(5)) : (MEASURE[l] && MEASURE[l][k]) || MEASURE.en[k] || k);

// what one part of the panel is, by its side
export const SIDE = {
  en: { ua: "One part of each country's support for Ukraine.", back: "Money flowing back from the war effort to the giver's own economy, subtracted from its support for Ukraine at its real gain.",
    rus: "One part of how much more or less Russia kept from trade with each country than in a world without the war (taxes and profit, not the sales value).", frozen: "The return Russia lost on money frozen in each country: counted in the net (not in support or trade), and not the amount frozen.", cost: "Not in the totals: shown for information." },
  de: { ua: "Ein Teil der Unterstützung jedes Landes für die Ukraine.", back: "Geld, das aus der Kriegshilfe in die Wirtschaft des Gebers zurückfließt und von seiner Unterstützung abgezogen wird, zu seinem echten Gewinn.",
    rus: "Ein Teil dessen, wie viel mehr oder weniger Russland am Handel mit jedem Land behielt als ohne Krieg (Steuern und Gewinn, nicht der Umsatz).", frozen: "Der Ertrag, den Russland auf in jedem Land eingefrorenes Geld verlor: im Saldo gezählt (nicht in Unterstützung oder Handel), nicht der eingefrorene Betrag.", cost: "Nicht in den Summen: zur Information." },
  fr: { ua: "Une composante du soutien de chaque pays à l'Ukraine.", back: "L'argent de l'effort de guerre qui revient dans l'économie du donateur, déduit de son soutien à hauteur de son gain réel.",
    rus: "Une composante de ce que la Russie a gardé de plus ou de moins sur son commerce avec chaque pays par rapport à un monde sans guerre (impôts et profits, pas les ventes).", frozen: "Le rendement perdu par la Russie sur l'argent gelé dans chaque pays : compté dans le solde (ni dans le soutien ni dans le commerce), et non le montant gelé.", cost: "Hors des totaux : à titre d'information." },
  es: { ua: "Una parte del apoyo de cada país a Ucrania.", back: "Dinero del esfuerzo de guerra que vuelve a la economía del donante, restado de su apoyo según su ganancia real.",
    rus: "Una parte de cuánto más o menos se quedó Rusia del comercio con cada país que en un mundo sin guerra (impuestos y beneficios, no las ventas).", frozen: "El rendimiento que Rusia perdió por el dinero congelado en cada país: cuenta en el neto (no en el apoyo ni en el comercio), y no es el importe congelado.", cost: "Fuera de los totales: como información." },
  pl: { ua: "Jeden ze składników wsparcia każdego kraju dla Ukrainy.", back: "Pieniądze z pomocy wojennej wracające do gospodarki darczyńcy, odejmowane od jego wsparcia według jego rzeczywistego zysku.",
    rus: "Jeden ze składników tego, o ile więcej lub mniej Rosja zatrzymała z handlu z każdym krajem niż w świecie bez wojny (podatki i zysk, nie sprzedaż).", frozen: "Zwrot utracony przez Rosję na środkach zamrożonych w każdym kraju: liczony w saldzie (nie we wsparciu ani w handlu), nie jest to kwota zamrożona.", cost: "Poza sumami: informacyjnie." },
  nl: { ua: "Een onderdeel van de steun van elk land aan Oekraïne.", back: "Geld uit de oorlogssteun dat terugvloeit naar de economie van de gever en van zijn steun wordt afgetrokken, tegen zijn werkelijke winst.",
    rus: "Een onderdeel van hoeveel meer of minder Rusland aan de handel met elk land overhield dan zonder oorlog (belasting en winst, geen omzet).", frozen: "Het rendement dat Rusland misliep op geld dat in elk land bevroren is: in het saldo geteld (niet bij steun of handel), en niet het bevroren bedrag.", cost: "Niet in de totalen: ter informatie." },
  uk: { ua: "Один зі складників підтримки України кожною країною.", back: "Гроші з воєнної допомоги, що повертаються в економіку донора й віднімаються від його підтримки за реальним прибутком.",
    rus: "Один зі складників того, на скільки більше чи менше Росія отримала від торгівлі з кожною країною, ніж у світі без війни (податки й прибуток, не продажі).", frozen: "Дохід, який Росія втратила на коштах, заморожених у кожній країні: враховано в нетто (не в підтримці й не в торгівлі), і це не заморожена сума.", cost: "Поза підсумками: для інформації." },
};
export const sideText = (l, side) => (SIDE[l] || SIDE.en)[side] || "";

// ----- the copy of each family, in every language: one entry per family, filled from the live table -----
// part:     {N} the part's name, {dataTo}, {t1} the first row's name, {topV} its figure; partIntro: {sideText}, {n}, {tops}
// year:     {y}, {Y} the year (with "to <month>" for the year in progress), {month}, {n}, {t1}, {topV}, {tops};
//           values: partial (the year in progress), topX (the first row's amount)
// compare:  {A} {B} the two names; compareLine: {a} {b} {eurA} {eurB}, values uaA uaB pctA pctB
// topic:    a topic or group page in another language: {label} {n} {measure} {unit} {dataTo} {t1} {topV} {tops} {sumUa}
//           {sumNetPct}, value net
// country:  {N} the name, {Nt} inside a sentence (English "the"), {NCap} {NtCap}; figures {ua} {uaP} {net} {netP} {rus}
//           {rusP} {ch}; the map's words {netDir} {sureWord} {leanWord} {uncWord} {zeroWord} {partyWord} {netRange}
//           {netWords} {kept} {uaVerb} {partyWhy} (and ...Cap, ...Lc); values rusX, eu, armed, frozen, mostly
// home:     {n} countries, {dataTo}
const COPY = {
  en: {
    part: { title: ["{N} by country since 2022", "{N} by country", "{N}"],
      description: ["{N}, every country ranked, February 2022 to {dataTo}. {t1}: {topV}. Euros, % of GDP, ranges, sources.", "{N}, every country ranked, February 2022 to {dataTo}, in euros and % of GDP, with ranges and sources."],
      h1: "{N}: every country since 2022",
      intro: "{sideText} From February 2022 to {dataTo}, {n} countries have this part; the table starts with {tops}." },
    year: {
      ua: { label: "Aid to Ukraine in {y}", title: ["{if:partial|Aid to Ukraine in {y} so far: by country (to {month})|Aid to Ukraine in {y}: how much each country gave}", "{if:partial|Aid to Ukraine in {y} so far, by country|Aid to Ukraine in {y} by country}"],
        description: ["Support for Ukraine in {Y}: {n} countries ranked in euros, with % of GDP. {t1}: {topV}. Aid, EU share, refugee hosting.", "Support for Ukraine in {Y}, every country ranked in euros and % of GDP: aid, EU share and refugee hosting."],
        h1: "{if:partial|How much has each country given Ukraine in {y} so far?|How much did each country give Ukraine in {y}?}",
        intro: "Each country's support for Ukraine in {Y}: its aid (loans at their gift value), its share of EU aid and the cost of hosting refugees, minus money flowing back. In euros, the table starts with {tops}." },
      rus: { label: "Trade with Russia in {y}", title: ["{if:partial|Trade with Russia in {y} so far: by country (to {month})|Trade with Russia in {y}: who added to Russia's earnings?}", "{if:partial|Trade with Russia in {y} so far, by country|Trade with Russia in {y} by country}"],
        description: ["Trade with Russia in {Y}: how much more or less Russia kept from each country's trade than without the war. {t1}: {topV} {if:topX>=0|less|more}.", "Trade with Russia in {Y}: how much more or less Russia kept from each country's trade than without the war, country by country."],
        h1: "Trade with Russia in {Y}: whose trade raised or cut Russia's earnings?",
        intro: "How much more or less Russia kept (taxes and profit, not the sales value) from trade with each country in {Y} than in a world without the war. The table starts with {tops}." } },
    compare: { label: "{A} vs {B}", title: ["{A} vs {B}: aid to Ukraine and trade with Russia", "{A} vs {B}: Ukraine aid and Russia trade", "{A} vs {B}: Ukraine or Russia?", "{A} vs {B}"],
      description: "{A} vs {B} since 2022: support for Ukraine, what Russia kept from trade with each, and the net, side by side, with ranges, chances and sources.",
      h1: "{A} vs {B}: support for Ukraine and trade with Russia since 2022",
      line: "Support for Ukraine in euros: {a} {eurA}, {b} {eurB}. More in euros: {if:uaA>=uaB|{a}|{b}}; more as a share of GDP: {if:pctA>=pctB|{a}|{b}}." },
    hub: { title: "Topics: every ranking, part, year and comparison", description: "All {n} pages of War Balance by topic: rankings, groups, each part of the numbers, each year since 2022 and countries compared side by side.", h1: "Every topic, part, year and comparison" },
    country: {
      u_sure: { title: ["How much has {Nt} given Ukraine? {ua} since 2022", "How much has {Nt} given Ukraine? {ua}", "{N}: {ua} for Ukraine since 2022", "{N}: {netP} of GDP {netDir}"],
        description: ["Support for Ukraine from {Nt} since 2022: {ua} ({uaP} of one year's GDP). With trade with Russia counted: {netP} of GDP {netDir}, {sureWord}.",
          "Support for Ukraine from {Nt} since 2022: {ua} ({uaP} of GDP). With trade with Russia: {netP} of GDP {netDir}, {sureWord}.",
          "Support for Ukraine since 2022: {ua} ({uaP} of GDP). With trade with Russia: {netP} of GDP {netDir}, {sureWord}."],
        h1: "How much has {Nt} given Ukraine since 2022?" },
      u_trade: { title: ["Does {Nt} trade with Russia? Russia kept {rus} {if:rusX>=0|less|more}", "{N} and Russia: trade kept Russia {rus} {if:rusX>=0|less|more}", "{N}: {netP} of GDP {netDir}"],
        description: ["Since 2022 Russia kept {rus} {if:rusX>=0|less|more} in taxes and profit from trade with {Nt} than without the war. With {ua} for Ukraine: {netP} of GDP {netDir}, {sureWord}.",
          "Since 2022 Russia kept {rus} {if:rusX>=0|less|more} from trade with {Nt} than without the war. With its support for Ukraine: {netP} of GDP {netDir}, {sureWord}."],
        h1: "Does {Nt} trade with Russia, and how much has it given Ukraine?" },
      r_sure: { title: ["Is {Nt} helping Russia? {rus} {if:rusX<0|more|less} for Russia from trade", "Is {Nt} helping Russia? {netP} of GDP {netDir}", "{N}: {netP} of GDP {netDir}"],
        description: ["In money terms, {sureWord} {netDir} ({ch}): Russia kept {rus} {if:rusX<0|more|less} in taxes and profit from trade with {Nt} since 2022 than without the war.",
          "{sureWordCap} {netDir} ({ch}): Russia kept {rus} {if:rusX<0|more|less} from trade with {Nt} since 2022 than without the war ({rusP} of GDP).",
          "{sureWordCap} {netDir} ({ch}): Russia kept {rus} {if:rusX<0|more|less} from trade since 2022 than without the war ({rusP} of GDP)."],
        h1: "Is {Nt} helping Russia? What the money flows show" },
      lean: { title: ["Is {Nt} helping Ukraine or Russia? {leanWord}", "{N}: Ukraine or Russia? {leanWord}", "{N}: {leanWordLc}"],
        description: ["{leanWord} ({ch}): {netP} of one year's GDP since 2022, {netRange}. Support for Ukraine: {uaP} of GDP; {kept}.", "{leanWord} ({ch}): {netP} of one year's GDP since 2022, {netRange}.", "{leanWord} ({ch}): {netP} of one year's GDP since 2022."],
        h1: "Is {Nt} helping Ukraine or Russia? {leanWord}" },
      unc: { title: ["Is {Nt} helping Ukraine or Russia? {uncWordCap}", "{N}: Ukraine or Russia? {uncWordCap}", "{N}: {uncWord}"],
        description: ["{uncWordCap} ({ch} {netDir}): support for Ukraine {uaP} of GDP; {kept}. Net {netRange}.", "{uncWordCap} ({ch} {netDir}): support for Ukraine {uaP} of GDP. Net {netRange}.", "{uncWordCap} ({ch} {netDir}): support for Ukraine {uaP} of GDP since 2022."],
        h1: "Is {Nt} helping Ukraine or Russia? {uncWordCap}" },
      zero: { title: ["Is {Nt} helping Russia or Ukraine? Net: {zeroWord}", "{N}: Ukraine or Russia? Net {zeroWord}", "{N}: net {zeroWord}"],
        description: ["{if:armed|Net since 2022: {zeroWord} ({netP} of GDP). Weapons and troops it sent to Russia (about {armedEur} at full value) are listed on Russia's panel.|{NtCap}'s net since 2022 is {zeroWord}: {netP} of one year's GDP ({netRange}). Support for Ukraine {uaP}; {kept}.}",
          "{NtCap}'s net since 2022 is {zeroWord}: {netP} of one year's GDP ({netRange}).", "Net since 2022: {zeroWord}, {netP} of one year's GDP ({netRange})."],
        h1: "Is {Nt} helping Russia or Ukraine? The net is {zeroWord}" },
      party: { title: ["Is {Nt} helping Russia? {partyWord}, {netP} of GDP", "Is {Nt} helping Russia? {partyWord}", "{N}: {partyWordLc}"],
        description: ["{partyWord} (with Russia), not ranked. Its money since 2022: {netP} of one year's GDP, {dirWords} ({ch}).", "{partyWord} (with Russia), not ranked. Its money since 2022: {netP} of one year's GDP, {dirWords}."],
        h1: "{N}: {partyWordLc} (with Russia)" },
      nodata: { title: ["Is {Nt} helping Ukraine or Russia? No data yet", "{N}: Ukraine or Russia? No data yet", "{N}: no data yet"],
        description: ["{if:mostly|{NtCap}'s trade with Russia has no record of its own for the war years; small rough estimates are counted, so it is not ranked.|There is no observation of {Nt}'s own for the war years: no customs or partner records of its trade with Russia or Ukraine, no aid, no refugees counted.}",
          "{if:mostly|No record of its own trade with Russia for the war years; small rough estimates are counted, so it is not ranked.|There is no observation of its own for the war years: no records of its trade with Russia or Ukraine, no aid, no refugees counted.}"],
        h1: "{N}: no data yet on its money toward Ukraine or Russia" },
      intro: "{NtCap}'s support for Ukraine since 2022: {ua} ({uaP} of one year's GDP: {if:eu|aid, its EU share and refugee hosting|aid and refugee hosting}). {keptCap}{if:frozen|; Russia also lost {frozenEur} of return on reserves frozen there|}. The net is {netP} of a year's GDP {netDir} ({netWords}).",
      introParty: "{partyWhy} Its money numbers since 2022 come to {netP} of one year's GDP, {dirWords} ({netRange}).",
      introNoData: "{if:mostly|{NtCap}'s trade with Russia has no record of its own for the war years: no customs or partner records of what it bought from or sold to Russia. Small rough estimates are counted, too little to give it a direction, so it is not ranked and it is drawn hatched on the map.|There is no observation of {Nt}'s own for the war years: no customs or partner records of its trade with Russia or Ukraine, no aid, no refugees counted. Nothing is counted, it is not ranked, and it is drawn hatched on the map.}" },
    // the English country page's short FAQ (in the other languages: the heading's question and the opposite one)
    faq: { q1: "How much has {Nt} given Ukraine?",
      a1: "{if:tiny|Almost nothing that can be measured: {ua} since 2022 ({uaP} of one year's GDP).|{NtCap}'s support for Ukraine from 2022 to {dataTo}: {ua}, {uaP} of one year's GDP ({uaRange}). That counts {if:eu|its own aid, its share of EU aid and the cost of hosting refugees|its aid and the cost of hosting refugees}, minus what flowed back; loans count at their gift value.{kielSp}}",
      q2: "{if:asTrade|Is {Nt}'s trade helping Russia?|Is {Nt} helping Russia?}",
      a2: "{if:party|{NtCap} is treated as a party to the war (with Russia), so it is not ranked: {partyWhy} |}In money terms: {keptCap}. With its support for Ukraine, the net is {netAbsP} of one year's GDP {if:netX>=0|toward Ukraine|toward Russia} ({netWords}).{if:armed| Weapons and troops it sent to Russia (about {armedEur} at full value) are listed on Russia's panel; in the totals they count at the seller's gain.|} The number counts money: arms deliveries, troops and diplomacy are not in it.",
      qYear: "How much did {Nt} give Ukraine each year?", aYear: "Support for Ukraine by year: {years}. With trade with Russia, the net since 2022 is {netAbsP} of one year's GDP {if:netX>=0|toward Ukraine|toward Russia}.",
      qPaid: "{if:asTrade|Does {Nt} trade with Russia?|How much has {Nt} paid Russia since 2022?}",
      aPaid: "{NtCap} paid Russia {paid} for fuel and other goods from 2022 to {dataTo}. The number here is not that sum but the change in what Russia kept from it (taxes and profit above a normal return) against a world without the war: {kept}.",
      qFrozen: "What about Russian money frozen in {Nt}?",
      aFrozen: "Russia lost {frozenEur} in returns on its reserves and private assets frozen in {Nt} since 2022 ({frozenGdp} of one year's GDP). This is the return lost, not the amount frozen, and it counts in the net, not in support or trade." },
    home: { title: "Countries helping Ukraine or Russia: money map since 2022", description: "Interactive map: how much each country moved toward Ukraine or Russia since 2022, through aid and trade, as % of GDP and in euros. Ranges, sources.", h1: "Where did each country's money move: toward Ukraine or toward Russia?",
      intro: "For {n} countries: support for Ukraine plus how much less, or more, Russia kept from trade with each, against a world without the war, from February 2022 to {dataTo}, with a range and a chance for every direction." },
    // the English ranking and How it works pages
    static: {
      ranking: { title: "Which countries help Ukraine most? Ranking by % of GDP",
        description: ["At the Ukraine end: {topUa}; at the Russia end: {topRu}. The net as % of GDP since 2022, with ranges and chances.", "Where did each country's money move since 2022, toward Ukraine or Russia? Aid plus trade with Russia against a no-war world, with a range for each country."],
        h1: "Ranking: every country's money toward Ukraine or Russia since 2022",
        intro: "{n} countries ranked by the net as a share of one year's GDP, grouped by the chance of the direction, as in the map's ranking. {parties} {if:nParty>1|are parties|is a party} to the war and not ranked." },
      "support-for-ukraine": { title: "Ukraine aid by country as % of GDP: who gave the most?",
        description: ["Support for Ukraine since 2022 in euros and % of GDP. In euros the list starts with {euroTop}; as a share of GDP with {shareTop}.", "Every country's support for Ukraine since 2022, aid, EU share and refugee hosting, in euros and % of GDP, each with a range and its sources."],
        h1: "Support for Ukraine by country since 2022",
        intro: "Aid (loans at their gift value), each EU member's share of EU aid and the cost of hosting refugees, minus what flowed back, for every country, in euros and as a share of one year's GDP." },
      "trade-with-russia": { title: "Which countries boosted Russia's trade earnings since 2022?",
        description: ["Russia kept {e1} {if:x1<0|more|less} from trade with {n1} and {e2} {if:x2<0|more|less} with {n2} than without the war; with {n3}, {e3} {if:x3<0|more|less}. Taxes and profit.", "Not sales but what Russia keeps: the change in its taxes and profit from trade with each country since 2022, against a no-war world, country by country."],
        h1: "Trade with Russia: who raised and who cut Russia's earnings since 2022",
        intro: "For every country, how much more or less Russia kept from trade with it (taxes and profit above a normal return, not the full sales value) than in a world without the war: oil, gas, coal, goods, services and shipping." },
      "how-it-works": { title: "How War Balance measures money toward Ukraine or Russia",
        description: "Support for Ukraine plus the change in what Russia keeps from trade (taxes and profit, not sales), against a no-war world, as % of one year's GDP.",
        h1: "How it works: one scale for aid, trade and frozen reserves",
        intro: "Each number is a change against what a country would have done without the war, valued at each year's prices, summed from 2022 and set against one year's GDP, with a range, a chance for its direction and its sources." } },
  },
  de: {
    part: { title: ["{N} nach Ländern seit 2022", "{N} nach Ländern", "{N}"],
      description: ["{N}: Länder gereiht, Februar 2022 bis {dataTo}. {t1}: {topV}. Euro, % des BIP, Spannen, Quellen.", "{N}: Länder gereiht, Februar 2022 bis {dataTo}, in Euro und % des BIP, mit Spannen und Quellen."],
      h1: "{N}: jedes Land seit 2022",
      intro: "{sideText} Februar 2022 bis {dataTo}: {n} Länder haben diesen Teil; die Tabelle beginnt mit {tops}." },
    year: {
      ua: { label: "Hilfe für die Ukraine {y}", title: ["{if:partial|Ukraine-Hilfe {y} bisher: nach Ländern (bis {month})|Ukraine-Hilfe {y}: Wie viel gab jedes Land?}", "{if:partial|Ukraine-Hilfe {y} bisher, nach Ländern|Ukraine-Hilfe {y} nach Ländern}"],
        description: ["Unterstützung für die Ukraine {Y}: {n} Länder in Euro gereiht, mit % des BIP. {t1}: {topV}. Hilfe, EU-Anteil, Geflüchtete.", "Unterstützung für die Ukraine {Y}, jedes Land in Euro und % des BIP: Hilfe, EU-Anteil und Aufnahme von Geflüchteten."],
        h1: "{if:partial|Wie viel hat jedes Land der Ukraine {y} bisher gegeben?|Wie viel hat jedes Land der Ukraine {y} gegeben?}",
        intro: "Die Unterstützung jedes Landes für die Ukraine {Y}: Hilfe (Kredite zu ihrem Geschenkwert), EU-Anteil und Kosten der Aufnahme von Geflüchteten, abzüglich zurückfließenden Geldes. In Euro beginnt die Tabelle mit {tops}." },
      rus: { label: "Handel mit Russland {y}", title: ["{if:partial|Handel mit Russland {y} bisher: nach Ländern (bis {month})|Handel mit Russland {y}: Wer erhöhte Russlands Einnahmen?}", "Handel mit Russland {y} nach Ländern"],
        description: ["Handel mit Russland {Y}: wie viel mehr oder weniger Russland am Handel jedes Landes behielt als ohne Krieg. {t1}: {topV} {if:topX>=0|weniger|mehr}.", "Handel mit Russland {Y}: wie viel mehr oder weniger Russland am Handel jedes Landes behielt als ohne Krieg, Land für Land."],
        h1: "Handel mit Russland {Y}: Wessen Handel erhöhte oder senkte Russlands Einnahmen?",
        intro: "Wie viel mehr oder weniger Russland {Y} am Handel mit jedem Land behielt (Steuern und Gewinn, nicht der Umsatz) als ohne Krieg. Die Tabelle beginnt mit {tops}." } },
    compare: { label: "{A} vs. {B}", title: ["{A} vs. {B}: Ukraine-Hilfe und Handel mit Russland", "{A} vs. {B}: Ukraine-Hilfe und Russlandhandel", "{A} vs. {B}: Ukraine oder Russland?", "{A} vs. {B}"],
      description: "{A} und {B} seit 2022 im Vergleich: Unterstützung für die Ukraine, Russlands Gewinn aus dem Handel und der Saldo, mit Spannen und Quellen.",
      h1: "{A} vs. {B}: Ukraine-Hilfe und Handel mit Russland seit 2022",
      line: "Unterstützung für die Ukraine in Euro: {a} {eurA}, {b} {eurB}. Mehr in Euro: {if:uaA>=uaB|{a}|{b}}; mehr im Verhältnis zum BIP: {if:pctA>=pctB|{a}|{b}}." },
    hub: { title: "Themen: alle Ranglisten, Teile, Jahre und Vergleiche", description: "Alle {n} Seiten von War Balance nach Thema: Ranglisten, Gruppen, jeder Teil der Zahlen, jedes Jahr seit 2022 und Länder im Vergleich.", h1: "Alle Themen, Teile, Jahre und Vergleiche" },
    topic: { description: ["{label}: {n} Länder nach „{measure}“ seit Februar 2022, bis {dataTo}. {t1}: {topV}. Mit Spannen und Quellen.", "{label}: {n} Länder gereiht, Februar 2022 bis {dataTo}, mit Spannen und Quellen."],
      introGroup: "{label}: {n} Mitglieder, Februar 2022 bis {dataTo}. Ihre Unterstützung für die Ukraine zusammen: {sumUa}; mit dem Russlandhandel und eingefrorenem russischem Geld beträgt der Saldo {sumNetPct} ihres gemeinsamen BIP {if:net>=0|Richtung Ukraine|Richtung Russland}.",
      introTopic: "{n} Länder, sortiert nach „{measure}“ {unit}, Februar 2022 bis {dataTo}. Die Tabelle beginnt mit {tops}." },
    country: {
      u_sure: { title: ["{N}: Wie viel Hilfe für die Ukraine? {ua}", "{N}: {ua} für die Ukraine seit 2022", "{N}: Hilfe für die Ukraine"], description: ["{N}: Unterstützung für die Ukraine seit 2022 {ua} ({uaP} eines Jahres-BIP). Mit dem Russlandhandel: {netP} des BIP {netDir}, {sureWord}.", "{N}: {ua} für die Ukraine seit 2022 ({uaP} des BIP). Mit dem Russlandhandel: {netP} des BIP {netDir}."], h1: "{N}: Wie viel hat das Land der Ukraine seit 2022 gegeben?" },
      r_sure: { title: ["{N}: Hilft das Land Russland? {rus} {if:rusX<0|mehr|weniger} für Russland", "{N}: Hilft das Land Russland? {netP} des BIP", "{N}: {netDir}"], description: ["{N}: {sureWord} {netDir} ({ch}). Russland behielt seit 2022 {rus} {if:rusX<0|mehr|weniger} an Steuern und Gewinn aus dem Handel als ohne Krieg.", "{N}: {sureWord} {netDir} ({ch}). Russland behielt seit 2022 {rus} {if:rusX<0|mehr|weniger} aus dem Handel als ohne Krieg."], h1: "{N}: Hilft das Land Russland? Was die Geldströme zeigen" },
      lean: { title: ["{N}: Ukraine oder Russland? {leanWord}", "{N}: {leanWord}"], description: ["{N} seit 2022: {leanWord}. Unterstützung für die Ukraine {uaP} des BIP; Saldo {netP} eines Jahres-BIP."], h1: "{N}: Ukraine oder Russland? {leanWord}" },
      unc: { title: ["{N}: Ukraine oder Russland? {uncWordCap}", "{N}: {uncWord}"], description: ["{N} seit 2022: {uncWordCap}. Unterstützung für die Ukraine {uaP} des BIP; Saldo {netP} eines Jahres-BIP."], h1: "{N}: Ukraine oder Russland? {uncWordCap}" },
      zero: { title: ["{N}: Ukraine oder Russland? Saldo {zeroWord}", "{N}: Saldo {zeroWord}"], description: ["{N} seit 2022: {zeroWordCap}. Unterstützung für die Ukraine {uaP} des BIP; Saldo {netP} eines Jahres-BIP."], h1: "{N}: Ukraine oder Russland? Der Saldo ist {zeroWord}" },
      party: { title: ["{N}: {partyWord} (mit Russland)", "{N}: {partyWord}"], description: ["{N} seit 2022: {partyWord}. Unterstützung für die Ukraine {uaP} des BIP; Saldo {netP} eines Jahres-BIP."], h1: "{N}: {partyWord} (mit Russland)" },
      nodata: { title: ["{N}: Ukraine oder Russland? Noch keine Daten", "{N}: noch keine Daten"], description: ["{N}: {noDataText}"], h1: "{N}: noch keine Daten zum Geld Richtung Ukraine oder Russland" },
      q2u: "{N}: Hilft das Land Russland?", q2r: "{N}: Wie viel Hilfe für die Ukraine?",
      intro: "{uaVerb} ({uaEur}). {keptCap}. Der Saldo: {netSigned} eines Jahres-BIP seit 2022 ({netWords}).", introParty: "{partyWhy} Der Saldo: {netSigned} eines Jahres-BIP seit 2022 ({netRange})." },
    home: { title: "Wer hilft der Ukraine, wer Russland? Geld-Karte seit 2022", description: "Interaktive Karte: wie viel Geld jedes Land seit 2022 Richtung Ukraine oder Russland bewegt hat, durch Hilfe und Handel, in % des BIP und Euro.", h1: "Wohin ist das Geld jedes Landes geflossen: Richtung Ukraine oder Russland?",
      intro: "Für {n} Länder: Unterstützung für die Ukraine plus wie viel weniger oder mehr Russland am Handel mit ihnen verdiente, verglichen mit einer Welt ohne Krieg, Februar 2022 bis {dataTo}, jeweils mit Spanne und Wahrscheinlichkeit." },
  },
  fr: {
    part: { title: ["{N} par pays depuis 2022", "{N} par pays", "{N}"],
      description: ["{N} : pays classés, de février 2022 à {dataTo}. {t1} : {topV}. Euros, % du PIB, fourchettes, sources.", "{N} : pays classés, de février 2022 à {dataTo}, en euros et en % du PIB, avec fourchettes et sources."],
      h1: "{N} : chaque pays depuis 2022",
      intro: "{sideText} De février 2022 à {dataTo}, {n} pays ont cette composante ; le tableau commence par {tops}." },
    year: {
      ua: { label: "Aide à l'Ukraine en {y}", title: ["{if:partial|Aide à l'Ukraine en {y} : par pays (jusqu'à {month})|Aide à l'Ukraine en {y} : combien chaque pays a donné}", "Aide à l'Ukraine en {y} par pays"],
        description: ["Soutien à l'Ukraine en {Y} : {n} pays classés en euros, avec le % du PIB. {t1} : {topV}. Aide, part de l'UE, accueil des réfugiés.", "Soutien à l'Ukraine en {Y}, chaque pays en euros et en % du PIB : aide, part de l'UE et accueil des réfugiés."],
        h1: "{if:partial|Combien chaque pays a-t-il donné à l'Ukraine en {y} jusqu'ici ?|Combien chaque pays a-t-il donné à l'Ukraine en {y} ?}",
        intro: "Le soutien de chaque pays à l'Ukraine en {Y} : son aide (prêts à leur valeur de don), sa part de l'aide de l'UE et le coût de l'accueil des réfugiés, moins l'argent qui revient. En euros, le tableau commence par {tops}." },
      rus: { label: "Commerce avec la Russie en {y}", title: ["{if:partial|Commerce avec la Russie en {y} : par pays (jusqu'à {month})|Commerce avec la Russie en {y} : qui a accru ses gains ?}", "Commerce avec la Russie en {y} par pays"],
        description: ["Commerce avec la Russie en {Y} : ce que la Russie a gardé de plus ou de moins sur le commerce de chaque pays, par rapport à un monde sans guerre. {t1} : {topV} {if:topX>=0|de moins|de plus}.", "Commerce avec la Russie en {Y} : ce que la Russie a gardé de plus ou de moins sur le commerce de chaque pays, par rapport à un monde sans guerre."],
        h1: "Commerce avec la Russie en {Y} : quels pays ont accru ou réduit ses gains ?",
        intro: "Ce que la Russie a gardé de plus ou de moins (impôts et profits, pas les ventes) sur son commerce avec chaque pays en {Y}, par rapport à un monde sans guerre. Le tableau commence par {tops}." } },
    compare: { label: "{A} vs {B}", title: ["{A} vs {B} : aide à l'Ukraine et commerce avec la Russie", "{A} vs {B} : aide à l'Ukraine, commerce russe", "{A} vs {B} : Ukraine ou Russie ?", "{A} vs {B}"],
      description: "{A} et {B} depuis 2022 : soutien à l'Ukraine, gain russe sur leur commerce et solde, côte à côte, avec fourchettes, probabilités et sources.",
      h1: "{A} vs {B} : soutien à l'Ukraine et commerce avec la Russie depuis 2022",
      line: "Soutien à l'Ukraine en euros : {a} {eurA}, {b} {eurB}. Plus en euros : {if:uaA>=uaB|{a}|{b}} ; plus en part du PIB : {if:pctA>=pctB|{a}|{b}}." },
    hub: { title: "Thèmes : classements, composantes, années, comparaisons", description: "Les {n} pages de War Balance par thème : classements, groupes, chaque composante des chiffres, chaque année depuis 2022 et pays comparés.", h1: "Tous les thèmes, composantes, années et comparaisons" },
    topic: { description: ["{label} : {n} pays classés selon « {measure} », de février 2022 à {dataTo}. {t1} : {topV}. Fourchettes et sources.", "{label} : {n} pays classés de février 2022 à {dataTo}, avec fourchettes et sources."],
      introGroup: "{label} : {n} membres, de février 2022 à {dataTo}. Leur soutien à l'Ukraine, ensemble : {sumUa} ; avec le commerce avec la Russie et l'argent russe gelé, le solde est de {sumNetPct} de leur PIB cumulé {if:net>=0|vers l'Ukraine|vers la Russie}.",
      introTopic: "{n} pays triés selon « {measure} » {unit}, de février 2022 à {dataTo}. Le tableau commence par {tops}." },
    country: {
      u_sure: { title: ["{N} : combien d'aide à l'Ukraine ? {ua}", "{N} : {ua} pour l'Ukraine depuis 2022", "{N} : aide à l'Ukraine"], description: ["{N} : soutien à l'Ukraine depuis 2022 de {ua} ({uaP} d'une année de PIB). Avec le commerce avec la Russie : {netP} du PIB {netDir}, {sureWord}.", "{N} : {ua} pour l'Ukraine depuis 2022 ({uaP} du PIB). Avec le commerce russe : {netP} du PIB {netDir}."], h1: "{N} : combien le pays a-t-il donné à l'Ukraine depuis 2022 ?" },
      r_sure: { title: ["{N} : le pays aide-t-il la Russie ? {rus} {if:rusX<0|de plus|de moins}", "{N} : le pays aide-t-il la Russie ?", "{N} : {netDir}"], description: ["{N} : {sureWord} {netDir} ({ch}). Depuis 2022, la Russie a gardé {rus} {if:rusX<0|de plus|de moins} (impôts et profits) sur ce commerce que sans la guerre.", "{N} : {sureWord} {netDir} ({ch}). Depuis 2022, la Russie a gardé {rus} {if:rusX<0|de plus|de moins} sur ce commerce que sans la guerre."], h1: "{N} : le pays aide-t-il la Russie ? Ce que montrent les flux d'argent" },
      lean: { title: ["{N} : Ukraine ou Russie ? {leanWord}", "{N} : {leanWord}"], description: ["{N} depuis 2022 : {leanWord}. Soutien à l'Ukraine de {uaP} du PIB ; solde de {netP} d'une année de PIB."], h1: "{N} : Ukraine ou Russie ? {leanWord}" },
      unc: { title: ["{N} : Ukraine ou Russie ? {uncWordCap}", "{N} : {uncWord}"], description: ["{N} depuis 2022 : {uncWord}. Soutien à l'Ukraine de {uaP} du PIB ; solde de {netP} d'une année de PIB."], h1: "{N} : Ukraine ou Russie ? {uncWordCap}" },
      zero: { title: ["{N} : Ukraine ou Russie ? Solde {zeroWord}", "{N} : solde {zeroWord}"], description: ["{N} depuis 2022 : {zeroWord}. Soutien à l'Ukraine de {uaP} du PIB ; solde de {netP} d'une année de PIB."], h1: "{N} : Ukraine ou Russie ? Le solde est {zeroWord}" },
      party: { title: ["{N} : {partyWordLc} (avec la Russie)", "{N} : {partyWordLc}"], description: ["{N} depuis 2022 : {partyWordLc}. Soutien à l'Ukraine de {uaP} du PIB ; solde de {netP} d'une année de PIB."], h1: "{N} : {partyWordLc} (avec la Russie)" },
      nodata: { title: ["{N} : Ukraine ou Russie ? Pas encore de données", "{N} : pas encore de données"], description: ["{N} : {noDataText}"], h1: "{N} : pas encore de données sur son argent vers l'Ukraine ou la Russie" },
      q2u: "{N} : le pays aide-t-il la Russie ?", q2r: "{N} : combien d'aide à l'Ukraine ?",
      intro: "{uaVerb} ({uaEur}). {keptCap}. Le solde : {netSigned} d'une année de PIB depuis 2022 ({netWords}).", introParty: "{partyWhy} Le solde : {netSigned} d'une année de PIB depuis 2022 ({netRange})." },
    home: { title: "Qui aide l'Ukraine, qui aide la Russie ? Carte depuis 2022", description: "Carte interactive : l'argent que chaque pays a orienté vers l'Ukraine ou la Russie depuis 2022, par l'aide et le commerce, en % du PIB et en euros.", h1: "Où est allé l'argent de chaque pays : vers l'Ukraine ou vers la Russie ?",
      intro: "Pour {n} pays : le soutien à l'Ukraine plus ce que la Russie a gagné en moins, ou en plus, sur son commerce avec eux, par rapport à un monde sans guerre, de février 2022 à {dataTo}, avec une fourchette et une probabilité." },
  },
  es: {
    part: { title: ["{N} por país desde 2022", "{N} por país", "{N}"],
      description: ["{N}: países, de febrero de 2022 a {dataTo}. {t1}: {topV}. Euros, % del PIB, rangos, fuentes.", "{N}: países, de febrero de 2022 a {dataTo}, en euros y % del PIB, con rangos y fuentes."],
      h1: "{N}: cada país desde 2022",
      intro: "{sideText} De febrero de 2022 a {dataTo}, {n} países tienen esta parte; la tabla empieza por {tops}." },
    year: {
      ua: { label: "Ayuda a Ucrania en {y}", title: ["{if:partial|Ayuda a Ucrania en {y}: por país (hasta {month})|Ayuda a Ucrania en {y}: cuánto dio cada país}", "Ayuda a Ucrania en {y} por país"],
        description: ["Apoyo a Ucrania en {Y}: {n} países ordenados en euros, con % del PIB. {t1}: {topV}. Ayuda, parte de la UE, acogida de refugiados.", "Apoyo a Ucrania en {Y}, cada país en euros y % del PIB: ayuda, parte de la UE y acogida de refugiados."],
        h1: "{if:partial|¿Cuánto ha dado cada país a Ucrania en {y} hasta ahora?|¿Cuánto dio cada país a Ucrania en {y}?}",
        intro: "El apoyo de cada país a Ucrania en {Y}: su ayuda (préstamos por su valor de donación), su parte de la ayuda de la UE y el coste de acoger refugiados, menos el dinero que vuelve. En euros, la tabla empieza por {tops}." },
      rus: { label: "Comercio con Rusia en {y}", title: ["{if:partial|Comercio con Rusia en {y}: por país (hasta {month})|Comercio con Rusia en {y}: ¿quién aumentó sus ingresos?}", "Comercio con Rusia en {y} por país"],
        description: ["Comercio con Rusia en {Y}: cuánto más o menos se quedó Rusia del comercio de cada país que sin la guerra. {t1}: {topV} {if:topX>=0|menos|más}.", "Comercio con Rusia en {Y}: cuánto más o menos se quedó Rusia del comercio de cada país que sin la guerra, país por país."],
        h1: "Comercio con Rusia en {Y}: ¿quién aumentó o redujo sus ingresos?",
        intro: "Cuánto más o menos se quedó Rusia (impuestos y beneficios, no las ventas) del comercio con cada país en {Y} que en un mundo sin guerra. La tabla empieza por {tops}." } },
    compare: { label: "{A} vs. {B}", title: ["{A} vs. {B}: ayuda a Ucrania y comercio con Rusia", "{A} vs. {B}: ayuda a Ucrania y Rusia", "{A} vs. {B}: ¿Ucrania o Rusia?", "{A} vs. {B}"],
      description: "{A} y {B} desde 2022: apoyo a Ucrania, lo que Rusia ganó con su comercio y el neto, lado a lado, con rangos, probabilidades y fuentes.",
      h1: "{A} vs. {B}: apoyo a Ucrania y comercio con Rusia desde 2022",
      line: "Apoyo a Ucrania en euros: {a} {eurA}, {b} {eurB}. Más en euros: {if:uaA>=uaB|{a}|{b}}; más como parte del PIB: {if:pctA>=pctB|{a}|{b}}." },
    hub: { title: "Temas: clasificaciones, partes, años y comparaciones", description: "Las {n} páginas de War Balance por tema: clasificaciones, grupos, cada parte de las cifras, cada año desde 2022 y países comparados.", h1: "Todos los temas, partes, años y comparaciones" },
    topic: { description: ["{label}: {n} países según «{measure}», de febrero de 2022 a {dataTo}. {t1}: {topV}. Con rangos y fuentes.", "{label}: {n} países, de febrero de 2022 a {dataTo}, con rangos y fuentes."],
      introGroup: "{label}: {n} miembros, de febrero de 2022 a {dataTo}. Su apoyo conjunto a Ucrania: {sumUa}; con el comercio con Rusia y el dinero ruso congelado, el neto es {sumNetPct} de su PIB conjunto {if:net>=0|hacia Ucrania|hacia Rusia}.",
      introTopic: "{n} países ordenados por «{measure}» {unit}, de febrero de 2022 a {dataTo}. La tabla empieza por {tops}." },
    country: {
      u_sure: { title: ["{N}: ¿cuánto ha dado a Ucrania? {ua}", "{N}: {ua} para Ucrania desde 2022", "{N}: ayuda a Ucrania"], description: ["{N}: apoyo a Ucrania desde 2022 de {ua} ({uaP} de un año de PIB). Con su comercio con Rusia: {netP} del PIB {netDir}, {sureWord}.", "{N}: {ua} para Ucrania desde 2022 ({uaP} del PIB). Con su comercio con Rusia: {netP} del PIB {netDir}."], h1: "{N}: ¿cuánto ha dado a Ucrania desde 2022?" },
      r_sure: { title: ["{N}: ¿ayuda a Rusia? {rus} {if:rusX<0|más|menos} para Rusia", "{N}: ¿ayuda a Rusia? {netP} del PIB", "{N}: {netDir}"], description: ["{N}: {sureWord} {netDir} ({ch}). Desde 2022 Rusia se quedó con {rus} {if:rusX<0|más|menos} (impuestos y beneficios) de ese comercio que sin la guerra.", "{N}: {sureWord} {netDir} ({ch}). Desde 2022 Rusia ganó {rus} {if:rusX<0|más|menos} con ese comercio que sin la guerra."], h1: "{N}: ¿ayuda a Rusia? Lo que muestran los flujos de dinero" },
      lean: { title: ["{N}: ¿Ucrania o Rusia? {leanWord}", "{N}: {leanWord}"], description: ["{N} desde 2022: {leanWord}. Apoyo a Ucrania de {uaP} del PIB; neto de {netP} de un año de PIB."], h1: "{N}: ¿Ucrania o Rusia? {leanWord}" },
      unc: { title: ["{N}: ¿Ucrania o Rusia? {uncWordCap}", "{N}: {uncWord}"], description: ["{N} desde 2022: {uncWord}. Apoyo a Ucrania de {uaP} del PIB; neto de {netP} de un año de PIB."], h1: "{N}: ¿Ucrania o Rusia? {uncWordCap}" },
      zero: { title: ["{N}: ¿Ucrania o Rusia? Neto {zeroWord}", "{N}: neto {zeroWord}"], description: ["{N} desde 2022: {zeroWord}. Apoyo a Ucrania de {uaP} del PIB; neto de {netP} de un año de PIB."], h1: "{N}: ¿Ucrania o Rusia? El neto es {zeroWord}" },
      party: { title: ["{N}: {partyWordLc} (con Rusia)", "{N}: {partyWordLc}"], description: ["{N} desde 2022: {partyWordLc}. Apoyo a Ucrania de {uaP} del PIB; neto de {netP} de un año de PIB."], h1: "{N}: {partyWordLc} (con Rusia)" },
      nodata: { title: ["{N}: ¿Ucrania o Rusia? Aún sin datos", "{N}: aún sin datos"], description: ["{N}: {noDataText}"], h1: "{N}: aún sin datos sobre su dinero hacia Ucrania o Rusia" },
      q2u: "{N}: ¿ayuda a Rusia?", q2r: "{N}: ¿cuánto ha dado a Ucrania?",
      intro: "{uaVerb} ({uaEur}). {keptCap}. El neto: {netSigned} de un año de PIB desde 2022 ({netWords}).", introParty: "{partyWhy} El neto: {netSigned} de un año de PIB desde 2022 ({netRange})." },
    home: { title: "¿Quién ayuda a Ucrania y quién a Rusia? Mapa desde 2022", description: "Mapa interactivo: cuánto dinero movió cada país hacia Ucrania o hacia Rusia desde 2022, por ayuda y comercio, en % del PIB y en euros. Con fuentes.", h1: "¿Hacia dónde fue el dinero de cada país: hacia Ucrania o hacia Rusia?",
      intro: "Para {n} países: el apoyo a Ucrania más cuánto menos, o más, ganó Rusia con su comercio, frente a un mundo sin guerra, de febrero de 2022 a {dataTo}, con rango y probabilidad." },
  },
  pl: {
    part: { title: ["{N} według krajów od 2022", "{N} według krajów", "{N}"],
      description: ["{N}: ranking krajów od lutego 2022 do {dataTo}. {t1}: {topV}. W euro i % PKB, z przedziałami i źródłami.", "{N}: ranking krajów od lutego 2022 do {dataTo}, w euro i % PKB, z przedziałami i źródłami."],
      h1: "{N}: każdy kraj od 2022 roku",
      intro: "{sideText} Od lutego 2022 do {dataTo} ten składnik ma {n} krajów; tabela zaczyna się od: {tops}." },
    year: {
      ua: { label: "Pomoc dla Ukrainy w {y} r.", title: ["{if:partial|Pomoc dla Ukrainy w {y} r.: według krajów (do {month})|Pomoc dla Ukrainy w {y} r.: ile dał każdy kraj?}", "Pomoc dla Ukrainy w {y} r. według krajów"],
        description: ["Wsparcie dla Ukrainy w {Y}: ranking {n} krajów w euro, z % PKB. {t1}: {topV}. Pomoc, udział w pomocy UE, uchodźcy.", "Wsparcie dla Ukrainy w {Y}, każdy kraj w euro i % PKB: pomoc, udział w pomocy UE i przyjęcie uchodźców."],
        h1: "{if:partial|Ile każdy kraj dał Ukrainie w {y} roku do tej pory?|Ile każdy kraj dał Ukrainie w {y} roku?}",
        intro: "Wsparcie każdego kraju dla Ukrainy w {Y}: pomoc (pożyczki według wartości darowizny), udział w pomocy UE i koszt przyjęcia uchodźców, minus pieniądze, które wróciły. W euro tabela zaczyna się od: {tops}." },
      rus: { label: "Handel z Rosją w {y} r.", title: ["{if:partial|Handel z Rosją w {y} r.: według krajów (do {month})|Handel z Rosją w {y} r.: kto zwiększył jej dochody?}", "Handel z Rosją w {y} r. według krajów"],
        description: ["Handel z Rosją w {Y}: o ile więcej lub mniej Rosja zatrzymała z handlu każdego kraju niż bez wojny. {t1}: {topV} {if:topX>=0|mniej|więcej}.", "Handel z Rosją w {Y}: o ile więcej lub mniej Rosja zatrzymała z handlu każdego kraju niż bez wojny, kraj po kraju."],
        h1: "Handel z Rosją w {Y}: czyj handel zwiększył lub zmniejszył jej dochody?",
        intro: "O ile więcej lub mniej Rosja zatrzymała (podatki i zysk, nie sprzedaż) z handlu z każdym krajem w {Y} niż w świecie bez wojny. Tabela zaczyna się od: {tops}." } },
    compare: { label: "{A} vs {B}", title: ["{A} vs {B}: pomoc dla Ukrainy i handel z Rosją", "{A} vs {B}: Ukraina czy Rosja?", "{A} vs {B}"],
      description: "{A} i {B} od 2022 r.: wsparcie dla Ukrainy, zysk Rosji z handlu z nimi i saldo, obok siebie, z przedziałami, szansami i źródłami.",
      h1: "{A} vs {B}: wsparcie dla Ukrainy i handel z Rosją od 2022 roku",
      line: "Wsparcie dla Ukrainy w euro: {a} {eurA}, {b} {eurB}. Więcej w euro: {if:uaA>=uaB|{a}|{b}}; więcej jako udział w PKB: {if:pctA>=pctB|{a}|{b}}." },
    hub: { title: "Tematy: rankingi, składniki, lata i porównania", description: "Wszystkie {n} stron War Balance według tematu: rankingi, grupy, każdy składnik liczb, każdy rok od 2022 i porównania krajów.", h1: "Wszystkie tematy, składniki, lata i porównania" },
    topic: { description: ["{label}: ranking {n} krajów według „{measure}”, od lutego 2022 do {dataTo}. {t1}: {topV}. Z przedziałami i źródłami.", "{label}: ranking {n} krajów od lutego 2022 do {dataTo}, z przedziałami i źródłami."],
      introGroup: "{label}: {n} członków, od lutego 2022 do {dataTo}. Ich łączne wsparcie dla Ukrainy: {sumUa}; z handlem z Rosją i zamrożonymi rosyjskimi środkami saldo wynosi {sumNetPct} ich łącznego PKB {if:net>=0|na rzecz Ukrainy|na rzecz Rosji}.",
      introTopic: "{n} krajów według „{measure}” {unit}, od lutego 2022 do {dataTo}. Tabela zaczyna się od: {tops}." },
    country: {
      u_sure: { title: ["{N}: ile pomocy dla Ukrainy? {ua}", "{N}: {ua} dla Ukrainy od 2022", "{N}: pomoc dla Ukrainy"], description: ["{N}: wsparcie dla Ukrainy od 2022 r. {ua} ({uaP} rocznego PKB). Z handlem z Rosją: {netP} PKB {netDir}, {sureWord}.", "{N}: {ua} dla Ukrainy od 2022 r. ({uaP} PKB). Z handlem z Rosją: {netP} PKB {netDir}."], h1: "{N}: ile ten kraj dał Ukrainie od 2022 roku?" },
      r_sure: { title: ["{N}: czy ten kraj pomaga Rosji? {rus} {if:rusX<0|więcej|mniej} dla Rosji", "{N}: czy ten kraj pomaga Rosji?", "{N}: {netDir}"], description: ["{N}: {sureWord} {netDir} ({ch}). Od 2022 r. Rosja zatrzymała z tego handlu {rus} {if:rusX<0|więcej|mniej} (podatki i zysk) niż bez wojny.", "{N}: {sureWord} {netDir} ({ch}). Od 2022 r. Rosja zatrzymała z tego handlu {rus} {if:rusX<0|więcej|mniej} niż bez wojny."], h1: "{N}: czy ten kraj pomaga Rosji? Co pokazują przepływy pieniędzy" },
      lean: { title: ["{N}: Ukraina czy Rosja? {leanWord}", "{N}: {leanWord}"], description: ["{N} od 2022 r.: {leanWord}. Wsparcie dla Ukrainy {uaP} PKB; saldo {netP} rocznego PKB."], h1: "{N}: Ukraina czy Rosja? {leanWord}" },
      unc: { title: ["{N}: Ukraina czy Rosja? {uncWordCap}", "{N}: {uncWord}"], description: ["{N} od 2022 r.: {uncWord}. Wsparcie dla Ukrainy {uaP} PKB; saldo {netP} rocznego PKB."], h1: "{N}: Ukraina czy Rosja? {uncWordCap}" },
      zero: { title: ["{N}: Ukraina czy Rosja? Saldo {zeroWord}", "{N}: saldo {zeroWord}"], description: ["{N} od 2022 r.: {zeroWord}. Wsparcie dla Ukrainy {uaP} PKB; saldo {netP} rocznego PKB."], h1: "{N}: Ukraina czy Rosja? Saldo {zeroWord}" },
      party: { title: ["{N}: {partyWordLc} (z Rosją)", "{N}: {partyWordLc}"], description: ["{N} od 2022 r.: {partyWordLc}. Wsparcie dla Ukrainy {uaP} PKB; saldo {netP} rocznego PKB."], h1: "{N}: {partyWordLc} (z Rosją)" },
      nodata: { title: ["{N}: Ukraina czy Rosja? Brak danych", "{N}: brak danych"], description: ["{N}: {noDataText}"], h1: "{N}: brak danych o pieniądzach w stronę Ukrainy lub Rosji" },
      q2u: "{N}: czy ten kraj pomaga Rosji?", q2r: "{N}: ile pomocy dla Ukrainy?",
      intro: "{uaVerb} ({uaEur}). {keptCap}. Saldo: {netSigned} rocznego PKB od 2022 ({netWords}).", introParty: "{partyWhy} Saldo: {netSigned} rocznego PKB od 2022 ({netRange})." },
    home: { title: "Kto pomaga Ukrainie, a kto Rosji? Mapa pieniędzy od 2022", description: "Interaktywna mapa: ile pieniędzy każdy kraj skierował do Ukrainy lub Rosji od 2022 r., przez pomoc i handel, w % PKB i w euro. Ze źródłami.", h1: "Dokąd popłynęły pieniądze każdego kraju: do Ukrainy czy do Rosji?",
      intro: "Dla {n} krajów: wsparcie dla Ukrainy plus to, ile mniej lub więcej Rosja zarobiła na handlu z nimi w porównaniu ze światem bez wojny, od lutego 2022 do {dataTo}, z przedziałem i szansą kierunku." },
  },
  nl: {
    part: { title: ["{N} per land sinds 2022", "{N} per land", "{N}"],
      description: ["{N}: landen gerangschikt, februari 2022 tot {dataTo}. {t1}: {topV}. Euro, % van het bbp, bandbreedtes, bronnen.", "{N}: landen gerangschikt, februari 2022 tot {dataTo}, in euro en % van het bbp, met bandbreedtes en bronnen."],
      h1: "{N}: elk land sinds 2022",
      intro: "{sideText} Van februari 2022 tot {dataTo} hebben {n} landen dit onderdeel; de tabel begint met {tops}." },
    year: {
      ua: { label: "Steun aan Oekraïne in {y}", title: ["{if:partial|Steun aan Oekraïne in {y} tot nu toe: per land (tot {month})|Steun aan Oekraïne in {y}: hoeveel gaf elk land?}", "Steun aan Oekraïne in {y} per land"],
        description: ["Steun aan Oekraïne in {Y}: {n} landen gerangschikt in euro, met % van het bbp. {t1}: {topV}. Hulp, EU-aandeel, opvang.", "Steun aan Oekraïne in {Y}, elk land in euro en % van het bbp: hulp, EU-aandeel en opvang van vluchtelingen."],
        h1: "{if:partial|Hoeveel heeft elk land Oekraïne in {y} tot nu toe gegeven?|Hoeveel gaf elk land Oekraïne in {y}?}",
        intro: "De steun van elk land aan Oekraïne in {Y}: hulp (leningen tegen hun schenkingswaarde), het EU-aandeel en de kosten van de opvang van vluchtelingen, min het geld dat terugvloeit. In euro begint de tabel met {tops}." },
      rus: { label: "Handel met Rusland in {y}", title: ["{if:partial|Handel met Rusland in {y}: per land (tot {month})|Handel met Rusland in {y}: wie verhoogde de inkomsten?}", "Handel met Rusland in {y} per land"],
        description: ["Handel met Rusland in {Y}: hoeveel meer of minder Rusland aan de handel van elk land overhield dan zonder oorlog. {t1}: {topV} {if:topX>=0|minder|meer}.", "Handel met Rusland in {Y}: hoeveel meer of minder Rusland aan de handel van elk land overhield dan zonder oorlog, land voor land."],
        h1: "Handel met Rusland in {Y}: wiens handel verhoogde of verlaagde Ruslands inkomsten?",
        intro: "Hoeveel meer of minder Rusland (belasting en winst, geen omzet) in {Y} aan de handel met elk land overhield dan zonder oorlog. De tabel begint met {tops}." } },
    compare: { label: "{A} vs {B}", title: ["{A} vs {B}: steun aan Oekraïne en handel met Rusland", "{A} vs {B}: Oekraïne of Rusland?", "{A} vs {B}"],
      description: "{A} en {B} sinds 2022: steun aan Oekraïne, wat Rusland aan de handel overhield en het saldo, naast elkaar, met bandbreedtes en bronnen.",
      h1: "{A} vs {B}: steun aan Oekraïne en handel met Rusland sinds 2022",
      line: "Steun aan Oekraïne in euro: {a} {eurA}, {b} {eurB}. Meer in euro: {if:uaA>=uaB|{a}|{b}}; meer als aandeel van het bbp: {if:pctA>=pctB|{a}|{b}}." },
    hub: { title: "Onderwerpen: ranglijsten, onderdelen, jaren, vergelijkingen", description: "Alle {n} pagina's van War Balance per onderwerp: ranglijsten, groepen, elk onderdeel van de cijfers, elk jaar sinds 2022 en landen vergeleken.", h1: "Alle onderwerpen, onderdelen, jaren en vergelijkingen" },
    topic: { description: ["{label}: {n} landen op ‘{measure}’, februari 2022 tot {dataTo}. {t1}: {topV}. Met bandbreedtes en bronnen.", "{label}: {n} landen gerangschikt, februari 2022 tot {dataTo}, met bandbreedtes en bronnen."],
      introGroup: "{label}: {n} leden, februari 2022 tot {dataTo}. Hun steun aan Oekraïne samen: {sumUa}; met de handel met Rusland en bevroren Russisch geld is het saldo {sumNetPct} van hun gezamenlijke bbp {if:net>=0|richting Oekraïne|richting Rusland}.",
      introTopic: "{n} landen gesorteerd op ‘{measure}’ {unit}, februari 2022 tot {dataTo}. De tabel begint met {tops}." },
    country: {
      u_sure: { title: ["{N}: hoeveel steun aan Oekraïne? {ua}", "{N}: {ua} voor Oekraïne sinds 2022", "{N}: steun aan Oekraïne"], description: ["{N}: steun aan Oekraïne sinds 2022 {ua} ({uaP} van een jaar bbp). Met de handel met Rusland: {netP} van het bbp {netDir}, {sureWord}.", "{N}: {ua} voor Oekraïne sinds 2022 ({uaP} van het bbp). Met de handel met Rusland: {netP} van het bbp {netDir}."], h1: "{N}: hoeveel gaf dit land sinds 2022 aan Oekraïne?" },
      r_sure: { title: ["{N}: helpt dit land Rusland? {rus} {if:rusX<0|meer|minder} voor Rusland", "{N}: helpt dit land Rusland?", "{N}: {netDir}"], description: ["{N}: {sureWord} {netDir} ({ch}). Rusland hield sinds 2022 {rus} {if:rusX<0|meer|minder} (belasting en winst) aan deze handel over dan zonder oorlog.", "{N}: {sureWord} {netDir} ({ch}). Rusland hield sinds 2022 {rus} {if:rusX<0|meer|minder} aan deze handel over dan zonder oorlog."], h1: "{N}: helpt dit land Rusland? Wat de geldstromen laten zien" },
      lean: { title: ["{N}: Oekraïne of Rusland? {leanWord}", "{N}: {leanWord}"], description: ["{N} sinds 2022: {leanWord}. Steun aan Oekraïne {uaP} van het bbp; saldo {netP} van een jaar bbp."], h1: "{N}: Oekraïne of Rusland? {leanWord}" },
      unc: { title: ["{N}: Oekraïne of Rusland? {uncWordCap}", "{N}: {uncWord}"], description: ["{N} sinds 2022: {uncWord}. Steun aan Oekraïne {uaP} van het bbp; saldo {netP} van een jaar bbp."], h1: "{N}: Oekraïne of Rusland? {uncWordCap}" },
      zero: { title: ["{N}: Oekraïne of Rusland? Saldo {zeroWord}", "{N}: saldo {zeroWord}"], description: ["{N} sinds 2022: {zeroWord}. Steun aan Oekraïne {uaP} van het bbp; saldo {netP} van een jaar bbp."], h1: "{N}: Oekraïne of Rusland? Het saldo is {zeroWord}" },
      party: { title: ["{N}: {partyWordLc} (met Rusland)", "{N}: {partyWordLc}"], description: ["{N} sinds 2022: {partyWordLc}. Steun aan Oekraïne {uaP} van het bbp; saldo {netP} van een jaar bbp."], h1: "{N}: {partyWordLc} (met Rusland)" },
      nodata: { title: ["{N}: Oekraïne of Rusland? Nog geen gegevens", "{N}: nog geen gegevens"], description: ["{N}: {noDataText}"], h1: "{N}: nog geen gegevens over het geld richting Oekraïne of Rusland" },
      q2u: "{N}: helpt dit land Rusland?", q2r: "{N}: hoeveel steun aan Oekraïne?",
      intro: "{uaVerb} ({uaEur}). {keptCap}. Het saldo: {netSigned} van een jaar bbp sinds 2022 ({netWords}).", introParty: "{partyWhy} Het saldo: {netSigned} van een jaar bbp sinds 2022 ({netRange})." },
    home: { title: "Wie helpt Oekraïne, wie helpt Rusland? Geldkaart sinds 2022", description: "Interactieve kaart: hoeveel geld elk land sinds 2022 richting Oekraïne of Rusland bewoog, via steun en handel, in % van het bbp en in euro.", h1: "Waar ging het geld van elk land heen: richting Oekraïne of Rusland?",
      intro: "Voor {n} landen: steun aan Oekraïne plus hoeveel minder, of meer, Rusland aan de handel met hen verdiende dan zonder oorlog, februari 2022 tot {dataTo}, met een bandbreedte en een kans." },
  },
  uk: {
    part: { title: ["{N} за країнами з 2022 року", "{N} за країнами", "{N}"],
      description: ["{N}: рейтинг країн з лютого 2022 до {dataTo}. {t1}: {topV}. Євро, % ВВП, діапазони, джерела.", "{N}: рейтинг країн з лютого 2022 до {dataTo}, у євро та % ВВП, з діапазонами й джерелами."],
      h1: "{N}: кожна країна з 2022 року",
      intro: "{sideText} З лютого 2022 до {dataTo} цей складник має {n} країн; таблиця починається з: {tops}." },
    year: {
      ua: { label: "Допомога Україні у {y} році", title: ["{if:partial|Допомога Україні у {y} році: за країнами (до {month})|Допомога Україні у {y} році: скільки дала кожна країна}", "Допомога Україні у {y} році за країнами"],
        description: ["Підтримка України у {Y}: рейтинг {n} країн у євро, з % ВВП. {t1}: {topV}. Допомога, частка ЄС, прийом біженців.", "Підтримка України у {Y}, кожна країна в євро та % ВВП: допомога, частка ЄС і прийом біженців."],
        h1: "{if:partial|Скільки кожна країна дала Україні у {y} році досі?|Скільки кожна країна дала Україні у {y} році?}",
        intro: "Підтримка України кожною країною у {Y}: допомога (кредити за вартістю дарунка), частка допомоги ЄС і витрати на прийом біженців, мінус гроші, що повернулися. У євро таблиця починається з: {tops}." },
      rus: { label: "Торгівля з Росією у {y} році", title: ["{if:partial|Торгівля з Росією у {y} році: за країнами (до {month})|Торгівля з Росією у {y} році: хто збільшив її доходи?}", "Торгівля з Росією у {y} році за країнами"],
        description: ["Торгівля з Росією у {Y}: на скільки більше чи менше Росія отримала від торгівлі з кожною країною, ніж без війни. {t1}: на {topV} {if:topX>=0|менше|більше}.", "Торгівля з Росією у {Y}: на скільки більше чи менше Росія отримала від торгівлі з кожною країною, ніж без війни."],
        h1: "Торгівля з Росією у {Y}: чия торгівля збільшила чи зменшила її доходи?",
        intro: "На скільки більше чи менше Росія отримала (податки й прибуток, не продажі) від торгівлі з кожною країною у {Y}, ніж у світі без війни. Таблиця починається з: {tops}." } },
    compare: { label: "{A} чи {B}", title: ["{A} чи {B}: допомога Україні й торгівля з Росією", "{A} чи {B}: Україна чи Росія?", "{A} чи {B}"],
      description: "{A} і {B} з 2022 року: підтримка України, прибуток Росії від торгівлі з ними і нетто, поруч, з діапазонами, шансами та джерелами.",
      h1: "{A} чи {B}: підтримка України й торгівля з Росією з 2022 року",
      line: "Підтримка України в євро: {a} {eurA}, {b} {eurB}. Більше в євро: {if:uaA>=uaB|{a}|{b}}; більше як частка ВВП: {if:pctA>=pctB|{a}|{b}}." },
    hub: { title: "Теми: рейтинги, складники, роки та порівняння", description: "Усі {n} сторінок War Balance за темами: рейтинги, групи, кожен складник чисел, кожен рік з 2022 і порівняння країн.", h1: "Усі теми, складники, роки й порівняння" },
    topic: { description: ["{label}: рейтинг {n} країн за показником «{measure}», з лютого 2022 до {dataTo}. {t1}: {topV}. З діапазонами й джерелами.", "{label}: рейтинг {n} країн з лютого 2022 до {dataTo}, з діапазонами й джерелами."],
      introGroup: "{label}: {n} членів, з лютого 2022 до {dataTo}. Їхня спільна підтримка України: {sumUa}; з торгівлею з Росією й замороженими російськими коштами нетто становить {sumNetPct} їхнього спільного ВВП {if:net>=0|на користь України|на бік Росії}.",
      introTopic: "{n} країн за показником «{measure}» {unit}, з лютого 2022 до {dataTo}. Таблиця починається з: {tops}." },
    country: {
      u_sure: { title: ["{N}: скільки допомоги Україні? {ua}", "{N}: {ua} для України з 2022 року", "{N}: допомога Україні"], description: ["{N}: підтримка України з 2022 року {ua} ({uaP} річного ВВП). З торгівлею з Росією: {netP} ВВП {netDir}, {sureWord}.", "{N}: {ua} для України з 2022 року ({uaP} ВВП). З торгівлею з Росією: {netP} ВВП {netDir}."], h1: "{N}: скільки ця країна дала Україні з 2022 року?" },
      r_sure: { title: ["{N}: чи допомагає ця країна Росії? {rus} {if:rusX<0|більше|менше} для Росії", "{N}: чи допомагає ця країна Росії?", "{N}: {netDir}"], description: ["{N}: {sureWord} {netDir} ({ch}). З 2022 року Росія отримала від цієї торгівлі на {rus} {if:rusX<0|більше|менше} податків і прибутку, ніж без війни.", "{N}: {sureWord} {netDir} ({ch}). З 2022 року Росія отримала від цієї торгівлі на {rus} {if:rusX<0|більше|менше}, ніж без війни."], h1: "{N}: чи допомагає ця країна Росії? Що показують грошові потоки" },
      lean: { title: ["{N}: Україна чи Росія? {leanWord}", "{N}: {leanWord}"], description: ["{N} з 2022 року: {leanWord}. Підтримка України {uaP} ВВП; нетто {netP} річного ВВП."], h1: "{N}: Україна чи Росія? {leanWord}" },
      unc: { title: ["{N}: Україна чи Росія? {uncWordCap}", "{N}: {uncWord}"], description: ["{N} з 2022 року: {uncWord}. Підтримка України {uaP} ВВП; нетто {netP} річного ВВП."], h1: "{N}: Україна чи Росія? {uncWordCap}" },
      zero: { title: ["{N}: Україна чи Росія? Нетто {zeroWord}", "{N}: нетто {zeroWord}"], description: ["{N} з 2022 року: {zeroWord}. Підтримка України {uaP} ВВП; нетто {netP} річного ВВП."], h1: "{N}: Україна чи Росія? Нетто {zeroWord}" },
      party: { title: ["{N}: {partyWordLc} (разом із Росією)", "{N}: {partyWordLc}"], description: ["{N} з 2022 року: {partyWordLc}. Підтримка України {uaP} ВВП; нетто {netP} річного ВВП."], h1: "{N}: {partyWordLc} (разом із Росією)" },
      nodata: { title: ["{N}: Україна чи Росія? Даних поки немає", "{N}: даних поки немає"], description: ["{N}: {noDataText}"], h1: "{N}: даних про гроші на користь України чи Росії поки немає" },
      q2u: "{N}: чи допомагає ця країна Росії?", q2r: "{N}: скільки допомоги Україні?",
      intro: "{uaVerb} ({uaEur}). {keptCap}. Нетто: {netSigned} річного ВВП з 2022 ({netWords}).", introParty: "{partyWhy} Нетто: {netSigned} річного ВВП з 2022 ({netRange})." },
    home: { title: "Хто допомагає Україні, а хто Росії? Карта грошей з 2022", description: "Інтерактивна карта: скільки грошей кожна країна спрямувала до України чи Росії з 2022 року через допомогу й торгівлю, у % ВВП і в євро.", h1: "Куди пішли гроші кожної країни: до України чи до Росії?",
      intro: "Для {n} {if:nOne|країни|країн}: підтримка України плюс те, скільки менше чи більше Росія заробила на торгівлі з нею порівняно зі світом без війни, з лютого 2022 до {dataTo} року, з діапазоном і ймовірністю." },
  },
};
const C = (l, path) => { let x = COPY[l]; for (const k of path) x = x && x[k]; if (x === undefined) { x = COPY.en; for (const k of path) x = x && x[k]; } return x; };

// ----- each family's copy -----
export function partCopy(l, { key, n, top, topV, dataTo }) {
  const v = { N: partName(l, key), n, dataTo, t1: top[0] || "", topV }, T = C(l, ["part"]);
  const d = fmtAll(T.description, v);
  return { label: v.N, title: fitTitle(fmtAll(T.title, v)), description: fitDesc(v.t1 ? d : d.slice(1)), h1: fmt(T.h1, v) };
}
export function partIntro(l, { key, side, n, top, dataTo }) {
  return fmt(C(l, ["part", "intro"]), { sideText: sideText(l, side), n, dataTo, tops: list3(l, top.slice(0, 3)) }).trim();
}
export function yearCopy(l, { kind, y, partial, month, n, top, topV, topX = 0, dataTo }) {
  const v = { y, month, n, dataTo, Y: partial ? s(l, "yearTo", { y, month }) : String(y), t1: top[0] || "", topV, tops: list3(l, top.slice(0, 3)) }, nums = { partial: !!partial, topX };
  const T = C(l, ["year", kind === "ua" ? "ua" : "rus"]), d = fmtAll(T.description, v, nums);
  return { label: fmt(T.label, v), title: fitTitle(fmtAll(T.title, v, nums)), description: fitDesc(v.t1 ? d : d.slice(1)), h1: fmt(T.h1, v, nums), intro: fmt(T.intro, v, nums) };
}
// a comparison of two countries. A, B: their names (the map's, in that language)
export function compareCopy(l, { A, B }) {
  const T = C(l, ["compare"]), v = { A, B };
  return { label: fmt(T.label, v), title: fitTitle(fmtAll(T.title, v)), description: fitDesc([fmt(T.description, v)]), h1: fmt(T.h1, v) };
}
// "Support for Ukraine in euros: A x, B y. More in euros: A; more as a share of GDP: B."
export const compareLine = (l, { a, b, eurA, eurB, uaA, uaB, pctA, pctB }) => fmt(C(l, ["compare", "line"]), { a, b, eurA, eurB }, { uaA, uaB, pctA, pctB });
export function hubCopy(l, n) {
  const T = C(l, ["hub"]);
  return { title: fitTitle([fmt(T.title, { n })]), description: fitDesc([fmt(T.description, { n })]), h1: fmt(T.h1, { n }) };
}

// ----- the topic and group pages of seo_topics.json in the other languages: a name, a title in the way people
// search in that language and a heading per entry; the description and intro are written from the table -----
export const TOPIC_T = {
  "ukraine-support-tracker": { de: ["Ukraine-Hilfe nach Ländern", "Ukraine-Hilfe nach Ländern: Wer gibt am meisten?", "Ukraine-Hilfe nach Ländern: Hilfe, Geflüchtete und Russlandhandel"], fr: ["Aide à l'Ukraine par pays", "Aide à l'Ukraine par pays : qui donne le plus ?", "Aide à l'Ukraine par pays : aide, réfugiés et commerce avec la Russie"], es: ["Ayuda a Ucrania por países", "Ayuda a Ucrania por países: ¿quién da más?", "Ayuda a Ucrania por países: ayuda, refugiados y comercio con Rusia"], pl: ["Pomoc dla Ukrainy według krajów", "Pomoc dla Ukrainy: ranking państw", "Pomoc dla Ukrainy według krajów: pomoc, uchodźcy i handel z Rosją"], nl: ["Steun aan Oekraïne per land", "Steun aan Oekraïne per land: wie geeft het meest?", "Steun aan Oekraïne per land: hulp, vluchtelingen en handel met Rusland"], uk: ["Допомога Україні по країнах", "Допомога Україні по країнах: хто дає найбільше?", "Допомога Україні по країнах: допомога, біженці й торгівля з Росією"] },
  "russian-oil-gas-buyers": { de: ["Wer kauft russisches Öl und Gas?", "Wer kauft russisches Öl und Gas? Zahlungen seit 2022", "Wer kauft russisches Öl und Gas? Was jedes Land Russland zahlte"], fr: ["Qui achète le pétrole et le gaz russes ?", "Qui achète le pétrole et le gaz russes depuis 2022 ?", "Qui achète le pétrole et le gaz russes ? Ce que chaque pays a payé"], es: ["¿Quién compra petróleo y gas ruso?", "¿Quién compra petróleo y gas ruso? Pagos desde 2022", "¿Quién compra petróleo y gas ruso? Lo que pagó cada país"], pl: ["Kto kupuje rosyjską ropę i gaz?", "Kto kupuje rosyjską ropę i gaz? Płatności od 2022", "Kto kupuje rosyjską ropę i gaz? Ile każdy kraj zapłacił Rosji"], nl: ["Wie koopt Russische olie en gas?", "Wie koopt Russische olie en gas? Betalingen sinds 2022", "Wie koopt Russische olie en gas? Wat elk land Rusland betaalde"], uk: ["Хто купує російську нафту й газ?", "Хто купує російську нафту й газ? Платежі з 2022", "Хто купує російську нафту й газ? Скільки кожна країна заплатила Росії"] },
  "frozen-russian-assets": { de: ["Eingefrorene russische Vermögen", "Eingefrorene russische Vermögen nach Ländern", "Eingefrorene russische Vermögen: Was Russland in jedem Land verliert"], fr: ["Avoirs russes gelés", "Avoirs russes gelés par pays", "Avoirs russes gelés : ce que la Russie perd dans chaque pays"], es: ["Activos rusos congelados", "Activos rusos congelados por país", "Activos rusos congelados: lo que Rusia pierde en cada país"], pl: ["Zamrożone rosyjskie aktywa", "Zamrożone rosyjskie aktywa według krajów", "Zamrożone rosyjskie aktywa: co Rosja traci w każdym kraju"], nl: ["Bevroren Russische tegoeden", "Bevroren Russische tegoeden per land", "Bevroren Russische tegoeden: wat Rusland in elk land misloopt"], uk: ["Заморожені російські активи", "Заморожені російські активи за країнами", "Заморожені російські активи: що Росія втрачає в кожній країні"] },
  "europe-energy-payments-vs-aid": { de: ["Europa: an Russland gezahlt vs. Ukraine-Hilfe", "Hat Europa Russland mehr gezahlt als der Ukraine gegeben?", "Hat Europa Russland mehr gezahlt, als es der Ukraine gab?"], fr: ["Europe : payé à la Russie vs aide à l'Ukraine", "L'Europe a-t-elle payé la Russie plus qu'aidé l'Ukraine ?", "L'Europe a-t-elle plus payé la Russie qu'aidé l'Ukraine depuis 2022 ?"], es: ["Europa: pagos a Rusia vs. ayuda a Ucrania", "¿Ha pagado Europa a Rusia más que a Ucrania?", "¿Ha pagado Europa a Rusia más de lo que dio a Ucrania desde 2022?"], pl: ["Europa: płatności dla Rosji a pomoc dla Ukrainy", "Czy Europa zapłaciła Rosji więcej, niż dała Ukrainie?", "Czy Europa zapłaciła Rosji więcej, niż dała Ukrainie od 2022 roku?"], nl: ["Europa: betaald aan Rusland vs steun aan Oekraïne", "Betaalde Europa Rusland meer dan het Oekraïne gaf?", "Betaalde Europa Rusland sinds 2022 meer dan het Oekraïne gaf?"], uk: ["Європа: платежі Росії проти допомоги Україні", "Чи заплатила Європа Росії більше, ніж дала Україні?", "Чи заплатила Європа Росії більше, ніж дала Україні з 2022 року?"] },
  "russia-war-income": { de: ["Russlands Kriegseinnahmen aus Handel", "Russlands Kriegseinnahmen: Wessen Handel brachte am meisten?", "Russlands Kriegseinnahmen: Wessen Handel brachte Russland am meisten seit 2022?"], fr: ["Revenus de guerre de la Russie", "Revenus de guerre de la Russie : quel commerce rapporte ?", "Revenus de guerre de la Russie : quels échanges l'ont le plus enrichie depuis 2022 ?"], es: ["Ingresos de guerra de Rusia", "Ingresos de guerra de Rusia: ¿qué comercio aporta más?", "Ingresos de guerra de Rusia: ¿qué comercio le aportó más desde 2022?"], pl: ["Wojenne dochody Rosji z handlu", "Wojenne dochody Rosji: czyj handel dał najwięcej?", "Wojenne dochody Rosji: czyj handel dał jej najwięcej od 2022 roku?"], nl: ["Ruslands oorlogsinkomsten uit handel", "Ruslands oorlogsinkomsten: wiens handel bracht het meest?", "Ruslands oorlogsinkomsten: wiens handel bracht sinds 2022 het meest op?"], uk: ["Воєнні доходи Росії від торгівлі", "Воєнні доходи Росії: чия торгівля дала найбільше?", "Воєнні доходи Росії: чия торгівля дала їй найбільше з 2022 року?"] },
  eu: { de: ["EU-Länder", "EU: Ukraine-Hilfe und Handel mit Russland je Land", "Die EU: das Geld jedes Mitglieds Richtung Ukraine oder Russland"], fr: ["Pays de l'UE", "UE : aide à l'Ukraine et commerce russe par pays", "L'UE : l'argent de chaque membre vers l'Ukraine ou la Russie"], es: ["Países de la UE", "UE: ayuda a Ucrania y comercio con Rusia por país", "La UE: el dinero de cada miembro hacia Ucrania o Rusia"], pl: ["Kraje UE", "UE: pomoc dla Ukrainy i handel z Rosją według krajów", "UE: pieniądze każdego członka w stronę Ukrainy lub Rosji"], nl: ["EU-landen", "EU: steun aan Oekraïne en handel met Rusland per land", "De EU: het geld van elk lid richting Oekraïne of Rusland"], uk: ["Країни ЄС", "ЄС: допомога Україні й торгівля з Росією за країнами", "ЄС: гроші кожного члена на користь України чи Росії"] },
  g7: { de: ["G7", "G7: Ukraine-Hilfe und Handel mit Russland seit 2022", "Die G7: das Geld jedes Mitglieds Richtung Ukraine oder Russland"], fr: ["G7", "G7 : aide à l'Ukraine et commerce avec la Russie", "Le G7 : l'argent de chaque membre vers l'Ukraine ou la Russie"], es: ["G7", "G7: ayuda a Ucrania y comercio con Rusia desde 2022", "El G7: el dinero de cada miembro hacia Ucrania o Rusia"], pl: ["G7", "G7: pomoc dla Ukrainy i handel z Rosją od 2022", "G7: pieniądze każdego członka w stronę Ukrainy lub Rosji"], nl: ["G7", "G7: steun aan Oekraïne en handel met Rusland sinds 2022", "De G7: het geld van elk lid richting Oekraïne of Rusland"], uk: ["G7", "G7: допомога Україні й торгівля з Росією з 2022", "G7: гроші кожного члена на користь України чи Росії"] },
  nato: { de: ["NATO-Mitglieder", "NATO: Ukraine-Hilfe und Handel mit Russland je Mitglied", "Die NATO: das Geld jedes Mitglieds Richtung Ukraine oder Russland"], fr: ["Membres de l'OTAN", "OTAN : aide à l'Ukraine et commerce russe par membre", "L'OTAN : l'argent de chaque membre vers l'Ukraine ou la Russie"], es: ["Miembros de la OTAN", "OTAN: ayuda a Ucrania y comercio con Rusia por miembro", "La OTAN: el dinero de cada miembro hacia Ucrania o Rusia"], pl: ["Członkowie NATO", "NATO: pomoc dla Ukrainy i handel z Rosją", "NATO: pieniądze każdego członka w stronę Ukrainy lub Rosji"], nl: ["NAVO-leden", "NAVO: steun aan Oekraïne en handel met Rusland per lid", "De NAVO: het geld van elk lid richting Oekraïne of Rusland"], uk: ["Члени НАТО", "НАТО: допомога Україні й торгівля з Росією", "НАТО: гроші кожного члена на користь України чи Росії"] },
  brics: { de: ["BRICS", "BRICS: Handel mit Russland und Ukraine-Hilfe seit 2022", "BRICS: das Geld jedes Mitglieds Richtung Ukraine oder Russland"], fr: ["BRICS", "BRICS : commerce avec la Russie et aide à l'Ukraine", "Les BRICS : l'argent de chaque membre vers l'Ukraine ou la Russie"], es: ["BRICS", "BRICS: comercio con Rusia y ayuda a Ucrania desde 2022", "BRICS: el dinero de cada miembro hacia Ucrania o Rusia"], pl: ["BRICS", "BRICS: handel z Rosją i pomoc dla Ukrainy od 2022", "BRICS: pieniądze każdego członka w stronę Ukrainy lub Rosji"], nl: ["BRICS", "BRICS: handel met Rusland en steun aan Oekraïne", "BRICS: het geld van elk lid richting Oekraïne of Rusland"], uk: ["БРІКС", "БРІКС: торгівля з Росією й допомога Україні з 2022", "БРІКС: гроші кожного члена на користь України чи Росії"] },
  "gulf-states": { de: ["Golfstaaten", "Golfstaaten: Handel mit Russland und Ukraine-Hilfe", "Golfstaaten: das Geld jedes Landes Richtung Ukraine oder Russland"], fr: ["États du Golfe", "États du Golfe : commerce avec la Russie et aide à l'Ukraine", "États du Golfe : l'argent de chacun vers l'Ukraine ou la Russie"], es: ["Estados del Golfo", "Estados del Golfo: comercio con Rusia y ayuda a Ucrania", "Estados del Golfo: el dinero de cada uno hacia Ucrania o Rusia"], pl: ["Państwa Zatoki Perskiej", "Państwa Zatoki: handel z Rosją i pomoc dla Ukrainy", "Państwa Zatoki: pieniądze każdego w stronę Ukrainy lub Rosji"], nl: ["Golfstaten", "Golfstaten: handel met Rusland en steun aan Oekraïne", "Golfstaten: het geld van elk land richting Oekraïne of Rusland"], uk: ["Країни Перської затоки", "Країни Затоки: торгівля з Росією й допомога Україні", "Країни Затоки: гроші кожної на користь України чи Росії"] },
  "central-asia": { de: ["Zentralasien", "Zentralasien: Handel mit Russland und Ukraine-Hilfe", "Zentralasien: das Geld jedes Landes Richtung Ukraine oder Russland"], fr: ["Asie centrale", "Asie centrale : commerce avec la Russie et aide à l'Ukraine", "Asie centrale : l'argent de chaque pays vers l'Ukraine ou la Russie"], es: ["Asia Central", "Asia Central: comercio con Rusia y ayuda a Ucrania", "Asia Central: el dinero de cada país hacia Ucrania o Rusia"], pl: ["Azja Środkowa", "Azja Środkowa: handel z Rosją i pomoc dla Ukrainy", "Azja Środkowa: pieniądze każdego kraju w stronę Ukrainy lub Rosji"], nl: ["Centraal-Azië", "Centraal-Azië: handel met Rusland en steun aan Oekraïne", "Centraal-Azië: het geld van elk land richting Oekraïne of Rusland"], uk: ["Центральна Азія", "Центральна Азія: торгівля з Росією й допомога Україні", "Центральна Азія: гроші кожної країни на користь України чи Росії"] },
  "countries-helping-russia": { de: ["Welche Länder helfen Russland?", "Welche Länder helfen Russland? Geldströme seit 2022", "Welche Länder helfen Russland? Wohin das Geld seit 2022 floss"], fr: ["Quels pays aident la Russie ?", "Quels pays aident la Russie ? L'argent depuis 2022", "Quels pays aident la Russie ? Où l'argent est allé depuis 2022"], es: ["¿Qué países ayudan a Rusia?", "¿Qué países ayudan a Rusia? El dinero desde 2022", "¿Qué países ayudan a Rusia? Hacia dónde fue el dinero desde 2022"], pl: ["Które kraje pomagają Rosji?", "Które kraje pomagają Rosji? Pieniądze od 2022", "Które kraje pomagają Rosji? Dokąd płynęły pieniądze od 2022"], nl: ["Welke landen helpen Rusland?", "Welke landen helpen Rusland? Geldstromen sinds 2022", "Welke landen helpen Rusland? Waar het geld sinds 2022 heen ging"], uk: ["Які країни допомагають Росії?", "Які країни допомагають Росії? Гроші з 2022 року", "Які країни допомагають Росії? Куди йшли гроші з 2022 року"] },
  "shadow-fleet": { de: ["Schattenflotte: Wer verschifft russisches Öl?", "Schattenflotte: Wer verdient am Transport russischen Öls?", "Schattenflotte: Welche Länder verdienen am Transport russischen Öls?"], fr: ["Flotte fantôme : qui transporte le pétrole russe ?", "Flotte fantôme : qui gagne au transport du pétrole russe ?", "Flotte fantôme : quels pays gagnent au transport du pétrole russe ?"], es: ["Flota fantasma: ¿quién transporta el crudo ruso?", "Flota fantasma: ¿quién gana con el crudo ruso?", "Flota fantasma: ¿qué países ganan transportando petróleo ruso?"], pl: ["Flota cieni: kto przewozi rosyjską ropę?", "Flota cieni: kto zarabia na przewozie rosyjskiej ropy?", "Flota cieni: które kraje zarabiają na przewozie rosyjskiej ropy?"], nl: ["Schaduwvloot: wie vervoert Russische olie?", "Schaduwvloot: wie verdient aan Russische olie?", "Schaduwvloot: welke landen verdienen aan het vervoer van Russische olie?"], uk: ["Тіньовий флот: хто возить російську нафту?", "Тіньовий флот: хто заробляє на російській нафті?", "Тіньовий флот: які країни заробляють на перевезенні російської нафти?"] },
  "ukrainian-refugees-cost": { de: ["Kosten ukrainischer Geflüchteter", "Ukraine-Flüchtlinge: Kosten der Aufnahme nach Ländern", "Was hat die Aufnahme ukrainischer Geflüchteter jedes Land gekostet?"], fr: ["Coût des réfugiés ukrainiens", "Réfugiés ukrainiens : coût de l'accueil par pays", "Combien l'accueil des réfugiés ukrainiens a-t-il coûté à chaque pays ?"], es: ["Coste de los refugiados ucranianos", "Refugiados ucranianos: coste de acogida por país", "¿Cuánto ha costado a cada país acoger refugiados ucranianos?"], pl: ["Koszt uchodźców z Ukrainy", "Uchodźcy z Ukrainy: koszt przyjęcia według krajów", "Ile każdy kraj wydał na przyjęcie uchodźców z Ukrainy?"], nl: ["Kosten Oekraïense vluchtelingen", "Oekraïense vluchtelingen: kosten van opvang per land", "Wat kostte de opvang van Oekraïense vluchtelingen elk land?"], uk: ["Витрати на українських біженців", "Українські біженці: витрати на прийом за країнами", "Скільки кожній країні коштував прийом українських біженців?"] },
  "eu-vs-us-aid": { de: ["EU vs. USA: Ukraine-Hilfe", "EU vs. USA: Wer hat der Ukraine mehr gegeben?", "EU vs. USA: Wer hat der Ukraine seit 2022 mehr gegeben?"], fr: ["UE vs États-Unis : aide à l'Ukraine", "UE vs États-Unis : qui a le plus aidé l'Ukraine ?", "UE vs États-Unis : qui a le plus aidé l'Ukraine depuis 2022 ?"], es: ["UE vs. EE. UU.: ayuda a Ucrania", "UE vs. EE. UU.: ¿quién ha dado más a Ucrania?", "UE vs. EE. UU.: ¿quién ha dado más a Ucrania desde 2022?"], pl: ["UE a USA: pomoc dla Ukrainy", "UE czy USA: kto dał Ukrainie więcej?", "UE czy USA: kto dał Ukrainie więcej od 2022 roku?"], nl: ["EU vs VS: steun aan Oekraïne", "EU vs VS: wie gaf Oekraïne meer?", "EU vs VS: wie gaf Oekraïne sinds 2022 meer?"], uk: ["ЄС чи США: допомога Україні", "ЄС чи США: хто дав Україні більше?", "ЄС чи США: хто дав Україні більше з 2022 року?"] },
  "ukraine-aid-per-capita": { de: ["Ukraine-Hilfe pro Kopf", "Ukraine-Hilfe pro Kopf: Wer gibt am meisten je Einwohner?", "Ukraine-Hilfe pro Kopf: Welche Länder geben je Einwohner am meisten?"], fr: ["Aide à l'Ukraine par habitant", "Aide à l'Ukraine par habitant : qui donne le plus ?", "Aide à l'Ukraine par habitant : quels pays donnent le plus ?"], es: ["Ayuda a Ucrania per cápita", "Ayuda a Ucrania per cápita: ¿quién da más por persona?", "Ayuda a Ucrania per cápita: ¿qué países dan más por persona?"], pl: ["Pomoc dla Ukrainy na mieszkańca", "Pomoc dla Ukrainy na mieszkańca: kto daje najwięcej?", "Pomoc dla Ukrainy na mieszkańca: które kraje dają najwięcej?"], nl: ["Steun aan Oekraïne per inwoner", "Steun aan Oekraïne per inwoner: wie geeft het meest?", "Steun aan Oekraïne per inwoner: welke landen geven het meest?"], uk: ["Допомога Україні на душу населення", "Допомога Україні на душу: хто дає найбільше?", "Допомога Україні на душу населення: які країни дають найбільше?"] },
  "military-support-to-russia": { de: ["Waffen für Russland", "Wer liefert Russland Waffen? Drohnen, Granaten, Raketen", "Wer liefert Russland Waffen? Militärische Lieferungen seit 2022"], fr: ["Armes envoyées à la Russie", "Qui envoie des armes à la Russie ? Drones, obus, missiles", "Qui envoie des armes à la Russie ? Les livraisons depuis 2022"], es: ["Armas enviadas a Rusia", "¿Quién envía armas a Rusia? Drones, proyectiles, misiles", "¿Quién envía armas a Rusia? Las entregas desde 2022"], pl: ["Broń wysyłana do Rosji", "Kto wysyła Rosji broń? Drony, pociski, rakiety", "Kto wysyła Rosji broń? Dostawy wojskowe od 2022 roku"], nl: ["Wapens naar Rusland", "Wie levert Rusland wapens? Drones, granaten, raketten", "Wie levert Rusland wapens? Militaire leveringen sinds 2022"], uk: ["Зброя для Росії", "Хто постачає Росії зброю? Дрони, снаряди, ракети", "Хто постачає Росії зброю? Військові поставки з 2022 року"] },
  "russian-oil-discount": { de: ["Rabatt auf russisches Öl", "Ölpreisdeckel: Wer bekam russisches Öl mit Rabatt?", "Hat der Ölpreisdeckel gewirkt? Wer russisches Öl mit Rabatt kaufte"], fr: ["Rabais sur le pétrole russe", "Plafond du prix du pétrole russe : qui a eu le rabais ?", "Le plafonnement a-t-il marché ? Qui a eu le pétrole russe au rabais"], es: ["Descuento del petróleo ruso", "Tope al crudo ruso: ¿quién compró con descuento?", "¿Funcionó el tope? Quién compró petróleo ruso con descuento"], pl: ["Rabat na rosyjską ropę", "Limit cen ropy: kto kupował rosyjską ropę z rabatem?", "Czy limit cen zadziałał? Kto kupował rosyjską ropę z rabatem"], nl: ["Korting op Russische olie", "Olieprijsplafond: wie kocht Russische olie met korting?", "Werkte het prijsplafond? Wie kocht Russische olie met korting"], uk: ["Знижка на російську нафту", "Цінова стеля на нафту: хто купував зі знижкою?", "Чи спрацювала цінова стеля? Хто купував російську нафту зі знижкою"] },
  "russian-oil-via-third-countries": { de: ["Russisches Öl über Drittländer", "Russisches Öl aus Indien und der Türkei: Wer kaufte es?", "Russisches Öl durch die Hintertür: Wer kaufte daraus raffinierten Kraftstoff?"], fr: ["Pétrole russe via des pays tiers", "Pétrole russe raffiné en Inde et en Turquie : qui l'achète ?", "Le pétrole russe par la porte de derrière : qui a acheté le carburant raffiné ?"], es: ["Petróleo ruso vía terceros países", "Petróleo ruso refinado en India y Turquía: ¿quién lo compra?", "Petróleo ruso por la puerta de atrás: ¿quién compró el combustible refinado?"], pl: ["Rosyjska ropa przez kraje trzecie", "Rosyjska ropa rafinowana w Indiach i Turcji: kto ją kupił?", "Rosyjska ropa tylnymi drzwiami: kto kupił paliwo z rosyjskiej ropy?"], nl: ["Russische olie via derde landen", "Russische olie geraffineerd in India en Turkije: wie kocht het?", "Russische olie via de achterdeur: wie kocht brandstof uit Russische ruwe olie?"], uk: ["Російська нафта через треті країни", "Російська нафта з Індії й Туреччини: хто її купував?", "Російська нафта з чорного ходу: хто купував пальне з російської сировини?"] },
  "russia-trade-hubs": { de: ["Handelsdrehscheiben neben Russland", "Sanktionen und Re-Export-Drehscheiben: VAE, Türkei, Kasachstan", "Handelsdrehscheiben und Russland: was durch VAE, Türkei und Zentralasien geht"], fr: ["Plaques tournantes du commerce russe", "Sanctions et plaques tournantes : EAU, Turquie, Kazakhstan", "Plaques tournantes et Russie : ce qui passe par les EAU, la Turquie et l'Asie centrale"], es: ["Centros de comercio junto a Rusia", "Sanciones y centros de reexportación: EAU, Turquía, Kazajistán", "Centros de comercio y Rusia: lo que pasa por EAU, Turquía y Asia Central"], pl: ["Węzły handlowe obok Rosji", "Sankcje i huby reeksportu: ZEA, Turcja, Kazachstan", "Węzły handlowe i Rosja: co przechodzi przez ZEA, Turcję i Azję Środkową"], nl: ["Handelsknooppunten rond Rusland", "Sancties en doorvoerknooppunten: VAE, Turkije, Kazachstan", "Handelsknooppunten en Rusland: wat via de VAE, Turkije en Centraal-Azië gaat"], uk: ["Торгові хаби біля Росії", "Санкції та хаби реекспорту: ОАЕ, Туреччина, Казахстан", "Торгові хаби й Росія: що йде через ОАЕ, Туреччину й Центральну Азію"] },
};

// a topic or group page in another language: its description and intro from the table, in that language
export function topicCopyLang(l, e, { n, top, topV, measure, unitKey, dataTo, sumUa, sumNetPct, net = 0, isGroup }) {
  const [label, title, h1] = (TOPIC_T[e.slug] || {})[l] || [e.label, e.label, e.label];
  const v = { label, n, measure, unit: s(l, "unit")[unitKey], dataTo, t1: top[0] || "", topV, tops: list3(l, top.slice(0, 3)), sumUa, sumNetPct }, T = C(l, ["topic"]);
  const d = fmtAll(T.description, v);
  return { label, title: fitTitle([title, label]), description: fitDesc(v.t1 ? d : d.slice(1)), h1, intro: fmt(isGroup ? T.introGroup : T.introTopic, v, { net }) };
}

// ----- country pages, every language and chance level. cat: u_sure, u_trade (English: where people search for its
// trade far more than for its aid), r_sure, u_lean or r_lean, unc, zero, party, nodata. v: the values (see COPY above),
// every word about the chance and the direction the map's own -----
export function countryText(l, cat, v, nums) {
  const T = C(l, ["country"]), key = cat === "u_lean" || cat === "r_lean" ? "lean" : cat === "u_trade" && !T.u_trade ? "u_sure" : cat;
  const F = T[key], one = x => fmt(x, v, nums);
  let title = fit(fmtAll(F.title, v, nums), TITLE_MAX);
  // a long name: cut it, never the chance words
  if (title.length > TITLE_MAX) { const last = one(F.title[F.title.length - 1]), rest = last.slice(v.N.length); title = v.N.slice(0, Math.max(8, TITLE_MAX - rest.length - 1)).trimEnd() + "…" + rest; }
  if (title.length > TITLE_MAX) title = cut(title, TITLE_MAX);
  return { title, description: fitDesc(fmtAll(F.description, v, nums)), h1: one(F.h1),
    intro: cat === "nodata" ? (T.introNoData ? one(T.introNoData) : "") : one(cat === "party" ? T.introParty : T.intro),
    q2: T.q2u ? one(cat.startsWith("r") || cat === "party" ? T.q2r : T.q2u) : "" };
}
export const faqText = (key, v, nums) => fmt(COPY.en.faq[key], v, nums);
export function homeText(l, n, dataTo) {
  const T = C(l, ["home"]), v = { n, dataTo }, nums = { nOne: n % 10 === 1 && n % 100 !== 11 };
  return { title: fmt(T.title, v, nums), description: fmt(T.description, v, nums), h1: fmt(T.h1, v, nums), intro: fmt(T.intro, v, nums) };
}
export function staticText(page, v, nums) {
  const T = COPY.en.static[page];
  return { title: fitTitle(fmtAll(T.title, v, nums)), description: fitDesc(fmtAll(T.description, v, nums)), h1: fmt(T.h1, v, nums), intro: fmt(T.intro, v, nums) };
}

// ----- the static pages' own words (the rest of a page's text is the map's own, in its language) -----
export const LABELS = {
  en: { openMap: "Open in the map", map: "Map", ranking: "Ranking", how: "How it works", net: "The net", support: "Support for Ukraine", trade: "Russia's earnings from trade", frozen: "Russian money frozen", parts: "What makes up the number", byYear: "By year", year: "Year", netYear: "Net", total: "Net since 2022", yearNote: "Each year's amount: + toward Ukraine, − toward Russia. *{y}: to {month}.", faq: "Questions", nearby: "Nearby in the ranking", sources: "Sources", moreSources: "{n} sources in all; the map's panel lists every one, with its documents.", dataTo: "Figures to {to} · page updated {upd}", measured: "How this is measured", preview: "Research preview: check a figure's sources before you quote it.", notRanked: "Not ranked", noData: "No data", noDataText: "There is no observation of its own for the war years, so nothing is counted for it and it is not ranked.", chance: "Chance", ofGdp: "of a year's GDP since 2022", lettersKey: "Letters: A reported, B measured estimate, C modelled estimate, D rough indication.", languages: "Languages", allCountries: "Countries, A to Z", changelog: "Changelog", limitations: "Limitations", supportPage: "Support for Ukraine by country", tradePage: "Trade with Russia by country", party: "Party to the war (with Russia), not ranked", eur: "Euros", share: "% of GDP", country: "Country", method: "Method",
    // the English ranking, method and document pages
    licence: "Data: {link}, CC BY 4.0.", smaller: "Smaller economies (GDP under {gdpMin})", smallerNote: "The map's ranking leaves them out by default (Filters › Size), because small amounts swing their shares widely. Each with its group.",
    noDataRank: "No observation of their own for the war years: nothing is counted and they are not ranked.", inEuros: "In euros", shareWithPp: "As a share of GDP, with € per person", keptMoreEur: "Russia kept more, in euros", keptLessEur: "Russia kept less, in euros", asShare: "As a share of GDP",
    allTopicsLong: "All topics, parts, years and comparisons", methodPages: "The method, page by page", flows: "Every money flow", also: "Also", fullData: "Full data (JSON)", everyNumber: "Every number measures money: aid to Ukraine and the change in what Russia keeps from trade, against a world without the war. Weapons sent, troops and diplomacy are not in it.",
    rankMoney: "The ranking measures money: aid to Ukraine and the change in what Russia keeps from trade, against a world without the war. Weapons sent, troops and diplomacy are not in it.",
    imgWorld: "World map of where each country's money moved since 2022", imgBrand: "War Balance: where each country's money moved since 2022", imgCountry: "{name}: {what} of a year's GDP since 2022, War Balance", imgNoData: "{name}: no data, War Balance", imgPair: "{a} and {b}: money toward Ukraine or Russia since 2022", methodSuffix: "War Balance method" },
  de: { openMap: "Auf der Karte öffnen", map: "Karte", ranking: "Rangliste", how: "So funktioniert es", net: "Der Saldo", support: "Unterstützung für die Ukraine", trade: "Russlands Einnahmen aus dem Handel", frozen: "Eingefrorenes russisches Geld", parts: "Woraus sich die Zahl zusammensetzt", byYear: "Nach Jahr", year: "Jahr", netYear: "Saldo", total: "Saldo seit 2022", yearNote: "Betrag je Jahr: + Richtung Ukraine, − Richtung Russland. *{y}: bis {month}.", faq: "Fragen", nearby: "In der Rangliste daneben", sources: "Quellen", moreSources: "Insgesamt {n} Quellen; der Bereich auf der Karte nennt jede, mit ihren Dokumenten.", dataTo: "Zahlen bis {to} · Seite aktualisiert am {upd}", measured: "Wie das gemessen wird", preview: "Forschungsvorschau: Prüfen Sie die Quellen einer Zahl, bevor Sie sie zitieren.", notRanked: "Nicht gereiht", noData: "Keine Daten", noDataText: "Für die Kriegsjahre gibt es keine eigene Beobachtung; es wird nichts gezählt und das Land wird nicht gereiht.", chance: "Wahrscheinlichkeit", ofGdp: "eines Jahres-BIP seit 2022", lettersKey: "Buchstaben: A gemeldet, B gemessene Schätzung, C modellierte Schätzung, D grober Anhaltspunkt.", languages: "Sprachen", allCountries: "Länder von A bis Z", changelog: "Änderungen", limitations: "Grenzen", supportPage: "Unterstützung für die Ukraine nach Land", tradePage: "Handel mit Russland nach Land", party: "Kriegspartei (mit Russland), nicht gereiht", eur: "Euro", share: "% des BIP", country: "Land", method: "Methode", licence: "Daten: {link}, CC BY 4.0." },
  fr: { openMap: "Ouvrir sur la carte", map: "Carte", ranking: "Classement", how: "Fonctionnement", net: "Le solde", support: "Soutien à l'Ukraine", trade: "Gains de la Russie sur le commerce", frozen: "Avoirs russes gelés", parts: "Ce qui compose le chiffre", byYear: "Par année", year: "Année", netYear: "Solde", total: "Solde depuis 2022", yearNote: "Montant de chaque année : + vers l'Ukraine, − vers la Russie. *{y} : jusqu'à {month}.", faq: "Questions", nearby: "Voisins au classement", sources: "Sources", moreSources: "{n} sources en tout ; le panneau de la carte les donne toutes, avec leurs documents.", dataTo: "Chiffres jusqu'au {to} · page mise à jour le {upd}", measured: "Comment c'est mesuré", preview: "Version de recherche : vérifiez les sources d'un chiffre avant de le citer.", notRanked: "Non classé", noData: "Pas de données", noDataText: "Aucune observation propre pour les années de guerre : rien n'est compté et le pays n'est pas classé.", chance: "Probabilité", ofGdp: "d'une année de PIB depuis 2022", lettersKey: "Lettres : A déclaré, B estimation mesurée, C estimation modélisée, D indication approximative.", languages: "Langues", allCountries: "Pays de A à Z", changelog: "Journal des modifications", limitations: "Limites", supportPage: "Soutien à l'Ukraine par pays", tradePage: "Commerce avec la Russie par pays", party: "Partie au conflit (avec la Russie), non classée", eur: "Euros", share: "% du PIB", country: "Pays", method: "Méthode", licence: "Données : {link}, CC BY 4.0." },
  es: { openMap: "Abrir en el mapa", map: "Mapa", ranking: "Clasificación", how: "Cómo funciona", net: "El neto", support: "Apoyo a Ucrania", trade: "Ganancias de Rusia por comercio", frozen: "Dinero ruso congelado", parts: "De qué se compone la cifra", byYear: "Por año", year: "Año", netYear: "Neto", total: "Neto desde 2022", yearNote: "Importe de cada año: + hacia Ucrania, − hacia Rusia. *{y}: hasta {month}.", faq: "Preguntas", nearby: "Cerca en la clasificación", sources: "Fuentes", moreSources: "{n} fuentes en total; el panel del mapa las muestra todas, con sus documentos.", dataTo: "Cifras hasta el {to} · página actualizada el {upd}", measured: "Cómo se mide", preview: "Versión de investigación: compruebe las fuentes de una cifra antes de citarla.", notRanked: "Sin clasificar", noData: "Sin datos", noDataText: "No hay observación propia para los años de guerra: no se cuenta nada y no se clasifica.", chance: "Probabilidad", ofGdp: "de un año de PIB desde 2022", lettersKey: "Letras: A declarado, B estimación medida, C estimación modelizada, D indicación aproximada.", languages: "Idiomas", allCountries: "Países de la A a la Z", changelog: "Registro de cambios", limitations: "Limitaciones", supportPage: "Apoyo a Ucrania por país", tradePage: "Comercio con Rusia por país", party: "Parte en la guerra (con Rusia), sin clasificar", eur: "Euros", share: "% del PIB", country: "País", method: "Método", licence: "Datos: {link}, CC BY 4.0." },
  pl: { openMap: "Otwórz na mapie", map: "Mapa", ranking: "Ranking", how: "Jak to działa", net: "Saldo", support: "Wsparcie dla Ukrainy", trade: "Zyski Rosji z handlu", frozen: "Zamrożone rosyjskie środki", parts: "Z czego składa się liczba", byYear: "Według roku", year: "Rok", netYear: "Saldo", total: "Saldo od 2022", yearNote: "Kwota w danym roku: + na rzecz Ukrainy, − na rzecz Rosji. *{y}: do {month}.", faq: "Pytania", nearby: "Obok w rankingu", sources: "Źródła", moreSources: "Łącznie {n} źródeł; panel na mapie podaje każde, z dokumentami.", dataTo: "Dane do {to} · strona zaktualizowana {upd}", measured: "Jak to jest mierzone", preview: "Wersja badawcza: sprawdź źródła liczby, zanim ją zacytujesz.", notRanked: "Poza rankingiem", noData: "Brak danych", noDataText: "Brak własnych obserwacji za lata wojny: nic nie jest liczone i kraj nie jest w rankingu.", chance: "Szansa", ofGdp: "rocznego PKB od 2022", lettersKey: "Litery: A zgłoszone, B zmierzone szacunki, C szacunki z modelu, D przybliżenie.", languages: "Języki", allCountries: "Kraje od A do Z", changelog: "Lista zmian", limitations: "Ograniczenia", supportPage: "Wsparcie dla Ukrainy według kraju", tradePage: "Handel z Rosją według kraju", party: "Strona wojny (z Rosją), poza rankingiem", eur: "Euro", share: "% PKB", country: "Kraj", method: "Metoda", licence: "Dane: {link}, CC BY 4.0." },
  nl: { openMap: "Openen op de kaart", map: "Kaart", ranking: "Ranglijst", how: "Hoe het werkt", net: "Het saldo", support: "Steun aan Oekraïne", trade: "Ruslands inkomsten uit handel", frozen: "Bevroren Russisch geld", parts: "Waaruit het getal bestaat", byYear: "Per jaar", year: "Jaar", netYear: "Saldo", total: "Saldo sinds 2022", yearNote: "Bedrag per jaar: + richting Oekraïne, − richting Rusland. *{y}: tot {month}.", faq: "Vragen", nearby: "In de buurt in de ranglijst", sources: "Bronnen", moreSources: "In totaal {n} bronnen; het paneel op de kaart noemt ze allemaal, met hun documenten.", dataTo: "Cijfers tot {to} · pagina bijgewerkt op {upd}", measured: "Hoe dit gemeten wordt", preview: "Onderzoeksversie: controleer de bronnen van een getal voordat u het citeert.", notRanked: "Niet gerangschikt", noData: "Geen gegevens", noDataText: "Er is geen eigen waarneming voor de oorlogsjaren: er wordt niets geteld en het land staat niet in de ranglijst.", chance: "Kans", ofGdp: "van een jaar bbp sinds 2022", lettersKey: "Letters: A gemeld, B gemeten schatting, C gemodelleerde schatting, D ruwe indicatie.", languages: "Talen", allCountries: "Landen van A tot Z", changelog: "Wijzigingen", limitations: "Beperkingen", supportPage: "Steun aan Oekraïne per land", tradePage: "Handel met Rusland per land", party: "Partij in de oorlog (met Rusland), niet gerangschikt", eur: "Euro", share: "% van het bbp", country: "Land", method: "Methode", licence: "Gegevens: {link}, CC BY 4.0." },
  uk: { openMap: "Відкрити на карті", map: "Карта", ranking: "Рейтинг", how: "Як це працює", net: "Нетто", support: "Підтримка України", trade: "Прибутки Росії від торгівлі", frozen: "Заморожені російські кошти", parts: "З чого складається число", byYear: "За роками", year: "Рік", netYear: "Нетто", total: "Нетто з 2022", yearNote: "Сума за рік: + на користь України, − на користь Росії. *{y}: до {month}.", faq: "Запитання", nearby: "Поруч у рейтингу", sources: "Джерела", moreSources: "Усього {n} джерел; панель на карті показує кожне з документами.", dataTo: "Дані до {to} · сторінку оновлено {upd}", measured: "Як це виміряно", preview: "Дослідницька версія: перевірте джерела числа, перш ніж цитувати його.", notRanked: "Поза рейтингом", noData: "Немає даних", noDataText: "Власних спостережень за роки війни немає: нічого не враховано, і країна не в рейтингу.", chance: "Шанс", ofGdp: "річного ВВП з 2022", lettersKey: "Літери: A звітні дані, B виміряна оцінка, C модельна оцінка, D приблизна вказівка.", languages: "Мови", allCountries: "Країни від А до Я", changelog: "Зміни", limitations: "Обмеження", supportPage: "Підтримка України за країнами", tradePage: "Торгівля з Росією за країнами", party: "Сторона війни (разом із Росією), поза рейтингом", eur: "Євро", share: "% ВВП", country: "Країна", method: "Методика", licence: "Дані: {link}, CC BY 4.0." },
};
// (always filled: a phrase that needs a value it is not given stops the build, instead of showing "{y}")
export const L = (l, key, vars, nums) => fmt((LABELS[l] && LABELS[l][key]) || LABELS.en[key], vars || {}, nums || {});

// ----- every phrase above, for the wording guard (seo_check.py: node prints phraseList() as JSON) -----
export function phraseList() {
  const out = [];
  const walk = (x, key, lang) => {
    if (typeof x === "string") out.push({ file: "pipeline/seo_i18n.mjs", key, lang, text: x });
    else if (Array.isArray(x)) x.forEach((y, i) => walk(y, `${key}[${i}]`, lang));
    else if (x && typeof x === "object") for (const [k, y] of Object.entries(x)) walk(y, `${key}.${k}`, lang);
  };
  for (const [name, table] of Object.entries({ S, MEASURE, PART, SIDE, COPY, LABELS })) for (const [l, t] of Object.entries(table)) walk(t, name, l);
  for (const [slug, byLang] of Object.entries(TOPIC_T)) for (const [l, t] of Object.entries(byLang)) walk(t, `TOPIC_T.${slug}`, l);
  return out;
}

// the strings above that a native speaker should read before they are relied on (new in round 56; reworded in round 57
// by the wording guard: the sort phrases, the comparison line, the year and part intros, every frame that said "first",
// "largest", "only" or a chance word)
export const REVIEW = ["S (page frames: de, fr, es, pl, nl, uk)", "MEASURE", "PART (37 part names)", "SIDE", "COPY.part", "COPY.year", "COPY.compare", "COPY.hub", "TOPIC_T (20 topics × 6 languages)", "COPY.topic", "COPY.country (7 chance levels)", "COPY.home", "LABELS"];
