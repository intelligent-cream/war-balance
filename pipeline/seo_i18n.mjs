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
    minGdp: "Gospodarki z PKB do {gdpMin} są pominięte, jak w rankingu na mapie.",
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
  eu: { de: ["EU-Länder", ["Ukraine-Hilfe der EU-Länder und Handel mit Russland", "EU: Ukraine-Hilfe und Handel mit Russland je Land"], "Die EU: das Geld jedes Mitglieds Richtung Ukraine oder Russland"], fr: ["Pays de l'UE", ["Aide de l'UE à l'Ukraine et commerce russe par pays", "UE : aide à l'Ukraine et commerce russe par pays"], "L'UE : l'argent de chaque membre vers l'Ukraine ou la Russie"], es: ["Países de la UE", ["Ayuda de la UE a Ucrania y comercio con Rusia por país", "UE: ayuda a Ucrania y comercio con Rusia por país"], "La UE: el dinero de cada miembro hacia Ucrania o Rusia"], pl: ["Kraje UE", ["Pomoc dla Ukrainy z UE i handel z Rosją według krajów", "UE: pomoc dla Ukrainy i handel z Rosją według krajów"], "UE: pieniądze każdego członka w stronę Ukrainy lub Rosji"], nl: ["EU-landen", ["EU-steun aan Oekraïne en handel met Rusland per land", "EU: steun aan Oekraïne en handel met Rusland per land"], "De EU: het geld van elk lid richting Oekraïne of Rusland"], uk: ["Країни ЄС", ["Допомога Україні від країн ЄС і торгівля з Росією", "ЄС: допомога Україні й торгівля з Росією за країнами"], "ЄС: гроші кожного члена на користь України чи Росії"] },
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
  "military-support-to-russia": { de: ["Waffen für Russland", ["{if:nArmed|{armedList}: Waffen für Russland|Wer liefert Russland Waffen? Drohnen, Granaten, Raketen}", "Wer liefert Russland Waffen? Drohnen, Granaten, Raketen"], "Wer liefert Russland Waffen? {if:nArmed|{armedList} und weitere Lieferungen seit 2022|Militärische Lieferungen seit 2022}"], fr: ["Armes envoyées à la Russie", ["{if:nArmed|{armedList} : armes pour la Russie|Qui envoie des armes à la Russie ? Drones, obus, missiles}", "Qui envoie des armes à la Russie ? Drones, obus, missiles"], "Qui envoie des armes à la Russie ? {if:nArmed|{armedList} et autres livraisons depuis 2022|Les livraisons depuis 2022}"], es: ["Armas enviadas a Rusia", ["{if:nArmed|{armedList}: armas para Rusia|¿Quién envía armas a Rusia? Drones, proyectiles, misiles}", "¿Quién envía armas a Rusia? Drones, proyectiles, misiles"], "¿Quién envía armas a Rusia? {if:nArmed|{armedList} y otras entregas desde 2022|Las entregas desde 2022}"], pl: ["Broń wysyłana do Rosji", ["{if:nArmed|{armedList}: broń dla Rosji|Kto wysyła Rosji broń? Drony, pociski, rakiety}", "Kto wysyła Rosji broń? Drony, pociski, rakiety"], "Kto wysyła Rosji broń? {if:nArmed|{armedList} i inne dostawy od 2022 roku|Dostawy wojskowe od 2022 roku}"], nl: ["Wapens naar Rusland", ["{if:nArmed|{armedList}: wapens voor Rusland|Wie levert Rusland wapens? Drones, granaten, raketten}", "Wie levert Rusland wapens? Drones, granaten, raketten"], "Wie levert Rusland wapens? {if:nArmed|{armedList} en andere leveringen sinds 2022|Militaire leveringen sinds 2022}"], uk: ["Зброя для Росії", ["{if:nArmed|{armedList}: зброя для Росії|Хто постачає Росії зброю? Дрони, снаряди, ракети}", "Хто постачає Росії зброю? Дрони, снаряди, ракети"], "Хто постачає Росії зброю? {if:nArmed|{armedList} та інші поставки з 2022 року|Військові поставки з 2022 року}"] },
  "russian-oil-discount": { de: ["Rabatt auf russisches Öl", "Ölpreisdeckel: Wer bekam russisches Öl mit Rabatt?", "Hat der Ölpreisdeckel gewirkt? Wer russisches Öl mit Rabatt kaufte"], fr: ["Rabais sur le pétrole russe", "Plafond du prix du pétrole russe : qui a eu le rabais ?", "Le plafonnement a-t-il marché ? Qui a eu le pétrole russe au rabais"], es: ["Descuento del petróleo ruso", "Tope al crudo ruso: ¿quién compró con descuento?", "¿Funcionó el tope? Quién compró petróleo ruso con descuento"], pl: ["Rabat na rosyjską ropę", "Limit cen ropy: kto kupował rosyjską ropę z rabatem?", "Czy limit cen zadziałał? Kto kupował rosyjską ropę z rabatem"], nl: ["Korting op Russische olie", "Olieprijsplafond: wie kocht Russische olie met korting?", "Werkte het prijsplafond? Wie kocht Russische olie met korting"], uk: ["Знижка на російську нафту", "Цінова стеля на нафту: хто купував зі знижкою?", "Чи спрацювала цінова стеля? Хто купував російську нафту зі знижкою"] },
  "russian-oil-via-third-countries": { de: ["Russisches Öl über Drittländer", "Russisches Öl aus Indien und der Türkei: Wer kaufte es?", "Russisches Öl durch die Hintertür: Wer kaufte daraus raffinierten Kraftstoff?"], fr: ["Pétrole russe via des pays tiers", "Pétrole russe raffiné en Inde et en Turquie : qui l'achète ?", "Le pétrole russe par la porte de derrière : qui a acheté le carburant raffiné ?"], es: ["Petróleo ruso vía terceros países", "Petróleo ruso refinado en India y Turquía: ¿quién lo compra?", "Petróleo ruso por la puerta de atrás: ¿quién compró el combustible refinado?"], pl: ["Rosyjska ropa przez kraje trzecie", "Rosyjska ropa rafinowana w Indiach i Turcji: kto ją kupił?", "Rosyjska ropa tylnymi drzwiami: kto kupił paliwo z rosyjskiej ropy?"], nl: ["Russische olie via derde landen", "Russische olie geraffineerd in India en Turkije: wie kocht het?", "Russische olie via de achterdeur: wie kocht brandstof uit Russische ruwe olie?"], uk: ["Російська нафта через треті країни", "Російська нафта з Індії й Туреччини: хто її купував?", "Російська нафта з чорного ходу: хто купував пальне з російської сировини?"] },
  "russia-trade-hubs": { de: ["Re-Exporte und Sanktionsumgehung", ["Re-Exporte und Sanktionsumgehung: VAE, Türkei, Kasachstan", "Sanktionen und Re-Export-Drehscheiben: VAE, Türkei, Kasachstan"], "Re-Exporte nach Russland und Sanktionsumgehung: was durch VAE, Türkei und Zentralasien geht"], fr: ["Réexportations et contournement des sanctions", ["Contournement des sanctions : EAU, Turquie, Kazakhstan", "Sanctions et plaques tournantes : EAU, Turquie, Kazakhstan"], "Réexportations à destination de la Russie et contournement des sanctions : ce qui passe par les EAU, la Turquie et l'Asie centrale"], es: ["Reexportaciones y evasión de sanciones", ["Evasión de sanciones y reexportación: EAU, Turquía, Kazajistán", "Sanciones y centros de reexportación: EAU, Turquía, Kazajistán"], "Reexportaciones a Rusia y evasión de sanciones: lo que pasa por EAU, Turquía y Asia Central"], pl: ["Reeksport i omijanie sankcji", ["Reeksport i omijanie sankcji: ZEA, Turcja, Kazachstan", "Sankcje i huby reeksportu: ZEA, Turcja, Kazachstan"], "Reeksport do Rosji i omijanie sankcji: co przechodzi przez ZEA, Turcję i Azję Środkową"], nl: ["Wederuitvoer en sanctieontwijking", ["Wederuitvoer en sanctieontwijking: VAE, Turkije, Kazachstan", "Sancties en doorvoerknooppunten: VAE, Turkije, Kazachstan"], "Wederuitvoer naar Rusland en sanctieontwijking: wat via de VAE, Turkije en Centraal-Azië gaat"], uk: ["Реекспорт і обхід санкцій", ["Реекспорт і обхід санкцій: ОАЕ, Туреччина, Казахстан", "Санкції та хаби реекспорту: ОАЕ, Туреччина, Казахстан"], "Реекспорт до Росії й обхід санкцій: що йде через ОАЕ, Туреччину й Центральну Азію"] },
};

// a topic or group page in another language: its description and intro from the table, in that language
// round 58: a title may list forms (the first that fits is used), and the title and heading may hold the page's own
// values: {armedList} with the value nArmed (the countries whose research names the kinds of supplies they sent)
export function topicCopyLang(l, e, { n, top, topV, measure, unitKey, dataTo, sumUa, sumNetPct, net = 0, isGroup, armedList = "", nArmed = 0 }) {
  const [label, title, h1] = (TOPIC_T[e.slug] || {})[l] || [e.label, e.label, e.label];
  const v = { label, n, measure, unit: s(l, "unit")[unitKey], dataTo, t1: top[0] || "", topV, tops: list3(l, top.slice(0, 3)), sumUa, sumNetPct, armedList }, T = C(l, ["topic"]);
  const own = { nArmed };
  const d = fmtAll(T.description, v);
  return { label, title: fitTitle([...fmtAll(title, v, own), label]), description: fitDesc(v.t1 ? d : d.slice(1)), h1: fmt(h1, v, own), intro: fmt(isGroup ? T.introGroup : T.introTopic, v, { net }) };
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
    intro: cat === "nodata" ? (T.introNoData ? one(T.introNoData) : "") : one(cat === "party" ? T.introParty : T.intro) };
}
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
    licence: "Data: {link}, CC BY 4.0.", smaller: "Economies with a GDP under {gdpMin}", smallerNote: "The map's ranking leaves them out by default (Filters › Size), because small amounts swing their shares widely. Each with its group.",
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

// ----- round 57b (richer country pages, approved by the owner): the words of the country page's sections and of its
// question pool (seo_country.mjs), in all seven languages. Every sentence about the country that the map already says
// is the map's own (seo_extract.mjs dyn: storyTags, decideLine, frozenLine, sanctionNote, kielLine, the markers ...);
// here are only the section titles, the frames of the figures the panel shows as tables (trade before and after,
// refugees, loans, the parts, the ranks) and the questions. Values: {Nt} {N} the name; figures are filled by the code
// (each marked with the model quantity it shows, checked by check 48); {if:...} picks the data's words.
const DYN = {
  en: {
    tDecide: "What decides this number", tTrade: "Trade with Russia before and after", tSanctions: "Sanctions, Russia's own cut-offs, or a choice",
    tEnergy: "The cost of switching away from Russian energy", tRefugees: "Refugees from Ukraine", tKiel: "Why this differs from the Kiel tracker",
    tFlowback: "Money flowing back from the war effort", tBusiness: "Companies, Russia and Russian owners", tIndirect: "Indirect channels: hubs, refined oil, shipping",
    tPeers: "Compared with its neighbours and groups", tBacking: "How the number is backed", tSources: "Sources, by part",
    zeroSize: "Here the size of the net is the finding, not its direction: {range}.",
    yearBig: "{if:nYears>=2|The year with the largest net amount was {y}|The one year with a net amount of note was {y}}: {v}.",
    yearUa: "Support for Ukraine {if:ua1~ua0|was about the same in {y0} and {y1}: {b}|{if:ua1>ua0|rose|fell} from {a} in {y0} to {b} in {y1}}.",
    yearSmall: "The yearly amounts are small against the range of the total, so their side from one year to the next is not a finding.",
    yearSides: "The yearly net amount changed side: {list}.",
    tradeBought: "It bought {b0} from Russia in {y0} and {b1} in {y1}{if:chgOk| ({chg})|}.",
    tradeSold: "It sold {s0} to Russia in {y0} and {s1} in {y1}{if:chgOk| ({chg})|}.",
    tradeFuel: "Before the war ({years}), fuel was {fs} of what it bought from Russia.",
    tradeNote: "These are sales values at each year's prices; the totals count what the seller kept on them.",
    energyPremium: "Replacing Russian energy cost it about {v} extra from 2022 ({p} of one year's GDP).",
    energyDiscount: "Russian oil bought at a war-time discount saved it about {v}.",
    energyNote: "{if:both|Neither is in the totals|This is not in the totals}: shown for information.",
    refCost: "Counted as support for Ukraine: {v} ({p} of one year's GDP), the public cost of hosting refugees from 2022, after the taxes working refugees pay.",
    refDate: "Refugees counted as of {d}.",
    kielLoans: "{lf}: {face}; {lg}: {ge}.",
    kielPledged: "{label}, in the Kiel Institute's figures: {v}. It is not counted here.",
    flowback: "{gross} of aid and of Ukraine's purchases was spent in {Nt}; what its firms kept of it, {kept}, is taken off its support.",
    partLine: "{name}: {v} ({p} of one year's GDP).",
    peersRank: "In the map's ranking: number {n} of {of} economies {side}, as a share of GDP.",
    peersNoRank: "Its direction is {word}, so the map's ranking gives it no number.",
    peersGroup: "{group}: number {n} of {of} members {side}.",
    neighbours: "Neighbours by land", similar: "In its region, with the same chance and direction: the nearest net shares of GDP", thNet: "Net, % of GDP",
    backTiers: "{n} sources back its parts: {off} official statistics, {res} research reports, {press} press reports and {own} of this project's own estimates{if:m|, plus {m} method inputs|}.",
    backShare: "By size, {ab} of its parts are reported or measured (A–B), {c} modelled (C) and {d} rough indications (D).",
    tierOfficial: "official", tierResearch: "research", tierPress: "press", tierOwn: "own estimate", tierMethod: "method input",
    srcAll: "Every source of its parts",
    qGave: "How much has {Nt} given Ukraine?",
    aGave: "{if:tiny|Almost nothing that can be measured: {ua} since 2022 ({uaP} of one year's GDP).|{NtCap}'s support for Ukraine from 2022 to {dataTo}: {ua}, {uaP} of one year's GDP ({uaRange}). It counts {if:eu|its own aid, its share of EU aid and the cost of hosting refugees|its aid and the cost of hosting refugees}, net of money flowing back; loans count at their gift value.}",
    qTrade: "Does {Nt} trade with Russia?",
    aTrade: "It bought {b1} from Russia in {y1} ({b0} in {y0}){if:sold|, and sold {s1} to Russia|}. What counts here is the change in what Russia kept from that trade (taxes and profit, not sales) against a world without the war: {kept}.",
    qHelp: "Is {Nt} helping Russia?",
    aHelp: "{if:party|{partyWhy} |}In money terms the net is {netSigned} of one year's GDP ({netWords}).{if:chance| {chance}|} {keptCap}.{if:fair| {fair}|}{if:armed| Weapons and troops it sent to Russia (about {armedEur} at full value) are listed on Russia's panel; in the totals they count at the seller's gain.|} The number counts money: arms deliveries, troops and diplomacy are not in it.",
    qDecide: "What decides {Nt}'s number?", aDecide: "{chance} {why} {flip}",
    qClose: "Why is {Nt}'s net so small?", aClose: "Its net is {zeroWord}: {netSigned} of one year's GDP ({range}). {why}",
    qOilgas: "Does {Nt} still buy Russian oil and gas?",
    aOilgas: "Before the war ({years}), fuel was {fs} of what it bought from Russia. In {y1} it bought {b1} of fuel and other goods from Russia, against {b0} in {y0}; this data has no split by fuel for {y1}.",
    qFrozen: "How much Russian money is frozen in {Nt}?", aFrozen: "{frozen}",
    qRefugees: "How many Ukrainian refugees does {Nt} host, and what does it cost?", aRefugees: "{hosted} {cost}{if:gross| {gross}|}{if:perYear| {perYear}|}",
    qKiel: "Why does War Balance differ from the Kiel tracker for {Nt}?", aKiel: "{kiel}",
    qYears: "How much did {Nt} give Ukraine each year?", aYears: "Support for Ukraine by year: {list}. In total since 2022: {ua} ({uaRange}).",
    qCompare: "How does {Nt} compare with its neighbours?", aCompare: "The net as a share of one year's GDP: {list}.{if:ranked| {rank}|}",
    qSources: "Where do the numbers for {Nt} come from?",
    aSources: "{n} sources back its parts, {off} of them official statistics. By part: {list}. The map's panel lists every one, with its documents.",
    qHub: "Does {Nt} help Russia get around sanctions?", aHub: "{hub}{if:chpl| {chpl}|}",
    qSanctions: "Did {Nt} cut trade with Russia because of sanctions?", aSanctions: "{sanction}{if:exempt| {exempt}|}",
    qNodata: "Why is there no number for {Nt}?", aNodata: "{text}",
  },
  de: {
    tDecide: "Was diese Zahl entscheidet", tTrade: "Handel mit Russland: vorher und nachher", tSanctions: "Sanktionen, Russlands eigene Lieferstopps oder eine Entscheidung",
    tEnergy: "Was der Abschied von russischer Energie kostete", tRefugees: "Geflüchtete aus der Ukraine", tKiel: "Warum die Zahl vom Kiel-Tracker abweicht",
    tFlowback: "Geld, das aus der Kriegshilfe zurückfließt", tBusiness: "Unternehmen, Russland und russische Eigentümer", tIndirect: "Indirekte Wege: Drehscheiben, raffiniertes Öl, Schifffahrt",
    tPeers: "Im Vergleich mit Nachbarn und Gruppen", tBacking: "Worauf die Zahl beruht", tSources: "Quellen nach Teil",
    zeroSize: "Hier ist die Größe des Saldos der Befund, nicht seine Richtung: {range}.",
    yearBig: "{if:nYears>=2|Den größten Saldo hatte das Jahr {y}|Einen nennenswerten Saldo hatte allein das Jahr {y}}: {v}.",
    yearUa: "Die Unterstützung für die Ukraine {if:ua1~ua0|war {y0} und {y1} etwa gleich: {b}|{if:ua1>ua0|stieg|sank} von {a} im Jahr {y0} auf {b} im Jahr {y1}}.",
    yearSmall: "Die Jahresbeträge sind klein gegenüber der Spanne der Summe; auf welcher Seite sie von Jahr zu Jahr liegen, ist daher kein Befund.",
    yearSides: "Der Saldo eines Jahres wechselte die Seite: {list}.",
    tradeBought: "Es kaufte {y0} für {b0} aus Russland und {y1} für {b1}{if:chgOk| ({chg})|}.",
    tradeSold: "Es verkaufte {y0} für {s0} nach Russland und {y1} für {s1}{if:chgOk| ({chg})|}.",
    tradeFuel: "Vor dem Krieg ({years}) machten Brennstoffe {fs} seiner Käufe aus Russland aus.",
    tradeNote: "Das sind Verkaufswerte zu den Preisen des jeweiligen Jahres; die Summen zählen, was der Verkäufer daran behielt.",
    energyPremium: "Der Ersatz russischer Energie kostete es seit 2022 etwa {v} zusätzlich ({p} eines Jahres-BIP).",
    energyDiscount: "Russisches Öl mit kriegsbedingtem Rabatt sparte ihm etwa {v}.",
    energyNote: "{if:both|Beides ist nicht in den Summen|Das ist nicht in den Summen}: zur Information.",
    refCost: "Als Unterstützung für die Ukraine gezählt: {v} ({p} eines Jahres-BIP), die öffentlichen Kosten der Aufnahme von Geflüchteten seit 2022, nach den Steuern, die arbeitende Geflüchtete zahlen.",
    refDate: "Gezählte Geflüchtete, Stand {d}.",
    kielLoans: "{lf}: {face}; {lg}: {ge}.",
    kielPledged: "{label}, nach den Zahlen des Kiel Instituts: {v}. Hier nicht gezählt.",
    flowback: "{gross} aus Hilfe und Käufen der Ukraine flossen in die Wirtschaft dieses Landes; was seine Firmen davon behielten, {kept}, wird von seiner Unterstützung abgezogen.",
    partLine: "{name}: {v} ({p} eines Jahres-BIP).",
    peersRank: "In der Rangliste der Karte: Nummer {n} von {of} Volkswirtschaften {side}, gemessen am BIP.",
    peersNoRank: "Seine Richtung ist {word}, daher gibt ihm die Rangliste der Karte keine Nummer.",
    peersGroup: "{group}: Nummer {n} von {of} Mitgliedern {side}.",
    neighbours: "Nachbarn an Land", similar: "In seiner Region, mit gleicher Einstufung und Richtung: die nächstliegenden Salden", thNet: "Saldo, % des BIP",
    backTiers: "{n} Quellen stützen seine Teile: {off} amtliche Statistiken, {res} Forschungsberichte, {press} Presseberichte und {own} eigene Schätzungen dieses Projekts{if:m|, dazu {m} Methodeneingaben|}.",
    backShare: "Nach Größe sind {ab} seiner Teile gemeldet oder gemessen (A–B), {c} modelliert (C) und {d} grobe Anhaltspunkte (D).",
    tierOfficial: "amtlich", tierResearch: "Forschung", tierPress: "Presse", tierOwn: "eigene Schätzung", tierMethod: "Methode",
    srcAll: "Alle Quellen seiner Teile",
    qGave: "{N}: Wie viel Unterstützung für die Ukraine?",
    aGave: "{if:tiny|Kaum etwas Messbares: {ua} seit 2022 ({uaP} eines Jahres-BIP).|Unterstützung für die Ukraine von 2022 bis {dataTo}: {ua}, {uaP} eines Jahres-BIP ({uaRange}). Darin sind {if:eu|eigene Hilfe, der Anteil an der EU-Hilfe und die Kosten der Aufnahme von Geflüchteten|Hilfe und die Kosten der Aufnahme von Geflüchteten}, abzüglich des zurückfließenden Geldes; Kredite zählen zu ihrem Zuschusswert.}",
    qTrade: "{N}: Gibt es Handel mit Russland?",
    aTrade: "Es kaufte {y1} für {b1} aus Russland ({y0}: {b0}){if:sold| und verkaufte für {s1} nach Russland|}. Gezählt wird hier die Veränderung dessen, was Russland aus diesem Handel behielt (Steuern und Gewinn, nicht der Umsatz), verglichen mit einer Welt ohne Krieg: {kept}.",
    qHelp: "{N}: Hilft dieses Land Russland?",
    aHelp: "{if:party|{partyWhy} |}In Geld gemessen beträgt der Saldo {netSigned} eines Jahres-BIP ({netWords}).{if:chance| {chance}|} {keptCap}.{if:fair| {fair}|}{if:armed| Waffen und Truppen, die es Russland schickte (etwa {armedEur} zum vollen Wert), stehen im Bereich Russlands; in den Summen zählen sie zum Gewinn des Verkäufers.|} Die Zahl misst Geld: Waffenlieferungen, Truppen und Diplomatie sind nicht enthalten.",
    qDecide: "{N}: Was entscheidet die Zahl?", aDecide: "{chance} {why} {flip}",
    qClose: "{N}: Warum ist der Saldo so klein?", aClose: "Der Saldo ist {zeroWord}: {netSigned} eines Jahres-BIP ({range}). {why}",
    qOilgas: "{N}: Wird noch russisches Öl und Gas gekauft?",
    aOilgas: "Vor dem Krieg ({years}) machten Brennstoffe {fs} seiner Käufe aus Russland aus. {y1} kaufte es für {b1} Brennstoffe und andere Waren aus Russland, {y0} für {b0}; eine Aufteilung nach Brennstoff für {y1} enthalten diese Daten nicht.",
    qFrozen: "{N}: Wie viel russisches Geld ist eingefroren?", aFrozen: "{frozen}",
    qRefugees: "{N}: Wie viele ukrainische Geflüchtete, und was kostet das?", aRefugees: "{hosted} {cost}{if:gross| {gross}|}{if:perYear| {perYear}|}",
    qKiel: "{N}: Warum weicht War Balance vom Kiel-Tracker ab?", aKiel: "{kiel}",
    qYears: "{N}: Wie viel Unterstützung für die Ukraine in jedem Jahr?", aYears: "Unterstützung für die Ukraine nach Jahr: {list}. Insgesamt seit 2022: {ua} ({uaRange}).",
    qCompare: "{N}: Wie im Vergleich mit den Nachbarn?", aCompare: "Der Saldo als Anteil an einem Jahres-BIP: {list}.{if:ranked| {rank}|}",
    qSources: "{N}: Woher stammen die Zahlen?",
    aSources: "{n} Quellen stützen seine Teile, {off} davon amtliche Statistiken. Nach Teil: {list}. Der Bereich auf der Karte nennt jede, mit ihren Dokumenten.",
    qHub: "{N}: Hilft das Land Russland, Sanktionen zu umgehen?", aHub: "{hub}{if:chpl| {chpl}|}",
    qSanctions: "{N}: Wurde der Handel mit Russland wegen Sanktionen gekürzt?", aSanctions: "{sanction}{if:exempt| {exempt}|}",
    qNodata: "{N}: Warum gibt es keine Zahl?", aNodata: "{text}",
  },
  fr: {
    tDecide: "Ce qui décide ce chiffre", tTrade: "Commerce avec la Russie, avant et après", tSanctions: "Sanctions, coupures décidées par la Russie, ou choix",
    tEnergy: "Le coût de l'abandon de l'énergie russe", tRefugees: "Réfugiés d'Ukraine", tKiel: "Pourquoi ce chiffre diffère du suivi de Kiel",
    tFlowback: "L'argent qui revient de l'effort de guerre", tBusiness: "Entreprises, Russie et propriétaires russes", tIndirect: "Voies indirectes : plaques tournantes, pétrole raffiné, transport maritime",
    tPeers: "Comparé à ses voisins et à ses groupes", tBacking: "Sur quoi repose ce chiffre", tSources: "Sources, par composante",
    zeroSize: "Ici, c'est la taille du solde qui compte, pas son sens : {range}.",
    yearBig: "{if:nYears>=2|Le solde annuel le plus important date de {y}|Le seul solde annuel notable date de {y}} : {v}.",
    yearUa: "Le soutien à l'Ukraine {if:ua1~ua0|est resté à peu près le même en {y0} et en {y1} : {b}|{if:ua1>ua0|a progressé|a reculé}, passant de {a} en {y0} à {b} en {y1}}.",
    yearSmall: "Les montants annuels sont petits face à la fourchette du total : leur côté d'une année à l'autre n'est donc pas un résultat.",
    yearSides: "Le solde annuel a changé de côté : {list}.",
    tradeBought: "Il a acheté à la Russie pour {b0} en {y0} et pour {b1} en {y1}{if:chgOk| ({chg})|}.",
    tradeSold: "Il a vendu à la Russie pour {s0} en {y0} et pour {s1} en {y1}{if:chgOk| ({chg})|}.",
    tradeFuel: "Avant la guerre ({years}), les combustibles représentaient {fs} de ses achats à la Russie.",
    tradeNote: "Ce sont des valeurs de vente aux prix de chaque année ; les totaux comptent ce que le vendeur en a gardé.",
    energyPremium: "Remplacer l'énergie russe lui a coûté environ {v} de surcoût depuis 2022 ({p} d'une année de PIB).",
    energyDiscount: "Le pétrole russe acheté avec une décote de guerre lui a fait économiser environ {v}.",
    energyNote: "{if:both|Aucun de ces montants n'est dans les totaux|Ce montant n'est pas dans les totaux} : à titre d'information.",
    refCost: "Compté comme soutien à l'Ukraine : {v} ({p} d'une année de PIB), le coût public de l'accueil des réfugiés depuis 2022, après les impôts que paient les réfugiés qui travaillent.",
    refDate: "Réfugiés comptés : situation de {d}.",
    kielLoans: "{lf} : {face} ; {lg} : {ge}.",
    kielPledged: "{label}, selon les chiffres de l'Institut de Kiel : {v}. Ce montant n'est pas compté ici.",
    flowback: "{gross} d'aide et d'achats de l'Ukraine ont été dépensés dans son économie ; ce que ses entreprises en ont gardé, {kept}, est retiré de son soutien.",
    partLine: "{name} : {v} ({p} d'une année de PIB).",
    peersRank: "Dans le classement de la carte : numéro {n} sur {of} économies {side}, en part du PIB.",
    peersNoRank: "Son sens est {word} : le classement de la carte ne lui donne donc pas de numéro.",
    peersGroup: "{group} : numéro {n} sur {of} membres {side}.",
    neighbours: "Voisins terrestres", similar: "Dans sa région, même niveau et même sens : soldes proches en part du PIB", thNet: "Solde, % du PIB",
    backTiers: "{n} sources étayent ses composantes : {off} statistiques officielles, {res} rapports de recherche, {press} articles de presse et {own} estimations propres à ce projet{if:m|, ainsi que {m} données de méthode|}.",
    backShare: "En taille, {ab} de ses composantes sont déclarées ou mesurées (A–B), {c} modélisées (C) et {d} des indications approximatives (D).",
    tierOfficial: "officielle", tierResearch: "recherche", tierPress: "presse", tierOwn: "estimation propre", tierMethod: "méthode",
    srcAll: "Toutes les sources de ses composantes",
    qGave: "{N} : combien d'aide à l'Ukraine ?",
    aGave: "{if:tiny|Presque rien de mesurable : {ua} depuis 2022 ({uaP} d'une année de PIB).|Soutien à l'Ukraine de 2022 à {dataTo} : {ua}, {uaP} d'une année de PIB ({uaRange}). Cela compte {if:eu|son aide propre, sa part de l'aide de l'UE et le coût de l'accueil des réfugiés|son aide et le coût de l'accueil des réfugiés}, moins l'argent qui revient ; les prêts comptent pour leur valeur de don.}",
    qTrade: "{N} : ce pays commerce-t-il avec la Russie ?",
    aTrade: "Il a acheté à la Russie pour {b1} en {y1} ({b0} en {y0}){if:sold| et lui a vendu pour {s1}|}. Ce qui compte ici, c'est la variation de ce que la Russie a gardé de ce commerce (impôts et profits, pas les ventes) par rapport à un monde sans guerre : {kept}.",
    qHelp: "{N} : ce pays aide-t-il la Russie ?",
    aHelp: "{if:party|{partyWhy} |}En argent, le solde est de {netSigned} d'une année de PIB ({netWords}).{if:chance| {chance}|} {keptCap}.{if:fair| {fair}|}{if:armed| Les armes et les troupes qu'il a envoyées à la Russie (environ {armedEur} en valeur pleine) figurent dans le panneau de la Russie ; dans les totaux, elles comptent pour le gain du vendeur.|} Le chiffre mesure de l'argent : livraisons d'armes, troupes et diplomatie n'y figurent pas.",
    qDecide: "{N} : qu'est-ce qui décide ce chiffre ?", aDecide: "{chance} {why} {flip}",
    qClose: "{N} : pourquoi ce solde est-il si petit ?", aClose: "Le solde est {zeroWord} : {netSigned} d'une année de PIB ({range}). {why}",
    qOilgas: "{N} : ce pays achète-t-il encore du pétrole et du gaz russes ?",
    aOilgas: "Avant la guerre ({years}), les combustibles représentaient {fs} de ses achats à la Russie. En {y1}, il a acheté à la Russie pour {b1} de combustibles et d'autres biens, contre {b0} en {y0} ; ces données ne détaillent pas les combustibles pour {y1}.",
    qFrozen: "{N} : combien d'argent russe est gelé ?", aFrozen: "{frozen}",
    qRefugees: "{N} : combien de réfugiés ukrainiens, et à quel coût ?", aRefugees: "{hosted} {cost}{if:gross| {gross}|}{if:perYear| {perYear}|}",
    qKiel: "{N} : pourquoi War Balance diffère-t-il du suivi de Kiel ?", aKiel: "{kiel}",
    qYears: "{N} : combien d'aide à l'Ukraine chaque année ?", aYears: "Soutien à l'Ukraine par année : {list}. Au total depuis 2022 : {ua} ({uaRange}).",
    qCompare: "{N} : que donne la comparaison avec ses voisins ?", aCompare: "Le solde en part d'une année de PIB : {list}.{if:ranked| {rank}|}",
    qSources: "{N} : d'où viennent les chiffres ?",
    aSources: "{n} sources étayent ses composantes, dont {off} statistiques officielles. Par composante : {list}. Le panneau de la carte les cite toutes, avec leurs documents.",
    qHub: "{N} : ce pays aide-t-il la Russie à contourner les sanctions ?", aHub: "{hub}{if:chpl| {chpl}|}",
    qSanctions: "{N} : le commerce avec la Russie a-t-il reculé à cause des sanctions ?", aSanctions: "{sanction}{if:exempt| {exempt}|}",
    qNodata: "{N} : pourquoi n'y a-t-il pas de chiffre ?", aNodata: "{text}",
  },
  es: {
    tDecide: "Qué decide esta cifra", tTrade: "Comercio con Rusia, antes y después", tSanctions: "Sanciones, cortes de la propia Rusia o una decisión",
    tEnergy: "El coste de dejar la energía rusa", tRefugees: "Refugiados de Ucrania", tKiel: "Por qué difiere del rastreador de Kiel",
    tFlowback: "Dinero que vuelve del esfuerzo de guerra", tBusiness: "Empresas, Rusia y propietarios rusos", tIndirect: "Vías indirectas: centros de reexportación, petróleo refinado, transporte marítimo",
    tPeers: "Comparado con sus vecinos y grupos", tBacking: "En qué se basa la cifra", tSources: "Fuentes, por componente",
    zeroSize: "Aquí lo relevante es el tamaño del saldo, no su dirección: {range}.",
    yearBig: "{if:nYears>=2|El saldo anual de mayor tamaño fue el de {y}|El único saldo anual notable fue el de {y}}: {v}.",
    yearUa: "El apoyo a Ucrania {if:ua1~ua0|fue casi el mismo en {y0} y en {y1}: {b}|{if:ua1>ua0|subió|bajó} de {a} en {y0} a {b} en {y1}}.",
    yearSmall: "Los importes anuales son pequeños frente al rango del total, así que su lado de un año a otro no es un resultado.",
    yearSides: "El saldo anual cambió de lado: {list}.",
    tradeBought: "Compró a Rusia {b0} en {y0} y {b1} en {y1}{if:chgOk| ({chg})|}.",
    tradeSold: "Vendió a Rusia {s0} en {y0} y {s1} en {y1}{if:chgOk| ({chg})|}.",
    tradeFuel: "Antes de la guerra ({years}), los combustibles eran el {fs} de lo que compraba a Rusia.",
    tradeNote: "Son valores de venta a precios de cada año; los totales cuentan lo que el vendedor se quedó de ellos.",
    energyPremium: "Sustituir la energía rusa le costó unos {v} extra desde 2022 ({p} de un año de PIB).",
    energyDiscount: "Comprar petróleo ruso con descuento de guerra le ahorró unos {v}.",
    energyNote: "{if:both|Estos importes quedan fuera de los totales|Este importe queda fuera de los totales}: se muestra a título informativo.",
    refCost: "Contado como apoyo a Ucrania: {v} ({p} de un año de PIB), el coste público de acoger refugiados desde 2022, tras los impuestos que pagan los refugiados que trabajan.",
    refDate: "Refugiados contados a fecha de {d}.",
    kielLoans: "{lf}: {face}; {lg}: {ge}.",
    kielPledged: "{label}, según las cifras del Instituto de Kiel: {v}. No se cuenta aquí.",
    flowback: "{gross} de ayuda y de compras de Ucrania se gastaron en su economía; lo que sus empresas se quedaron, {kept}, se resta de su apoyo.",
    partLine: "{name}: {v} ({p} de un año de PIB).",
    peersRank: "En la clasificación del mapa: número {n} de {of} economías {side}, en proporción al PIB.",
    peersNoRank: "Su dirección es {word}, así que la clasificación del mapa no le da número.",
    peersGroup: "{group}: número {n} de {of} miembros {side}.",
    neighbours: "Vecinos por tierra", similar: "En su región, con el mismo nivel y la misma dirección: saldos cercanos en proporción al PIB", thNet: "Saldo, % del PIB",
    backTiers: "{n} fuentes respaldan sus componentes: {off} estadísticas oficiales, {res} informes de investigación, {press} noticias de prensa y {own} estimaciones propias de este proyecto{if:m|, además de {m} datos de método|}.",
    backShare: "Por tamaño, el {ab} de sus componentes son declarados o medidos (A–B), el {c} modelados (C) y el {d} indicaciones aproximadas (D).",
    tierOfficial: "oficial", tierResearch: "investigación", tierPress: "prensa", tierOwn: "estimación propia", tierMethod: "método",
    srcAll: "Todas las fuentes de sus componentes",
    qGave: "{N}: ¿cuánta ayuda a Ucrania?",
    aGave: "{if:tiny|Casi nada que se pueda medir: {ua} desde 2022 ({uaP} de un año de PIB).|Apoyo a Ucrania de 2022 a {dataTo}: {ua}, {uaP} de un año de PIB ({uaRange}). Incluye {if:eu|su propia ayuda, su parte de la ayuda de la UE y el coste de acoger refugiados|su ayuda y el coste de acoger refugiados}, menos el dinero que vuelve; los préstamos cuentan por su valor de donación.}",
    qTrade: "{N}: ¿comercia con Rusia?",
    aTrade: "Compró a Rusia {b1} en {y1} ({b0} en {y0}){if:sold| y le vendió {s1}|}. Lo que cuenta aquí es el cambio en lo que Rusia se quedó de ese comercio (impuestos y beneficios, no ventas) frente a un mundo sin guerra: {kept}.",
    qHelp: "{N}: ¿ayuda a Rusia?",
    aHelp: "{if:party|{partyWhy} |}En dinero, el saldo es {netSigned} de un año de PIB ({netWords}).{if:chance| {chance}|} {keptCap}.{if:fair| {fair}|}{if:armed| Las armas y tropas que envió a Rusia (unos {armedEur} a valor completo) figuran en el panel de Rusia; en los totales cuentan por la ganancia del vendedor.|} La cifra mide dinero: no incluye entregas de armas, tropas ni diplomacia.",
    qDecide: "{N}: ¿qué decide la cifra?", aDecide: "{chance} {why} {flip}",
    qClose: "{N}: ¿por qué es tan pequeño el saldo?", aClose: "El saldo es {zeroWord}: {netSigned} de un año de PIB ({range}). {why}",
    qOilgas: "{N}: ¿sigue comprando petróleo y gas rusos?",
    aOilgas: "Antes de la guerra ({years}), los combustibles eran el {fs} de lo que compraba a Rusia. En {y1} compró a Rusia {b1} en combustibles y otros bienes, frente a {b0} en {y0}; estos datos no separan los combustibles en {y1}.",
    qFrozen: "{N}: ¿cuánto dinero ruso está congelado?", aFrozen: "{frozen}",
    qRefugees: "{N}: ¿cuántos refugiados ucranianos acoge y cuánto cuesta?", aRefugees: "{hosted} {cost}{if:gross| {gross}|}{if:perYear| {perYear}|}",
    qKiel: "{N}: ¿por qué War Balance difiere del rastreador de Kiel?", aKiel: "{kiel}",
    qYears: "{N}: ¿cuánta ayuda a Ucrania cada año?", aYears: "Apoyo a Ucrania por año: {list}. En total desde 2022: {ua} ({uaRange}).",
    qCompare: "{N}: ¿cómo se compara con sus vecinos?", aCompare: "El saldo en proporción a un año de PIB: {list}.{if:ranked| {rank}|}",
    qSources: "{N}: ¿de dónde salen las cifras?",
    aSources: "{n} fuentes respaldan sus componentes, {off} de ellas estadísticas oficiales. Por componente: {list}. El panel del mapa las enumera todas, con sus documentos.",
    qHub: "{N}: ¿ayuda a Rusia a sortear las sanciones?", aHub: "{hub}{if:chpl| {chpl}|}",
    qSanctions: "{N}: ¿recortó el comercio con Rusia por las sanciones?", aSanctions: "{sanction}{if:exempt| {exempt}|}",
    qNodata: "{N}: ¿por qué no hay cifra?", aNodata: "{text}",
  },
  pl: {
    tDecide: "Co przesądza o tej liczbie", tTrade: "Handel z Rosją przed wojną i w jej trakcie", tSanctions: "Sankcje, odcięcia przez samą Rosję czy własny wybór",
    tEnergy: "Koszt odejścia od rosyjskiej energii", tRefugees: "Uchodźcy z Ukrainy", tKiel: "Dlaczego liczba różni się od trackera z Kilonii",
    tFlowback: "Pieniądze wracające z wysiłku wojennego", tBusiness: "Firmy, Rosja i rosyjscy właściciele", tIndirect: "Kanały pośrednie: huby, rafinowana ropa, żegluga",
    tPeers: "Na tle sąsiadów i grup", tBacking: "Na czym opiera się ta liczba", tSources: "Źródła według składnika",
    zeroSize: "Tu wnioskiem jest wielkość salda, a nie jego kierunek: {range}.",
    yearBig: "{if:nYears>=2|Największe saldo roczne przypadło na {y}|Jedyne znaczące saldo roczne przypadło na {y}}: {v}.",
    yearUa: "Wsparcie dla Ukrainy {if:ua1~ua0|było w {y0} i {y1} podobne: {b}|{if:ua1>ua0|wzrosło|spadło} z {a} w {y0} do {b} w {y1}}.",
    yearSmall: "Kwoty roczne są małe wobec przedziału sumy, więc to, po której stronie wypadają z roku na rok, nie jest wnioskiem.",
    yearSides: "Saldo roczne zmieniało stronę: {list}.",
    tradeBought: "Zakupy z Rosji: {b0} w {y0} i {b1} w {y1}{if:chgOk| ({chg})|}.",
    tradeSold: "Sprzedaż do Rosji: {s0} w {y0} i {s1} w {y1}{if:chgOk| ({chg})|}.",
    tradeFuel: "Przed wojną ({years}) paliwa stanowiły {fs} zakupów z Rosji.",
    tradeNote: "To wartości sprzedaży w cenach każdego roku; sumy liczą to, co zatrzymał z nich sprzedawca.",
    energyPremium: "Zastąpienie rosyjskiej energii kosztowało ten kraj od 2022 r. dodatkowo około {v} ({p} rocznego PKB).",
    energyDiscount: "Rosyjska ropa kupowana z wojennym rabatem pozwoliła zaoszczędzić około {v}.",
    energyNote: "{if:both|Obie kwoty nie wchodzą do sum|Ta kwota nie wchodzi do sum}: podano je dla informacji.",
    refCost: "Liczone jako wsparcie dla Ukrainy: {v} ({p} rocznego PKB), publiczny koszt przyjęcia uchodźców od 2022 r., po odjęciu podatków płaconych przez pracujących uchodźców.",
    refDate: "Liczba uchodźców według stanu na {d}.",
    kielLoans: "{lf}: {face}; {lg}: {ge}.",
    kielPledged: "{label}, według danych Instytutu Kilońskiego: {v}. Nie jest to tu liczone.",
    flowback: "{gross} z pomocy i zakupów Ukrainy wydano w gospodarce tego kraju; to, co zatrzymały z tego jego firmy, {kept}, odejmuje się od jego wsparcia.",
    partLine: "{name}: {v} ({p} rocznego PKB).",
    peersRank: "W rankingu mapy: numer {n} z {of} gospodarek {side}, w relacji do PKB.",
    peersNoRank: "Kierunek: {word}, więc ranking mapy nie nadaje temu krajowi numeru.",
    peersGroup: "{group}: numer {n} z {of} członków {side}.",
    neighbours: "Sąsiedzi lądowi", similar: "W tym samym regionie, z tym samym poziomem i kierunkiem: najbliższe salda w relacji do PKB", thNet: "Saldo, % PKB",
    backTiers: "Źródła składników: {n}; statystyki oficjalne: {off}, raporty badawcze: {res}, doniesienia prasowe: {press}, własne szacunki projektu: {own}{if:m|, dane metody: {m}|}.",
    backShare: "Według wielkości: {ab} składników to dane raportowane lub mierzone (A–B), {c} modelowane (C), {d} przybliżone wskazania (D).",
    tierOfficial: "oficjalne", tierResearch: "badania", tierPress: "prasa", tierOwn: "własny szacunek", tierMethod: "metoda",
    srcAll: "Wszystkie źródła składników",
    qGave: "{N}: ile wsparcia dla Ukrainy?",
    aGave: "{if:tiny|Prawie nic mierzalnego: {ua} od 2022 r. ({uaP} rocznego PKB).|Wsparcie dla Ukrainy od 2022 r. do {dataTo}: {ua}, {uaP} rocznego PKB ({uaRange}). Obejmuje {if:eu|własną pomoc, udział w pomocy UE i koszt przyjęcia uchodźców|pomoc i koszt przyjęcia uchodźców}, po odjęciu pieniędzy, które wróciły; pożyczki liczone są według wartości darowizny.}",
    qTrade: "{N}: czy handluje z Rosją?",
    aTrade: "Zakupy z Rosji: {b1} w {y1} ({b0} w {y0}){if:sold|, sprzedaż do Rosji: {s1}|}. Liczy się tu zmiana tego, co Rosja zatrzymała z tego handlu (podatki i zysk, nie sprzedaż), wobec świata bez wojny: {kept}.",
    qHelp: "{N}: czy ten kraj pomaga Rosji?",
    aHelp: "{if:party|{partyWhy} |}W pieniądzu saldo wynosi {netSigned} rocznego PKB ({netWords}).{if:chance| {chance}|} {keptCap}.{if:fair| {fair}|}{if:armed| Broń i wojska wysłane do Rosji (około {armedEur} według pełnej wartości) są wymienione w panelu Rosji; w sumach liczą się według zysku sprzedawcy.|} Liczba mierzy pieniądze: dostawy broni, wojska i dyplomacja nie są w niej ujęte.",
    qDecide: "{N}: co przesądza o tej liczbie?", aDecide: "{chance} {why} {flip}",
    qClose: "{N}: dlaczego saldo jest tak małe?", aClose: "Saldo: {zeroWord}, {netSigned} rocznego PKB ({range}). {why}",
    qOilgas: "{N}: czy nadal kupuje rosyjską ropę i gaz?",
    aOilgas: "Przed wojną ({years}) paliwa stanowiły {fs} zakupów z Rosji. W {y1} zakupy paliw i innych towarów z Rosji wyniosły {b1}, wobec {b0} w {y0}; te dane nie dzielą zakupów z {y1} według paliw.",
    qFrozen: "{N}: ile rosyjskich pieniędzy jest zamrożonych?", aFrozen: "{frozen}",
    qRefugees: "{N}: ilu uchodźców z Ukrainy i jaki koszt?", aRefugees: "{hosted} {cost}{if:gross| {gross}|}{if:perYear| {perYear}|}",
    qKiel: "{N}: dlaczego War Balance różni się od trackera z Kilonii?", aKiel: "{kiel}",
    qYears: "{N}: ile wsparcia dla Ukrainy w każdym roku?", aYears: "Wsparcie dla Ukrainy według lat: {list}. Łącznie od 2022 r.: {ua} ({uaRange}).",
    qCompare: "{N}: jak wypada na tle sąsiadów?", aCompare: "Saldo w relacji do rocznego PKB: {list}.{if:ranked| {rank}|}",
    qSources: "{N}: skąd pochodzą liczby?",
    aSources: "Źródła składników: {n}, w tym statystyki oficjalne: {off}. Według składnika: {list}. Panel mapy wymienia każde z nich, z dokumentami.",
    qHub: "{N}: czy pomaga Rosji obchodzić sankcje?", aHub: "{hub}{if:chpl| {chpl}|}",
    qSanctions: "{N}: czy handel z Rosją ograniczono z powodu sankcji?", aSanctions: "{sanction}{if:exempt| {exempt}|}",
    qNodata: "{N}: dlaczego nie ma liczby?", aNodata: "{text}",
  },
  nl: {
    tDecide: "Wat dit getal bepaalt", tTrade: "Handel met Rusland, voor en na", tSanctions: "Sancties, Ruslands eigen afsluitingen of een keuze",
    tEnergy: "Wat het afscheid van Russische energie kostte", tRefugees: "Vluchtelingen uit Oekraïne", tKiel: "Waarom dit afwijkt van de Kiel-tracker",
    tFlowback: "Geld dat terugvloeit uit de oorlogsinspanning", tBusiness: "Bedrijven, Rusland en Russische eigenaren", tIndirect: "Indirecte kanalen: knooppunten, geraffineerde olie, scheepvaart",
    tPeers: "Vergeleken met buren en groepen", tBacking: "Waar het getal op berust", tSources: "Bronnen, per onderdeel",
    zeroSize: "Hier is de omvang van het saldo de bevinding, niet de richting: {range}.",
    yearBig: "{if:nYears>=2|Het grootste jaarsaldo was in {y}|Het enige jaarsaldo van betekenis was in {y}}: {v}.",
    yearUa: "De steun aan Oekraïne {if:ua1~ua0|was in {y0} en {y1} ongeveer gelijk: {b}|{if:ua1>ua0|steeg|daalde} van {a} in {y0} naar {b} in {y1}}.",
    yearSmall: "De jaarbedragen zijn klein tegenover de bandbreedte van het totaal, dus aan welke kant ze van jaar tot jaar vallen, is geen bevinding.",
    yearSides: "Het jaarsaldo wisselde van kant: {list}.",
    tradeBought: "Het kocht in {y0} voor {b0} uit Rusland en in {y1} voor {b1}{if:chgOk| ({chg})|}.",
    tradeSold: "Het verkocht in {y0} voor {s0} aan Rusland en in {y1} voor {s1}{if:chgOk| ({chg})|}.",
    tradeFuel: "Voor de oorlog ({years}) was brandstof {fs} van wat het uit Rusland kocht.",
    tradeNote: "Dit zijn verkoopwaarden tegen de prijzen van elk jaar; de totalen tellen wat de verkoper eraan overhield.",
    energyPremium: "Russische energie vervangen kostte het sinds 2022 ongeveer {v} extra ({p} van een jaar-bbp).",
    energyDiscount: "Russische olie met oorlogskorting bespaarde het ongeveer {v}.",
    energyNote: "{if:both|Beide staan niet in de totalen|Dit staat niet in de totalen}: ter informatie.",
    refCost: "Geteld als steun aan Oekraïne: {v} ({p} van een jaar-bbp), de publieke kosten van de opvang van vluchtelingen sinds 2022, na de belastingen die werkende vluchtelingen betalen.",
    refDate: "Vluchtelingen geteld per {d}.",
    kielLoans: "{lf}: {face}; {lg}: {ge}.",
    kielPledged: "{label}, volgens de cijfers van het Kiel Instituut: {v}. Dit telt hier niet mee.",
    flowback: "{gross} aan hulp en Oekraïense aankopen werd in de eigen economie uitgegeven; wat de bedrijven ervan overhielden, {kept}, gaat van de steun af.",
    partLine: "{name}: {v} ({p} van een jaar-bbp).",
    peersRank: "In de ranglijst van de kaart: nummer {n} van {of} economieën {side}, als deel van het bbp.",
    peersNoRank: "De richting is {word}, dus de ranglijst van de kaart geeft het geen nummer.",
    peersGroup: "{group}: nummer {n} van {of} leden {side}.",
    neighbours: "Buren over land", similar: "In de eigen regio, met dezelfde inschatting en richting: saldi die dichtbij liggen, als deel van het bbp", thNet: "Saldo, % van het bbp",
    backTiers: "{n} bronnen onderbouwen de onderdelen: {off} officiële statistieken, {res} onderzoeksrapporten, {press} persberichten en {own} eigen schattingen van dit project{if:m|, plus {m} methode-invoer|}.",
    backShare: "Naar omvang is {ab} van de onderdelen gemeld of gemeten (A–B), {c} gemodelleerd (C) en {d} een ruwe indicatie (D).",
    tierOfficial: "officieel", tierResearch: "onderzoek", tierPress: "pers", tierOwn: "eigen schatting", tierMethod: "methode",
    srcAll: "Alle bronnen achter de onderdelen",
    qGave: "{N}: hoeveel steun voor Oekraïne?",
    aGave: "{if:tiny|Vrijwel niets meetbaars: {ua} sinds 2022 ({uaP} van een jaar-bbp).|Steun aan Oekraïne van 2022 tot {dataTo}: {ua}, {uaP} van een jaar-bbp ({uaRange}). Daarin zitten {if:eu|eigen hulp, het aandeel in EU-hulp en de kosten van de opvang van vluchtelingen|hulp en de kosten van de opvang van vluchtelingen}, min het geld dat terugvloeit; leningen tellen tegen hun schenkingswaarde.}",
    qTrade: "{N}: handelt het met Rusland?",
    aTrade: "Het kocht in {y1} voor {b1} uit Rusland ({y0}: {b0}){if:sold| en verkocht voor {s1} aan Rusland|}. Wat hier telt, is de verandering in wat Rusland aan die handel overhield (belastingen en winst, niet de omzet) tegenover een wereld zonder oorlog: {kept}.",
    qHelp: "{N}: helpt het Rusland?",
    aHelp: "{if:party|{partyWhy} |}In geld is het saldo {netSigned} van een jaar-bbp ({netWords}).{if:chance| {chance}|} {keptCap}.{if:fair| {fair}|}{if:armed| Wapens en troepen die het naar Rusland stuurde (ongeveer {armedEur} tegen volle waarde) staan in het paneel van Rusland; in de totalen tellen ze tegen de winst van de verkoper.|} Het getal meet geld: wapenleveringen, troepen en diplomatie zitten er niet in.",
    qDecide: "{N}: wat bepaalt het getal?", aDecide: "{chance} {why} {flip}",
    qClose: "{N}: waarom is het saldo zo klein?", aClose: "Het saldo is {zeroWord}: {netSigned} van een jaar-bbp ({range}). {why}",
    qOilgas: "{N}: koopt het nog Russische olie en gas?",
    aOilgas: "Voor de oorlog ({years}) was brandstof {fs} van wat het uit Rusland kocht. In {y1} kocht het voor {b1} aan brandstof en andere goederen uit Rusland, tegenover {b0} in {y0}; deze gegevens splitsen {y1} niet per brandstof.",
    qFrozen: "{N}: hoeveel Russisch geld is bevroren?", aFrozen: "{frozen}",
    qRefugees: "{N}: hoeveel Oekraïense vluchtelingen, en wat kost dat?", aRefugees: "{hosted} {cost}{if:gross| {gross}|}{if:perYear| {perYear}|}",
    qKiel: "{N}: waarom wijkt War Balance af van de Kiel-tracker?", aKiel: "{kiel}",
    qYears: "{N}: hoeveel steun voor Oekraïne per jaar?", aYears: "Steun aan Oekraïne per jaar: {list}. In totaal sinds 2022: {ua} ({uaRange}).",
    qCompare: "{N}: hoe verhoudt het zich tot de buren?", aCompare: "Het saldo als deel van een jaar-bbp: {list}.{if:ranked| {rank}|}",
    qSources: "{N}: waar komen de cijfers vandaan?",
    aSources: "{n} bronnen onderbouwen de onderdelen, waarvan {off} officiële statistieken. Per onderdeel: {list}. Het paneel van de kaart noemt ze allemaal, met hun documenten.",
    qHub: "{N}: helpt het Rusland sancties te omzeilen?", aHub: "{hub}{if:chpl| {chpl}|}",
    qSanctions: "{N}: is de handel met Rusland door sancties ingekrompen?", aSanctions: "{sanction}{if:exempt| {exempt}|}",
    qNodata: "{N}: waarom is er geen getal?", aNodata: "{text}",
  },
  uk: {
    tDecide: "Що визначає це число", tTrade: "Торгівля з Росією до і після", tSanctions: "Санкції, власні відключення Росії чи вибір",
    tEnergy: "Ціна відмови від російської енергії", tRefugees: "Біженці з України", tKiel: "Чому це відрізняється від трекера Кільського інституту",
    tFlowback: "Гроші, що повертаються з воєнних зусиль", tBusiness: "Компанії, Росія та російські власники", tIndirect: "Непрямі канали: хаби, перероблена нафта, судноплавство",
    tPeers: "Порівняно з сусідами та групами", tBacking: "На чому ґрунтується це число", tSources: "Джерела за складниками",
    zeroSize: "Тут висновок — розмір сальдо, а не його напрям: {range}.",
    yearBig: "{if:nYears>=2|Найбільше річне сальдо припало на {y}|Єдине помітне річне сальдо припало на {y}}: {v}.",
    yearUa: "Підтримка України {if:ua1~ua0|у {y0} і {y1} була приблизно однаковою: {b}|{if:ua1>ua0|зросла|зменшилася} з {a} у {y0} до {b} у {y1}}.",
    yearSmall: "Річні суми малі порівняно з діапазоном загальної суми, тож те, на який бік вони припадають з року в рік, не є висновком.",
    yearSides: "Річне сальдо змінювало бік: {list}.",
    tradeBought: "Закупівлі з Росії: {b0} у {y0} і {b1} у {y1}{if:chgOk| ({chg})|}.",
    tradeSold: "Продажі до Росії: {s0} у {y0} і {s1} у {y1}{if:chgOk| ({chg})|}.",
    tradeFuel: "До війни ({years}) паливо становило {fs} закупівель з Росії.",
    tradeNote: "Це вартість продажів у цінах кожного року; підсумки враховують те, що з неї залишив собі продавець.",
    energyPremium: "Заміна російської енергії коштувала країні з 2022 року додатково близько {v} ({p} річного ВВП).",
    energyDiscount: "Російська нафта, куплена з воєнною знижкою, заощадила близько {v}.",
    energyNote: "{if:both|Обидві суми не входять до підсумків|Ця сума не входить до підсумків}: показано для інформації.",
    refCost: "Зараховано як підтримку України: {v} ({p} річного ВВП), державні витрати на прийом біженців з 2022 року після податків, які сплачують працюючі біженці.",
    refDate: "Кількість біженців станом на {d}.",
    kielLoans: "{lf}: {face}; {lg}: {ge}.",
    kielPledged: "{label}, за даними Кільського інституту: {v}. Тут це не враховано.",
    flowback: "{gross} допомоги та закупівель України було витрачено в економіці країни; те, що з цього залишили собі її компанії, {kept}, віднімається від її підтримки.",
    partLine: "{name}: {v} ({p} річного ВВП).",
    peersRank: "У рейтингу карти: номер {n} з {of} економік {side}, у частці ВВП.",
    peersNoRank: "Напрям: {word}, тому рейтинг карти не дає країні номера.",
    peersGroup: "{group}: номер {n} з {of} членів {side}.",
    neighbours: "Сухопутні сусіди", similar: "У тому ж регіоні, з тим самим рівнем і напрямом: близькі сальдо у частці ВВП", thNet: "Сальдо, % ВВП",
    backTiers: "Джерела складників: {n}; офіційна статистика: {off}, дослідницькі звіти: {res}, преса: {press}, власні оцінки проєкту: {own}{if:m|, дані методу: {m}|}.",
    backShare: "За розміром: {ab} складників — звітні або виміряні дані (A–B), {c} — модельовані (C), {d} — грубі орієнтири (D).",
    tierOfficial: "офіційне", tierResearch: "дослідження", tierPress: "преса", tierOwn: "власна оцінка", tierMethod: "метод",
    srcAll: "Усі джерела складників",
    qGave: "{N}: скільки підтримки Україні?",
    aGave: "{if:tiny|Майже нічого вимірного: {ua} з 2022 року ({uaP} річного ВВП).|Підтримка України з 2022 року до {dataTo}: {ua}, {uaP} річного ВВП ({uaRange}). Сюди входять {if:eu|власна допомога, частка допомоги ЄС і витрати на прийом біженців|допомога і витрати на прийом біженців}, за вирахуванням грошей, що повернулися; кредити враховано за їхньою грантовою вартістю.}",
    qTrade: "{N}: чи торгує з Росією?",
    aTrade: "Закупівлі з Росії: {b1} у {y1} ({b0} у {y0}){if:sold|, продажі до Росії: {s1}|}. Тут враховано зміну того, що Росія залишила собі з цієї торгівлі (податки та прибуток, а не продажі), порівняно зі світом без війни: {kept}.",
    qHelp: "{N}: чи допомагає ця країна Росії?",
    aHelp: "{if:party|{partyWhy} |}У грошах сальдо становить {netSigned} річного ВВП ({netWords}).{if:chance| {chance}|} {keptCap}.{if:fair| {fair}|}{if:armed| Зброя і війська, надіслані до Росії (близько {armedEur} за повною вартістю), наведені на панелі Росії; у підсумках вони враховані за прибутком продавця.|} Число вимірює гроші: постачання зброї, війська й дипломатія до нього не входять.",
    qDecide: "{N}: що визначає це число?", aDecide: "{chance} {why} {flip}",
    qClose: "{N}: чому сальдо таке мале?", aClose: "Сальдо: {zeroWord}, {netSigned} річного ВВП ({range}). {why}",
    qOilgas: "{N}: чи досі купує російську нафту й газ?",
    aOilgas: "До війни ({years}) паливо становило {fs} закупівель з Росії. У {y1} закупівлі палива та інших товарів з Росії склали {b1} проти {b0} у {y0}; ці дані не ділять {y1} рік за видами палива.",
    qFrozen: "{N}: скільки російських грошей заморожено?", aFrozen: "{frozen}",
    qRefugees: "{N}: скільки українських біженців і яка ціна?", aRefugees: "{hosted} {cost}{if:gross| {gross}|}{if:perYear| {perYear}|}",
    qKiel: "{N}: чому War Balance відрізняється від трекера Кільського інституту?", aKiel: "{kiel}",
    qYears: "{N}: скільки підтримки Україні щороку?", aYears: "Підтримка України за роками: {list}. Загалом з 2022 року: {ua} ({uaRange}).",
    qCompare: "{N}: який вигляд порівняно з сусідами?", aCompare: "Сальдо у частці річного ВВП: {list}.{if:ranked| {rank}|}",
    qSources: "{N}: звідки беруться числа?",
    aSources: "Джерела складників: {n}, з них офіційна статистика: {off}. За складниками: {list}. Панель карти називає кожне з них разом із документами.",
    qHub: "{N}: чи допомагає Росії обходити санкції?", aHub: "{hub}{if:chpl| {chpl}|}",
    qSanctions: "{N}: чи скоротили торгівлю з Росією через санкції?", aSanctions: "{sanction}{if:exempt| {exempt}|}",
    qNodata: "{N}: чому немає числа?", aNodata: "{text}",
  },
};
// a DYN phrase in a language (English where a language has none)
export const dyn = (l, k) => { const x = (DYN[l] && DYN[l][k]) ?? DYN.en[k]; if (x === undefined) throw new Error("seo_i18n.mjs DYN: no phrase " + k); return x; };
export const DYN_KEYS = Object.keys(DYN.en);
// a whole number and a whole percentage as each language writes them ("1,259,155", "−96 %")
export const N = (l, n) => group(Math.round(Math.abs(n)), l);
export const PI = (l, x) => { const s = String(Math.round(Math.abs(x))); return ["de", "fr", "es"].includes(l) ? s + " %" : s + "%"; };

// ----- round 58 (explainers and search wording, approved by the owner) -----
// EXPLAIN: a short neutral "what it is" for the topics people search to understand (keyword research of 26 October
// 2026, clusters shadow_fleet, price_cap, reparations_loan, sanctions_evasion_hubs, frozen_assets), shown at the top of
// the topic pages that name them in pipeline/seo_topics.json ("explain"), in every language. q is the heading (the
// searchers' own question), a the answer; where a language's search demand for its cluster reaches
// seo_families.json explain.minDemand the pair is also in the page's FAQ (JSON-LD). Facts only, fixed in time: the dates
// are the rules' own (allowed by name in seo_check.py ALLOW). {amountText} with the value amount: a hook for amounts
// from the data (the research on them is in progress); until the code gives one, the sentence is left out.
// link: the words of the link to the page's own table, where an explainer has one.
export const EXPLAIN = {
  en: {
    shadowFleet: { q: "What is the shadow fleet?", link: "The ranking by country",
      a: "The shadow fleet is the name for tankers that carry Russian oil outside the Western shipping and insurance system. Many are older ships whose owners are hidden in companies registered in places such as Dubai or Hong Kong, that change flag often and are insured outside the International Group of P&I clubs. It took shape after the EU embargo and the G7 price cap, which allow Western firms to ship and insure Russian oil on condition that it is sold at the cap or under it. Who owns the tankers is often hidden, so this page counts the money: what each country's shipping and insurance firms earned from carrying Russian oil, credited to the country that controls the tankers, not to the flag." },
    priceCap: { q: "What is the Russian oil price cap?",
      a: "The price cap is a G7 and EU rule on Russian oil sold by sea: Western firms may ship, insure and finance a cargo on condition that it is sold at the cap or under it. It applies to crude oil since December 2022 and to oil products such as diesel since February 2023, alongside the EU's ban on importing Russian crude and oil products by sea. The EU, the UK and other members of the coalition cut the cap on crude from September 2025 and now review it regularly against the market price. Russia also sells crude outside the cap with the shadow fleet; this page shows the discount buyers gained beyond Russia's normal pre-war discount." },
    reparationsLoan: { q: "What is the reparations loan for Ukraine?",
      a: "The reparations loan is a plan discussed in the EU since 2025 to lend Ukraine money raised against the cash balances of Russia's central bank reserves immobilised in the EU, held largely at Euroclear in Belgium. The reserves would stay immobilised and remain Russia's claim; Ukraine would repay the loan once Russia pays reparations for the damage caused by the war. The G7's ERA loans (Extraordinary Revenue Acceleration), agreed in 2024, work differently: they are repaid from the windfall profits that the frozen reserves earn at Euroclear. On this site, loans to Ukraine repaid from the proceeds of Russian assets are left out of donors' aid, since Russia pays for them.{if:amount| {amountText}|}" },
    reexportHubs: { q: "What are re-export hubs, and what is sanctions evasion?",
      a: "A re-export is a good that a country imports and sells on without changing it much: a phone made in China or a machine made in the EU that reaches Russia through the UAE, Armenia or Kazakhstan. Since sanctions and the exit of many Western firms cut direct sales to Russia, such hubs have handled part of its imports; when the goods are banned for Russia, this route is called sanctions evasion. This site counts re-exported goods for the country that made them, not for the hub; each hub keeps its own trade and its trading margin. So the table shows what each hub's own trade means for Russia, not every good that passed through it." },
    frozenAssets: { q: "What are frozen Russian assets?",
      a: "Since February 2022 the EU, the G7 and other countries have immobilised the reserves of Russia's central bank held with them, and frozen the assets of sanctioned Russian people and companies. Immobilised means the money cannot be used or moved but still belongs to Russia; confiscation would take ownership, a separate legal step. A large share of the reserves immobilised in the EU is held at Euroclear, a securities depository in Brussels: as bonds mature they turn into cash, and the windfall profits Euroclear earns on that cash are taxed and used for Ukraine. This page counts the return Russia lost on the frozen money, not the amount frozen.{if:amount| {amountText}|}" },
    unfriendlyList: { q: "What is Russia's list of unfriendly countries?",
      a: "In March 2022 Russia's government published a list of “unfriendly” countries and territories: those that imposed or joined sanctions against Russia, such as the EU members, the United States, the United Kingdom, Japan and others; it later added others. Companies and people from these countries face extra rules in Russia: debts may be paid in roubles into special accounts, and selling a stake in a Russian company needs government approval, a discount and an exit payment. The list is a Russian government classification; the figures on this site measure money moved toward Ukraine or Russia against a world without the war, not political alignment." },
  },
  de: {
    shadowFleet: { q: "Was ist die Schattenflotte?", link: "Die Rangliste nach Ländern",
      a: "Als Schattenflotte werden Tanker bezeichnet, die russisches Öl außerhalb des westlichen Schifffahrts- und Versicherungssystems transportieren. Oft sind es ältere Schiffe, deren Eigentümer hinter Firmen in Orten wie Dubai oder Hongkong stehen, die häufig die Flagge wechseln und außerhalb der International Group of P&I Clubs versichert sind. Sie entstand nach dem EU-Embargo und dem Ölpreisdeckel der G7, die westlichen Firmen Transport und Versicherung russischen Öls unter der Bedingung erlauben, dass es zum Preisdeckel oder darunter verkauft wird. Wem die Tanker gehören, ist oft verschleiert; diese Seite zählt deshalb das Geld: was die Reederei- und Versicherungsfirmen jedes Landes am Transport russischen Öls verdienten, zugerechnet dem Land, das die Tanker kontrolliert, nicht der Flagge." },
    priceCap: { q: "Was ist der Ölpreisdeckel für russisches Öl?",
      a: "Der Preisdeckel ist eine Regel der G7 und der EU für russisches Öl auf dem Seeweg: Westliche Firmen dürfen eine Ladung transportieren, versichern und finanzieren, wenn sie zum Preisdeckel oder darunter verkauft wird. Er gilt für Rohöl seit Dezember 2022 und für Ölprodukte wie Diesel seit Februar 2023, neben dem EU-Verbot, russisches Rohöl und russische Ölprodukte auf dem Seeweg einzuführen. Die EU, das Vereinigte Königreich und weitere Mitglieder der Koalition haben den Deckel für Rohöl ab September 2025 gesenkt und überprüfen ihn seither regelmäßig am Marktpreis. Russland verkauft Rohöl auch außerhalb des Deckels mit der Schattenflotte; diese Seite zeigt den Rabatt, den Käufer über Russlands üblichen Vorkriegsrabatt hinaus erhielten." },
    reparationsLoan: { q: "Was ist das Reparationsdarlehen für die Ukraine?",
      a: "Das Reparationsdarlehen ist ein seit 2025 in der EU diskutierter Plan, der Ukraine Geld zu leihen, das gegen die Barguthaben der in der EU immobilisierten Reserven der russischen Zentralbank aufgenommen wird; sie liegen großteils bei Euroclear in Belgien. Die Reserven blieben immobilisiert und ein Anspruch Russlands; die Ukraine würde das Darlehen zurückzahlen, sobald Russland Reparationen für die Kriegsschäden zahlt. Die ERA-Kredite der G7 (Extraordinary Revenue Acceleration) von 2024 funktionieren anders: Sie werden aus den Zufallsgewinnen bedient, die die eingefrorenen Reserven bei Euroclear abwerfen. Auf dieser Seite zählen Kredite an die Ukraine, die aus Erträgen russischer Vermögen zurückgezahlt werden, nicht als Hilfe der Geber, da Russland sie bezahlt.{if:amount| {amountText}|}" },
    reexportHubs: { q: "Was sind Re-Export-Drehscheiben, und was ist Sanktionsumgehung?",
      a: "Ein Re-Export ist eine Ware, die ein Land einführt und ohne große Veränderung weiterverkauft: ein Telefon aus China oder eine Maschine aus der EU, die über die VAE, Armenien oder Kasachstan nach Russland gelangt. Seit Sanktionen und der Rückzug vieler westlicher Firmen direkte Lieferungen nach Russland gekappt haben, wickeln solche Drehscheiben einen Teil seiner Einfuhren ab; sind die Waren für Russland verboten, spricht man von Sanktionsumgehung. Diese Seite zählt reexportierte Waren für das Land, das sie hergestellt hat, nicht für die Drehscheibe; jede Drehscheibe behält ihren eigenen Handel und ihre Handelsmarge. Die Tabelle zeigt also, was der eigene Handel jeder Drehscheibe für Russland bedeutet, nicht jede Ware, die durch sie lief." },
    frozenAssets: { q: "Was sind eingefrorene russische Vermögen?",
      a: "Seit Februar 2022 haben die EU, die G7 und weitere Länder die bei ihnen liegenden Reserven der russischen Zentralbank immobilisiert und die Vermögen sanktionierter russischer Personen und Firmen eingefroren. Immobilisiert heißt: Das Geld kann nicht genutzt oder bewegt werden, gehört aber weiter Russland; eine Beschlagnahme würde das Eigentum entziehen, ein eigener rechtlicher Schritt. Ein großer Teil der in der EU immobilisierten Reserven liegt bei Euroclear, einem Wertpapierverwahrer in Brüssel: Fällige Anleihen werden zu Bargeld, und die Zufallsgewinne, die Euroclear darauf erzielt, werden besteuert und für die Ukraine verwendet. Diese Seite zählt den Ertrag, den Russland auf das eingefrorene Geld verlor, nicht den eingefrorenen Betrag.{if:amount| {amountText}|}" },
    unfriendlyList: { q: "Was ist Russlands Liste „unfreundlicher“ Staaten?",
      a: "Im März 2022 veröffentlichte die russische Regierung eine Liste „unfreundlicher“ Staaten und Gebiete: jener, die Sanktionen gegen Russland verhängten oder sich ihnen anschlossen, etwa die EU-Mitglieder, die Vereinigten Staaten, das Vereinigte Königreich, Japan und andere; später kamen weitere hinzu. Firmen und Personen aus diesen Ländern unterliegen in Russland zusätzlichen Regeln: Schulden dürfen in Rubel auf Sonderkonten gezahlt werden, und der Verkauf einer Beteiligung an einer russischen Firma braucht eine Genehmigung der Regierung, einen Abschlag und eine Ausstiegszahlung. Die Liste ist eine Einstufung der russischen Regierung; die Zahlen dieser Seite messen Geld Richtung Ukraine oder Russland gegenüber einer Welt ohne Krieg, keine politische Haltung." },
  },
  fr: {
    shadowFleet: { q: "Qu'est-ce que la flotte fantôme ?", link: "Le classement par pays",
      a: "On appelle flotte fantôme les pétroliers qui transportent le pétrole russe hors du système occidental de transport maritime et d'assurance. Ce sont souvent des navires anciens, dont les propriétaires sont dissimulés par des sociétés enregistrées à Dubaï ou à Hong Kong, qui changent souvent de pavillon et sont assurés hors de l'International Group of P&I Clubs. Elle s'est formée après l'embargo de l'UE et le plafonnement du prix du pétrole par le G7, qui autorisent les entreprises occidentales à transporter et assurer le pétrole russe à condition qu'il soit vendu à un prix ne dépassant pas le plafond. Les propriétaires des navires étant souvent cachés, cette page compte l'argent : ce que les entreprises de transport et d'assurance de chaque pays ont gagné en transportant du pétrole russe, attribué au pays qui contrôle les navires, et non au pavillon." },
    priceCap: { q: "Qu'est-ce que le plafonnement du prix du pétrole russe ?",
      a: "Le plafonnement est une règle du G7 et de l'UE sur le pétrole russe transporté par mer : les entreprises occidentales peuvent transporter, assurer et financer une cargaison à condition qu'elle soit vendue à un prix ne dépassant pas le plafond. Il s'applique au brut depuis décembre 2022 et aux produits pétroliers comme le diesel depuis février 2023, en complément de l'interdiction par l'UE des importations de brut et de produits pétroliers russes par mer. L'UE, le Royaume-Uni et d'autres membres de la coalition ont abaissé le plafond sur le brut à partir de septembre 2025 et le révisent désormais régulièrement selon le prix du marché. La Russie vend aussi du brut hors plafond grâce à la flotte fantôme ; cette page montre le rabais obtenu par les acheteurs au-delà du rabais habituel d'avant-guerre." },
    reparationsLoan: { q: "Qu'est-ce que le prêt de réparation pour l'Ukraine ?",
      a: "Le prêt de réparation est un projet discuté dans l'UE depuis 2025 : prêter à l'Ukraine de l'argent levé sur les soldes de trésorerie des réserves de la banque centrale russe immobilisées dans l'UE, détenues en grande partie chez Euroclear en Belgique. Les réserves resteraient immobilisées et une créance de la Russie ; l'Ukraine rembourserait le prêt une fois que la Russie aura payé des réparations pour les dommages de la guerre. Les prêts ERA du G7 (Extraordinary Revenue Acceleration), convenus en 2024, fonctionnent autrement : ils sont remboursés par les profits exceptionnels que les réserves gelées rapportent chez Euroclear. Sur ce site, les prêts à l'Ukraine remboursés par les revenus d'avoirs russes ne comptent pas dans l'aide des donateurs, puisque la Russie les paie.{if:amount| {amountText}|}" },
    reexportHubs: { q: "Que sont les plaques tournantes de réexportation et le contournement des sanctions ?",
      a: "Une réexportation est un bien qu'un pays importe puis revend sans le transformer beaucoup : un téléphone fabriqué en Chine ou une machine fabriquée dans l'UE qui arrive en Russie via les Émirats arabes unis, l'Arménie ou le Kazakhstan. Depuis que les sanctions et le départ de nombreuses entreprises occidentales ont coupé les ventes directes à la Russie, ces plaques tournantes assurent une partie de ses importations ; quand les biens sont interdits pour la Russie, on parle de contournement des sanctions. Ce site compte les biens réexportés pour le pays qui les a fabriqués, et non pour la plaque tournante ; chacune garde son propre commerce et sa marge commerciale. Le tableau montre donc ce que le commerce propre de chaque plaque tournante représente pour la Russie, pas chaque bien qui y a transité." },
    frozenAssets: { q: "Que sont les avoirs russes gelés ?",
      a: "Depuis février 2022, l'UE, le G7 et d'autres pays ont immobilisé les réserves de la banque centrale russe détenues chez eux et gelé les avoirs de personnes et d'entreprises russes sanctionnées. Immobilisé signifie que l'argent ne peut être ni utilisé ni déplacé, mais reste la propriété de la Russie ; une confiscation en transférerait la propriété, une étape juridique distincte. Une grande partie des réserves immobilisées dans l'UE se trouve chez Euroclear, dépositaire de titres à Bruxelles : à l'échéance, les obligations deviennent des liquidités, et les profits exceptionnels qu'Euroclear en tire sont taxés et utilisés pour l'Ukraine. Cette page compte le rendement que la Russie a perdu sur l'argent gelé, et non le montant gelé.{if:amount| {amountText}|}" },
    unfriendlyList: { q: "Qu'est-ce que la liste des pays « inamicaux » de la Russie ?",
      a: "En mars 2022, le gouvernement russe a publié une liste de pays et territoires « inamicaux » : ceux qui ont imposé des sanctions à la Russie ou s'y sont joints, comme les membres de l'UE, les États-Unis, le Royaume-Uni, le Japon et d'autres ; d'autres y ont été ajoutés ensuite. Les entreprises et les personnes de ces pays sont soumises à des règles supplémentaires en Russie : des dettes peuvent être payées en roubles sur des comptes spéciaux, et vendre une participation dans une entreprise russe exige l'accord du gouvernement, une décote et un paiement de sortie. La liste est une classification du gouvernement russe ; les chiffres de ce site mesurent l'argent vers l'Ukraine ou la Russie par rapport à un monde sans guerre, pas l'alignement politique." },
  },
  es: {
    shadowFleet: { q: "¿Qué es la flota fantasma?", link: "La clasificación por país",
      a: "Se llama flota fantasma a los petroleros que transportan petróleo ruso fuera del sistema occidental de transporte marítimo y seguros. Suelen ser buques viejos, cuyos propietarios se esconden tras empresas registradas en lugares como Dubái o Hong Kong, que cambian a menudo de bandera y están asegurados fuera del International Group of P&I Clubs. Surgió tras el embargo de la UE y el tope de precio del G7, que permiten a las empresas occidentales transportar y asegurar petróleo ruso a condición de que se venda a un precio que no supere el tope. Como los propietarios suelen estar ocultos, esta página cuenta el dinero: lo que ganaron las empresas de transporte y seguros de cada país al llevar petróleo ruso, atribuido al país que controla los buques, no a la bandera." },
    priceCap: { q: "¿Qué es el tope al precio del petróleo ruso?",
      a: "El tope de precio es una regla del G7 y la UE para el petróleo ruso transportado por mar: las empresas occidentales pueden transportar, asegurar y financiar un cargamento a condición de que se venda a un precio que no supere el tope. Se aplica al crudo desde diciembre de 2022 y a los productos petrolíferos como el diésel desde febrero de 2023, junto a la prohibición de la UE de importar por mar crudo y productos petrolíferos rusos. La UE, el Reino Unido y otros miembros de la coalición rebajaron el tope del crudo a partir de septiembre de 2025 y ahora lo revisan con regularidad según el precio de mercado. Rusia vende crudo también fuera del tope con la flota fantasma; esta página muestra el descuento que obtuvieron los compradores, aparte del descuento habitual de Rusia antes de la guerra." },
    reparationsLoan: { q: "¿Qué es el préstamo de reparaciones para Ucrania?",
      a: "El préstamo de reparaciones es un plan debatido en la UE desde 2025 para prestar a Ucrania dinero obtenido sobre los saldos de caja de las reservas del banco central ruso inmovilizadas en la UE, depositadas en gran parte en Euroclear, en Bélgica. Las reservas seguirían inmovilizadas y serían un derecho de Rusia; Ucrania devolvería el préstamo cuando Rusia pague reparaciones por los daños de la guerra. Los préstamos ERA del G7 (Extraordinary Revenue Acceleration), acordados en 2024, funcionan de otro modo: se devuelven con los beneficios extraordinarios que las reservas congeladas generan en Euroclear. En este sitio, los préstamos a Ucrania devueltos con los ingresos de activos rusos no cuentan como ayuda de los donantes, ya que los paga Rusia.{if:amount| {amountText}|}" },
    reexportHubs: { q: "¿Qué son los centros de reexportación y la evasión de sanciones?",
      a: "Una reexportación es un bien que un país importa y revende sin apenas transformarlo: un teléfono fabricado en China o una máquina fabricada en la UE que llega a Rusia a través de los Emiratos Árabes Unidos, Armenia o Kazajistán. Desde que las sanciones y la salida de muchas empresas occidentales cortaron las ventas directas a Rusia, estos centros gestionan parte de sus importaciones; cuando los bienes están prohibidos para Rusia, se habla de evasión de sanciones. Este sitio cuenta los bienes reexportados para el país que los fabricó, no para el centro; cada centro conserva su propio comercio y su margen comercial. Así, la tabla muestra lo que el comercio propio de cada centro supone para Rusia, no cada bien que pasó por él." },
    frozenAssets: { q: "¿Qué son los activos rusos congelados?",
      a: "Desde febrero de 2022, la UE, el G7 y otros países han inmovilizado las reservas del banco central ruso depositadas en ellos y congelado los activos de personas y empresas rusas sancionadas. Inmovilizado significa que el dinero no puede usarse ni moverse, pero sigue siendo de Rusia; una confiscación transferiría la propiedad, un paso jurídico distinto. Gran parte de las reservas inmovilizadas en la UE está en Euroclear, un depositario de valores en Bruselas: al vencer, los bonos se convierten en efectivo, y los beneficios extraordinarios que Euroclear obtiene con él se gravan y se destinan a Ucrania. Esta página cuenta el rendimiento que Rusia perdió con el dinero congelado, no el importe congelado.{if:amount| {amountText}|}" },
    unfriendlyList: { q: "¿Qué es la lista de países «hostiles» de Rusia?",
      a: "En marzo de 2022 el Gobierno ruso publicó una lista de países y territorios «hostiles»: los que impusieron sanciones a Rusia o se sumaron a ellas, como los miembros de la UE, Estados Unidos, el Reino Unido, Japón y otros; después añadió otros. Las empresas y personas de esos países están sujetas a normas adicionales en Rusia: las deudas pueden pagarse en rublos en cuentas especiales, y vender una participación en una empresa rusa exige la aprobación del Gobierno, un descuento y un pago de salida. La lista es una clasificación del Gobierno ruso; las cifras de este sitio miden el dinero hacia Ucrania o Rusia frente a un mundo sin guerra, no la alineación política." },
  },
  pl: {
    shadowFleet: { q: "Co to jest flota cieni?", link: "Ranking według krajów",
      a: "Flotą cieni nazywa się tankowce, które przewożą rosyjską ropę poza zachodnim systemem żeglugi i ubezpieczeń. Często są to stare statki, których właściciele kryją się za firmami zarejestrowanymi w miejscach takich jak Dubaj czy Hongkong; często zmieniają banderę i są ubezpieczone poza International Group of P&I Clubs. Powstała po embargu UE i limicie cen ropy G7, które pozwalają zachodnim firmom przewozić i ubezpieczać rosyjską ropę pod warunkiem, że jest sprzedawana po cenie nieprzekraczającej limitu. Właściciele tankowców są często ukryci, dlatego ta strona liczy pieniądze: ile firmy żeglugowe i ubezpieczeniowe z każdego kraju zarobiły na przewozie rosyjskiej ropy, przypisane krajowi, który kontroluje tankowce, a nie banderze." },
    priceCap: { q: "Co to jest limit cen rosyjskiej ropy?",
      a: "Limit cen to zasada G7 i UE dotycząca rosyjskiej ropy przewożonej drogą morską: zachodnie firmy mogą przewozić, ubezpieczać i finansować ładunek pod warunkiem, że jest sprzedawany po cenie nieprzekraczającej limitu. Obowiązuje dla ropy naftowej od grudnia 2022 i dla produktów naftowych, takich jak olej napędowy, od lutego 2023, obok unijnego zakazu importu rosyjskiej ropy i produktów naftowych drogą morską. UE, Wielka Brytania i inni członkowie koalicji obniżyli limit dla ropy od września 2025 i odtąd regularnie go weryfikują według ceny rynkowej. Rosja sprzedaje ropę także poza limitem dzięki flocie cieni; ta strona pokazuje rabat, jaki uzyskali kupujący ponad zwykły przedwojenny rabat Rosji." },
    reparationsLoan: { q: "Co to jest kredyt reparacyjny dla Ukrainy?",
      a: "Kredyt reparacyjny to plan omawiany w UE od 2025 roku: pożyczyć Ukrainie pieniądze pozyskane pod salda gotówkowe rezerw rosyjskiego banku centralnego unieruchomionych w UE, przechowywanych w dużej części w Euroclear w Belgii. Rezerwy pozostałyby unieruchomione i byłyby roszczeniem Rosji; Ukraina spłaciłaby kredyt, gdy Rosja zapłaci reparacje za szkody wojenne. Pożyczki ERA grupy G7 (Extraordinary Revenue Acceleration), uzgodnione w 2024 roku, działają inaczej: są spłacane z nadzwyczajnych zysków, które zamrożone rezerwy przynoszą w Euroclear. Na tej stronie pożyczki dla Ukrainy spłacane z dochodów z rosyjskich aktywów nie są liczone jako pomoc darczyńców, bo płaci za nie Rosja.{if:amount| {amountText}|}" },
    reexportHubs: { q: "Czym są huby reeksportu i co to jest omijanie sankcji?",
      a: "Reeksport to towar, który kraj importuje i sprzedaje dalej bez istotnych zmian: telefon wyprodukowany w Chinach lub maszyna wyprodukowana w UE, które trafiają do Rosji przez ZEA, Armenię czy Kazachstan. Odkąd sankcje i wyjście wielu zachodnich firm odcięły bezpośrednią sprzedaż do Rosji, takie huby obsługują część jej importu; gdy towary są dla Rosji zakazane, mówi się o omijaniu sankcji. Ta strona liczy reeksportowane towary dla kraju, który je wyprodukował, a nie dla hubu; każdy hub zachowuje własny handel i marżę handlową. Tabela pokazuje więc, co własny handel każdego hubu oznacza dla Rosji, a nie każdy towar, który przez niego przeszedł." },
    frozenAssets: { q: "Czym są zamrożone rosyjskie aktywa?",
      a: "Od lutego 2022 UE, G7 i inne kraje unieruchomiły przechowywane u siebie rezerwy rosyjskiego banku centralnego i zamroziły aktywa objętych sankcjami rosyjskich osób i firm. Unieruchomione oznacza, że pieniędzy nie można używać ani przenosić, ale nadal należą do Rosji; konfiskata odebrałaby własność i jest odrębnym krokiem prawnym. Duża część rezerw unieruchomionych w UE znajduje się w Euroclear, depozycie papierów wartościowych w Brukseli: zapadające obligacje zamieniają się w gotówkę, a nadzwyczajne zyski, które Euroclear na niej uzyskuje, są opodatkowane i przeznaczane dla Ukrainy. Ta strona liczy zwrot, który Rosja utraciła na zamrożonych pieniądzach, a nie zamrożoną kwotę.{if:amount| {amountText}|}" },
    unfriendlyList: { q: "Czym jest rosyjska lista krajów „nieprzyjaznych”?",
      a: "W marcu 2022 rząd Rosji opublikował listę „nieprzyjaznych” państw i terytoriów: tych, które nałożyły sankcje na Rosję lub do nich dołączyły, takich jak członkowie UE, Stany Zjednoczone, Wielka Brytania, Japonia i inne; później dodano kolejne. Firmy i osoby z tych krajów podlegają w Rosji dodatkowym zasadom: długi mogą być spłacane w rublach na specjalne rachunki, a sprzedaż udziałów w rosyjskiej firmie wymaga zgody rządu, dyskonta i opłaty za wyjście. Lista jest klasyfikacją rosyjskiego rządu; liczby na tej stronie mierzą pieniądze na rzecz Ukrainy lub Rosji w porównaniu ze światem bez wojny, a nie polityczne stanowisko." },
  },
  nl: {
    shadowFleet: { q: "Wat is de schaduwvloot?", link: "De ranglijst per land",
      a: "De schaduwvloot is de naam voor tankers die Russische olie vervoeren buiten het westerse systeem van scheepvaart en verzekering. Vaak zijn het oude schepen waarvan de eigenaars schuilgaan achter bedrijven in plaatsen als Dubai of Hongkong, die vaak van vlag wisselen en buiten de International Group of P&I Clubs verzekerd zijn. Ze ontstond na het EU-embargo en het olieprijsplafond van de G7, die westerse bedrijven toestaan Russische olie te vervoeren en te verzekeren op voorwaarde dat ze tegen hoogstens de plafondprijs wordt verkocht. Wie de tankers bezit, is vaak verborgen; deze pagina telt daarom het geld: wat de scheepvaart- en verzekeringsbedrijven van elk land verdienden aan het vervoer van Russische olie, toegerekend aan het land dat de tankers controleert, niet aan de vlag." },
    priceCap: { q: "Wat is het prijsplafond voor Russische olie?",
      a: "Het prijsplafond is een regel van de G7 en de EU voor Russische olie over zee: westerse bedrijven mogen een lading vervoeren, verzekeren en financieren op voorwaarde dat ze tegen hoogstens de plafondprijs wordt verkocht. Het geldt voor ruwe olie sinds december 2022 en voor olieproducten zoals diesel sinds februari 2023, naast het EU-verbod op de invoer van Russische ruwe olie en olieproducten over zee. De EU, het Verenigd Koninkrijk en andere leden van de coalitie hebben het plafond voor ruwe olie vanaf september 2025 verlaagd en herzien het sindsdien regelmatig aan de hand van de marktprijs. Rusland verkoopt ook ruwe olie buiten het plafond met de schaduwvloot; deze pagina toont de korting die kopers kregen bovenop de gewone vooroorlogse korting van Rusland." },
    reparationsLoan: { q: "Wat is de herstellening voor Oekraïne?",
      a: "De herstellening is een plan dat sinds 2025 in de EU wordt besproken: Oekraïne geld lenen dat wordt opgehaald tegen de kassaldi van de reserves van de Russische centrale bank die in de EU zijn geïmmobiliseerd, grotendeels bij Euroclear in België. De reserves zouden geïmmobiliseerd blijven en een vordering van Rusland zijn; Oekraïne zou de lening terugbetalen zodra Rusland herstelbetalingen doet voor de oorlogsschade. De ERA-leningen van de G7 (Extraordinary Revenue Acceleration), afgesproken in 2024, werken anders: ze worden terugbetaald uit de overwinsten die de bevroren reserves bij Euroclear opleveren. Op deze site tellen leningen aan Oekraïne die worden terugbetaald uit de opbrengsten van Russische tegoeden niet als steun van de donoren, omdat Rusland ervoor betaalt.{if:amount| {amountText}|}" },
    reexportHubs: { q: "Wat zijn wederuitvoerknooppunten, en wat is sanctieontwijking?",
      a: "Wederuitvoer is een goed dat een land invoert en zonder veel bewerking doorverkoopt: een telefoon uit China of een machine uit de EU die via de VAE, Armenië of Kazachstan in Rusland terechtkomt. Sinds sancties en het vertrek van veel westerse bedrijven de rechtstreekse verkoop aan Rusland afsneden, verzorgen zulke knooppunten een deel van zijn invoer; als de goederen voor Rusland verboden zijn, spreekt men van sanctieontwijking. Deze site telt wederuitgevoerde goederen voor het land dat ze maakte, niet voor het knooppunt; elk knooppunt houdt zijn eigen handel en handelsmarge. De tabel toont dus wat de eigen handel van elk knooppunt voor Rusland betekent, niet elk goed dat erdoorheen ging." },
    frozenAssets: { q: "Wat zijn bevroren Russische tegoeden?",
      a: "Sinds februari 2022 hebben de EU, de G7 en andere landen de reserves van de Russische centrale bank die bij hen staan geïmmobiliseerd en de tegoeden van gesanctioneerde Russische personen en bedrijven bevroren. Geïmmobiliseerd betekent dat het geld niet gebruikt of verplaatst kan worden, maar van Rusland blijft; confiscatie zou de eigendom overnemen, een aparte juridische stap. Een groot deel van de in de EU geïmmobiliseerde reserves staat bij Euroclear, een effectenbewaarinstelling in Brussel: als obligaties vervallen, worden ze contant geld, en de overwinsten die Euroclear daarop maakt, worden belast en voor Oekraïne gebruikt. Deze pagina telt het rendement dat Rusland op het bevroren geld misliep, niet het bevroren bedrag.{if:amount| {amountText}|}" },
    unfriendlyList: { q: "Wat is Ruslands lijst van ‘onvriendelijke’ landen?",
      a: "In maart 2022 publiceerde de Russische regering een lijst van ‘onvriendelijke’ landen en gebieden: landen die sancties tegen Rusland instelden of zich daarbij aansloten, zoals de EU-lidstaten, de Verenigde Staten, het Verenigd Koninkrijk, Japan en andere; later kwamen er nog bij. Bedrijven en personen uit die landen krijgen in Rusland extra regels: schulden mogen in roebels op speciale rekeningen worden betaald, en de verkoop van een belang in een Russisch bedrijf vereist goedkeuring van de regering, een korting en een vertrekbetaling. De lijst is een indeling van de Russische regering; de cijfers op deze site meten geld richting Oekraïne of Rusland ten opzichte van een wereld zonder oorlog, geen politieke positie." },
  },
  uk: {
    shadowFleet: { q: "Що таке тіньовий флот?", link: "Рейтинг за країнами",
      a: "Тіньовим флотом називають танкери, що перевозять російську нафту поза західною системою судноплавства й страхування. Часто це старі судна, власники яких ховаються за компаніями, зареєстрованими, наприклад, у Дубаї чи Гонконзі; вони часто змінюють прапор і застраховані поза Міжнародною групою клубів P&I. Він сформувався після ембарго ЄС і стелі цін G7, які дозволяють західним компаніям перевозити й страхувати російську нафту за умови, що її продають за ціною не вище стелі. Власники танкерів часто приховані, тому ця сторінка рахує гроші: скільки компанії з перевезень і страхування кожної країни заробили на перевезенні російської нафти, з віднесенням до країни, що контролює танкери, а не до прапора." },
    priceCap: { q: "Що таке стеля цін на російську нафту?",
      a: "Стеля цін — це правило G7 і ЄС щодо російської нафти, яку перевозять морем: західні компанії можуть перевозити, страхувати й фінансувати вантаж за умови, що його продають за ціною не вище стелі. Вона діє для сирої нафти з грудня 2022 і для нафтопродуктів, як-от дизель, з лютого 2023, поряд із забороною ЄС на морський імпорт російської нафти й нафтопродуктів. ЄС, Велика Британія та інші члени коаліції знизили стелю для сирої нафти з вересня 2025 і відтоді регулярно переглядають її відповідно до ринкової ціни. Росія продає нафту й поза стелею за допомогою тіньового флоту; ця сторінка показує знижку, яку отримали покупці понад звичайну довоєнну знижку Росії." },
    reparationsLoan: { q: "Що таке репараційний кредит для України?",
      a: "Репараційний кредит — це план, який обговорюють у ЄС з 2025 року: позичити Україні гроші, залучені під грошові залишки резервів російського центрального банку, знерухомлених у ЄС і здебільшого розміщених у Euroclear у Бельгії. Резерви залишалися б знерухомленими й вимогою Росії; Україна повернула б кредит, коли Росія сплатить репарації за збитки від війни. Кредити ERA країн G7 (Extraordinary Revenue Acceleration), погоджені 2024 року, влаштовані інакше: їх погашають з надприбутків, які заморожені резерви приносять у Euroclear. На цьому сайті кредити Україні, що погашаються з доходів від російських активів, не враховуються як допомога донорів, бо за них платить Росія.{if:amount| {amountText}|}" },
    reexportHubs: { q: "Що таке хаби реекспорту й обхід санкцій?",
      a: "Реекспорт — це товар, який країна ввозить і перепродає майже без змін: телефон, вироблений у Китаї, чи машина, вироблена в ЄС, що потрапляють до Росії через ОАЕ, Вірменію чи Казахстан. Відколи санкції та вихід багатьох західних компаній обірвали прямі продажі до Росії, такі хаби забезпечують частину її імпорту; коли товари для Росії заборонені, говорять про обхід санкцій. Цей сайт рахує реекспортовані товари за країною, що їх виготовила, а не за хабом; кожен хаб зберігає власну торгівлю й торговельну маржу. Тож таблиця показує, що власна торгівля кожного хабу означає для Росії, а не кожен товар, що пройшов через нього." },
    frozenAssets: { q: "Що таке заморожені російські активи?",
      a: "З лютого 2022 ЄС, G7 та інші країни знерухомили резерви російського центрального банку, що зберігаються в них, і заморозили активи підсанкційних російських осіб і компаній. Знерухомлені означає, що гроші не можна використати чи перемістити, але вони й далі належать Росії; конфіскація забрала б право власності, це окремий юридичний крок. Значна частина резервів, знерухомлених у ЄС, зберігається в Euroclear — депозитарії цінних паперів у Брюсселі: коли облігації погашаються, вони стають готівкою, а надприбутки, які Euroclear на ній отримує, оподатковуються й спрямовуються Україні. Ця сторінка рахує дохід, який Росія втратила на заморожених коштах, а не заморожену суму.{if:amount| {amountText}|}" },
    unfriendlyList: { q: "Що таке російський список «недружніх» країн?",
      a: "У березні 2022 уряд Росії опублікував список «недружніх» країн і територій: тих, що запровадили санкції проти Росії або приєдналися до них, як-от члени ЄС, США, Велика Британія, Японія та інші; згодом до нього додали й інші. Компанії та люди з цих країн мають у Росії додаткові правила: борги можна сплачувати в рублях на спеціальні рахунки, а продаж частки в російській компанії потребує дозволу уряду, дисконту й виплати за вихід. Список — це класифікація російського уряду; цифри на цьому сайті вимірюють гроші на користь України чи Росії порівняно зі світом без війни, а не політичну позицію." },
  },
};
export const EXPLAIN_IDS = Object.keys(EXPLAIN.en);
// an explainer in a language: { q, a, link } filled (vars: amountText; nums: amount, 0 until the data give one)
export function explainText(l, id, vars = {}, nums = {}) {
  const x = (EXPLAIN[l] || EXPLAIN.en)[id] || EXPLAIN.en[id];
  if (!x) throw new Error("seo_i18n.mjs EXPLAIN: no explainer " + id);
  const v = { amountText: "", ...vars }, n = { amount: 0, ...nums };
  return { q: fmt(x.q, v, n), a: fmt(x.a, v, n), link: x.link ? fmt(x.link, v, n) : "" };
}

// the page frames' new words (merged into S): the searchers' wording for weapons sent to Russia (a country with the
// kinds of supplies its research names, seo_families.json armedItems: "North Korea soldiers and shells"), the cite line
// of every page, and the downloads page
const S58 = {
  en: { armedPair: "{N} {items}", item: { soldiers: "soldiers", shells: "shells", drones: "drones", missiles: "missiles" },
    cite: "Cite as: War Balance, figures to {dataTo}, {url}", mdLink: "This page as Markdown", downloads: "Downloads",
    dlTitle: "Download the data: War Balance in CSV and JSON", dlH1: "Download the data",
    dlIntro: "Every country's figures from February 2022 to {dataTo}, as the map shows them, free to reuse under CC BY 4.0 with credit to War Balance.",
    dlCountries: "Every country: the net, support for Ukraine and Russia's earnings from trade, each with its range, certainty letter and chance (CSV)",
    dlParts: "Every part of every country's number, with its range, certainty letter and sources (CSV)",
    dlYears: "Each country's own amounts year by year: support for Ukraine, Russia's earnings from trade and the net (CSV)",
    dlJson: "The full data file the map runs on (JSON)", dlGuide: "Field guide",
    dlFields: ["Amounts are in € bn from February 2022; a share of GDP is against one year's GDP.",
      "Net: support for Ukraine plus the change in what Russia kept from trade, against a world without the war, plus the return Russia lost on frozen money; + toward Ukraine, − toward Russia.",
      "Russia's earnings from trade: how much less (+) or more (−) Russia kept from trade with the country, in taxes and profit, than in a world without the war.",
      "low and high: the range; certainty: A reported, B measured estimate, C modelled estimate, D rough indication; the chance columns: the share of the simulation on each side.",
      "The years file: each year's own amount, a best estimate; the ranges are for the totals, in the other files."],
    dlLicence: "Licence: CC BY 4.0. Credit: War Balance.", dlDescription: "War Balance data for every country: CSV files of the net, support for Ukraine, Russia's earnings from trade, every part and each year, and the full JSON." },
  de: { armedPair: "{N} – {items}", item: { soldiers: "Soldaten", shells: "Granaten", drones: "Drohnen", missiles: "Raketen" },
    cite: "Zitiervorschlag: War Balance, Zahlen bis {dataTo}, {url}", mdLink: "Diese Seite als Markdown", downloads: "Downloads",
    dlTitle: "Daten herunterladen: War Balance als CSV und JSON", dlH1: "Daten herunterladen",
    dlIntro: "Die Zahlen jedes Landes von Februar 2022 bis {dataTo}, wie die Karte sie zeigt, frei nutzbar unter CC BY 4.0 mit Nennung von War Balance.",
    dlCountries: "Jedes Land: Saldo, Unterstützung für die Ukraine und Russlands Einnahmen aus dem Handel, jeweils mit Spanne, Sicherheitsbuchstabe und Wahrscheinlichkeit (CSV)",
    dlParts: "Jeder Teil der Zahl jedes Landes, mit Spanne, Sicherheitsbuchstabe und Quellen (CSV)",
    dlYears: "Die eigenen Beträge jedes Landes Jahr für Jahr: Unterstützung für die Ukraine, Russlands Einnahmen aus dem Handel und Saldo (CSV)",
    dlJson: "Die vollständige Datendatei der Karte (JSON)", dlGuide: "Feldbeschreibung",
    dlFields: ["Beträge in Mrd. € ab Februar 2022; ein BIP-Anteil bezieht sich auf das BIP eines Jahres.",
      "Saldo: Unterstützung für die Ukraine plus die Änderung dessen, was Russland gegenüber einer Welt ohne Krieg aus dem Handel behielt, plus der Ertrag, den Russland auf eingefrorenes Geld verlor; + Richtung Ukraine, − Richtung Russland.",
      "Russlands Einnahmen aus dem Handel: wie viel weniger (+) oder mehr (−) Russland aus dem Handel mit dem Land an Steuern und Gewinn behielt als in einer Welt ohne Krieg.",
      "low und high: die Spanne; certainty: A gemeldet, B gemessene Schätzung, C modellierte Schätzung, D grober Anhaltspunkt; die chance-Spalten: der Anteil der Simulation auf jeder Seite.",
      "Die Jahresdatei: der eigene Betrag jedes Jahres, eine beste Schätzung; die Spannen gelten für die Summen, in den anderen Dateien."],
    dlLicence: "Lizenz: CC BY 4.0. Nennung: War Balance.", dlDescription: "Daten von War Balance für jedes Land als CSV: Saldo, Ukraine-Hilfe, Russlands Handelseinnahmen, alle Teile und jedes Jahr, dazu das JSON." },
  fr: { armedPair: "{N} – {items}", item: { soldiers: "soldats", shells: "obus", drones: "drones", missiles: "missiles" },
    cite: "Citer : War Balance, chiffres jusqu'à {dataTo}, {url}", mdLink: "Cette page en Markdown", downloads: "Téléchargements",
    dlTitle: "Télécharger les données : War Balance en CSV et JSON", dlH1: "Télécharger les données",
    dlIntro: "Les chiffres de chaque pays de février 2022 à {dataTo}, tels que la carte les montre, librement réutilisables sous CC BY 4.0 en citant War Balance.",
    dlCountries: "Chaque pays : le solde, le soutien à l'Ukraine et les gains de la Russie sur le commerce, chacun avec sa fourchette, sa lettre de certitude et sa probabilité (CSV)",
    dlParts: "Chaque composante du chiffre de chaque pays, avec sa fourchette, sa lettre de certitude et ses sources (CSV)",
    dlYears: "Les montants propres de chaque pays, année par année : soutien à l'Ukraine, gains de la Russie sur le commerce et solde (CSV)",
    dlJson: "Le fichier de données complet de la carte (JSON)", dlGuide: "Guide des champs",
    dlFields: ["Montants en Md€ depuis février 2022 ; une part du PIB se rapporte au PIB d'une année.",
      "Solde : le soutien à l'Ukraine, plus la variation de ce que la Russie a gardé du commerce par rapport à un monde sans guerre, plus le rendement perdu par la Russie sur l'argent gelé ; + vers l'Ukraine, − vers la Russie.",
      "Gains de la Russie sur le commerce : combien la Russie a gardé en moins (+) ou en plus (−), en impôts et profits, sur le commerce avec le pays par rapport à un monde sans guerre.",
      "low et high : la fourchette ; la lettre : A déclaré, B estimation mesurée, C estimation modélisée, D indication approximative ; les colonnes chance : la part de la simulation de chaque côté.",
      "Le fichier par année : le montant propre de chaque année, une meilleure estimation ; les fourchettes portent sur les totaux, dans les autres fichiers."],
    dlLicence: "Licence : CC BY 4.0. Crédit : War Balance.", dlDescription: "Les données de War Balance par pays en CSV : solde, soutien à l'Ukraine, gains russes sur le commerce, composantes et années, et le JSON." },
  es: { armedPair: "{N} – {items}", item: { soldiers: "soldados", shells: "proyectiles", drones: "drones", missiles: "misiles" },
    cite: "Cómo citar: War Balance, cifras hasta {dataTo}, {url}", mdLink: "Esta página en Markdown", downloads: "Descargas",
    dlTitle: "Descargar los datos: War Balance en CSV y JSON", dlH1: "Descargar los datos",
    dlIntro: "Las cifras de cada país de febrero de 2022 a {dataTo}, tal como las muestra el mapa, de libre reutilización con CC BY 4.0 citando a War Balance.",
    dlCountries: "Cada país: el neto, el apoyo a Ucrania y las ganancias de Rusia por comercio, cada uno con su rango, su letra de certeza y su probabilidad (CSV)",
    dlParts: "Cada componente de la cifra de cada país, con su rango, su letra de certeza y sus fuentes (CSV)",
    dlYears: "Los importes propios de cada país año a año: apoyo a Ucrania, ganancias de Rusia por comercio y neto (CSV)",
    dlJson: "El archivo de datos completo del mapa (JSON)", dlGuide: "Guía de campos",
    dlFields: ["Importes en euros desde febrero de 2022, en la unidad que indica el nombre de cada columna; una parte del PIB se refiere al PIB de un año.",
      "Neto: el apoyo a Ucrania, más el cambio en lo que Rusia retuvo del comercio frente a un mundo sin guerra, más el rendimiento que Rusia perdió con el dinero congelado; + hacia Ucrania, − hacia Rusia.",
      "Ganancias de Rusia por comercio: cuánto menos (+) o cuánto más (−) retuvo Rusia, en impuestos y beneficios, del comercio con el país que en un mundo sin guerra.",
      "low y high: el rango; certainty: A declarado, B estimación medida, C estimación modelizada, D indicación aproximada; las columnas chance: la parte de la simulación en cada lado.",
      "El archivo por años: el importe propio de cada año, una estimación central; los rangos son de los totales, en los otros archivos."],
    dlLicence: "Licencia: CC BY 4.0. Crédito: War Balance.", dlDescription: "Datos de War Balance por país en CSV: neto, apoyo a Ucrania, ganancias rusas por comercio, cada componente y cada año, y el JSON completo." },
  pl: { armedPair: "{N} – {items}", item: { soldiers: "żołnierze", shells: "pociski", drones: "drony", missiles: "rakiety" },
    cite: "Jak cytować: War Balance, dane do {dataTo}, {url}", mdLink: "Ta strona w formacie Markdown", downloads: "Pliki do pobrania",
    dlTitle: "Pobierz dane: War Balance w CSV i JSON", dlH1: "Pobierz dane",
    dlIntro: "Dane każdego kraju od lutego 2022 do {dataTo}, tak jak pokazuje je mapa, do swobodnego wykorzystania na licencji CC BY 4.0 z podaniem War Balance.",
    dlCountries: "Każdy kraj: saldo, wsparcie dla Ukrainy i zyski Rosji z handlu, każde z przedziałem, literą pewności i prawdopodobieństwem (CSV)",
    dlParts: "Każdy składnik liczby każdego kraju, z przedziałem, literą pewności i źródłami (CSV)",
    dlYears: "Własne kwoty każdego kraju rok po roku: wsparcie dla Ukrainy, zyski Rosji z handlu i saldo (CSV)",
    dlJson: "Pełny plik danych mapy (JSON)", dlGuide: "Opis pól",
    dlFields: ["Kwoty w mld € od lutego 2022; udział w PKB odnosi się do PKB jednego roku.",
      "Saldo: wsparcie dla Ukrainy plus zmiana tego, ile Rosja zatrzymała z handlu w porównaniu ze światem bez wojny, plus zwrot utracony przez Rosję na zamrożonych pieniądzach; + na rzecz Ukrainy, − na rzecz Rosji.",
      "Zyski Rosji z handlu: o ile mniej (+) lub więcej (−) Rosja zatrzymała z handlu z danym krajem w podatkach i zyskach niż w świecie bez wojny.",
      "low i high: przedział; certainty: A zgłoszone, B zmierzone szacunki, C modelowane szacunki, D przybliżona wskazówka; kolumny chance: część symulacji po każdej stronie.",
      "Plik roczny: własna kwota każdego roku, najlepszy szacunek; przedziały dotyczą sum, w pozostałych plikach."],
    dlLicence: "Licencja: CC BY 4.0. Źródło: War Balance.", dlDescription: "Dane War Balance dla każdego kraju: pliki CSV z saldem, wsparciem dla Ukrainy, zyskami Rosji z handlu, każdym składnikiem i każdym rokiem oraz pełny JSON." },
  nl: { armedPair: "{N} – {items}", item: { soldiers: "soldaten", shells: "granaten", drones: "drones", missiles: "raketten" },
    cite: "Citeren als: War Balance, cijfers tot {dataTo}, {url}", mdLink: "Deze pagina als Markdown", downloads: "Downloads",
    dlTitle: "De data downloaden: War Balance in CSV en JSON", dlH1: "De data downloaden",
    dlIntro: "De cijfers van elk land van februari 2022 tot {dataTo}, zoals de kaart ze toont, vrij te hergebruiken onder CC BY 4.0 met vermelding van War Balance.",
    dlCountries: "Elk land: het saldo, de steun aan Oekraïne en Ruslands inkomsten uit handel, elk met marge, zekerheidsletter en kans (CSV)",
    dlParts: "Elk onderdeel van het getal van elk land, met marge, zekerheidsletter en bronnen (CSV)",
    dlYears: "De eigen bedragen van elk land per jaar: steun aan Oekraïne, Ruslands inkomsten uit handel en saldo (CSV)",
    dlJson: "Het volledige databestand van de kaart (JSON)", dlGuide: "Uitleg van de velden",
    dlFields: ["Bedragen in mld € vanaf februari 2022; een aandeel in het bbp is ten opzichte van het bbp van een jaar.",
      "Saldo: steun aan Oekraïne plus de verandering in wat Rusland uit de handel overhield ten opzichte van een wereld zonder oorlog, plus het rendement dat Rusland op bevroren geld misliep; + richting Oekraïne, − richting Rusland.",
      "Ruslands inkomsten uit handel: hoeveel minder (+) of meer (−) Rusland aan belastingen en winst uit de handel met het land overhield dan in een wereld zonder oorlog.",
      "low en high: de marge; certainty: A gerapporteerd, B gemeten schatting, C gemodelleerde schatting, D ruwe indicatie; de chance-kolommen: het deel van de simulatie aan elke kant.",
      "Het jaarbestand: het eigen bedrag van elk jaar, een beste schatting; de marges gelden voor de totalen, in de andere bestanden."],
    dlLicence: "Licentie: CC BY 4.0. Bron: War Balance.", dlDescription: "Data van War Balance per land als CSV: saldo, steun aan Oekraïne, Ruslands handelsinkomsten, elk onderdeel en elk jaar, en de JSON." },
  uk: { armedPair: "{N} – {items}", item: { soldiers: "солдати", shells: "снаряди", drones: "дрони", missiles: "ракети" },
    cite: "Як цитувати: War Balance, дані до {dataTo}, {url}", mdLink: "Ця сторінка у форматі Markdown", downloads: "Завантаження",
    dlTitle: "Завантажити дані: War Balance у CSV і JSON", dlH1: "Завантажити дані",
    dlIntro: "Дані кожної країни з лютого 2022 до {dataTo}, як їх показує карта, для вільного використання за ліцензією CC BY 4.0 з посиланням на War Balance.",
    dlCountries: "Кожна країна: нетто, підтримка України та прибутки Росії від торгівлі, кожен показник із діапазоном, літерою достовірності й імовірністю (CSV)",
    dlParts: "Кожен складник числа кожної країни, з діапазоном, літерою достовірності й джерелами (CSV)",
    dlYears: "Власні суми кожної країни за роками: підтримка України, прибутки Росії від торгівлі й нетто (CSV)",
    dlJson: "Повний файл даних карти (JSON)", dlGuide: "Опис полів",
    dlFields: ["Суми в млрд € з лютого 2022; частка ВВП — від ВВП одного року.",
      "Нетто: підтримка України плюс зміна того, скільки Росія залишила собі від торгівлі порівняно зі світом без війни, плюс дохід, який Росія втратила на заморожених коштах; + на користь України, − на користь Росії.",
      "Прибутки Росії від торгівлі: на скільки менше (+) чи більше (−) податків і прибутку Росія залишила собі від торгівлі з країною, ніж у світі без війни.",
      "low і high: діапазон; certainty: A звітні дані, B виміряна оцінка, C модельна оцінка, D приблизна вказівка; стовпці chance: частка симуляції на кожному боці.",
      "Файл за роками: власна сума кожного року, найкраща оцінка; діапазони стосуються підсумків, в інших файлах."],
    dlLicence: "Ліцензія: CC BY 4.0. Джерело: War Balance.", dlDescription: "Дані War Balance для кожної країни в CSV: нетто, підтримка України, прибутки Росії від торгівлі, складники й роки, а також JSON." },
};
for (const l of LANGS) Object.assign(S[l], S58[l]);
// "North Korea soldiers and shells": a country with the kinds of supplies its research names, in a language
export const armedPair = (l, N, items) => fmt((S[l] || S.en).armedPair, { N, items: list3(l, items.map(k => (S[l] || S.en).item[k] || k)) });

// the country page's new questions (merged into DYN): its relations with Russia, where people search for them
// (seo_demand.json byLang), answered from its trade, support and net; the weapons and troops it sent to Russia, in the
// searchers' words, where its research names them
const DYN58 = {
  en: { qRelations: "{N}–Russia relations: what do the numbers show?",
    aRelations: "In money terms: {if:trade|it bought {b1} from Russia in {y1} ({b0} in {y0}){if:sold|, and sold {s1} to Russia|}; |}its support for Ukraine since 2022 is {ua}; and the net, with what Russia kept from trade against a world without the war, is {netSigned} of one year's GDP ({netWords}). Diplomacy, security ties and politics are not in these numbers.",
    qArmed: "{pair} for Russia: what are they worth?",
    aArmed: "{pair}, with other military supplies sent to Russia since 2022: about {armedEur} at full value, from the sources on Russia's panel. In the totals, what Russia paid for counts at the seller's net gain, like a sale; what it did not pay for counts in full.{if:party| As a party to the war, it is listed apart and not ranked.|}" },
  de: { qRelations: "{N} und Russland: Was zeigen die Zahlen über die Beziehung?",
    aRelations: "In Geld gemessen: {if:trade|Das Land kaufte {y1} für {b1} aus Russland ({y0}: {b0}){if:sold| und verkaufte für {s1} nach Russland|}; |}seine Unterstützung für die Ukraine seit 2022 beträgt {ua}; der Saldo, mit dem, was Russland gegenüber einer Welt ohne Krieg aus dem Handel behielt, liegt bei {netSigned} eines Jahres-BIP ({netWords}). Diplomatie, Sicherheitsbeziehungen und Politik sind in diesen Zahlen nicht enthalten.",
    qArmed: "{pair} für Russland: Was sind sie wert?",
    aArmed: "{pair}, mit weiteren militärischen Lieferungen an Russland seit 2022: etwa {armedEur} zum vollen Wert, nach den Quellen im Bereich zu Russland auf der Karte. In den Summen zählt, was Russland bezahlte, zum Nettogewinn des Verkäufers, wie ein Verkauf; was es nicht bezahlte, zählt voll.{if:party| Als Kriegspartei steht dieses Land gesondert und wird nicht gereiht.|}" },
  fr: { qRelations: "Relations {N}–Russie : que montrent les chiffres ?",
    aRelations: "En argent : {if:trade|le pays a acheté {b1} à la Russie en {y1} ({b0} en {y0}){if:sold|, et lui a vendu {s1}|} ; |}son soutien à l'Ukraine depuis 2022 s'élève à {ua} ; et le solde, avec ce que la Russie a gardé du commerce par rapport à un monde sans guerre, est de {netSigned} d'une année de PIB ({netWords}). La diplomatie, les liens de sécurité et la politique ne sont pas dans ces chiffres.",
    qArmed: "{pair} pour la Russie : quelle valeur ?",
    aArmed: "{pair} et autres livraisons militaires à la Russie depuis 2022 : environ {armedEur} en valeur totale, selon les sources du panneau de la Russie. Dans les totaux, ce que la Russie a payé compte au gain net du vendeur, comme une vente ; ce qu'elle n'a pas payé compte en entier.{if:party| Partie au conflit, ce pays est présenté à part et n'est pas classé.|}" },
  es: { qRelations: "Relaciones {N}–Rusia: ¿qué muestran las cifras?",
    aRelations: "En dinero: {if:trade|compró {b1} a Rusia en {y1} ({b0} en {y0}){if:sold| y le vendió {s1}|}; |}su apoyo a Ucrania desde 2022 es de {ua}; y el neto, con lo que Rusia retuvo del comercio frente a un mundo sin guerra, es {netSigned} de un año de PIB ({netWords}). La diplomacia, los lazos de seguridad y la política no están en estas cifras.",
    qArmed: "{pair} para Rusia: ¿cuánto valen?",
    aArmed: "{pair}, con otros suministros militares enviados a Rusia desde 2022: unos {armedEur} a valor total, según las fuentes del panel de Rusia. En los totales, lo que Rusia pagó cuenta por la ganancia neta del vendedor, como una venta; lo que no pagó cuenta entero.{if:party| Como parte en la guerra, este país figura aparte y sin clasificar.|}" },
  pl: { qRelations: "Relacje {N}–Rosja: co pokazują liczby?",
    aRelations: "W pieniądzach: {if:trade|kraj kupił od Rosji towary za {b1} w {y1} r. ({b0} w {y0} r.){if:sold| i sprzedał jej za {s1}|}; |}jego wsparcie dla Ukrainy od 2022 to {ua}; a saldo, wraz z tym, ile Rosja zatrzymała z handlu w porównaniu ze światem bez wojny, wynosi {netSigned} rocznego PKB ({netWords}). Dyplomacji, więzi bezpieczeństwa i polityki nie ma w tych liczbach.",
    qArmed: "{pair} dla Rosji: ile są warte?",
    aArmed: "{pair}, wraz z innymi dostawami wojskowymi do Rosji od 2022: około {armedEur} według pełnej wartości, na podstawie źródeł w panelu Rosji. W sumach to, za co Rosja zapłaciła, liczy się według zysku netto sprzedawcy, jak sprzedaż; to, za co nie zapłaciła, liczy się w całości.{if:party| Jako strona wojny ten kraj jest wymieniony osobno i nie jest klasyfikowany.|}" },
  nl: { qRelations: "Relatie {N}–Rusland: wat laten de cijfers zien?",
    aRelations: "In geld: {if:trade|het land kocht in {y1} voor {b1} uit Rusland ({b0} in {y0}){if:sold| en verkocht voor {s1} aan Rusland|}; |}zijn steun aan Oekraïne sinds 2022 bedraagt {ua}; en het saldo, met wat Rusland uit de handel overhield ten opzichte van een wereld zonder oorlog, is {netSigned} van een jaar bbp ({netWords}). Diplomatie, veiligheidsbanden en politiek zitten niet in deze cijfers.",
    qArmed: "{pair} voor Rusland: wat zijn ze waard?",
    aArmed: "{pair}, met andere militaire leveringen aan Rusland sinds 2022: ongeveer {armedEur} tegen volle waarde, volgens de bronnen in het paneel van Rusland. In de totalen telt wat Rusland betaalde tegen de nettowinst van de verkoper, als een verkoop; wat het niet betaalde, telt volledig.{if:party| Als partij in de oorlog staat dit land apart en is het niet gerangschikt.|}" },
  uk: { qRelations: "{N} і Росія: що показують цифри про відносини?",
    aRelations: "У грошах: {if:trade|країна купила в Росії на {b1} у {y1} році ({b0} у {y0}){if:sold| і продала їй на {s1}|}; |}її підтримка України з 2022 року — {ua}; а нетто, з урахуванням того, скільки Росія залишила собі від торгівлі порівняно зі світом без війни, — {netSigned} річного ВВП ({netWords}). Дипломатії, безпекових зв'язків і політики в цих цифрах немає.",
    qArmed: "{pair} для Росії: скільки вони коштують?",
    aArmed: "{pair}, разом з іншими військовими поставками до Росії з 2022 року: близько {armedEur} за повною вартістю, за джерелами на панелі Росії. У підсумках те, за що Росія заплатила, рахується за чистим прибутком продавця, як продаж; те, за що не заплатила, — повністю.{if:party| Як сторона війни ця країна наведена окремо й не входить до рейтингу.|}" },
};
for (const l of LANGS) Object.assign(DYN[l], DYN58[l]);

// llms.txt and llms-full.txt (round 58): a plain guide for automated readers, in English, its figures and the map's own
// chance words filled in at deploy
export const LLMS = {
  en: {
    summary: "War Balance shows, for every country, where its money moved since Russia's full-scale invasion of Ukraine: its support for Ukraine and the change in what Russia kept from trade with it, against a world without the war.",
    dataLine: "Figures from February 2022 to {dataTo}. Data and text: CC BY 4.0, credit War Balance.",
    hMeasures: "What it measures",
    defs: ["Net: support for Ukraine plus the change in what Russia kept from trade with the country, plus the return Russia lost on frozen Russian money; + toward Ukraine, − toward Russia.",
      "Support for Ukraine: government aid (loans at their gift value), the country's share of EU-level aid and the public cost of hosting refugees, net of money flowing back to its own economy.",
      "Russia's earnings from trade: how much less, or more, Russia kept from trade with the country (taxes and profit above a normal return, not sales) than in a world without the war.",
      "The no-war baseline: the trade, prices and volumes expected without the war; every trade figure is the difference from it.",
      "Amounts are totals since February 2022, in euros and as a share of one year's GDP.",
      "Ranges: every figure has a range, from simulating every part's range together, and a certainty letter: A reported, B measured estimate, C modelled estimate, D rough indication.",
      "Weapons sent, troops and diplomacy are not in the money figures, except weapons and troops sent to Russia, which count for the countries that sent them."],
    chance: "Chance words: {chanceKey}",
    hCite: "How to cite", cite: "War Balance, figures to {dataTo}, then the page's address. Every page carries its own cite line.",
    hPages: "Main pages", hMethod: "Method", hData: "Data", hCountries: "Every country",
    pages: { home: "The map: every country's net, support for Ukraine and Russia's earnings from trade", ranking: "Every country ranked by its net, with the chance of its direction",
      support: "Each country's support for Ukraine, in euros, as a share of GDP and per person", trade: "What Russia kept from trade with each country, against a world without the war", topics: "Every topic, group, part, year and comparison page, in every site language",
      downloads: "The data as CSV and JSON, with a field guide", how: "How it works: the method, page by page", limitations: "What the figures leave out", llmsFull: "One line per country" },
    markdown: "Every generated page also has a Markdown version at its own address with index.md added.",
    langs: "Languages: English at the root; uk, de, fr, pl, nl and es under /<language>/.",
    fullIntro: "One line per country: its name, the net as a share of one year's GDP with its range and chance, its support for Ukraine in euros, what Russia kept from trade with it against a world without the war, and its page.",
    noData: "no data of its own for the war years", party: "party to the war (with Russia), not ranked",
  },
};

// ----- every phrase above, for the wording guard (seo_check.py: node prints phraseList() as JSON) -----
export function phraseList() {
  const out = [];
  const walk = (x, key, lang) => {
    if (typeof x === "string") out.push({ file: "pipeline/seo_i18n.mjs", key, lang, text: x });
    else if (Array.isArray(x)) x.forEach((y, i) => walk(y, `${key}[${i}]`, lang));
    else if (x && typeof x === "object") for (const [k, y] of Object.entries(x)) walk(y, `${key}.${k}`, lang);
  };
  for (const [name, table] of Object.entries({ S, MEASURE, PART, SIDE, COPY, LABELS, DYN, EXPLAIN, LLMS })) for (const [l, t] of Object.entries(table)) walk(t, name, l);
  for (const [slug, byLang] of Object.entries(TOPIC_T)) for (const [l, t] of Object.entries(byLang)) walk(t, `TOPIC_T.${slug}`, l);
  return out;
}

// the strings above that a native speaker should read before they are relied on (new in round 56; reworded in round 57
// by the wording guard: the sort phrases, the comparison line, the year and part intros, every frame that said "first",
// "largest", "only" or a chance word)
export const REVIEW = ["S (page frames: de, fr, es, pl, nl, uk)", "MEASURE", "PART (37 part names)", "SIDE", "COPY.part", "COPY.year", "COPY.compare", "COPY.hub", "TOPIC_T (20 topics × 6 languages)", "COPY.topic", "COPY.country (7 chance levels)", "COPY.home", "LABELS", "DYN (round 57b: the country page's sections and questions, 6 languages)", "EXPLAIN (round 58: six explainers, 6 languages)", "S58 and DYN58 (round 58: armed items, cite line, downloads page, relations and armed questions, 6 languages)"];
