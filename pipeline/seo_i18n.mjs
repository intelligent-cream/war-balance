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
    order: { hiLo: "high to low", bySize: "by size, either way", uaRu: "from the Ukraine side to the Russia side", ruUa: "from the Russia side to the Ukraine side", keptMoreLess: "from where Russia kept more to where it kept less", keptLessMore: "from where Russia kept less to where it kept more", back: "by the amount subtracted, high to low", loHi: "low to high" },
    minGdp: "Economies under {gdpMin} of GDP are left out, as in the map's ranking.",
    legendKept: "more or less: how much more or less Russia kept (taxes and profit, not sales) than in a world without the war", legendSigned: "+ toward Ukraine, − toward Russia", legendUa: "+ adds to its support for Ukraine, − takes from it", legendBack: "−: what it earned, subtracted from its support for Ukraine and from the net", rangeOf: "range {r}", rangeTo: "{lo} to {hi}", rangeKeptMix: "from {more} more to {less} less", eachRowPart: "Each row: the best estimate, then its range in the same unit and sign. The chances of the direction are for each country's totals, on its page.",
    ofGdp: "of GDP", perPerson: "per person", ofCombined: "of the members' combined GDP",
    figKept: "{s} {if:x>=0|less|more}", totRus: "Russia kept {v} {if:x>=0|less|more} than without the war", totNet: "{v} {if:x>=0|toward Ukraine|toward Russia}",
    chanceSide: "{if:ukr|toward Ukraine|toward Russia}",
    totUa: "{v} in support", totFrozen: "{v} return lost", groupTotals: "Group totals",
    notInTotals: "Not in the totals: shown for information (the cost view, kept in the full data download).",
    openMap: "Open in the map", map: "Map",
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
    order: { hiLo: "von hoch nach niedrig", bySize: "nach Größe, in beide Richtungen", uaRu: "von der Seite der Ukraine zur Seite Russlands", ruUa: "von der Seite Russlands zur Seite der Ukraine", keptMoreLess: "von dort, wo Russland mehr behielt, bis dort, wo es weniger behielt", keptLessMore: "von dort, wo Russland weniger behielt, bis dort, wo es mehr behielt", back: "nach dem abgezogenen Betrag, von hoch nach niedrig", loHi: "von niedrig nach hoch" },
    minGdp: "Volkswirtschaften unter {gdpMin} BIP sind ausgelassen, wie in der Rangliste der Karte.",
    legendKept: "mehr oder weniger: wie viel mehr oder weniger Russland behielt (Steuern und Gewinn, nicht der Umsatz) als ohne Krieg", legendSigned: "+ Richtung Ukraine, − Richtung Russland", legendUa: "+ erhöht seine Unterstützung für die Ukraine, − verringert sie", legendBack: "−: was es verdiente, abgezogen von seiner Unterstützung für die Ukraine und vom Saldo", rangeOf: "Spanne {r}", rangeTo: "{lo} bis {hi}", rangeKeptMix: "von {more} mehr bis {less} weniger", eachRowPart: "Jede Zeile: die beste Schätzung, dann ihre Spanne in derselben Einheit und mit demselben Vorzeichen. Die Wahrscheinlichkeiten der Richtung gelten für die Summen jedes Landes, auf seiner Seite.",
    ofGdp: "des BIP", perPerson: "pro Kopf", ofCombined: "des gemeinsamen BIP der Mitglieder",
    figKept: "{s} {if:x>=0|weniger|mehr}", totRus: "Russland behielt {v} {if:x>=0|weniger|mehr} als ohne Krieg", totNet: "{v} {if:x>=0|Richtung Ukraine|Richtung Russland}",
    chanceSide: "{if:ukr|Richtung Ukraine|Richtung Russland}",
    totUa: "{v} Unterstützung", totFrozen: "{v} entgangener Ertrag", groupTotals: "Summen der Gruppe",
    notInTotals: "Nicht in den Summen: zur Information (Kostenansicht, im vollständigen Datendownload).",
    openMap: "Auf der Karte öffnen", map: "Karte",
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
    order: { hiLo: "par ordre décroissant", bySize: "par taille, dans un sens ou l'autre", uaRu: "du côté ukrainien au côté russe", ruUa: "du côté russe au côté ukrainien", keptMoreLess: "de là où la Russie a gardé plus à là où elle a gardé moins", keptLessMore: "de là où la Russie a gardé moins à là où elle a gardé plus", back: "selon le montant déduit, par ordre décroissant", loHi: "par ordre croissant" },
    minGdp: "Les économies de moins de {gdpMin} de PIB sont exclues, comme dans le classement de la carte.",
    legendKept: "en plus ou en moins : l'écart entre ce que la Russie a gardé (impôts et profits, pas les ventes) et ce qu'elle aurait gardé sans la guerre", legendSigned: "+ vers l'Ukraine, − vers la Russie", legendUa: "+ s'ajoute à son soutien à l'Ukraine, − s'en retranche", legendBack: "− : ce qu'il a gagné, déduit de son soutien à l'Ukraine et du solde", rangeOf: "fourchette {r}", rangeTo: "de {lo} à {hi}", rangeKeptMix: "de {more} de plus à {less} de moins", eachRowPart: "Chaque ligne : la meilleure estimation, puis sa fourchette dans la même unité et avec le même signe. Les probabilités du sens portent sur les totaux de chaque pays, sur sa page.",
    ofGdp: "du PIB", perPerson: "par habitant", ofCombined: "du PIB cumulé des membres",
    figKept: "{s} {if:x>=0|de moins|de plus}", totRus: "la Russie a gardé {v} {if:x>=0|de moins|de plus} que sans la guerre", totNet: "{v} {if:x>=0|vers l'Ukraine|vers la Russie}",
    chanceSide: "{if:ukr|vers l'Ukraine|vers la Russie}",
    totUa: "{v} de soutien", totFrozen: "{v} de rendement perdu", groupTotals: "Totaux du groupe",
    notInTotals: "Hors des totaux : à titre d'information (vue des coûts, dans le téléchargement complet des données).",
    openMap: "Ouvrir sur la carte", map: "Carte",
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
    order: { hiLo: "de más a menos", bySize: "por tamaño, en cualquier sentido", uaRu: "del lado ucraniano al lado ruso", ruUa: "del lado ruso al lado ucraniano", keptMoreLess: "de donde Rusia ganó más a donde ganó menos", keptLessMore: "de donde Rusia ganó menos a donde ganó más", back: "por el importe restado, de más a menos", loHi: "de menos a más" },
    minGdp: "Se excluyen las economías con menos de {gdpMin} de PIB, como en la clasificación del mapa.",
    legendKept: "más o menos: cuánto más o menos se quedó Rusia (impuestos y beneficios, no ventas) que en un mundo sin guerra", legendSigned: "+ hacia Ucrania, − hacia Rusia", legendUa: "+ suma a su apoyo a Ucrania, − le resta", legendBack: "−: lo que ganó, restado de su apoyo a Ucrania y del neto", rangeOf: "rango {r}", rangeTo: "de {lo} a {hi}", rangeKeptMix: "de {more} más a {less} menos", eachRowPart: "Cada fila: la mejor estimación, luego su rango en la misma unidad y con el mismo signo. Las probabilidades de la dirección son de los totales de cada país, en su página.",
    ofGdp: "del PIB", perPerson: "por persona", ofCombined: "del PIB conjunto de los miembros",
    figKept: "{s} {if:x>=0|menos|más}", totRus: "Rusia se quedó con {v} {if:x>=0|menos|más} que sin la guerra", totNet: "{v} {if:x>=0|hacia Ucrania|hacia Rusia}",
    chanceSide: "{if:ukr|hacia Ucrania|hacia Rusia}",
    totUa: "{v} de apoyo", totFrozen: "{v} de rendimiento perdido", groupTotals: "Totales del grupo",
    notInTotals: "Fuera de los totales: como información (vista de costes, en la descarga completa de datos).",
    openMap: "Abrir en el mapa", map: "Mapa",
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
    order: { hiLo: "malejąco", bySize: "według wielkości, w obie strony", uaRu: "od strony ukraińskiej do rosyjskiej", ruUa: "od strony rosyjskiej do ukraińskiej", keptMoreLess: "od krajów, gdzie Rosja zatrzymała więcej, do tych, gdzie mniej", keptLessMore: "od krajów, gdzie Rosja zatrzymała mniej, do tych, gdzie więcej", back: "według odjętej kwoty, malejąco", loHi: "rosnąco" },
    minGdp: "Gospodarki z PKB do {gdpMin} są pominięte, jak w rankingu na mapie.",
    legendKept: "więcej lub mniej: o ile więcej lub mniej Rosja zatrzymała (podatki i zysk, nie sprzedaż) niż w świecie bez wojny", legendSigned: "+ na rzecz Ukrainy, − na rzecz Rosji", legendUa: "+ zwiększa jego wsparcie dla Ukrainy, − je zmniejsza", legendBack: "−: to, co zarobił, odjęte od jego wsparcia dla Ukrainy i od salda", rangeOf: "przedział {r}", rangeTo: "od {lo} do {hi}", rangeKeptMix: "od {more} więcej do {less} mniej", eachRowPart: "Każdy wiersz: najlepszy szacunek, potem jego przedział w tej samej jednostce i z tym samym znakiem. Szanse kierunku dotyczą sum każdego kraju, na jego stronie.",
    ofGdp: "PKB", perPerson: "na osobę", ofCombined: "łącznego PKB członków",
    figKept: "{s} {if:x>=0|mniej|więcej}", totRus: "Rosja zatrzymała {v} {if:x>=0|mniej|więcej} niż bez wojny", totNet: "{v} {if:x>=0|na rzecz Ukrainy|na rzecz Rosji}",
    chanceSide: "{if:ukr|na rzecz Ukrainy|na rzecz Rosji}",
    totUa: "{v} wsparcia", totFrozen: "{v} utraconego zwrotu", groupTotals: "Sumy grupy",
    notInTotals: "Poza sumami: informacyjnie (widok kosztów, w pełnym pliku danych).",
    openMap: "Otwórz na mapie", map: "Mapa",
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
    order: { hiLo: "van hoog naar laag", bySize: "naar grootte, beide kanten op", uaRu: "van de Oekraïense naar de Russische kant", ruUa: "van de Russische naar de Oekraïense kant", keptMoreLess: "van waar Rusland meer overhield naar waar het minder overhield", keptLessMore: "van waar Rusland minder overhield naar waar het meer overhield", back: "naar het afgetrokken bedrag, van hoog naar laag", loHi: "van laag naar hoog" },
    minGdp: "Economieën onder {gdpMin} bbp zijn weggelaten, zoals in de ranglijst van de kaart.",
    legendKept: "meer of minder: hoeveel meer of minder Rusland overhield (belasting en winst, geen omzet) dan zonder oorlog", legendSigned: "+ richting Oekraïne, − richting Rusland", legendUa: "+ telt op bij zijn steun aan Oekraïne, − gaat ervan af", legendBack: "−: wat het verdiende, afgetrokken van zijn steun aan Oekraïne en van het saldo", rangeOf: "bandbreedte {r}", rangeTo: "{lo} tot {hi}", rangeKeptMix: "van {more} meer tot {less} minder", eachRowPart: "Elke rij: de beste schatting, dan de bandbreedte in dezelfde eenheid en met hetzelfde teken. De kansen op de richting gelden voor de totalen van elk land, op zijn pagina.",
    ofGdp: "van het bbp", perPerson: "per persoon", ofCombined: "van het gezamenlijke bbp van de leden",
    figKept: "{s} {if:x>=0|minder|meer}", totRus: "Rusland hield {v} {if:x>=0|minder|meer} over dan zonder oorlog", totNet: "{v} {if:x>=0|richting Oekraïne|richting Rusland}",
    chanceSide: "{if:ukr|richting Oekraïne|richting Rusland}",
    totUa: "{v} aan steun", totFrozen: "{v} gederfd rendement", groupTotals: "Totalen van de groep",
    notInTotals: "Niet in de totalen: ter informatie (kostenweergave, in de volledige datadownload).",
    openMap: "Openen op de kaart", map: "Kaart",
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
    order: { hiLo: "за спаданням", bySize: "за розміром, в обидва боки", uaRu: "від українського боку до російського", ruUa: "від російського боку до українського", keptMoreLess: "від країн, де Росія отримала більше, до країн, де менше", keptLessMore: "від країн, де Росія отримала менше, до країн, де більше", back: "за відрахованою сумою, за спаданням", loHi: "за зростанням" },
    minGdp: "Економіки з ВВП менше {gdpMin} не враховано, як у рейтингу на карті.",
    legendKept: "більше чи менше: на скільки більше чи менше Росія отримала (податки й прибуток, не продажі), ніж у світі без війни", legendSigned: "+ на користь України, − на бік Росії", legendUa: "+ додає до її підтримки України, − зменшує її", legendBack: "−: те, що вона заробила, віднято від її підтримки України й від нетто", rangeOf: "діапазон {r}", rangeTo: "від {lo} до {hi}", rangeKeptMix: "від {more} більше до {less} менше", eachRowPart: "Кожен рядок: найкраща оцінка, далі її діапазон у тих самих одиницях і з тим самим знаком. Шанси напрямку стосуються підсумків кожної країни, на її сторінці.",
    ofGdp: "ВВП", perPerson: "на особу", ofCombined: "спільного ВВП членів",
    figKept: "{s} {if:x>=0|менше|більше}", totRus: "Росія отримала на {v} {if:x>=0|менше|більше}, ніж без війни", totNet: "{v} {if:x>=0|на користь України|на бік Росії}",
    chanceSide: "{if:ukr|на користь України|на бік Росії}",
    totUa: "{v} підтримки", totFrozen: "{v} втраченого доходу", groupTotals: "Підсумки групи",
    notInTotals: "Поза підсумками: для інформації (вигляд витрат, у повному завантаженні даних).",
    openMap: "Відкрити на карті", map: "Карта",
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
  en: { ua: "One part of each country's support for Ukraine.", back: "What each country earned from money of the war effort spent in its own economy: counted at its real gain (taxes and profit above a normal return, times the share that is genuinely extra) and subtracted from its support for Ukraine. Each row is the country where the money was spent.",
    rus: "One part of how much more or less Russia kept from trade with each country than in a world without the war (taxes and profit, not the sales value).", frozen: "The return Russia lost on money frozen in each country: counted in the net (not in support or trade), and not the amount frozen.", cost: "Not in the totals: shown for information." },
  de: { ua: "Ein Teil der Unterstützung jedes Landes für die Ukraine.", back: "Was jedes Land an Geld aus der Kriegshilfe verdiente, das in seiner eigenen Wirtschaft ausgegeben wurde: zu seinem echten Gewinn gezählt (Steuern und Gewinn über einer normalen Rendite, mal dem wirklich zusätzlichen Anteil) und von seiner Unterstützung für die Ukraine abgezogen. Jede Zeile ist das Land, in dem das Geld ausgegeben wurde.",
    rus: "Ein Teil dessen, wie viel mehr oder weniger Russland am Handel mit jedem Land behielt als ohne Krieg (Steuern und Gewinn, nicht der Umsatz).", frozen: "Der Ertrag, den Russland auf in jedem Land eingefrorenes Geld verlor: im Saldo gezählt (nicht in Unterstützung oder Handel), nicht der eingefrorene Betrag.", cost: "Nicht in den Summen: zur Information." },
  fr: { ua: "Une composante du soutien de chaque pays à l'Ukraine.", back: "Ce que chaque pays a gagné sur l'argent de l'effort de guerre dépensé dans sa propre économie : compté à son gain réel (impôts et profits au-delà d'un rendement normal, multipliés par la part réellement additionnelle) et déduit de son soutien à l'Ukraine. Chaque ligne est le pays où l'argent a été dépensé.",
    rus: "Une composante de ce que la Russie a gardé de plus ou de moins sur son commerce avec chaque pays par rapport à un monde sans guerre (impôts et profits, pas les ventes).", frozen: "Le rendement perdu par la Russie sur l'argent gelé dans chaque pays : compté dans le solde (ni dans le soutien ni dans le commerce), et non le montant gelé.", cost: "Hors des totaux : à titre d'information." },
  es: { ua: "Una parte del apoyo de cada país a Ucrania.", back: "Lo que cada país ganó con dinero del esfuerzo de guerra gastado en su propia economía: contado según su ganancia real (impuestos y beneficios sobre un rendimiento normal, por la parte realmente adicional) y restado de su apoyo a Ucrania. Cada fila es el país donde se gastó el dinero.",
    rus: "Una parte de cuánto más o menos se quedó Rusia del comercio con cada país que en un mundo sin guerra (impuestos y beneficios, no las ventas).", frozen: "El rendimiento que Rusia perdió por el dinero congelado en cada país: cuenta en el neto (no en el apoyo ni en el comercio), y no es el importe congelado.", cost: "Fuera de los totales: como información." },
  pl: { ua: "Jeden ze składników wsparcia każdego kraju dla Ukrainy.", back: "To, co każdy kraj zarobił na pieniądzach z pomocy wojennej wydanych w jego własnej gospodarce: liczone według jego rzeczywistego zysku (podatki i zysk ponad normalny zwrot, razy część naprawdę dodatkowa) i odjęte od jego wsparcia dla Ukrainy. Każdy wiersz to kraj, w którym pieniądze wydano.",
    rus: "Jeden ze składników tego, o ile więcej lub mniej Rosja zatrzymała z handlu z każdym krajem niż w świecie bez wojny (podatki i zysk, nie sprzedaż).", frozen: "Zwrot utracony przez Rosję na środkach zamrożonych w każdym kraju: liczony w saldzie (nie we wsparciu ani w handlu), nie jest to kwota zamrożona.", cost: "Poza sumami: informacyjnie." },
  nl: { ua: "Een onderdeel van de steun van elk land aan Oekraïne.", back: "Wat elk land verdiende aan geld uit de oorlogssteun dat in zijn eigen economie werd uitgegeven: geteld tegen zijn werkelijke winst (belasting en winst boven een normaal rendement, maal het deel dat echt extra is) en afgetrokken van zijn steun aan Oekraïne. Elke rij is het land waar het geld werd uitgegeven.",
    rus: "Een onderdeel van hoeveel meer of minder Rusland aan de handel met elk land overhield dan zonder oorlog (belasting en winst, geen omzet).", frozen: "Het rendement dat Rusland misliep op geld dat in elk land bevroren is: in het saldo geteld (niet bij steun of handel), en niet het bevroren bedrag.", cost: "Niet in de totalen: ter informatie." },
  uk: { ua: "Один зі складників підтримки України кожною країною.", back: "Те, що кожна країна заробила на грошах воєнної допомоги, витрачених у її власній економіці: за її реальним прибутком (податки й прибуток понад звичайну дохідність, помножені на справді додаткову частку) і віднято від її підтримки України. Кожен рядок — країна, де гроші витратили.",
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
      u_sure: { title: ["How much has {Nt} given to Ukraine? {ua} since 2022", "How much has {Nt} given to Ukraine? {ua}", "{N}: {ua} for Ukraine since 2022", "{N}: {netP} of GDP {netDir}"],
        description: ["Support for Ukraine from {Nt} since 2022: {ua} ({uaP} of one year's GDP). With trade with Russia counted: {netP} of GDP {netDir}, {sureWord}.",
          "Support for Ukraine from {Nt} since 2022: {ua} ({uaP} of GDP). With trade with Russia: {netP} of GDP {netDir}, {sureWord}.",
          "Support for Ukraine since 2022: {ua} ({uaP} of GDP). With trade with Russia: {netP} of GDP {netDir}, {sureWord}."],
        h1: "How much has {Nt} given to Ukraine since 2022?" },
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
      "support-for-ukraine": { title: ["Total aid to Ukraine by country: euros and % of GDP", "Total aid to Ukraine by country"],
        description: ["Support for Ukraine since 2022 in euros and % of GDP. In euros the list starts with {euroTop}; as a share of GDP with {shareTop}.", "Every country's support for Ukraine since 2022, aid, EU share and refugee hosting, in euros and % of GDP, each with a range and its sources."],
        h1: "Total aid to Ukraine by country since 2022",
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
  "ukraine-support-tracker": { de: ["Ukraine-Hilfe nach Ländern", ["Unterstützung der Ukraine im Ländervergleich (pro Kopf, % BIP)", "Unterstützung der Ukraine im Ländervergleich: pro Kopf, BIP", "Unterstützung der Ukraine im Ländervergleich"], "Unterstützung der Ukraine im Ländervergleich (pro Kopf, % BIP): Hilfe, Geflüchtete und Russlandhandel"], fr: ["Aide à l'Ukraine par pays", ["Aide à l'Ukraine par pays : qui donne le plus ?", "Aide à l'Ukraine par pays"], "Aide à l'Ukraine par pays : aide, réfugiés et commerce avec la Russie"], es: ["Ayuda a Ucrania por países", "Ayuda a Ucrania por países: ¿quién da más?", "Ayuda a Ucrania por países: ayuda, refugiados y comercio con Rusia"], pl: ["Pomoc dla Ukrainy według krajów", "Pomoc dla Ukrainy: ranking państw", "Pomoc dla Ukrainy według krajów: pomoc, uchodźcy i handel z Rosją"], nl: ["Steun aan Oekraïne per land", ["Steun aan Oekraïne per land: wie geeft het meest?", "Steun aan Oekraïne per land"], "Steun aan Oekraïne per land: hulp, vluchtelingen en handel met Rusland"], uk: ["Допомога Україні від країн", ["Допомога Україні від країн: хто дає найбільше?", "Допомога Україні від країн"], "Допомога Україні від країн: допомога, біженці й торгівля з Росією"] },
  "russian-oil-gas-buyers": { de: ["Wer kauft russisches Öl und Gas?", "Wer kauft russisches Öl und Gas? Zahlungen seit 2022", "Wer kauft russisches Öl und Gas? Was jedes Land Russland zahlte"], fr: ["Qui achète le pétrole et le gaz russes ?", "Qui achète le pétrole et le gaz russes depuis 2022 ?", "Qui achète le pétrole et le gaz russes ? Ce que chaque pays a payé"], es: ["¿Quién compra petróleo y gas ruso?", "¿Quién compra petróleo y gas ruso? Pagos desde 2022", "¿Quién compra petróleo y gas ruso? Lo que pagó cada país"], pl: ["Kto kupuje rosyjską ropę i gaz?", "Kto kupuje rosyjską ropę i gaz? Płatności od 2022", "Kto kupuje rosyjską ropę i gaz? Ile każdy kraj zapłacił Rosji"], nl: ["Wie koopt Russische olie en gas?", "Wie koopt Russische olie en gas? Betalingen sinds 2022", "Wie koopt Russische olie en gas? Wat elk land Rusland betaalde"], uk: ["Хто купує російську нафту й газ?", "Хто купує російську нафту й газ? Платежі з 2022", "Хто купує російську нафту й газ? Скільки кожна країна заплатила Росії"] },
  "frozen-russian-assets": { de: ["Eingefrorene russische Vermögen", ["Eingefrorenes russisches Vermögen und Euroclear nach Ländern", "Eingefrorene russische Vermögen nach Ländern"], "Eingefrorenes russisches Vermögen und Euroclear: Was Russland in jedem Land verliert"], fr: ["Avoirs russes gelés", ["Avoirs russes gelés et Euroclear par pays", "Avoirs russes gelés par pays"], "Avoirs russes gelés et Euroclear : ce que la Russie perd dans chaque pays"], es: ["Activos rusos congelados", ["Activos rusos congelados y Euroclear por país", "Activos rusos congelados por país"], "Activos rusos congelados y Euroclear: lo que Rusia pierde en cada país"], pl: ["Zamrożone rosyjskie aktywa", ["Zamrożone rosyjskie aktywa i Euroclear według krajów", "Zamrożone rosyjskie aktywa według krajów"], "Zamrożone rosyjskie aktywa i Euroclear: co Rosja traci w każdym kraju"], nl: ["Bevroren Russische tegoeden", ["Bevroren Russische tegoeden en Euroclear per land", "Bevroren Russische tegoeden per land"], "Bevroren Russische tegoeden en Euroclear: wat Rusland in elk land misloopt"], uk: ["Заморожені російські активи", ["Заморожені російські активи та Euroclear за країнами", "Заморожені російські активи за країнами"], "Заморожені російські активи та Euroclear: що Росія втрачає в кожній країні"] },
  "europe-energy-payments-vs-aid": { de: ["Europa: an Russland gezahlt vs. Ukraine-Hilfe", "Hat Europa Russland mehr gezahlt als der Ukraine gegeben?", "Hat Europa Russland mehr gezahlt, als es der Ukraine gab?"], fr: ["Europe : payé à la Russie vs aide à l'Ukraine", "L'Europe a-t-elle payé la Russie plus qu'aidé l'Ukraine ?", "L'Europe a-t-elle plus payé la Russie qu'aidé l'Ukraine depuis 2022 ?"], es: ["Europa: pagos a Rusia vs. ayuda a Ucrania", "¿Ha pagado Europa a Rusia más que a Ucrania?", "¿Ha pagado Europa a Rusia más de lo que dio a Ucrania desde 2022?"], pl: ["Europa: płatności dla Rosji a pomoc dla Ukrainy", "Czy Europa zapłaciła Rosji więcej, niż dała Ukrainie?", "Czy Europa zapłaciła Rosji więcej, niż dała Ukrainie od 2022 roku?"], nl: ["Europa: betaald aan Rusland vs steun aan Oekraïne", "Betaalde Europa Rusland meer dan het Oekraïne gaf?", "Betaalde Europa Rusland sinds 2022 meer dan het Oekraïne gaf?"], uk: ["Європа: платежі Росії проти допомоги Україні", "Чи заплатила Європа Росії більше, ніж дала Україні?", "Чи заплатила Європа Росії більше, ніж дала Україні з 2022 року?"] },
  "russia-war-income": { de: ["Russlands Kriegseinnahmen aus Handel", "Russlands Kriegseinnahmen: Wessen Handel brachte am meisten?", "Russlands Kriegseinnahmen: Wessen Handel brachte Russland am meisten seit 2022?"], fr: ["Revenus de guerre de la Russie", "Revenus de guerre de la Russie : quel commerce rapporte ?", "Revenus de guerre de la Russie : quels échanges l'ont le plus enrichie depuis 2022 ?"], es: ["Ingresos de guerra de Rusia", "Ingresos de guerra de Rusia: ¿qué comercio aporta más?", "Ingresos de guerra de Rusia: ¿qué comercio le aportó más desde 2022?"], pl: ["Wojenne dochody Rosji z handlu", "Wojenne dochody Rosji: czyj handel dał najwięcej?", "Wojenne dochody Rosji: czyj handel dał jej najwięcej od 2022 roku?"], nl: ["Ruslands oorlogsinkomsten uit handel", "Ruslands oorlogsinkomsten: wiens handel bracht het meest?", "Ruslands oorlogsinkomsten: wiens handel bracht sinds 2022 het meest op?"], uk: ["Воєнні доходи Росії від торгівлі", "Воєнні доходи Росії: чия торгівля дала найбільше?", "Воєнні доходи Росії: чия торгівля дала їй найбільше з 2022 року?"] },
  eu: { de: ["EU-Länder", ["Ukraine-Hilfe der EU-Länder und Handel mit Russland", "EU: Ukraine-Hilfe und Handel mit Russland je Land"], "Die EU: das Geld jedes Mitglieds Richtung Ukraine oder Russland"], fr: ["Pays de l'UE", ["Aide de l'UE à l'Ukraine et commerce russe par pays", "UE : aide à l'Ukraine et commerce russe par pays"], "L'UE : l'argent de chaque membre vers l'Ukraine ou la Russie"], es: ["Países de la UE", ["Ayuda de la UE a Ucrania y comercio con Rusia por país", "UE: ayuda a Ucrania y comercio con Rusia por país"], "La UE: el dinero de cada miembro hacia Ucrania o Rusia"], pl: ["Kraje UE", ["Pomoc dla Ukrainy z UE i handel z Rosją według krajów", "UE: pomoc dla Ukrainy i handel z Rosją według krajów"], "UE: pieniądze każdego członka w stronę Ukrainy lub Rosji"], nl: ["EU-landen", ["EU-steun aan Oekraïne en handel met Rusland per land", "EU: steun aan Oekraïne en handel met Rusland per land"], "De EU: het geld van elk lid richting Oekraïne of Rusland"], uk: ["Країни ЄС", ["Допомога Україні від країн ЄС і торгівля з Росією", "ЄС: допомога Україні й торгівля з Росією за країнами"], "ЄС: гроші кожного члена на користь України чи Росії"] },
  g7: { de: ["G7", "G7: Ukraine-Hilfe und Handel mit Russland seit 2022", "Die G7: das Geld jedes Mitglieds Richtung Ukraine oder Russland"], fr: ["G7", "G7 : aide à l'Ukraine et commerce avec la Russie", "Le G7 : l'argent de chaque membre vers l'Ukraine ou la Russie"], es: ["G7", "G7: ayuda a Ucrania y comercio con Rusia desde 2022", "El G7: el dinero de cada miembro hacia Ucrania o Rusia"], pl: ["G7", "G7: pomoc dla Ukrainy i handel z Rosją od 2022", "G7: pieniądze każdego członka w stronę Ukrainy lub Rosji"], nl: ["G7", "G7: steun aan Oekraïne en handel met Rusland sinds 2022", "De G7: het geld van elk lid richting Oekraïne of Rusland"], uk: ["G7", "G7: допомога Україні й торгівля з Росією з 2022", "G7: гроші кожного члена на користь України чи Росії"] },
  nato: { de: ["NATO-Mitglieder", "NATO: Ukraine-Hilfe und Handel mit Russland je Mitglied", "Die NATO: das Geld jedes Mitglieds Richtung Ukraine oder Russland"], fr: ["Membres de l'OTAN", "OTAN : aide à l'Ukraine et commerce russe par membre", "L'OTAN : l'argent de chaque membre vers l'Ukraine ou la Russie"], es: ["Miembros de la OTAN", "OTAN: ayuda a Ucrania y comercio con Rusia por miembro", "La OTAN: el dinero de cada miembro hacia Ucrania o Rusia"], pl: ["Członkowie NATO", "NATO: pomoc dla Ukrainy i handel z Rosją", "NATO: pieniądze każdego członka w stronę Ukrainy lub Rosji"], nl: ["NAVO-leden", "NAVO: steun aan Oekraïne en handel met Rusland per lid", "De NAVO: het geld van elk lid richting Oekraïne of Rusland"], uk: ["Члени НАТО", "НАТО: допомога Україні й торгівля з Росією", "НАТО: гроші кожного члена на користь України чи Росії"] },
  brics: { de: ["BRICS", "BRICS: Handel mit Russland und Ukraine-Hilfe seit 2022", "BRICS: das Geld jedes Mitglieds Richtung Ukraine oder Russland"], fr: ["BRICS", "BRICS : commerce avec la Russie et aide à l'Ukraine", "Les BRICS : l'argent de chaque membre vers l'Ukraine ou la Russie"], es: ["BRICS", "BRICS: comercio con Rusia y ayuda a Ucrania desde 2022", "BRICS: el dinero de cada miembro hacia Ucrania o Rusia"], pl: ["BRICS", "BRICS: handel z Rosją i pomoc dla Ukrainy od 2022", "BRICS: pieniądze każdego członka w stronę Ukrainy lub Rosji"], nl: ["BRICS", "BRICS: handel met Rusland en steun aan Oekraïne", "BRICS: het geld van elk lid richting Oekraïne of Rusland"], uk: ["БРІКС", "БРІКС: торгівля з Росією й допомога Україні з 2022", "БРІКС: гроші кожного члена на користь України чи Росії"] },
  "gulf-states": { de: ["Golfstaaten", "Golfstaaten: Handel mit Russland und Ukraine-Hilfe", "Golfstaaten: das Geld jedes Landes Richtung Ukraine oder Russland"], fr: ["États du Golfe", "États du Golfe : commerce avec la Russie et aide à l'Ukraine", "États du Golfe : l'argent de chacun vers l'Ukraine ou la Russie"], es: ["Estados del Golfo", "Estados del Golfo: comercio con Rusia y ayuda a Ucrania", "Estados del Golfo: el dinero de cada uno hacia Ucrania o Rusia"], pl: ["Państwa Zatoki Perskiej", "Państwa Zatoki: handel z Rosją i pomoc dla Ukrainy", "Państwa Zatoki: pieniądze każdego w stronę Ukrainy lub Rosji"], nl: ["Golfstaten", "Golfstaten: handel met Rusland en steun aan Oekraïne", "Golfstaten: het geld van elk land richting Oekraïne of Rusland"], uk: ["Країни Перської затоки", "Країни Затоки: торгівля з Росією й допомога Україні", "Країни Затоки: гроші кожної на користь України чи Росії"] },
  "central-asia": { de: ["Zentralasien", "Zentralasien: Handel mit Russland und Ukraine-Hilfe", "Zentralasien: das Geld jedes Landes Richtung Ukraine oder Russland"], fr: ["Asie centrale", "Asie centrale : commerce avec la Russie et aide à l'Ukraine", "Asie centrale : l'argent de chaque pays vers l'Ukraine ou la Russie"], es: ["Asia Central", "Asia Central: comercio con Rusia y ayuda a Ucrania", "Asia Central: el dinero de cada país hacia Ucrania o Rusia"], pl: ["Azja Środkowa", "Azja Środkowa: handel z Rosją i pomoc dla Ukrainy", "Azja Środkowa: pieniądze każdego kraju w stronę Ukrainy lub Rosji"], nl: ["Centraal-Azië", "Centraal-Azië: handel met Rusland en steun aan Oekraïne", "Centraal-Azië: het geld van elk land richting Oekraïne of Rusland"], uk: ["Центральна Азія", "Центральна Азія: торгівля з Росією й допомога Україні", "Центральна Азія: гроші кожної країни на користь України чи Росії"] },
  "countries-helping-russia": { de: ["Welche Länder helfen Russland?", ["{q:Russlands Verbündete?} Wohin das Geld seit 2022 floss", "{q:Russlands Verbündete?} Geldströme seit 2022"], "{q:Russlands Verbündete?} Wohin das Geld jedes Landes seit 2022 floss"], fr: ["Quels pays aident la Russie ?", ["{q:Alliés de la Russie ?} Où l'argent est allé depuis 2022", "{q:Alliés de la Russie ?} L'argent depuis 2022"], "{q:Alliés de la Russie ?} Où l'argent de chaque pays est allé depuis 2022"], es: ["¿Qué países ayudan a Rusia?", ["{q:¿Aliados de Rusia?} Hacia dónde fue el dinero desde 2022", "{q:¿Aliados de Rusia?} El dinero desde 2022"], "{q:¿Aliados de Rusia?} Hacia dónde fue el dinero de cada país desde 2022"], pl: ["Które kraje pomagają Rosji?", ["{q:Sojusznicy Rosji?} Dokąd płynęły pieniądze od 2022", "{q:Sojusznicy Rosji?} Pieniądze od 2022"], "{q:Sojusznicy Rosji?} Dokąd płynęły pieniądze każdego kraju od 2022 roku"], nl: ["Welke landen helpen Rusland?", ["{q:Bondgenoten van Rusland?} Waar het geld sinds 2022 heen ging", "{q:Bondgenoten van Rusland?} Geldstromen sinds 2022"], "{q:Bondgenoten van Rusland?} Waar het geld van elk land sinds 2022 heen ging"], uk: ["Які країни допомагають Росії?", ["{q:Союзники Росії?} Куди йшли гроші з 2022 року", "{q:Союзники Росії?} Гроші з 2022 року"], "{q:Союзники Росії?} Куди йшли гроші кожної країни з 2022 року"] },
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
    qGave: "How much has {Nt} given to Ukraine?",
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
      a: "In March 2022 Russia's government published a list of “unfriendly” countries and territories: mostly countries that imposed or joined sanctions against Russia, such as the EU members, the United States, the United Kingdom, Japan and others; it later added others. It is not the same as the list of countries with sanctions: some are on it without sanctions of their own, and some apply sanctions without being on it. Companies and people from these countries face extra rules in Russia: debts may be paid in roubles into special accounts, and selling a stake in a Russian company needs government approval, a discount and an exit payment. The list is a Russian government classification; the figures on this site measure money moved toward Ukraine or Russia against a world without the war, not political alignment." },
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
      a: "Im März 2022 veröffentlichte die russische Regierung eine Liste „unfreundlicher“ Staaten und Gebiete: überwiegend jener, die Sanktionen gegen Russland verhängten oder sich ihnen anschlossen, etwa die EU-Mitglieder, die Vereinigten Staaten, das Vereinigte Königreich, Japan und andere; später kamen weitere hinzu. Sie ist nicht dasselbe wie die Liste der Länder mit Sanktionen: Manche stehen darauf ohne eigene Sanktionen, manche wenden Sanktionen an, ohne darauf zu stehen. Firmen und Personen aus diesen Ländern unterliegen in Russland zusätzlichen Regeln: Schulden dürfen in Rubel auf Sonderkonten gezahlt werden, und der Verkauf einer Beteiligung an einer russischen Firma braucht eine Genehmigung der Regierung, einen Abschlag und eine Ausstiegszahlung. Die Liste ist eine Einstufung der russischen Regierung; die Zahlen dieser Seite messen Geld Richtung Ukraine oder Russland gegenüber einer Welt ohne Krieg, keine politische Haltung." },
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
      a: "En mars 2022, le gouvernement russe a publié une liste de pays et territoires « inamicaux » : surtout ceux qui ont imposé des sanctions à la Russie ou s'y sont joints, comme les membres de l'UE, les États-Unis, le Royaume-Uni, le Japon et d'autres ; d'autres y ont été ajoutés ensuite. Ce n'est pas la liste des pays qui appliquent des sanctions : des pays y figurent sans sanctions propres, et d'autres appliquent des sanctions sans y figurer. Les entreprises et les personnes de ces pays sont soumises à des règles supplémentaires en Russie : des dettes peuvent être payées en roubles sur des comptes spéciaux, et vendre une participation dans une entreprise russe exige l'accord du gouvernement, une décote et un paiement de sortie. La liste est une classification du gouvernement russe ; les chiffres de ce site mesurent l'argent vers l'Ukraine ou la Russie par rapport à un monde sans guerre, pas l'alignement politique." },
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
      a: "En marzo de 2022 el Gobierno ruso publicó una lista de países y territorios «hostiles»: sobre todo los que impusieron sanciones a Rusia o se sumaron a ellas, como los miembros de la UE, Estados Unidos, el Reino Unido, Japón y otros; después añadió otros. No es la misma que la lista de países con sanciones: algunos figuran en ella sin sanciones propias y otros aplican sanciones sin figurar en ella. Las empresas y personas de esos países están sujetas a normas adicionales en Rusia: las deudas pueden pagarse en rublos en cuentas especiales, y vender una participación en una empresa rusa exige la aprobación del Gobierno, un descuento y un pago de salida. La lista es una clasificación del Gobierno ruso; las cifras de este sitio miden el dinero hacia Ucrania o Rusia frente a un mundo sin guerra, no la alineación política." },
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
      a: "W marcu 2022 rząd Rosji opublikował listę „nieprzyjaznych” państw i terytoriów: głównie tych, które nałożyły sankcje na Rosję lub do nich dołączyły, takich jak członkowie UE, Stany Zjednoczone, Wielka Brytania, Japonia i inne; później dodano kolejne. To nie to samo co lista krajów z sankcjami: niektóre są na niej bez własnych sankcji, a niektóre stosują sankcje, nie będąc na niej. Firmy i osoby z tych krajów podlegają w Rosji dodatkowym zasadom: długi mogą być spłacane w rublach na specjalne rachunki, a sprzedaż udziałów w rosyjskiej firmie wymaga zgody rządu, dyskonta i opłaty za wyjście. Lista jest klasyfikacją rosyjskiego rządu; liczby na tej stronie mierzą pieniądze na rzecz Ukrainy lub Rosji w porównaniu ze światem bez wojny, a nie polityczne stanowisko." },
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
      a: "In maart 2022 publiceerde de Russische regering een lijst van ‘onvriendelijke’ landen en gebieden: vooral landen die sancties tegen Rusland instelden of zich daarbij aansloten, zoals de EU-lidstaten, de Verenigde Staten, het Verenigd Koninkrijk, Japan en andere; later kwamen er nog bij. Het is niet hetzelfde als de lijst van landen met sancties: sommige staan erop zonder eigen sancties, andere passen sancties toe zonder erop te staan. Bedrijven en personen uit die landen krijgen in Rusland extra regels: schulden mogen in roebels op speciale rekeningen worden betaald, en de verkoop van een belang in een Russisch bedrijf vereist goedkeuring van de regering, een korting en een vertrekbetaling. De lijst is een indeling van de Russische regering; de cijfers op deze site meten geld richting Oekraïne of Rusland ten opzichte van een wereld zonder oorlog, geen politieke positie." },
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
      a: "У березні 2022 уряд Росії опублікував список «недружніх» країн і територій: переважно тих, що запровадили санкції проти Росії або приєдналися до них, як-от члени ЄС, США, Велика Британія, Японія та інші; згодом до нього додали й інші. Це не те саме, що список країн із санкціями: деякі є в ньому без власних санкцій, а деякі застосовують санкції, не будучи в ньому. Компанії та люди з цих країн мають у Росії додаткові правила: борги можна сплачувати в рублях на спеціальні рахунки, а продаж частки в російській компанії потребує дозволу уряду, дисконту й виплати за вихід. Список — це класифікація російського уряду; цифри на цьому сайті вимірюють гроші на користь України чи Росії порівняно зі світом без війни, а не політичну позицію." },
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
    dlYears: "Each country's own amounts year by year: support for Ukraine, Russia's earnings from trade, the return Russia lost on frozen money and the net (CSV)",
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
    dlYears: "Die eigenen Beträge jedes Landes Jahr für Jahr: Unterstützung für die Ukraine, Russlands Einnahmen aus dem Handel, der Ertrag, den Russland auf eingefrorenes Geld verlor, und Saldo (CSV)",
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
    dlYears: "Les montants propres de chaque pays, année par année : soutien à l'Ukraine, gains de la Russie sur le commerce, rendement perdu par la Russie sur l'argent gelé et solde (CSV)",
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
    dlYears: "Los importes propios de cada país año a año: apoyo a Ucrania, ganancias de Rusia por comercio, rendimiento que Rusia perdió con el dinero congelado y neto (CSV)",
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
    dlYears: "Własne kwoty każdego kraju rok po roku: wsparcie dla Ukrainy, zyski Rosji z handlu, zwrot utracony przez Rosję na zamrożonych pieniądzach i saldo (CSV)",
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
    dlYears: "De eigen bedragen van elk land per jaar: steun aan Oekraïne, Ruslands inkomsten uit handel, het rendement dat Rusland op bevroren geld misliep en saldo (CSV)",
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
    dlYears: "Власні суми кожної країни за роками: підтримка України, прибутки Росії від торгівлі, дохід, який Росія втратила на заморожених коштах, і нетто (CSV)",
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

// ----- round 58b (owner approved: the three research results wired in; seo_research.mjs) -----
// Amounts in other currencies, as each language writes them (€ amounts: E above): "$280bn", "RUB 7,924bn", "7.924 Mrd. RUB"
export function CUR(l, bn, code) {
  if (code === "EUR") return E(l, bn);
  const a = Math.abs(bn), sym = code === "USD" ? "$" : "RUB";
  if (l === "es") return (a >= 0.1 ? group(Math.round(a * 10) * 100, l) : String(Math.round(a * 1000))) + (sym === "$" ? " M$" : " M RUB");
  const big = a >= 0.1, s = !big ? String(Math.round(a * 1000)) : a >= 100 ? group(Math.round(a), l) : dec((a >= 1 ? a.toFixed(1) : a.toFixed(2)).replace(/\.0$/, ""), l);
  const u = {
    en: sym === "$" ? (big ? ["$", "bn"] : ["$", "m"]) : (big ? ["RUB ", "bn"] : ["RUB ", "m"]),
    de: big ? ["", " Mrd. " + sym] : ["", " Mio. " + sym], fr: sym === "$" ? (big ? ["", " Md$"] : ["", " M$"]) : (big ? ["", " Md RUB"] : ["", " M RUB"]),
    pl: big ? ["", " mld " + sym] : ["", " mln " + sym], nl: sym === "$" ? (big ? ["$", " mld"] : ["$", " mln"]) : (big ? ["RUB ", " mld"] : ["RUB ", " mln"]),
    uk: big ? ["", sym === "$" ? " млрд $" : " млрд руб."] : ["", sym === "$" ? " млн $" : " млн руб."],
  }[l];
  return u[0] + s + u[1];
}
// a research file's date in a language: "2025" as it is, "2025-12" as "December 2025", "2022-03-05" with its day;
// a span ("2022-2023") with an en dash; anything after the date ("2025-12-18/19", "2026-10 (page ...)") left out
export function dateL(s, l, gen = false) {
  const t = String(s || "").trim();
  // after a preposition ("since", "to"), Polish and Ukrainian take the month in the genitive ("od marca 2022")
  if (gen && GEN.has(l) && /^\d{4}-\d{2}(?!-\d)/.test(t)) return monthYear(t.slice(0, 7) + "-15", l).replace(/ р\.$/, "");
  let m;
  const loc = l === "en" ? "en-GB" : l;
  if ((m = t.match(/^(\d{4})-(\d{4})$/))) return m[1] + "–" + m[2];
  if ((m = t.match(/^(\d{4})-(\d{2})-(\d{2})/))) return new Date(`${m[1]}-${m[2]}-${m[3]}T12:00:00Z`).toLocaleDateString(loc, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).replace(/ р\.$/, "");
  if ((m = t.match(/^(\d{4})-(\d{2})/))) return new Date(`${m[1]}-${m[2]}-15T12:00:00Z`).toLocaleDateString(loc, { month: "long", year: "numeric", timeZone: "UTC" }).replace(/ р\.$/, "");
  if ((m = t.match(/^(\d{4})/))) return m[1];
  return "";
}
// a month as a table's row label ("September 2026"; the nominative in Polish and Ukrainian)
export const monthLabel = (ym, l) => dateL(ym.slice(0, 7), l);

// the phrases of the sanctions section and question of every country page, the frozen amounts, the explainers' amounts,
// the page of every country's sanctions (/countries-with-sanctions-on-russia/) and the page of Russia's oil and gas
// revenue (/russia-oil-gas-revenue/). Every figure, date, count and name is a placeholder filled from the research files
// (research/2026-10/gaps/sanctions_r58.json, frozen_amounts_r58.json, russia_revenue_r58.json) at deploy
const RES = {
  en: {
    tRegime: "Sanctions on Russia", qRegime: "Does {Nt} have sanctions on Russia?",
    cat_eu_member: "Yes. As an EU member, {Nt} applies the EU's sanctions on Russia, which every member agreed to in the Council.",
    cat_adopts_eu_measures: "Yes. {NtCap} is not in the EU but adopts the EU's sanctions on Russia under its own law.{if:partial| Official EU reports say its alignment is incomplete.|}",
    cat_own_regime: "Yes. {NtCap} has sanctions on Russia under its own law{if:since|, since {sinceText}|}.{if:expFin| They are export controls and financial measures, not a general sanctions regime.|}{if:exp| They are export controls on listed high-tech goods; it has no general sanctions list.|}",
    cat_financial_directive_only: "{NtCap}'s financial regulators told banks{if:since| on {sinceText}|} not to deal with people and companies sanctioned by the United States, the United Kingdom, the EU and Canada. It has no sanctions list of its own.",
    cat_no_own_regime_stated: "No. {NtCap} has not imposed sanctions of its own on Russia, and its government has said so publicly{if:date| ({dateText})|}.{if:evasion| It has also said it will not let its territory be used to get around other countries' sanctions.|}",
    cat_no_own_regime_found: "We found no sanctions of {Nt}'s own against Russia (checked {checked}). This says nothing about whether firms there follow other countries' sanctions.",
    cat_territory_uk_order: "{NtCap} is a British overseas territory: the UK's sanctions on Russia apply there through the Russia (Sanctions) (Overseas Territories) Order 2020.",
    cat_territory: "{NtCap} is a territory of {sov}. We did not check whether the sanctions of {sov} on Russia extend to it.",
    priceCap: "It is part of the price cap coalition on Russian oil{if:viaEU| through the EU|}.",
    exportCtl: "It applies export controls on Russia{if:bis|, and the United States lists it among the partners with controls like its own|}.",
    ufListed: "Separately, Russia lists {Nt} as an “unfriendly” state (government order {order}, {sinceText}): that is Russia's own list of countries it acts against, not a sanction by {Nt}.",
    ufNotNamed: "Russia's list of “unfriendly” states does not name {Nt} itself{if:sov|; it names {sov}|}.",
    ufNo: "Russia's list of “unfriendly” states does not name {Nt}.",
    checked: "Checked {checked}.", srcSearch: "search summary, to be checked against the official text", srcNews: "news report", allSanctions: "Every country's sanctions on Russia",
    stockLead: "Amounts frozen here, for context (the map counts the return Russia lost on them, not the amounts):",
    stockCbr: "Bank of Russia reserves immobilised: {v}", stockPriv: "assets of sanctioned people and companies frozen: {v}",
    stockNsd: "{v} of Russian investors' securities blocked through the sanctioned depository NSD, counted apart ({date})",
    stockEuroclear: "Euroclear reports {v} of sanctioned Russian assets on its balance sheet ({date}); that figure overlaps the central bank's and is not added to it.",
    stockNone: "No public figure has been published for the amounts frozen here; a missing figure does not mean that nothing is frozen.",
    noFig: "no public figure", estimate: "estimate: about {v}", source: "source",
    colCbr: "Central bank reserves immobilised", colPriv: "Sanctioned private assets frozen", frozenAll: "Frozen Russian assets by country",
    stockNote: "The amount columns show the amounts frozen at the date shown, for context: the table is sorted by the return Russia lost, not by these amounts. “No public figure” does not mean that nothing is frozen; an estimate is marked as one.",
    amtFrozenAssets: "In figures: about {euCbr} of Bank of Russia reserves are immobilised in the EU ({euCbrDate}, European Commission), and over {euPriv} of assets of sanctioned people and companies are frozen there. For the members of the REPO task force (the EU, the G7 and Australia), the official total was about {repoCbr} of central bank assets ({repoCbrDate}) and over {repoPriv} of private assets ({repoPrivDate}). Euroclear reports {euroclear} of sanctioned Russian assets on its balance sheet ({euroclearDate}); that figure overlaps the Commission's and is not added to it. The windfall payments from Euroclear to the EU came to about {windfall} by {windfallDate}.",
    amtReparationsLoan: "Where it stands: proposed, not adopted. The Commission's legal proposal ({propDate}) would have used up to {propMax} of immobilised assets. On {eucoDate} the European Council agreed instead on a {usl} Ukraine Support Loan for {uslYears}, funded by EU borrowing: Ukraine repays it once Russia pays reparations, and the EU keeps the right to use the immobilised assets for that. By {paidDate}, {uslPaid} of it had been paid out. The G7's ERA loans come to about {eraUsd} ({eraEur}).",
    sTitle: "Sanctions on Russia by country: EU, US, UK and others",
    sDesc: "Each country by the sanctions on Russia that apply there: EU, EU adopters, own regimes, the oil price cap, export controls and Russia's list.",
    sH1: "Sanctions on Russia by country: which countries have them?", sLabel: "Countries with sanctions on Russia",
    sIntro: "Every country and territory on the map by the sanctions on Russia that apply there (checked {checked}), with the oil price cap coalition and export controls. Russia's own list of “unfriendly” countries has a column of its own: it is the list of countries Russia acts against, not a list of sanctions, and they differ.",
    lab_eu_member: "EU members: the EU's sanctions", lab_adopts_eu_measures: "Adopt the EU's sanctions", lab_own_regime: "Sanctions under their own law", lab_financial_directive_only: "Financial directive",
    lab_no_own_regime_stated: "No sanctions of their own, said publicly", lab_no_own_regime_found: "No sanctions of their own found", lab_territory_uk_order: "British overseas territories: the UK's sanctions", lab_territory: "Territories: not checked",
    note_eu_member: "EU members apply the EU's sanctions on Russia, which each member agreed to in the Council.",
    note_adopts_eu_measures: "Not in the EU; they adopt the EU's sanctions under their own law. “In part”: official EU reports say the alignment is incomplete.",
    note_own_regime: "Sanctions or export controls under their own law; the scope varies, as the column says.",
    note_financial_directive_only: "Financial regulators told banks to observe other countries' sanctions; there is no list of its own.",
    note_no_own_regime_stated: "No sanctions of their own, and the government has said so publicly.",
    note_no_own_regime_found: "No sanctions of their own found on the date checked. This says nothing about whether firms there follow other countries' sanctions.",
    note_territory_uk_order: "The UK's sanctions on Russia apply here by order.",
    note_territory: "Not sovereign states: whether the sovereign's sanctions extend to each was not checked.",
    thMeasures: "Measures", thPriceCap: "Price cap coalition", thExport: "Export controls", thUnfriendly: "Russia's “unfriendly” list",
    yes: "yes", no: "no", notChecked: "not checked", viaEU: "via the EU", listed: "listed, {sinceText}", notNamed: "not named itself",
    cell_eu_member: "the EU's", cell_adopts_eu_measures: "the EU's, adopted{if:partial| in part|}", cell_own_regime: "{scope}{if:since|, since {sinceText}|}", cell_financial_directive_only: "financial directive{if:since|, {sinceText}|}",
    cell_no_own_regime_stated: "said so publicly{if:date| ({dateText})|}", cell_no_own_regime_found: "–", cell_territory_uk_order: "the UK's", cell_territory: "not checked",
    scopeFull: "its own sanctions", scopeExp: "export controls", scopeExpFin: "export controls and financial measures",
    sCounts: "By category",
    sNoteUkr: "Ukraine has sanctions of its own on Russia too; the map does not list Ukraine or Russia as countries.",
    sNoteSrc: "Each country's page lists its sources. A source marked “search summary” was read through a search engine's extract and should be checked against the official text before it is quoted.",
    sQ1: "Which countries have sanctions on Russia?",
    sA1: "The EU's {nEu} members, {nAdopt} other European countries that adopt the EU's sanctions ({adoptList}) and {nOwn} countries with sanctions under their own law ({ownList}){if:nFin|; {finList}: a financial directive|}. Checked {checked}.",
    sQ2: "Is Russia's “unfriendly” list the list of countries with sanctions?",
    sA2: "No. The lists overlap but differ.{if:nListedNo| On Russia's list without sanctions of their own: {listedNoList}.|}{if:nAdoptNo| Adopting the EU's sanctions without being on Russia's list: {adoptNoList}.|}",
    rTitle: "Russia's war budget: defence spending vs oil and gas income",
    rDesc: "Russia's defence budget and military spending beside its federal oil and gas revenue since {y0}, in roubles and euros, by year and month, with sources.",
    rH1: "Russia's war budget: defence spending and oil and gas income since {y0}", rLabel: "Russia's war budget and oil and gas revenue",
    rIntro: "Russia's federal budget books taxes on oil and gas production and exports as oil and gas revenue. In {lastFull} it came to {ogRub} ({ogEur}), {share} of federal revenue; from January to {latestMonth}, {ytdRub} ({ytdEur}), {ytdShare}. Figures from Russia's Ministry of Finance (data of {published}); euros at the Bank of Russia's monthly average rates.{if:defOk| The budget law plans {defPlan} for “national defence” in {defYear}.|}",
    rWhatH: "What counts as oil and gas revenue",
    rWhat: "The mineral extraction tax on oil, gas and condensate, export duties on oil, oil products and gas, and the additional income tax on oil production, net of the “damper” payments to refiners. It measures tax, not export earnings: it includes tax on oil and gas sold in Russia and leaves out companies' profits, profit tax and dividends, which the ministry counts as other revenue. Months vary because the additional income tax is paid each quarter. Roubles are the official unit; euro values move with the exchange rate.",
    rYearH: "Year by year", rMonthH: "Month by month, to {latestMonth}",
    thMonth: "Month", thOgRub: "Oil and gas revenue, roubles", thOgEur: "In euros", thShare: "Share of federal revenue", thTotRub: "All federal revenue, roubles",
    partYear: "{y}, January to {month}",
    rCreaH: "Export earnings from fossil fuels: an estimate",
    rCrea: "A different measure: what Russia's exports of oil, gas and coal earned, as estimated by the Centre for Research on Energy and Clean Air (CREA) from tracked shipments and prices. It is the value of exports, not tax, and it is not added to the budget figures.",
    thCreaAll: "All fossil fuels", thCreaOg: "Oil and gas",
    rDefH: "Defence spending, for context",
    rDef: "Budget money is pooled: no revenue is set aside for a given line of spending, so these figures are context, not a link between revenue and spending. Each figure says what it is: the budget's “national defence” section as spent (to 2021) or as planned in the budget law, and SIPRI's estimate of military spending, which uses a broader definition.",
    thDefSpent: "National defence, spent", thDefPlan: "National defence, budget law", thSipri: "SIPRI military spending", thSipriGdp: "SIPRI, share of GDP", approx: "approximate",
    rMeasureH: "How this differs from the map's measure",
    rMeasure: "The map measures, for each country, how much less or more Russia kept from trade with that country than in a world without the war. The figures on this page are the taxes Russia's state received, from all buyers together: they cannot be split by country and have no no-war baseline, so they are not added to the map's figures or set against them.",
    rMeasureLink: "What Russia kept from trade, by country",
    rQ1: "How much does Russia earn from oil?",
    rA1: "Russia's budget books oil and gas together. Federal oil and gas revenue in {lastFull}: {ogRub} ({ogEur}), {share} of federal revenue; from January to {latestMonth}: {ytdRub} ({ytdEur}). CREA estimates Russia's export earnings from oil and gas in {lastFull} at {crea}.",
    rQ2: "What share of Russia's federal revenue comes from oil and gas?",
    rA2: "{share} in {lastFull} and {ytdShare} from January to {latestMonth}. Year by year since {y0}: {list}.",
    sources: "Sources", hubBackground: "Background",
    dlRevMonthly: "Russia's federal oil and gas revenue and all federal revenue, month by month, in roubles and euros (Ministry of Finance; CSV)",
    dlRevYearly: "The same by year, with CREA's estimate of export earnings and the defence spending figures, each labelled (CSV)",
  },
  de: {
    tRegime: "Sanktionen gegen Russland", qRegime: "{N}: Gibt es Sanktionen gegen Russland?",
    cat_eu_member: "Ja. Als EU-Mitglied wendet das Land die Sanktionen der EU gegen Russland an, denen jedes Mitglied im Rat zugestimmt hat.",
    cat_adopts_eu_measures: "Ja. Das Land ist nicht in der EU, übernimmt aber die Sanktionen der EU gegen Russland nach eigenem Recht.{if:partial| Offizielle Berichte der EU nennen die Übernahme unvollständig.|}",
    cat_own_regime: "Ja. Das Land hat Sanktionen gegen Russland nach eigenem Recht{if:since|, seit {sinceText}|}.{if:expFin| Es sind Exportkontrollen und Finanzmaßnahmen, kein allgemeines Sanktionsregime.|}{if:exp| Es sind Exportkontrollen für gelistete Hochtechnologiegüter; eine allgemeine Sanktionsliste gibt es nicht.|}",
    cat_financial_directive_only: "Die Finanzaufsicht des Landes wies die Banken{if:since| am {sinceText}|} an, keine Geschäfte mit Personen und Firmen zu machen, die von den USA, dem Vereinigten Königreich, der EU und Kanada sanktioniert sind. Eine eigene Sanktionsliste gibt es dort nicht.",
    cat_no_own_regime_stated: "Nein. Das Land hat keine eigenen Sanktionen gegen Russland verhängt, und die Regierung hat das öffentlich gesagt{if:date| ({dateText})|}.{if:evasion| Sie hat auch erklärt, das Staatsgebiet nicht zur Umgehung der Sanktionen anderer Länder nutzen zu lassen.|}",
    cat_no_own_regime_found: "Wir haben keine eigenen Sanktionen dieses Landes gegen Russland gefunden (Stand: {checked}). Das sagt nichts darüber, ob Firmen dort die Sanktionen anderer Länder befolgen.",
    cat_territory_uk_order: "Das Gebiet ist ein britisches Überseegebiet: Die Sanktionen des Vereinigten Königreichs gegen Russland gelten dort über die Russia (Sanctions) (Overseas Territories) Order 2020.",
    cat_territory: "Das Gebiet gehört zu einem anderen Staat ({sov}). Ob dessen Sanktionen gegen Russland dort gelten, haben wir nicht geprüft.",
    priceCap: "Das Land gehört zur Preisdeckel-Koalition für russisches Öl{if:viaEU| über die EU|}.",
    exportCtl: "Es wendet Exportkontrollen gegen Russland an{if:bis|, und die USA führen es unter den Partnern mit vergleichbaren Kontrollen|}.",
    ufListed: "Davon getrennt stuft Russland das Land als „unfreundlichen“ Staat ein (Regierungsanordnung {order}, {sinceText}): Das ist Russlands eigene Liste von Ländern, gegen die es vorgeht, keine Sanktion dieses Landes.",
    ufNotNamed: "Russlands Liste „unfreundlicher“ Staaten nennt das Gebiet nicht selbst{if:sov|; sie nennt den Staat, zu dem es gehört ({sov})|}.",
    ufNo: "Russlands Liste „unfreundlicher“ Staaten nennt das Land nicht.",
    checked: "Stand: {checked}.", srcSearch: "Auszug aus einer Suchmaschine, am offiziellen Text zu prüfen", srcNews: "Pressebericht", allSanctions: "Sanktionen gegen Russland: die Länderübersicht",
    stockLead: "Hier eingefrorene Beträge, zur Einordnung (die Karte zählt den Ertrag, den Russland darauf verlor, nicht die Beträge):",
    stockCbr: "Reserven der russischen Zentralbank, immobilisiert: {v}", stockPriv: "Vermögen sanktionierter Personen und Firmen, eingefroren: {v}",
    stockNsd: "{v} an Wertpapieren russischer Anleger, blockiert über den sanktionierten Verwahrer NSD, gesondert gezählt ({date})",
    stockEuroclear: "Euroclear meldet {v} an sanktionierten russischen Vermögen in seiner Bilanz ({date}); diese Zahl überschneidet sich mit der der Zentralbank und wird nicht hinzugezählt.",
    stockNone: "Für die hier eingefrorenen Beträge wurde keine Zahl veröffentlicht; eine fehlende Zahl heißt nicht, dass nichts eingefroren ist.",
    noFig: "keine veröffentlichte Zahl", estimate: "Schätzung: etwa {v}", source: "Quelle",
    colCbr: "Zentralbankreserven, immobilisiert", colPriv: "Sanktionierte Privatvermögen, eingefroren", frozenAll: "Eingefrorene russische Vermögen nach Land",
    stockNote: "Die beiden Spalten mit Beträgen zeigen die eingefrorenen Summen zum genannten Datum, zur Einordnung: Sortiert ist die Tabelle nach dem Ertrag, den Russland verlor, nicht nach diesen Beträgen. „Keine veröffentlichte Zahl“ heißt nicht, dass nichts eingefroren ist; eine Schätzung ist als solche gekennzeichnet.",
    amtFrozenAssets: "In Zahlen: Etwa {euCbr} an Reserven der russischen Zentralbank sind in der EU immobilisiert ({euCbrDate}, Europäische Kommission), dazu über {euPriv} an Vermögen sanktionierter Personen und Firmen. Für die Mitglieder der REPO-Taskforce (EU, G7 und Australien) lag die offizielle Summe bei etwa {repoCbr} an Zentralbankvermögen ({repoCbrDate}) und über {repoPriv} an Privatvermögen ({repoPrivDate}). Euroclear meldet {euroclear} an sanktionierten russischen Vermögen in seiner Bilanz ({euroclearDate}); diese Zahl überschneidet sich mit der der Kommission und wird nicht hinzugezählt. Die Zufallsgewinne, die Euroclear an die EU abführte, beliefen sich bis {windfallDate} auf etwa {windfall}.",
    amtReparationsLoan: "Stand: vorgeschlagen, nicht beschlossen. Der Rechtsvorschlag der Kommission ({propDate}) hätte bis zu {propMax} der immobilisierten Vermögen genutzt. Am {eucoDate} einigte sich der Europäische Rat stattdessen auf ein Unterstützungsdarlehen für die Ukraine von {usl} für {uslYears}, finanziert durch Kreditaufnahme der EU: Die Ukraine zahlt es zurück, sobald Russland Reparationen zahlt, und die EU behält sich vor, die immobilisierten Vermögen dafür zu nutzen. Bis {paidDate} waren davon {uslPaid} ausgezahlt. Die ERA-Kredite der G7 belaufen sich auf etwa {eraUsd} ({eraEur}).",
    sTitle: "Sanktionen gegen Russland nach Ländern: EU, USA, UK u. a.",
    sDesc: "Jedes Land nach den Sanktionen gegen Russland, die dort gelten: EU, Übernahme der EU-Sanktionen, eigene Regime, Preisdeckel und Russlands Liste.",
    sH1: "Sanktionen gegen Russland nach Ländern: Wer hat welche?", sLabel: "Länder mit Sanktionen gegen Russland",
    sIntro: "Jedes Land und Gebiet der Karte nach den Sanktionen gegen Russland, die dort gelten (Stand: {checked}), mit der Preisdeckel-Koalition für Öl und den Exportkontrollen. Russlands eigene Liste „unfreundlicher“ Länder hat eine eigene Spalte: Sie ist die Liste der Länder, gegen die Russland vorgeht, keine Liste von Sanktionen, und die beiden unterscheiden sich.",
    lab_eu_member: "EU-Mitglieder: Sanktionen der EU", lab_adopts_eu_measures: "Übernehmen die Sanktionen der EU", lab_own_regime: "Sanktionen nach eigenem Recht", lab_financial_directive_only: "Anweisung der Finanzaufsicht",
    lab_no_own_regime_stated: "Keine eigenen Sanktionen, öffentlich erklärt", lab_no_own_regime_found: "Keine eigenen Sanktionen gefunden", lab_territory_uk_order: "Britische Überseegebiete: Sanktionen des Vereinigten Königreichs", lab_territory: "Gebiete: nicht geprüft",
    note_eu_member: "EU-Mitglieder wenden die Sanktionen der EU gegen Russland an, denen jedes Mitglied im Rat zugestimmt hat.",
    note_adopts_eu_measures: "Nicht in der EU; sie übernehmen die Sanktionen der EU nach eigenem Recht. „Teilweise“: Offizielle Berichte der EU nennen die Übernahme unvollständig.",
    note_own_regime: "Sanktionen oder Exportkontrollen nach eigenem Recht; der Umfang ist verschieden, wie die Spalte zeigt.",
    note_financial_directive_only: "Die Finanzaufsicht wies die Banken an, die Sanktionen anderer Länder zu beachten; eine eigene Liste gibt es nicht.",
    note_no_own_regime_stated: "Keine eigenen Sanktionen, und die Regierung hat das öffentlich gesagt.",
    note_no_own_regime_found: "Keine eigenen Sanktionen gefunden, Stand des Prüfdatums. Das sagt nichts darüber, ob Firmen dort die Sanktionen anderer Länder befolgen.",
    note_territory_uk_order: "Die Sanktionen des Vereinigten Königreichs gegen Russland gelten hier per Verordnung.",
    note_territory: "Keine souveränen Staaten: Ob die Sanktionen des jeweiligen Staates dort gelten, wurde nicht einzeln geprüft.",
    thMeasures: "Maßnahmen", thPriceCap: "Preisdeckel-Koalition", thExport: "Exportkontrollen", thUnfriendly: "Russlands Liste „unfreundlicher“ Staaten",
    yes: "ja", no: "nein", notChecked: "nicht geprüft", viaEU: "über die EU", listed: "gelistet, {sinceText}", notNamed: "nicht selbst genannt",
    cell_eu_member: "die der EU", cell_adopts_eu_measures: "die der EU, übernommen{if:partial|, teilweise|}", cell_own_regime: "{scope}{if:since|, seit {sinceText}|}", cell_financial_directive_only: "Anweisung der Finanzaufsicht{if:since|, {sinceText}|}",
    cell_no_own_regime_stated: "öffentlich erklärt{if:date| ({dateText})|}", cell_no_own_regime_found: "–", cell_territory_uk_order: "die des Vereinigten Königreichs", cell_territory: "nicht geprüft",
    scopeFull: "eigene Sanktionen", scopeExp: "Exportkontrollen", scopeExpFin: "Exportkontrollen und Finanzmaßnahmen",
    sCounts: "Nach Kategorie",
    sNoteUkr: "Auch die Ukraine hat eigene Sanktionen gegen Russland; die Karte zeigt die Ukraine und Russland nicht als Länder.",
    sNoteSrc: "Die Seite jedes Landes nennt ihre Quellen. Eine als „Auszug aus einer Suchmaschine“ markierte Quelle wurde über einen solchen Auszug gelesen und ist vor einem Zitat am offiziellen Text zu prüfen.",
    sQ1: "Welche Länder haben Sanktionen gegen Russland?",
    sA1: "Die {nEu} Mitglieder der EU, {nAdopt} weitere europäische Länder, die die Sanktionen der EU übernehmen ({adoptList}), und {nOwn} Länder mit Sanktionen nach eigenem Recht ({ownList}){if:nFin|; {finList}: eine Anweisung der Finanzaufsicht|}. Stand: {checked}.",
    sQ2: "Ist Russlands Liste „unfreundlicher“ Staaten die Liste der Länder mit Sanktionen?",
    sA2: "Nein. Die beiden Listen überschneiden sich, sind aber verschieden.{if:nListedNo| Auf Russlands Liste ohne eigene Sanktionen: {listedNoList}.|}{if:nAdoptNo| Übernehmen die Sanktionen der EU, ohne auf Russlands Liste zu stehen: {adoptNoList}.|}",
    rTitle: "Russlands Kriegshaushalt: Verteidigung vs. Öl und Gas",
    rDesc: "Russlands Verteidigungshaushalt und Militärausgaben neben den Öl- und Gaseinnahmen des Bundeshaushalts seit {y0}, in Rubel und Euro, nach Jahr und Monat.",
    rH1: "Russlands Kriegshaushalt: Verteidigungsausgaben und Einnahmen aus Öl und Gas seit {y0}", rLabel: "Russlands Kriegshaushalt und Öl- und Gaseinnahmen",
    rIntro: "Russlands Bundeshaushalt verbucht Steuern auf die Förderung und den Export von Öl und Gas als Öl- und Gaseinnahmen. {lastFull} waren es {ogRub} ({ogEur}), {share} der Bundeseinnahmen; von Januar bis {latestMonth} {ytdRub} ({ytdEur}), {ytdShare}. Zahlen des russischen Finanzministeriums (Daten vom {published}); Euro zu den Monatsdurchschnittskursen der russischen Zentralbank.{if:defOk| Das Haushaltsgesetz sieht für {defYear} {defPlan} für „Landesverteidigung“ vor.|}",
    rWhatH: "Was als Öl- und Gaseinnahmen zählt",
    rWhat: "Die Förderabgabe auf Öl, Gas und Kondensat, Exportzölle auf Öl, Ölprodukte und Gas sowie die Zusatzertragsteuer auf die Ölförderung, abzüglich der „Dämpfer“-Zahlungen an Raffinerien. Das misst Steuern, keine Exporterlöse: Es enthält Steuern auf in Russland verkauftes Öl und Gas und lässt Unternehmensgewinne, Gewinnsteuer und Dividenden weg, die das Ministerium als sonstige Einnahmen zählt. Die Monate schwanken, weil die Zusatzertragsteuer vierteljährlich gezahlt wird. Der Rubel ist die amtliche Einheit; Euro-Werte bewegen sich mit dem Wechselkurs.",
    rYearH: "Jahr für Jahr", rMonthH: "Monat für Monat, bis {latestMonth}",
    thMonth: "Monat", thOgRub: "Öl- und Gaseinnahmen, Rubel", thOgEur: "In Euro", thShare: "Anteil an den Bundeseinnahmen", thTotRub: "Bundeseinnahmen insgesamt, Rubel",
    partYear: "{y}, Januar bis {month}",
    rCreaH: "Exporterlöse aus fossilen Brennstoffen: eine Schätzung",
    rCrea: "Ein anderes Maß: was Russlands Exporte von Öl, Gas und Kohle einbrachten, geschätzt vom Centre for Research on Energy and Clean Air (CREA) aus verfolgten Lieferungen und Preisen. Das ist der Wert der Exporte, keine Steuer, und wird nicht zu den Haushaltszahlen addiert.",
    thCreaAll: "Alle fossilen Brennstoffe", thCreaOg: "Öl und Gas",
    rDefH: "Verteidigungsausgaben, zur Einordnung",
    rDef: "Haushaltsmittel fließen in einen gemeinsamen Topf: Keine Einnahme ist für eine bestimmte Ausgabe reserviert, daher dienen diese Zahlen der Einordnung, nicht als Verbindung zwischen Einnahmen und Ausgaben. Jede Zahl sagt, was sie ist: der Haushaltsabschnitt „Nationale Verteidigung“ wie ausgegeben (bis 2021) oder wie im Haushaltsgesetz geplant, und SIPRIs Schätzung der Militärausgaben, die eine breitere Definition verwendet.",
    thDefSpent: "Nationale Verteidigung, ausgegeben", thDefPlan: "Nationale Verteidigung, Haushaltsgesetz", thSipri: "SIPRI: Militärausgaben", thSipriGdp: "SIPRI: Anteil am BIP", approx: "ungefähr",
    rMeasureH: "Wie sich das vom Maß der Karte unterscheidet",
    rMeasure: "Die Karte misst für jedes Land, wie viel weniger oder mehr Russland aus dem Handel mit diesem Land behielt als in einer Welt ohne Krieg. Die Zahlen auf dieser Seite sind die Steuern, die Russlands Staat erhielt, von allen Käufern zusammen: Sie lassen sich nicht nach Ländern aufteilen und haben keine Basis ohne Krieg, daher werden die beiden weder addiert noch gegeneinander gestellt.",
    rMeasureLink: "Was Russland aus dem Handel behielt, nach Land",
    rQ1: "Wie viel verdient Russland mit Öl?",
    rA1: "Der Haushalt bucht Öl und Gas zusammen. Öl- und Gaseinnahmen des Bundeshaushalts {lastFull}: {ogRub} ({ogEur}), {share} der Bundeseinnahmen; von Januar bis {latestMonth}: {ytdRub} ({ytdEur}). CREA schätzt Russlands Exporterlöse aus Öl und Gas {lastFull} auf {crea}.",
    rQ2: "Welcher Anteil der russischen Bundeseinnahmen stammt aus Öl und Gas?",
    rA2: "{share} im Jahr {lastFull} und {ytdShare} von Januar bis {latestMonth}. Jahr für Jahr seit {y0}: {list}.",
    sources: "Quellen", hubBackground: "Hintergrund",
    dlRevMonthly: "Russlands Öl- und Gaseinnahmen und alle Bundeseinnahmen, Monat für Monat, in Rubel und Euro (Finanzministerium; CSV)",
    dlRevYearly: "Dasselbe nach Jahr, mit CREAs Schätzung der Exporterlöse und den Verteidigungsausgaben, jeweils gekennzeichnet (CSV)",
  },
  fr: {
    tRegime: "Sanctions contre la Russie", qRegime: "{N} : ce pays a-t-il des sanctions contre la Russie ?",
    cat_eu_member: "Oui. Membre de l'UE, ce pays applique les sanctions de l'UE contre la Russie, que chaque membre a approuvées au Conseil.",
    cat_adopts_eu_measures: "Oui. Ce pays n'est pas dans l'UE mais reprend les sanctions de l'UE contre la Russie dans son propre droit.{if:partial| Des rapports officiels de l'UE jugent cet alignement incomplet.|}",
    cat_own_regime: "Oui. Ce pays applique des sanctions contre la Russie en vertu de son propre droit{if:since|, depuis {if:day|le |}{sinceText}|}.{if:expFin| Ce sont des contrôles à l'exportation et des mesures financières, pas un régime de sanctions général.|}{if:exp| Ce sont des contrôles à l'exportation de biens de haute technologie listés ; il n'y a pas de liste de sanctions générale.|}",
    cat_financial_directive_only: "Les autorités financières de ce pays ont demandé aux banques{if:since| le {sinceText}|} de ne pas traiter avec les personnes et entreprises sanctionnées par les États-Unis, le Royaume-Uni, l'UE et le Canada. Il n'existe pas de liste de sanctions propre.",
    cat_no_own_regime_stated: "Non. Ce pays n'a pas imposé de sanctions propres à la Russie, et son gouvernement l'a dit publiquement{if:date| ({dateText})|}.{if:evasion| Il a aussi déclaré qu'il ne laisserait pas utiliser son territoire pour contourner les sanctions d'autres pays.|}",
    cat_no_own_regime_found: "Nous n'avons trouvé aucune sanction propre de ce pays contre la Russie (vérifié le {checked}). Cela ne dit rien sur le respect, par les entreprises du pays, des sanctions d'autres pays.",
    cat_territory_uk_order: "C'est un territoire britannique d'outre-mer : les sanctions du Royaume-Uni contre la Russie s'y appliquent par la Russia (Sanctions) (Overseas Territories) Order 2020.",
    cat_territory: "Ce territoire dépend d'un autre État ({sov}). Nous n'avons pas vérifié si les sanctions de cet État contre la Russie s'y appliquent.",
    priceCap: "Il fait partie de la coalition du plafonnement du prix du pétrole russe{if:viaEU| par l'intermédiaire de l'UE|}.",
    exportCtl: "Il applique des contrôles à l'exportation visant la Russie{if:bis|, et les États-Unis le comptent parmi les partenaires aux contrôles comparables aux leurs|}.",
    ufListed: "Par ailleurs, la Russie classe ce pays comme État « inamical » (ordonnance gouvernementale {order}, {sinceText}) : c'est la liste russe des pays contre lesquels la Russie prend des mesures, pas une sanction de ce pays.",
    ufNotNamed: "La liste russe des États « inamicaux » ne nomme pas ce territoire lui-même{if:sov| ; elle nomme l'État dont il dépend ({sov})|}.",
    ufNo: "La liste russe des États « inamicaux » ne nomme pas ce pays.",
    checked: "Vérifié le {checked}.", srcSearch: "extrait de moteur de recherche, à vérifier sur le texte officiel", srcNews: "article de presse", allSanctions: "Les sanctions contre la Russie, pays par pays",
    stockLead: "Montants gelés ici, pour situer (la carte compte le rendement que la Russie a perdu sur ces montants, pas les montants eux-mêmes) :",
    stockCbr: "réserves de la Banque de Russie immobilisées : {v}", stockPriv: "avoirs de personnes et d'entreprises sanctionnées gelés : {v}",
    stockNsd: "{v} de titres d'investisseurs russes bloqués via le dépositaire sanctionné NSD, comptés à part ({date})",
    stockEuroclear: "Euroclear déclare {v} d'actifs russes sanctionnés à son bilan ({date}) ; ce chiffre recoupe celui de la banque centrale et ne s'y ajoute pas.",
    stockNone: "Aucun chiffre public n'a été publié pour les montants gelés ici ; un chiffre manquant ne veut pas dire que rien n'est gelé.",
    noFig: "pas de chiffre public", estimate: "estimation : environ {v}", source: "source",
    colCbr: "Réserves de banque centrale immobilisées", colPriv: "Avoirs privés sanctionnés gelés", frozenAll: "Avoirs russes gelés par pays",
    stockNote: "Les colonnes de montants donnent les montants gelés à la date indiquée, pour situer : le tableau est trié selon le rendement perdu par la Russie, pas selon ces montants. « Pas de chiffre public » ne veut pas dire que rien n'est gelé ; une estimation est signalée comme telle.",
    amtFrozenAssets: "En chiffres : environ {euCbr} de réserves de la Banque de Russie sont immobilisés dans l'UE ({euCbrDate}, Commission européenne), et plus de {euPriv} d'avoirs de personnes et d'entreprises sanctionnées y sont gelés. Pour les membres du groupe de travail REPO (l'UE, le G7 et l'Australie), le total officiel était d'environ {repoCbr} d'actifs de banque centrale ({repoCbrDate}) et de plus de {repoPriv} d'avoirs privés ({repoPrivDate}). Euroclear déclare {euroclear} d'actifs russes sanctionnés à son bilan ({euroclearDate}) ; ce chiffre recoupe celui de la Commission et ne s'y ajoute pas. Les contributions sur les profits exceptionnels versées par Euroclear à l'UE atteignaient environ {windfall} en {windfallDate}.",
    amtReparationsLoan: "Où en est-il : proposé, pas adopté. La proposition législative de la Commission ({propDate}) aurait mobilisé jusqu'à {propMax} d'actifs immobilisés. Le {eucoDate}, le Conseil européen a retenu à la place un prêt de soutien à l'Ukraine de {usl} pour {uslYears}, financé par l'emprunt de l'UE : l'Ukraine le rembourse lorsque la Russie paie des réparations, et l'UE garde le droit d'utiliser pour cela les actifs immobilisés. En {paidDate}, {uslPaid} en avaient été versés. Les prêts ERA du G7 représentent environ {eraUsd} ({eraEur}).",
    sTitle: "Sanctions contre la Russie par pays : UE, USA, Royaume-Uni",
    sDesc: "Chaque pays selon les sanctions contre la Russie qui s'y appliquent : UE, alignés sur l'UE, régimes propres, plafond de prix, liste russe.",
    sH1: "Sanctions contre la Russie par pays : qui en applique ?", sLabel: "Pays qui sanctionnent la Russie",
    sIntro: "Chaque pays et territoire de la carte selon les sanctions contre la Russie qui s'y appliquent (vérifié le {checked}), avec la coalition du plafonnement du prix du pétrole et les contrôles à l'exportation. La liste russe des pays « inamicaux » a sa propre colonne : c'est la liste des pays contre lesquels la Russie prend des mesures, pas une liste de sanctions, et ces listes diffèrent.",
    lab_eu_member: "Membres de l'UE : sanctions de l'UE", lab_adopts_eu_measures: "Reprennent les sanctions de l'UE", lab_own_regime: "Sanctions en vertu de leur propre droit", lab_financial_directive_only: "Directive des autorités financières",
    lab_no_own_regime_stated: "Pas de sanctions propres, déclaré publiquement", lab_no_own_regime_found: "Pas de sanctions propres trouvées", lab_territory_uk_order: "Territoires britanniques d'outre-mer : sanctions du Royaume-Uni", lab_territory: "Territoires : non vérifié",
    note_eu_member: "Les membres de l'UE appliquent les sanctions de l'UE contre la Russie, que chaque membre a approuvées au Conseil.",
    note_adopts_eu_measures: "Hors de l'UE ; ils reprennent les sanctions de l'UE dans leur propre droit. « En partie » : des rapports officiels de l'UE jugent l'alignement incomplet.",
    note_own_regime: "Sanctions ou contrôles à l'exportation en vertu de leur propre droit ; la portée varie, comme l'indique la colonne.",
    note_financial_directive_only: "Les autorités financières ont demandé aux banques de respecter les sanctions d'autres pays ; il n'y a pas de liste propre.",
    note_no_own_regime_stated: "Pas de sanctions propres, et le gouvernement l'a dit publiquement.",
    note_no_own_regime_found: "Pas de sanctions propres trouvées à la date de vérification. Cela ne dit rien sur le respect, par les entreprises du pays, des sanctions d'autres pays.",
    note_territory_uk_order: "Les sanctions du Royaume-Uni contre la Russie s'y appliquent par ordonnance.",
    note_territory: "Pas des États souverains : l'application des sanctions de l'État souverain n'a pas été vérifiée territoire par territoire.",
    thMeasures: "Mesures", thPriceCap: "Coalition du plafond de prix", thExport: "Contrôles à l'exportation", thUnfriendly: "Liste russe des États « inamicaux »",
    yes: "oui", no: "non", notChecked: "non vérifié", viaEU: "via l'UE", listed: "listé, {sinceText}", notNamed: "pas nommé lui-même",
    cell_eu_member: "celles de l'UE", cell_adopts_eu_measures: "celles de l'UE, reprises{if:partial| en partie|}", cell_own_regime: "{scope}{if:since|, depuis {if:day|le |}{sinceText}|}", cell_financial_directive_only: "directive des autorités financières{if:since|, {sinceText}|}",
    cell_no_own_regime_stated: "déclaré publiquement{if:date| ({dateText})|}", cell_no_own_regime_found: "–", cell_territory_uk_order: "celles du Royaume-Uni", cell_territory: "non vérifié",
    scopeFull: "sanctions propres", scopeExp: "contrôles à l'exportation", scopeExpFin: "contrôles à l'exportation et mesures financières",
    sCounts: "Par catégorie",
    sNoteUkr: "L'Ukraine applique aussi ses propres sanctions contre la Russie ; la carte ne présente ni l'Ukraine ni la Russie comme pays.",
    sNoteSrc: "La page de chaque pays donne ses sources. Une source signalée « extrait de moteur de recherche » n'a pu être lue que par un tel extrait et doit être vérifiée sur le texte officiel avant d'être citée.",
    sQ1: "Quels pays appliquent des sanctions contre la Russie ?",
    sA1: "Les {nEu} membres de l'UE, {nAdopt} autres pays européens qui reprennent les sanctions de l'UE ({adoptList}) et {nOwn} pays dotés de sanctions en vertu de leur propre droit ({ownList}){if:nFin| ; {finList} : une directive des autorités financières|}. Vérifié le {checked}.",
    sQ2: "La liste russe des États « inamicaux » est-elle la liste des pays qui sanctionnent la Russie ?",
    sA2: "Non. Les listes se recoupent mais diffèrent.{if:nListedNo| Sur la liste russe sans sanctions propres : {listedNoList}.|}{if:nAdoptNo| Reprennent les sanctions de l'UE sans figurer sur la liste russe : {adoptNoList}.|}",
    rTitle: "Le budget de guerre russe : défense vs pétrole et gaz",
    rDesc: "Budget de la défense et dépenses militaires de la Russie, à côté de ses recettes pétrolières et gazières depuis {y0}, en roubles et euros, par an et mois.",
    rH1: "Le budget de guerre de la Russie : dépenses de défense et recettes du pétrole et du gaz depuis {y0}", rLabel: "Budget de guerre et recettes pétrolières de la Russie",
    rIntro: "Le budget fédéral russe enregistre les impôts sur la production et l'exportation de pétrole et de gaz comme recettes pétrolières et gazières. En {lastFull}, elles ont atteint {ogRub} ({ogEur}), soit {share} des recettes fédérales ; de janvier à {latestMonth}, {ytdRub} ({ytdEur}), soit {ytdShare}. Chiffres du ministère russe des Finances (données du {published}) ; euros aux taux moyens mensuels de la Banque de Russie.{if:defOk| La loi de finances prévoit {defPlan} pour la « défense nationale » en {defYear}.|}",
    rWhatH: "Ce qui compte comme recettes pétrolières et gazières",
    rWhat: "La taxe sur l'extraction du pétrole, du gaz et du condensat, les droits à l'exportation sur le pétrole, les produits pétroliers et le gaz, et l'impôt additionnel sur le revenu de la production pétrolière, nets des versements « amortisseurs » aux raffineries. C'est une mesure fiscale, pas des recettes d'exportation : elle inclut l'impôt sur le pétrole et le gaz vendus en Russie et laisse de côté les bénéfices des entreprises, l'impôt sur les bénéfices et les dividendes, que le ministère compte dans les autres recettes. Les mois varient parce que l'impôt additionnel est payé chaque trimestre. Le rouble est l'unité officielle ; les valeurs en euros suivent le taux de change.",
    rYearH: "Année par année", rMonthH: "Mois par mois, jusqu'à {latestMonth}",
    thMonth: "Mois", thOgRub: "Recettes pétrolières et gazières, roubles", thOgEur: "En euros", thShare: "Part des recettes fédérales", thTotRub: "Recettes fédérales totales, roubles",
    partYear: "{y}, de janvier à {month}",
    rCreaH: "Recettes d'exportation des combustibles fossiles : une estimation",
    rCrea: "Une autre mesure : ce que les exportations russes de pétrole, de gaz et de charbon ont rapporté, selon l'estimation du Centre for Research on Energy and Clean Air (CREA) à partir des cargaisons suivies et des prix. C'est la valeur des exportations, pas l'impôt, et elle ne s'ajoute pas aux chiffres du budget.",
    thCreaAll: "Tous combustibles fossiles", thCreaOg: "Pétrole et gaz",
    rDefH: "Dépenses de défense, pour situer",
    rDef: "L'argent du budget est mis en commun : aucune recette n'est réservée à une dépense donnée, ces chiffres servent donc à situer et ne relient pas recettes et dépenses. Chaque chiffre dit ce qu'il est : la section « défense nationale » du budget telle que dépensée (jusqu'en 2021) ou prévue par la loi de finances, et l'estimation des dépenses militaires du SIPRI, selon une définition plus large.",
    thDefSpent: "Défense nationale, dépensé", thDefPlan: "Défense nationale, loi de finances", thSipri: "SIPRI : dépenses militaires", thSipriGdp: "SIPRI : part du PIB", approx: "approximatif",
    rMeasureH: "En quoi cela diffère de la mesure de la carte",
    rMeasure: "La carte mesure, pour chaque pays, combien la Russie a gardé en moins ou en plus de son commerce avec ce pays par rapport à un monde sans guerre. Les chiffres de cette page sont les impôts perçus par l'État russe, pour l'ensemble des acheteurs : ils ne peuvent pas être répartis par pays et n'ont pas de base sans guerre, si bien qu'on ne les additionne pas aux chiffres de la carte et qu'on ne les y oppose pas.",
    rMeasureLink: "Ce que la Russie a gardé du commerce, par pays",
    rQ1: "Combien la Russie gagne-t-elle avec le pétrole ?",
    rA1: "Le budget compte le pétrole et le gaz ensemble. Recettes pétrolières et gazières fédérales en {lastFull} : {ogRub} ({ogEur}), soit {share} des recettes fédérales ; de janvier à {latestMonth} : {ytdRub} ({ytdEur}). Le CREA estime les recettes d'exportation de pétrole et de gaz de la Russie en {lastFull} à {crea}.",
    rQ2: "Quelle part des recettes fédérales russes provient du pétrole et du gaz ?",
    rA2: "{share} en {lastFull} et {ytdShare} de janvier à {latestMonth}. Année par année depuis {y0} : {list}.",
    sources: "Sources", hubBackground: "Contexte",
    dlRevMonthly: "Recettes pétrolières et gazières fédérales de la Russie et recettes fédérales totales, mois par mois, en roubles et en euros (ministère des Finances ; CSV)",
    dlRevYearly: "Les mêmes par année, avec l'estimation des recettes d'exportation du CREA et les dépenses de défense, chacune signalée (CSV)",
  },
  es: {
    tRegime: "Sanciones a Rusia", qRegime: "{N}: ¿tiene sanciones contra Rusia?",
    cat_eu_member: "Sí. Como miembro de la UE, este país aplica las sanciones de la UE contra Rusia, que cada miembro aprobó en el Consejo.",
    cat_adopts_eu_measures: "Sí. Este país no está en la UE, pero adopta las sanciones de la UE contra Rusia en su propio derecho.{if:partial| Informes oficiales de la UE dicen que su alineamiento es incompleto.|}",
    cat_own_regime: "Sí. Este país tiene sanciones contra Rusia según su propio derecho{if:since|, desde {if:day|el |}{sinceText}|}.{if:expFin| Son controles a la exportación y medidas financieras, no un régimen general de sanciones.|}{if:exp| Son controles a la exportación de bienes de alta tecnología de una lista; no hay una lista general de sanciones.|}",
    cat_financial_directive_only: "Los supervisores financieros de este país indicaron a los bancos{if:since| el {sinceText}|} que no trataran con personas y empresas sancionadas por Estados Unidos, el Reino Unido, la UE y Canadá. No tiene una lista de sanciones propia.",
    cat_no_own_regime_stated: "No. Este país no ha impuesto sanciones propias a Rusia, y su gobierno lo ha dicho públicamente{if:date| ({dateText})|}.{if:evasion| También ha dicho que no dejará que su territorio se use para eludir las sanciones de otros países.|}",
    cat_no_own_regime_found: "No encontramos sanciones propias de este país contra Rusia (comprobado el {checked}). Esto no dice nada sobre si las empresas de allí cumplen las sanciones de otros países.",
    cat_territory_uk_order: "Es un territorio británico de ultramar: las sanciones del Reino Unido contra Rusia se aplican allí mediante la Russia (Sanctions) (Overseas Territories) Order 2020.",
    cat_territory: "Este territorio depende de otro Estado ({sov}). No comprobamos si las sanciones de ese Estado contra Rusia se extienden a él.",
    priceCap: "Forma parte de la coalición del tope de precio al petróleo ruso{if:viaEU| a través de la UE|}.",
    exportCtl: "Aplica controles a la exportación a Rusia{if:bis|, y Estados Unidos lo incluye entre los socios con controles como los suyos|}.",
    ufListed: "Aparte, Rusia incluye a este país como Estado «hostil» (orden del gobierno {order}, {sinceText}): es la lista propia de Rusia de países contra los que actúa, no una sanción de este país.",
    ufNotNamed: "La lista rusa de Estados «hostiles» no nombra a este territorio como tal{if:sov|; nombra al Estado del que depende ({sov})|}.",
    ufNo: "La lista rusa de Estados «hostiles» no nombra a este país.",
    checked: "Comprobado el {checked}.", srcSearch: "extracto de buscador, por comprobar con el texto oficial", srcNews: "noticia de prensa", allSanctions: "Las sanciones a Rusia, país por país",
    stockLead: "Importes congelados aquí, como contexto (el mapa cuenta el rendimiento que Rusia perdió con ellos, no los importes):",
    stockCbr: "reservas del Banco de Rusia inmovilizadas: {v}", stockPriv: "activos de personas y empresas sancionadas congelados: {v}",
    stockNsd: "{v} en valores de inversores rusos bloqueados a través del depositario sancionado NSD, contados aparte ({date})",
    stockEuroclear: "Euroclear declara {v} de activos rusos sancionados en su balance ({date}); esa cifra se solapa con la del banco central y no se le suma.",
    stockNone: "No se ha publicado ninguna cifra de los importes congelados aquí; que falte la cifra no significa que no haya nada congelado.",
    noFig: "sin cifra pública", estimate: "estimación: unos {v}", source: "fuente",
    colCbr: "Reservas del banco central inmovilizadas", colPriv: "Activos privados sancionados congelados", frozenAll: "Activos rusos congelados por país",
    stockNote: "Las columnas de importes muestran lo congelado en la fecha indicada, como contexto: la tabla se ordena por el rendimiento que Rusia perdió, no por estos importes. «Sin cifra pública» no significa que no haya nada congelado; una estimación se marca como tal.",
    amtFrozenAssets: "En cifras: unos {euCbr} de reservas del Banco de Rusia están inmovilizados en la UE ({euCbrDate}, Comisión Europea), y allí están congelados más de {euPriv} en activos de personas y empresas sancionadas. Para los miembros del grupo de trabajo REPO (la UE, el G7 y Australia), el total oficial fue de unos {repoCbr} en activos del banco central ({repoCbrDate}) y más de {repoPriv} en activos privados ({repoPrivDate}). Euroclear declara {euroclear} de activos rusos sancionados en su balance ({euroclearDate}); esa cifra se solapa con la de la Comisión y no se le suma. Los pagos de beneficios extraordinarios de Euroclear a la UE sumaban unos {windfall} en {windfallDate}.",
    amtReparationsLoan: "Situación: propuesto, no aprobado. La propuesta legal de la Comisión ({propDate}) habría usado hasta {propMax} de activos inmovilizados. El {eucoDate}, el Consejo Europeo acordó en su lugar un préstamo de apoyo a Ucrania de {usl} para {uslYears}, financiado con deuda de la UE: Ucrania lo devuelve cuando Rusia pague reparaciones, y la UE se reserva el derecho de usar para ello los activos inmovilizados. En {paidDate} se habían desembolsado {uslPaid}. Los préstamos ERA del G7 suman unos {eraUsd} ({eraEur}).",
    sTitle: "Sanciones a Rusia por país: UE, EE. UU., Reino Unido y otros",
    sDesc: "Cada país según las sanciones contra Rusia que se aplican allí: UE, quienes adoptan las de la UE, regímenes propios, tope de precio y lista rusa.",
    sH1: "Sanciones a Rusia por país: ¿quién las aplica?", sLabel: "Países con sanciones contra Rusia",
    sIntro: "Cada país y territorio del mapa según las sanciones contra Rusia que se aplican allí (comprobado el {checked}), con la coalición del tope de precio al petróleo y los controles a la exportación. La lista rusa de países «hostiles» tiene su propia columna: es la lista de países contra los que Rusia actúa, no una lista de sanciones, y difieren.",
    lab_eu_member: "Miembros de la UE: sanciones de la UE", lab_adopts_eu_measures: "Adoptan las sanciones de la UE", lab_own_regime: "Sanciones según su propio derecho", lab_financial_directive_only: "Directiva de los supervisores financieros",
    lab_no_own_regime_stated: "Sin sanciones propias, dicho públicamente", lab_no_own_regime_found: "Sin sanciones propias encontradas", lab_territory_uk_order: "Territorios británicos de ultramar: sanciones del Reino Unido", lab_territory: "Territorios: sin comprobar",
    note_eu_member: "Los miembros de la UE aplican las sanciones de la UE contra Rusia, que cada miembro aprobó en el Consejo.",
    note_adopts_eu_measures: "Fuera de la UE; adoptan las sanciones de la UE en su propio derecho. «En parte»: informes oficiales de la UE dicen que el alineamiento es incompleto.",
    note_own_regime: "Sanciones o controles a la exportación según su propio derecho; el alcance varía, como indica la columna.",
    note_financial_directive_only: "Los supervisores financieros indicaron a los bancos que respeten las sanciones de otros países; no hay una lista propia.",
    note_no_own_regime_stated: "Sin sanciones propias, y el gobierno lo ha dicho públicamente.",
    note_no_own_regime_found: "Sin sanciones propias encontradas en la fecha comprobada. Esto no dice nada sobre si las empresas de allí cumplen las sanciones de otros países.",
    note_territory_uk_order: "Las sanciones del Reino Unido contra Rusia se aplican aquí por orden.",
    note_territory: "No son Estados soberanos: no se comprobó en cada caso si las sanciones del Estado soberano se extienden a ellos.",
    thMeasures: "Medidas", thPriceCap: "Coalición del tope de precio", thExport: "Controles a la exportación", thUnfriendly: "Lista rusa de Estados «hostiles»",
    yes: "sí", no: "no", notChecked: "sin comprobar", viaEU: "vía la UE", listed: "en la lista, {sinceText}", notNamed: "no nombrado como tal",
    cell_eu_member: "las de la UE", cell_adopts_eu_measures: "las de la UE, adoptadas{if:partial| en parte|}", cell_own_regime: "{scope}{if:since|, desde {if:day|el |}{sinceText}|}", cell_financial_directive_only: "directiva de los supervisores financieros{if:since|, {sinceText}|}",
    cell_no_own_regime_stated: "dicho públicamente{if:date| ({dateText})|}", cell_no_own_regime_found: "–", cell_territory_uk_order: "las del Reino Unido", cell_territory: "sin comprobar",
    scopeFull: "sanciones propias", scopeExp: "controles a la exportación", scopeExpFin: "controles a la exportación y medidas financieras",
    sCounts: "Por categoría",
    sNoteUkr: "Ucrania también tiene sanciones propias contra Rusia; el mapa no presenta a Ucrania ni a Rusia como países.",
    sNoteSrc: "La página de cada país da sus fuentes. Una fuente marcada «extracto de buscador» se leyó en ese extracto y debe comprobarse con el texto oficial antes de citarla.",
    sQ1: "¿Qué países tienen sanciones contra Rusia?",
    sA1: "Los {nEu} miembros de la UE, otros {nAdopt} países europeos que adoptan las sanciones de la UE ({adoptList}) y {nOwn} países con sanciones según su propio derecho ({ownList}){if:nFin|; {finList}: una directiva de los supervisores financieros|}. Comprobado el {checked}.",
    sQ2: "¿Es la lista rusa de Estados «hostiles» la lista de países con sanciones?",
    sA2: "No. Las listas se solapan, pero difieren.{if:nListedNo| En la lista rusa sin sanciones propias: {listedNoList}.|}{if:nAdoptNo| Adoptan las sanciones de la UE sin figurar en la lista rusa: {adoptNoList}.|}",
    rTitle: "Presupuesto de guerra de Rusia: defensa vs. petróleo y gas",
    rDesc: "El presupuesto de defensa y el gasto militar de Rusia junto a sus ingresos federales por petróleo y gas desde {y0}, en rublos y euros, por año y mes.",
    rH1: "El presupuesto de guerra de Rusia: gasto en defensa e ingresos por petróleo y gas desde {y0}", rLabel: "Presupuesto de guerra e ingresos por petróleo y gas de Rusia",
    rIntro: "El presupuesto federal ruso registra los impuestos sobre la producción y la exportación de petróleo y gas como ingresos por petróleo y gas. En {lastFull} sumaron {ogRub} ({ogEur}), el {share} de los ingresos federales; de enero a {latestMonth}, {ytdRub} ({ytdEur}), el {ytdShare}. Cifras del Ministerio de Finanzas de Rusia (datos del {published}); euros al tipo medio mensual del Banco de Rusia.{if:defOk| La ley de presupuestos prevé {defPlan} para «defensa nacional» en {defYear}.|}",
    rWhatH: "Qué cuenta como ingresos por petróleo y gas",
    rWhat: "El impuesto sobre la extracción de petróleo, gas y condensado, los derechos de exportación sobre el petróleo, sus derivados y el gas, y el impuesto adicional sobre la renta de la producción de petróleo, descontados los pagos «amortiguadores» a las refinerías. Mide impuestos, no ingresos por exportación: incluye el impuesto sobre el petróleo y el gas vendidos en Rusia y deja fuera los beneficios de las empresas, el impuesto de sociedades y los dividendos, que el ministerio cuenta como otros ingresos. Los meses varían porque el impuesto adicional se paga cada trimestre. El rublo es la unidad oficial; los valores en euros se mueven con el tipo de cambio.",
    rYearH: "Año a año", rMonthH: "Mes a mes, hasta {latestMonth}",
    thMonth: "Mes", thOgRub: "Ingresos por petróleo y gas, rublos", thOgEur: "En euros", thShare: "Parte de los ingresos federales", thTotRub: "Ingresos federales totales, rublos",
    partYear: "{y}, de enero a {month}",
    rCreaH: "Ingresos por exportación de combustibles fósiles: una estimación",
    rCrea: "Otra medida: lo que obtuvieron las exportaciones rusas de petróleo, gas y carbón, según la estimación del Centre for Research on Energy and Clean Air (CREA) a partir de envíos rastreados y precios. Es el valor de las exportaciones, no impuestos, y no se suma a las cifras del presupuesto.",
    thCreaAll: "Todos los combustibles fósiles", thCreaOg: "Petróleo y gas",
    rDefH: "Gasto en defensa, como contexto",
    rDef: "El dinero del presupuesto se junta: ningún ingreso se reserva para un gasto concreto, así que estas cifras son contexto, no un vínculo entre ingresos y gastos. Cada cifra dice lo que es: la sección «defensa nacional» del presupuesto según lo gastado (hasta 2021) o lo previsto en la ley de presupuestos, y la estimación del gasto militar del SIPRI, con una definición más amplia.",
    thDefSpent: "Defensa nacional, gastado", thDefPlan: "Defensa nacional, ley de presupuestos", thSipri: "SIPRI: gasto militar", thSipriGdp: "SIPRI: parte del PIB", approx: "aproximado",
    rMeasureH: "En qué se diferencia de la medida del mapa",
    rMeasure: "El mapa mide, para cada país, cuánto retuvo Rusia de menos o de más del comercio con ese país frente a un mundo sin guerra. Las cifras de esta página son los impuestos que recibió el Estado ruso, de todos los compradores juntos: no pueden repartirse por país ni tienen una base sin guerra, así que no se suman a las cifras del mapa ni se contraponen a ellas.",
    rMeasureLink: "Lo que Rusia retuvo del comercio, por país",
    rQ1: "¿Cuánto gana Rusia con el petróleo?",
    rA1: "El presupuesto contabiliza petróleo y gas juntos. Ingresos federales por petróleo y gas en {lastFull}: {ogRub} ({ogEur}), el {share} de los ingresos federales; de enero a {latestMonth}: {ytdRub} ({ytdEur}). CREA estima los ingresos de Rusia por exportar petróleo y gas en {lastFull} en {crea}.",
    rQ2: "¿Qué parte de los ingresos federales de Rusia procede del petróleo y el gas?",
    rA2: "El {share} en {lastFull} y el {ytdShare} de enero a {latestMonth}. Año a año desde {y0}: {list}.",
    sources: "Fuentes", hubBackground: "Contexto",
    dlRevMonthly: "Ingresos federales de Rusia por petróleo y gas e ingresos federales totales, mes a mes, en rublos y euros (Ministerio de Finanzas; CSV)",
    dlRevYearly: "Lo mismo por año, con la estimación de CREA de los ingresos por exportación y el gasto en defensa, cada uno etiquetado (CSV)",
  },
  pl: {
    tRegime: "Sankcje wobec Rosji", qRegime: "{N}: czy ma sankcje wobec Rosji?",
    cat_eu_member: "Tak. Jako członek UE ten kraj stosuje sankcje UE wobec Rosji, na które każdy członek zgodził się w Radzie.",
    cat_adopts_eu_measures: "Tak. Ten kraj nie należy do UE, ale przyjmuje sankcje UE wobec Rosji we własnym prawie.{if:partial| Oficjalne raporty UE oceniają to dostosowanie jako niepełne.|}",
    cat_own_regime: "Tak. Ten kraj ma sankcje wobec Rosji na mocy własnego prawa{if:since|, od {sinceText}|}.{if:expFin| To kontrole eksportu i środki finansowe, a nie ogólny system sankcji.|}{if:exp| To kontrole eksportu wymienionych towarów zaawansowanych technologii; ogólnej listy sankcyjnej nie ma.|}",
    cat_financial_directive_only: "Nadzór finansowy tego kraju polecił bankom{if:since| {sinceText}|}, by nie prowadziły interesów z osobami i firmami objętymi sankcjami Stanów Zjednoczonych, Wielkiej Brytanii, UE i Kanady. Własnej listy sankcyjnej nie ma.",
    cat_no_own_regime_stated: "Nie. Ten kraj nie ma własnych sankcji wobec Rosji, a jego rząd powiedział to publicznie{if:date| ({dateText})|}.{if:evasion| Zapowiedział też, że nie pozwoli używać terytorium kraju do obchodzenia sankcji innych krajów.|}",
    cat_no_own_regime_found: "Nie znaleźliśmy własnych sankcji tego kraju wobec Rosji (stan na {checked}). Nie mówi to nic o tym, czy tamtejsze firmy przestrzegają sankcji innych krajów.",
    cat_territory_uk_order: "To brytyjskie terytorium zamorskie: sankcje Wielkiej Brytanii wobec Rosji obowiązują tam na mocy Russia (Sanctions) (Overseas Territories) Order 2020.",
    cat_territory: "To terytorium należy do innego państwa ({sov}). Nie sprawdzaliśmy, czy sankcje tego państwa wobec Rosji je obejmują.",
    priceCap: "Należy do koalicji pułapu cenowego na rosyjską ropę{if:viaEU| za pośrednictwem UE|}.",
    exportCtl: "Stosuje kontrole eksportu wobec Rosji{if:bis|, a Stany Zjednoczone wymieniają ten kraj wśród partnerów z kontrolami podobnymi do własnych|}.",
    ufListed: "Niezależnie od tego Rosja umieszcza ten kraj na liście państw „nieprzyjaznych” (zarządzenie rządu {order}, {sinceText}): to własna lista Rosji z krajami, wobec których podejmuje działania, a nie sankcja tego kraju.",
    ufNotNamed: "Rosyjska lista państw „nieprzyjaznych” nie wymienia samego terytorium{if:sov|; wymienia państwo, do którego należy ({sov})|}.",
    ufNo: "Rosyjska lista państw „nieprzyjaznych” nie wymienia tego kraju.",
    checked: "Stan na {checked}.", srcSearch: "wyciąg z wyszukiwarki, do sprawdzenia z oficjalnym tekstem", srcNews: "doniesienie prasowe", allSanctions: "Sankcje wobec Rosji: każdy kraj",
    stockLead: "Kwoty zamrożone tutaj, dla kontekstu (mapa liczy zwrot utracony na nich przez Rosję, a nie same kwoty):",
    stockCbr: "unieruchomione rezerwy Banku Rosji: {v}", stockPriv: "zamrożone aktywa osób i firm objętych sankcjami: {v}",
    stockNsd: "{v} w papierach wartościowych rosyjskich inwestorów zablokowanych przez objęty sankcjami depozyt NSD, liczone osobno ({date})",
    stockEuroclear: "Euroclear wykazuje {v} objętych sankcjami rosyjskich aktywów w swoim bilansie ({date}); ta kwota pokrywa się z kwotą banku centralnego i nie jest do niej dodawana.",
    stockNone: "Nie opublikowano kwot zamrożonych tutaj; brak danych nie oznacza, że nic nie jest zamrożone.",
    noFig: "brak publicznych danych", estimate: "szacunek: około {v}", source: "źródło",
    colCbr: "Rezerwy banku centralnego, unieruchomione", colPriv: "Prywatne aktywa objęte sankcjami, zamrożone", frozenAll: "Zamrożone rosyjskie aktywa według krajów",
    stockNote: "Kolumny z kwotami pokazują sumy zamrożone na podany dzień, dla kontekstu: tabela jest uporządkowana według zwrotu utraconego przez Rosję, a nie według tych kwot. „Brak publicznych danych” nie oznacza, że nic nie jest zamrożone; szacunek jest oznaczony jako szacunek.",
    amtFrozenAssets: "W liczbach: około {euCbr} rezerw Banku Rosji jest unieruchomionych w UE ({euCbrDate}, Komisja Europejska), a ponad {euPriv} aktywów osób i firm objętych sankcjami jest tam zamrożonych. Dla członków grupy zadaniowej REPO (UE, G7 i Australia) oficjalna suma wyniosła około {repoCbr} aktywów banku centralnego ({repoCbrDate}) i ponad {repoPriv} aktywów prywatnych ({repoPrivDate}). Euroclear wykazuje {euroclear} objętych sankcjami rosyjskich aktywów w swoim bilansie ({euroclearDate}); ta kwota pokrywa się z kwotą Komisji i nie jest do niej dodawana. Wpłaty nadzwyczajnych zysków z Euroclear do UE sięgnęły około {windfall} do {windfallDate}.",
    amtReparationsLoan: "Stan: zaproponowany, nieprzyjęty. Wniosek ustawodawczy Komisji ({propDate}) przewidywał użycie do {propMax} unieruchomionych aktywów. {eucoDate} Rada Europejska uzgodniła zamiast tego pożyczkę na wsparcie Ukrainy w wysokości {usl} na lata {uslYears}, finansowaną z pożyczek UE: Ukraina spłaci ją, gdy Rosja zapłaci reparacje, a UE zachowuje prawo do użycia na ten cel unieruchomionych aktywów. Do {paidDate} wypłacono z niej {uslPaid}. Pożyczki ERA grupy G7 wynoszą około {eraUsd} ({eraEur}).",
    sTitle: "Sankcje wobec Rosji według krajów: UE, USA, Wielka Brytania",
    sDesc: "Każdy kraj z mapy według sankcji wobec Rosji, które tam obowiązują: członkowie UE, przyjmujący sankcje UE, własne systemy, pułap cenowy i lista Rosji.",
    sH1: "Sankcje wobec Rosji według krajów: kto je stosuje?", sLabel: "Kraje z sankcjami wobec Rosji",
    sIntro: "Każdy kraj i terytorium z mapy według sankcji wobec Rosji, które tam obowiązują (stan na {checked}), wraz z koalicją pułapu cenowego na ropę i kontrolami eksportu. Rosyjska lista krajów „nieprzyjaznych” ma osobną kolumnę: to lista krajów, wobec których Rosja podejmuje działania, a nie lista sankcji, i obie się różnią.",
    lab_eu_member: "Członkowie UE: sankcje UE", lab_adopts_eu_measures: "Przyjmują sankcje UE", lab_own_regime: "Sankcje na mocy własnego prawa", lab_financial_directive_only: "Polecenie nadzoru finansowego",
    lab_no_own_regime_stated: "Bez własnych sankcji, oświadczone publicznie", lab_no_own_regime_found: "Nie znaleziono własnych sankcji", lab_territory_uk_order: "Brytyjskie terytoria zamorskie: sankcje Wielkiej Brytanii", lab_territory: "Terytoria: niesprawdzone",
    note_eu_member: "Członkowie UE stosują sankcje UE wobec Rosji, na które każdy członek zgodził się w Radzie.",
    note_adopts_eu_measures: "Poza UE; przyjmują sankcje UE we własnym prawie. „Częściowo”: oficjalne raporty UE oceniają dostosowanie jako niepełne.",
    note_own_regime: "Sankcje lub kontrole eksportu na mocy własnego prawa; zakres jest różny, jak pokazuje kolumna.",
    note_financial_directive_only: "Nadzór finansowy polecił bankom przestrzegać sankcji innych krajów; własnej listy nie ma.",
    note_no_own_regime_stated: "Bez własnych sankcji, a rząd powiedział to publicznie.",
    note_no_own_regime_found: "Nie znaleziono własnych sankcji w dniu sprawdzenia. Nie mówi to nic o tym, czy tamtejsze firmy przestrzegają sankcji innych krajów.",
    note_territory_uk_order: "Sankcje Wielkiej Brytanii wobec Rosji obowiązują tu na mocy zarządzenia.",
    note_territory: "Nie są to państwa suwerenne: nie sprawdzano po kolei, czy obejmują je sankcje państwa, do którego należą.",
    thMeasures: "Środki", thPriceCap: "Koalicja pułapu cenowego", thExport: "Kontrole eksportu", thUnfriendly: "Rosyjska lista państw „nieprzyjaznych”",
    yes: "tak", no: "nie", notChecked: "niesprawdzone", viaEU: "przez UE", listed: "na liście, {sinceText}", notNamed: "niewymienione wprost",
    cell_eu_member: "sankcje UE", cell_adopts_eu_measures: "sankcje UE, przyjęte{if:partial| częściowo|}", cell_own_regime: "{scope}{if:since|, od {sinceText}|}", cell_financial_directive_only: "polecenie nadzoru finansowego{if:since|, {sinceText}|}",
    cell_no_own_regime_stated: "oświadczone publicznie{if:date| ({dateText})|}", cell_no_own_regime_found: "–", cell_territory_uk_order: "sankcje Wielkiej Brytanii", cell_territory: "niesprawdzone",
    scopeFull: "własne sankcje", scopeExp: "kontrole eksportu", scopeExpFin: "kontrole eksportu i środki finansowe",
    sCounts: "Według kategorii",
    sNoteUkr: "Ukraina też ma własne sankcje wobec Rosji; mapa nie przedstawia Ukrainy ani Rosji jako krajów.",
    sNoteSrc: "Strona każdego kraju podaje jego źródła. Źródło oznaczone jako „wyciąg z wyszukiwarki” dało się odczytać wyłącznie z takiego wyciągu i przed cytowaniem trzeba je sprawdzić z oficjalnym tekstem.",
    sQ1: "Które kraje mają sankcje wobec Rosji?",
    sA1: "Członkowie UE ({nEu}), inne kraje europejskie przyjmujące sankcje UE ({nAdopt}: {adoptList}) oraz kraje z sankcjami na mocy własnego prawa ({nOwn}: {ownList}){if:nFin|; {finList}: polecenie nadzoru finansowego|}. Stan na {checked}.",
    sQ2: "Czy rosyjska lista państw „nieprzyjaznych” to lista krajów z sankcjami?",
    sA2: "Nie. Obie listy częściowo się pokrywają, ale się różnią.{if:nListedNo| Na liście Rosji bez własnych sankcji: {listedNoList}.|}{if:nAdoptNo| Przyjmują sankcje UE, choć nie ma ich na liście Rosji: {adoptNoList}.|}",
    rTitle: "Wojenny budżet Rosji: obrona a dochody z ropy i gazu",
    rDesc: "Budżet obronny i wydatki wojskowe Rosji obok federalnych dochodów z ropy i gazu od {y0} r., w rublach i euro, według lat i miesięcy.",
    rH1: "Wojenny budżet Rosji: wydatki na obronę i dochody z ropy i gazu od {y0} r.", rLabel: "Wojenny budżet Rosji i dochody z ropy i gazu",
    rIntro: "Budżet federalny Rosji księguje podatki od wydobycia i eksportu ropy i gazu jako dochody naftowo-gazowe. W {lastFull} r. wyniosły {ogRub} ({ogEur}), czyli {share} dochodów federalnych; od stycznia do {latestMonth}: {ytdRub} ({ytdEur}), czyli {ytdShare}. Dane rosyjskiego Ministerstwa Finansów (stan na {published}); euro według średnich miesięcznych kursów Banku Rosji.{if:defOk| Ustawa budżetowa przewiduje {defPlan} na „obronę narodową” w {defYear} r.|}",
    rWhatH: "Co liczy się jako dochody z ropy i gazu",
    rWhat: "Podatek od wydobycia ropy, gazu i kondensatu, cła eksportowe na ropę, produkty naftowe i gaz oraz dodatkowy podatek dochodowy od wydobycia ropy, po odjęciu płatności „amortyzatora” dla rafinerii. To miara podatków, a nie przychodów z eksportu: obejmuje podatek od ropy i gazu sprzedanych w Rosji i pomija zyski firm, podatek od zysków i dywidendy, które ministerstwo liczy jako inne dochody. Miesiące się wahają, bo dodatkowy podatek płaci się co kwartał. Rubel jest jednostką oficjalną; wartości w euro zmieniają się z kursem.",
    rYearH: "Rok po roku", rMonthH: "Miesiąc po miesiącu, do {latestMonth}",
    thMonth: "Miesiąc", thOgRub: "Dochody z ropy i gazu, ruble", thOgEur: "W euro", thShare: "Udział w dochodach federalnych", thTotRub: "Wszystkie dochody federalne, ruble",
    partYear: "{y}, od stycznia do {month}",
    rCreaH: "Przychody z eksportu paliw kopalnych: szacunek",
    rCrea: "Inna miara: ile przyniósł rosyjski eksport ropy, gazu i węgla według szacunku Centre for Research on Energy and Clean Air (CREA) na podstawie śledzonych dostaw i cen. To wartość eksportu, a nie podatki, i nie dodaje się jej do danych budżetowych.",
    thCreaAll: "Wszystkie paliwa kopalne", thCreaOg: "Ropa i gaz",
    rDefH: "Wydatki na obronę, dla kontekstu",
    rDef: "Pieniądze budżetu są wspólne: żaden dochód nie jest przypisany do konkretnego wydatku, więc te liczby dają kontekst, a nie związek między dochodami a wydatkami. Każda liczba mówi, czym jest: dział budżetu „obrona narodowa” według wykonania (do 2021 r.) lub planu w ustawie budżetowej oraz szacunek wydatków wojskowych SIPRI, oparty na szerszej definicji.",
    thDefSpent: "Obrona narodowa, wykonanie", thDefPlan: "Obrona narodowa, ustawa budżetowa", thSipri: "SIPRI: wydatki wojskowe", thSipriGdp: "SIPRI: udział w PKB", approx: "w przybliżeniu",
    rMeasureH: "Czym to się różni od miary na mapie",
    rMeasure: "Mapa mierzy dla każdego kraju, ile mniej lub ile więcej Rosja zatrzymała z handlu z tym krajem niż w świecie bez wojny. Liczby na tej stronie to podatki, które otrzymało państwo rosyjskie od wszystkich nabywców łącznie: nie da się ich podzielić według krajów i nie mają poziomu odniesienia bez wojny, więc nie dodaje się ich do siebie ani nie zestawia ze sobą.",
    rMeasureLink: "Co Rosja zatrzymała z handlu, według krajów",
    rQ1: "Ile Rosja zarabia na ropie?",
    rA1: "Budżet liczy ropę i gaz łącznie. Federalne dochody z ropy i gazu w {lastFull} r.: {ogRub} ({ogEur}), czyli {share} dochodów federalnych; od stycznia do {latestMonth}: {ytdRub} ({ytdEur}). CREA szacuje przychody Rosji z eksportu ropy i gazu w {lastFull} r. na {crea}.",
    rQ2: "Jaka część dochodów federalnych Rosji pochodzi z ropy i gazu?",
    rA2: "{share} w {lastFull} r. i {ytdShare} od stycznia do {latestMonth}. Rok po roku od {y0} r.: {list}.",
    sources: "Źródła", hubBackground: "Tło",
    dlRevMonthly: "Federalne dochody Rosji z ropy i gazu oraz wszystkie dochody federalne, miesiąc po miesiącu, w rublach i euro (Ministerstwo Finansów; CSV)",
    dlRevYearly: "To samo według lat, z szacunkiem przychodów z eksportu CREA i wydatkami na obronę, każde z opisem (CSV)",
  },
  nl: {
    tRegime: "Sancties tegen Rusland", qRegime: "{N}: heeft het sancties tegen Rusland?",
    cat_eu_member: "Ja. Als EU-lid past dit land de sancties van de EU tegen Rusland toe, waarmee elk lid in de Raad heeft ingestemd.",
    cat_adopts_eu_measures: "Ja. Dit land zit niet in de EU, maar neemt de sancties van de EU tegen Rusland over in eigen recht.{if:partial| Officiële EU-rapporten noemen die afstemming onvolledig.|}",
    cat_own_regime: "Ja. Dit land heeft sancties tegen Rusland op grond van eigen recht{if:since|, sinds {sinceText}|}.{if:expFin| Het gaat om exportcontroles en financiële maatregelen, geen algemeen sanctieregime.|}{if:exp| Het gaat om exportcontroles op vermelde hightechgoederen; een algemene sanctielijst is er niet.|}",
    cat_financial_directive_only: "De financiële toezichthouders van dit land droegen banken{if:since| op {sinceText}|} op geen zaken te doen met personen en bedrijven die de Verenigde Staten, het Verenigd Koninkrijk, de EU en Canada sanctioneren. Een eigen sanctielijst is er niet.",
    cat_no_own_regime_stated: "Nee. Dit land heeft geen eigen sancties tegen Rusland ingesteld, en de regering heeft dat publiek gezegd{if:date| ({dateText})|}.{if:evasion| Ze heeft ook gezegd dat ze het grondgebied niet laat gebruiken om de sancties van andere landen te omzeilen.|}",
    cat_no_own_regime_found: "We vonden geen eigen sancties van dit land tegen Rusland (gecontroleerd op {checked}). Dat zegt niets over de vraag of bedrijven daar de sancties van andere landen volgen.",
    cat_territory_uk_order: "Dit is een Brits overzees gebied: de sancties van het Verenigd Koninkrijk tegen Rusland gelden er via de Russia (Sanctions) (Overseas Territories) Order 2020.",
    cat_territory: "Dit gebied hoort bij een andere staat ({sov}). We hebben niet gecontroleerd of de sancties van die staat tegen Rusland er gelden.",
    priceCap: "Het hoort bij de coalitie van het prijsplafond voor Russische olie{if:viaEU| via de EU|}.",
    exportCtl: "Het past exportcontroles toe op Rusland{if:bis|, en de Verenigde Staten noemen het onder de partners met controles zoals de hunne|}.",
    ufListed: "Los daarvan zet Rusland dit land op de lijst van ‘onvriendelijke’ staten (regeringsbesluit {order}, {sinceText}): dat is Ruslands eigen lijst van landen waartegen het optreedt, geen sanctie van dit land.",
    ufNotNamed: "Ruslands lijst van ‘onvriendelijke’ staten noemt dit gebied niet zelf{if:sov|; ze noemt de staat waartoe het hoort ({sov})|}.",
    ufNo: "Ruslands lijst van ‘onvriendelijke’ staten noemt dit land niet.",
    checked: "Gecontroleerd op {checked}.", srcSearch: "uittreksel van een zoekmachine, te controleren aan de officiële tekst", srcNews: "persbericht", allSanctions: "Sancties tegen Rusland, per land",
    stockLead: "Bedragen die hier bevroren zijn, ter context (de kaart telt het rendement dat Rusland erop misliep, niet de bedragen):",
    stockCbr: "geïmmobiliseerde reserves van de Russische centrale bank: {v}", stockPriv: "bevroren tegoeden van gesanctioneerde personen en bedrijven: {v}",
    stockNsd: "{v} aan effecten van Russische beleggers, geblokkeerd via de gesanctioneerde bewaarinstelling NSD, apart geteld ({date})",
    stockEuroclear: "Euroclear meldt {v} aan gesanctioneerde Russische tegoeden op zijn balans ({date}); dat cijfer overlapt met dat van de centrale bank en komt er niet bij.",
    stockNone: "Voor de hier bevroren bedragen is geen cijfer gepubliceerd; een ontbrekend cijfer betekent niet dat er niets bevroren is.",
    noFig: "geen openbaar cijfer", estimate: "schatting: ongeveer {v}", source: "bron",
    colCbr: "Reserves centrale bank, geïmmobiliseerd", colPriv: "Gesanctioneerde privétegoeden, bevroren", frozenAll: "Bevroren Russische tegoeden per land",
    stockNote: "De kolommen met bedragen tonen wat op de genoemde datum bevroren was, ter context: de tabel is gesorteerd op het rendement dat Rusland misliep, niet op deze bedragen. ‘Geen openbaar cijfer’ betekent niet dat er niets bevroren is; een schatting staat als schatting vermeld.",
    amtFrozenAssets: "In cijfers: ongeveer {euCbr} aan reserves van de Russische centrale bank is in de EU geïmmobiliseerd ({euCbrDate}, Europese Commissie), en ruim {euPriv} aan tegoeden van gesanctioneerde personen en bedrijven is er bevroren. Voor de leden van de REPO-taskforce (de EU, de G7 en Australië) was het officiële totaal ongeveer {repoCbr} aan centralebanktegoeden ({repoCbrDate}) en ruim {repoPriv} aan privétegoeden ({repoPrivDate}). Euroclear meldt {euroclear} aan gesanctioneerde Russische tegoeden op zijn balans ({euroclearDate}); dat cijfer overlapt met dat van de Commissie en komt er niet bij. De afdrachten van overwinsten door Euroclear aan de EU kwamen tot {windfallDate} op ongeveer {windfall}.",
    amtReparationsLoan: "Stand van zaken: voorgesteld, niet aangenomen. Het wetsvoorstel van de Commissie ({propDate}) zou tot {propMax} aan geïmmobiliseerde tegoeden hebben gebruikt. Op {eucoDate} koos de Europese Raad in plaats daarvan voor een steunlening aan Oekraïne van {usl} voor {uslYears}, gefinancierd met leningen van de EU: Oekraïne betaalt haar terug zodra Rusland herstelbetalingen doet, en de EU behoudt het recht om de geïmmobiliseerde tegoeden daarvoor te gebruiken. Tot {paidDate} was er {uslPaid} van uitbetaald. De ERA-leningen van de G7 bedragen ongeveer {eraUsd} ({eraEur}).",
    sTitle: "Sancties tegen Rusland per land: EU, VS, VK en andere",
    sDesc: "Elk land volgens de sancties tegen Rusland die er gelden: EU-leden, overname van EU-sancties, eigen regimes, prijsplafond en Ruslands lijst.",
    sH1: "Sancties tegen Rusland per land: wie heeft ze?", sLabel: "Landen met sancties tegen Rusland",
    sIntro: "Elk land en gebied op de kaart volgens de sancties tegen Rusland die er gelden (gecontroleerd op {checked}), met de coalitie van het olieprijsplafond en de exportcontroles. Ruslands eigen lijst van ‘onvriendelijke’ landen heeft een eigen kolom: het is de lijst van landen waartegen Rusland optreedt, geen lijst van sancties, en ze verschillen.",
    lab_eu_member: "EU-leden: sancties van de EU", lab_adopts_eu_measures: "Nemen de sancties van de EU over", lab_own_regime: "Sancties op grond van eigen recht", lab_financial_directive_only: "Opdracht van de financiële toezichthouders",
    lab_no_own_regime_stated: "Geen eigen sancties, publiek gezegd", lab_no_own_regime_found: "Geen eigen sancties gevonden", lab_territory_uk_order: "Britse overzeese gebieden: sancties van het Verenigd Koninkrijk", lab_territory: "Gebieden: niet gecontroleerd",
    note_eu_member: "EU-leden passen de sancties van de EU tegen Rusland toe, waarmee elk lid in de Raad heeft ingestemd.",
    note_adopts_eu_measures: "Niet in de EU; ze nemen de sancties van de EU over in eigen recht. ‘Deels’: officiële EU-rapporten noemen de afstemming onvolledig.",
    note_own_regime: "Sancties of exportcontroles op grond van eigen recht; de reikwijdte verschilt, zoals de kolom laat zien.",
    note_financial_directive_only: "De financiële toezichthouders droegen banken op de sancties van andere landen te volgen; een eigen lijst is er niet.",
    note_no_own_regime_stated: "Geen eigen sancties, en de regering heeft dat publiek gezegd.",
    note_no_own_regime_found: "Geen eigen sancties gevonden op de controledatum. Dat zegt niets over de vraag of bedrijven daar de sancties van andere landen volgen.",
    note_territory_uk_order: "De sancties van het Verenigd Koninkrijk tegen Rusland gelden hier bij besluit.",
    note_territory: "Geen soevereine staten: of de sancties van de staat waartoe ze horen er gelden, is niet per gebied gecontroleerd.",
    thMeasures: "Maatregelen", thPriceCap: "Coalitie prijsplafond", thExport: "Exportcontroles", thUnfriendly: "Ruslands lijst van ‘onvriendelijke’ staten",
    yes: "ja", no: "nee", notChecked: "niet gecontroleerd", viaEU: "via de EU", listed: "op de lijst, {sinceText}", notNamed: "niet zelf genoemd",
    cell_eu_member: "die van de EU", cell_adopts_eu_measures: "die van de EU, overgenomen{if:partial|, deels|}", cell_own_regime: "{scope}{if:since|, sinds {sinceText}|}", cell_financial_directive_only: "opdracht van de toezichthouders{if:since|, {sinceText}|}",
    cell_no_own_regime_stated: "publiek gezegd{if:date| ({dateText})|}", cell_no_own_regime_found: "–", cell_territory_uk_order: "die van het Verenigd Koninkrijk", cell_territory: "niet gecontroleerd",
    scopeFull: "eigen sancties", scopeExp: "exportcontroles", scopeExpFin: "exportcontroles en financiële maatregelen",
    sCounts: "Per categorie",
    sNoteUkr: "Ook Oekraïne heeft eigen sancties tegen Rusland; de kaart toont Oekraïne en Rusland niet als landen.",
    sNoteSrc: "De pagina van elk land noemt zijn bronnen. Een bron met de vermelding ‘uittreksel van een zoekmachine’ was uitsluitend via zo'n uittreksel te lezen en moet aan de officiële tekst worden gecontroleerd voordat ze wordt geciteerd.",
    sQ1: "Welke landen hebben sancties tegen Rusland?",
    sA1: "De {nEu} leden van de EU, {nAdopt} andere Europese landen die de sancties van de EU overnemen ({adoptList}) en {nOwn} landen met sancties op grond van eigen recht ({ownList}){if:nFin|; {finList}: een opdracht van de financiële toezichthouders|}. Gecontroleerd op {checked}.",
    sQ2: "Is Ruslands lijst van ‘onvriendelijke’ staten de lijst van landen met sancties?",
    sA2: "Nee. De lijsten overlappen, maar verschillen.{if:nListedNo| Op Ruslands lijst zonder eigen sancties: {listedNoList}.|}{if:nAdoptNo| Nemen de sancties van de EU over zonder op Ruslands lijst te staan: {adoptNoList}.|}",
    rTitle: "Ruslands oorlogsbegroting: defensie vs. olie en gas",
    rDesc: "Ruslands defensiebegroting en militaire uitgaven naast de federale olie- en gasinkomsten sinds {y0}, in roebel en euro, per jaar en per maand.",
    rH1: "Ruslands oorlogsbegroting: defensie-uitgaven en inkomsten uit olie en gas sinds {y0}", rLabel: "Ruslands oorlogsbegroting en olie- en gasinkomsten",
    rIntro: "Ruslands federale begroting boekt belastingen op de winning en export van olie en gas als olie- en gasinkomsten. In {lastFull} was dat {ogRub} ({ogEur}), {share} van de federale inkomsten; van januari tot en met {latestMonth} {ytdRub} ({ytdEur}), {ytdShare}. Cijfers van het Russische ministerie van Financiën (gegevens van {published}); euro tegen de maandgemiddelde koersen van de Russische centrale bank.{if:defOk| De begrotingswet voorziet {defPlan} voor ‘nationale defensie’ in {defYear}.|}",
    rWhatH: "Wat telt als olie- en gasinkomsten",
    rWhat: "De delfstoffenbelasting op olie, gas en condensaat, exportheffingen op olie, olieproducten en gas, en de extra winstbelasting op olieproductie, na aftrek van de ‘demper’-betalingen aan raffinaderijen. Het meet belasting, geen exportopbrengst: het omvat belasting op olie en gas die in Rusland verkocht worden en laat bedrijfswinsten, winstbelasting en dividenden weg, die het ministerie als overige inkomsten telt. De maanden schommelen omdat de extra winstbelasting per kwartaal wordt betaald. De roebel is de officiële eenheid; waarden in euro bewegen mee met de wisselkoers.",
    rYearH: "Jaar na jaar", rMonthH: "Maand na maand, tot en met {latestMonth}",
    thMonth: "Maand", thOgRub: "Olie- en gasinkomsten, roebel", thOgEur: "In euro", thShare: "Aandeel in federale inkomsten", thTotRub: "Alle federale inkomsten, roebel",
    partYear: "{y}, januari tot en met {month}",
    rCreaH: "Exportopbrengst van fossiele brandstoffen: een schatting",
    rCrea: "Een andere maat: wat Ruslands export van olie, gas en steenkool opbracht, geschat door het Centre for Research on Energy and Clean Air (CREA) op basis van gevolgde ladingen en prijzen. Het is de waarde van de export, geen belasting, en wordt niet bij de begrotingscijfers opgeteld.",
    thCreaAll: "Alle fossiele brandstoffen", thCreaOg: "Olie en gas",
    rDefH: "Defensie-uitgaven, ter context",
    rDef: "Begrotingsgeld gaat in één pot: geen inkomst is gereserveerd voor een bepaalde uitgave, dus deze cijfers geven context, geen verband tussen inkomsten en uitgaven. Elk cijfer zegt wat het is: het begrotingshoofdstuk ‘nationale defensie’ zoals uitgegeven (tot en met 2021) of zoals gepland in de begrotingswet, en de schatting van de militaire uitgaven van SIPRI, met een ruimere definitie.",
    thDefSpent: "Nationale defensie, uitgegeven", thDefPlan: "Nationale defensie, begrotingswet", thSipri: "SIPRI: militaire uitgaven", thSipriGdp: "SIPRI: aandeel in het bbp", approx: "bij benadering",
    rMeasureH: "Hoe dit verschilt van de maat van de kaart",
    rMeasure: "De kaart meet voor elk land hoeveel minder of meer Rusland overhield aan de handel met dat land dan in een wereld zonder oorlog. De cijfers op deze pagina zijn de belastingen die de Russische staat ontving, van alle kopers samen: ze zijn niet per land te verdelen en hebben geen basis zonder oorlog, dus ze worden niet bij de cijfers van de kaart opgeteld of ertegen afgezet.",
    rMeasureLink: "Wat Rusland aan handel overhield, per land",
    rQ1: "Hoeveel verdient Rusland aan olie?",
    rA1: "De begroting boekt olie en gas samen. Federale olie- en gasinkomsten in {lastFull}: {ogRub} ({ogEur}), {share} van de federale inkomsten; van januari tot en met {latestMonth}: {ytdRub} ({ytdEur}). CREA schat Ruslands exportopbrengst uit olie en gas in {lastFull} op {crea}.",
    rQ2: "Welk deel van Ruslands federale inkomsten komt uit olie en gas?",
    rA2: "{share} in {lastFull} en {ytdShare} van januari tot en met {latestMonth}. Per jaar sinds {y0}: {list}.",
    sources: "Bronnen", hubBackground: "Achtergrond",
    dlRevMonthly: "Ruslands federale olie- en gasinkomsten en alle federale inkomsten, per maand, in roebel en euro (ministerie van Financiën; CSV)",
    dlRevYearly: "Hetzelfde per jaar, met de schatting van de exportopbrengst door CREA en de defensie-uitgaven, elk met omschrijving (CSV)",
  },
  uk: {
    tRegime: "Санкції проти Росії", qRegime: "{N}: чи має санкції проти Росії?",
    cat_eu_member: "Так. Як член ЄС, ця країна застосовує санкції ЄС проти Росії, які кожен член схвалив у Раді.",
    cat_adopts_eu_measures: "Так. Ця країна не входить до ЄС, але переймає санкції ЄС проти Росії у своєму праві.{if:partial| Офіційні звіти ЄС називають це приєднання неповним.|}",
    cat_own_regime: "Так. Ця країна має санкції проти Росії за власним правом{if:since|, з {sinceText}|}.{if:expFin| Це експортний контроль і фінансові заходи, а не загальний санкційний режим.|}{if:exp| Це експортний контроль на перелічені високотехнологічні товари; загального санкційного списку немає.|}",
    cat_financial_directive_only: "Фінансові регулятори цієї країни доручили банкам{if:since| {sinceText}|} не мати справ з особами й компаніями під санкціями США, Великої Британії, ЄС і Канади. Власного санкційного списку немає.",
    cat_no_own_regime_stated: "Ні. Ця країна не запровадила власних санкцій проти Росії, і її уряд заявив про це публічно{if:date| ({dateText})|}.{if:evasion| Він також заявив, що не дозволить використовувати територію країни для обходу санкцій інших країн.|}",
    cat_no_own_regime_found: "Ми не знайшли власних санкцій цієї країни проти Росії (перевірено {checked}). Це нічого не каже про те, чи дотримуються тамтешні компанії санкцій інших країн.",
    cat_territory_uk_order: "Це британська заморська територія: санкції Великої Британії проти Росії діють там через Russia (Sanctions) (Overseas Territories) Order 2020.",
    cat_territory: "Ця територія належить іншій державі ({sov}). Ми не перевіряли, чи поширюються на неї санкції цієї держави проти Росії.",
    priceCap: "Країна входить до коаліції цінової стелі на російську нафту{if:viaEU| через ЄС|}.",
    exportCtl: "Країна застосовує експортний контроль щодо Росії{if:bis|, і США зараховують її до партнерів із подібним до власного контролем|}.",
    ufListed: "Окремо Росія вносить цю країну до списку «недружніх» держав (розпорядження уряду {order}, {sinceText}): це власний список Росії з країнами, проти яких вона вживає заходів, а не санкція цієї країни.",
    ufNotNamed: "Російський список «недружніх» держав не називає саму цю територію{if:sov|; він називає державу, якій вона належить ({sov})|}.",
    ufNo: "Російський список «недружніх» держав не називає цю країну.",
    checked: "Перевірено {checked}.", srcSearch: "витяг із пошукової системи, потрібно звірити з офіційним текстом", srcNews: "повідомлення преси", allSanctions: "Санкції проти Росії: кожна країна",
    stockLead: "Суми, заморожені тут, для контексту (карта рахує дохід, який Росія на них втратила, а не самі суми):",
    stockCbr: "знерухомлені резерви Банку Росії: {v}", stockPriv: "заморожені активи осіб і компаній під санкціями: {v}",
    stockNsd: "{v} цінних паперів російських інвесторів, заблокованих через підсанкційний депозитарій НРД, рахуються окремо ({date})",
    stockEuroclear: "Euroclear звітує про {v} підсанкційних російських активів на своєму балансі ({date}); ця цифра перетинається з цифрою центробанку й не додається до неї.",
    stockNone: "Суми, заморожені тут, не оприлюднено; відсутність цифри не означає, що нічого не заморожено.",
    noFig: "немає оприлюдненої цифри", estimate: "оцінка: близько {v}", source: "джерело",
    colCbr: "Резерви центробанку, знерухомлені", colPriv: "Приватні активи під санкціями, заморожені", frozenAll: "Заморожені російські активи за країнами",
    stockNote: "Колонки із сумами показують заморожене на вказану дату, для контексту: таблицю впорядковано за доходом, який втратила Росія, а не за цими сумами. «Немає оприлюдненої цифри» не означає, що нічого не заморожено; оцінку позначено як оцінку.",
    amtFrozenAssets: "У цифрах: близько {euCbr} резервів Банку Росії знерухомлено в ЄС ({euCbrDate}, Європейська комісія), і понад {euPriv} активів осіб і компаній під санкціями там заморожено. Для членів робочої групи REPO (ЄС, G7 і Австралія) офіційна сума становила близько {repoCbr} активів центробанку ({repoCbrDate}) і понад {repoPriv} приватних активів ({repoPrivDate}). Euroclear звітує про {euroclear} підсанкційних російських активів на своєму балансі ({euroclearDate}); ця цифра перетинається з цифрою Комісії й не додається до неї. Виплати надприбутків від Euroclear до ЄС сягнули близько {windfall} до {windfallDate}.",
    amtReparationsLoan: "Стан: запропоновано, не ухвалено. Законодавча пропозиція Комісії ({propDate}) передбачала використання до {propMax} знерухомлених активів. {eucoDate} Європейська рада натомість погодила кредит на підтримку України обсягом {usl} на {uslYears}, що фінансується запозиченнями ЄС: Україна поверне його, коли Росія сплатить репарації, а ЄС залишає за собою право використати для цього знерухомлені активи. До {paidDate} з нього виплачено {uslPaid}. Кредити ERA країн G7 становлять близько {eraUsd} ({eraEur}).",
    sTitle: "Санкції проти Росії за країнами: ЄС, США, Британія та інші",
    sDesc: "Кожна країна на карті за санкціями проти Росії, що там діють: члени ЄС, ті, хто переймає санкції ЄС, власні режими, цінова стеля й російський список.",
    sH1: "Санкції проти Росії за країнами: хто їх запровадив?", sLabel: "Країни із санкціями проти Росії",
    sIntro: "Кожна країна й територія на карті за санкціями проти Росії, що там діють (перевірено {checked}), разом із коаліцією цінової стелі на нафту та експортним контролем. Російський список «недружніх» країн має окрему колонку: це список країн, проти яких Росія вживає заходів, а не список санкцій, і вони різняться.",
    lab_eu_member: "Члени ЄС: санкції ЄС", lab_adopts_eu_measures: "Переймають санкції ЄС", lab_own_regime: "Санкції за власним правом", lab_financial_directive_only: "Доручення фінансових регуляторів",
    lab_no_own_regime_stated: "Без власних санкцій, заявлено публічно", lab_no_own_regime_found: "Власних санкцій не знайдено", lab_territory_uk_order: "Британські заморські території: санкції Великої Британії", lab_territory: "Території: не перевірено",
    note_eu_member: "Члени ЄС застосовують санкції ЄС проти Росії, які кожен член схвалив у Раді.",
    note_adopts_eu_measures: "Поза ЄС; переймають санкції ЄС у своєму праві. «Частково»: офіційні звіти ЄС називають приєднання неповним.",
    note_own_regime: "Санкції або експортний контроль за власним правом; обсяг різний, як показує колонка.",
    note_financial_directive_only: "Фінансові регулятори доручили банкам дотримуватися санкцій інших країн; власного списку немає.",
    note_no_own_regime_stated: "Без власних санкцій, і уряд заявив про це публічно.",
    note_no_own_regime_found: "Власних санкцій не знайдено на дату перевірки. Це нічого не каже про те, чи дотримуються тамтешні компанії санкцій інших країн.",
    note_territory_uk_order: "Санкції Великої Британії проти Росії діють тут за розпорядженням.",
    note_territory: "Не суверенні держави: чи поширюються на них санкції відповідної держави, окремо не перевірялося.",
    thMeasures: "Заходи", thPriceCap: "Коаліція цінової стелі", thExport: "Експортний контроль", thUnfriendly: "Російський список «недружніх» держав",
    yes: "так", no: "ні", notChecked: "не перевірено", viaEU: "через ЄС", listed: "у списку, {sinceText}", notNamed: "не названо окремо",
    cell_eu_member: "санкції ЄС", cell_adopts_eu_measures: "санкції ЄС, перейняті{if:partial| частково|}", cell_own_regime: "{scope}{if:since|, з {sinceText}|}", cell_financial_directive_only: "доручення фінансових регуляторів{if:since|, {sinceText}|}",
    cell_no_own_regime_stated: "заявлено публічно{if:date| ({dateText})|}", cell_no_own_regime_found: "–", cell_territory_uk_order: "санкції Великої Британії", cell_territory: "не перевірено",
    scopeFull: "власні санкції", scopeExp: "експортний контроль", scopeExpFin: "експортний контроль і фінансові заходи",
    sCounts: "За категоріями",
    sNoteUkr: "Україна теж має власні санкції проти Росії; карта не показує Україну й Росію як країни.",
    sNoteSrc: "Сторінка кожної країни подає її джерела. Джерело з позначкою «витяг із пошукової системи» прочитано з такого витягу, і перед цитуванням його слід звірити з офіційним текстом.",
    sQ1: "Які країни мають санкції проти Росії?",
    sA1: "Члени ЄС ({nEu}), інші європейські країни, що переймають санкції ЄС ({nAdopt}: {adoptList}), і країни із санкціями за власним правом ({nOwn}: {ownList}){if:nFin|; {finList}: доручення фінансових регуляторів|}. Перевірено {checked}.",
    sQ2: "Чи російський список «недружніх» держав — це список країн із санкціями?",
    sA2: "Ні. Списки частково збігаються, але різняться.{if:nListedNo| У російському списку без власних санкцій: {listedNoList}.|}{if:nAdoptNo| Переймають санкції ЄС, хоча їх немає в російському списку: {adoptNoList}.|}",
    rTitle: "Воєнний бюджет Росії: оборона й доходи від нафти та газу",
    rDesc: "Оборонний бюджет і військові видатки Росії поруч із федеральними нафтогазовими доходами з {y0} року, у рублях і євро, за роками й місяцями.",
    rH1: "Воєнний бюджет Росії: оборонні видатки й доходи від нафти та газу з {y0} року", rLabel: "Воєнний бюджет і нафтогазові доходи Росії",
    rIntro: "Федеральний бюджет Росії обліковує податки на видобуток і експорт нафти й газу як нафтогазові доходи. У {lastFull} році вони становили {ogRub} ({ogEur}), або {share} федеральних доходів; із січня до {latestMonth} — {ytdRub} ({ytdEur}), або {ytdShare}. Дані Міністерства фінансів Росії (станом на {published}); євро за середньомісячними курсами Банку Росії.{if:defOk| Закон про бюджет передбачає {defPlan} на «національну оборону» у {defYear} році.|}",
    rWhatH: "Що рахується як нафтогазові доходи",
    rWhat: "Податок на видобуток нафти, газу й конденсату, експортні мита на нафту, нафтопродукти й газ і податок на додатковий дохід від видобутку нафти, за вирахуванням «демпферних» виплат нафтопереробникам. Це міра податків, а не експортної виручки: вона включає податок на нафту й газ, продані в Росії, і не включає прибутки компаній, податок на прибуток і дивіденди, які міністерство рахує як інші доходи. Місяці коливаються, бо податок на додатковий дохід сплачують щокварталу. Рубль — офіційна одиниця; значення в євро змінюються з курсом.",
    rYearH: "Рік за роком", rMonthH: "Місяць за місяцем, до {latestMonth}",
    thMonth: "Місяць", thOgRub: "Нафтогазові доходи, рублі", thOgEur: "У євро", thShare: "Частка федеральних доходів", thTotRub: "Усі федеральні доходи, рублі",
    partYear: "{y}, із січня до {month}",
    rCreaH: "Експортна виручка від викопного палива: оцінка",
    rCrea: "Інша міра: скільки принесли російський експорт нафти, газу й вугілля за оцінкою Centre for Research on Energy and Clean Air (CREA) на основі відстежених поставок і цін. Це вартість експорту, а не податки, і її не додають до бюджетних цифр.",
    thCreaAll: "Усе викопне паливо", thCreaOg: "Нафта й газ",
    rDefH: "Оборонні витрати, для контексту",
    rDef: "Бюджетні гроші спільні: жоден дохід не закріплений за певною статтею видатків, тож ці цифри дають контекст, а не зв'язок між доходами й видатками. Кожна цифра позначена: розділ бюджету «Національна оборона» за виконанням (до 2021 року) або за планом у законі про бюджет, і оцінка військових витрат SIPRI за ширшим визначенням.",
    thDefSpent: "Національна оборона, виконання", thDefPlan: "Національна оборона, закон про бюджет", thSipri: "SIPRI: військові витрати", thSipriGdp: "SIPRI: частка ВВП", approx: "приблизно",
    rMeasureH: "Чим це відрізняється від міри на карті",
    rMeasure: "Карта вимірює для кожної країни, на скільки менше чи більше Росія залишила собі від торгівлі з цією країною, ніж у світі без війни. Цифри на цій сторінці — податки, які отримала російська держава від усіх покупців разом: їх не можна розділити за країнами, і вони не мають рівня без війни, тож їх не додають до цифр карти й не зіставляють із ними.",
    rMeasureLink: "Що Росія залишила собі від торгівлі, за країнами",
    rQ1: "Скільки Росія заробляє на нафті?",
    rA1: "Бюджет рахує нафту й газ разом. Федеральні нафтогазові доходи у {lastFull} році: {ogRub} ({ogEur}), або {share} федеральних доходів; із січня до {latestMonth}: {ytdRub} ({ytdEur}). CREA оцінює експортну виручку Росії від нафти й газу у {lastFull} році в {crea}.",
    rQ2: "Яка частка федеральних доходів Росії припадає на нафту й газ?",
    rA2: "{share} у {lastFull} році та {ytdShare} із січня до {latestMonth}. Рік за роком з {y0}: {list}.",
    sources: "Джерела", hubBackground: "Контекст",
    dlRevMonthly: "Федеральні нафтогазові доходи Росії й усі федеральні доходи, помісячно, у рублях і євро (Мінфін; CSV)",
    dlRevYearly: "Те саме за роками, з оцінкою експортної виручки CREA та оборонними витратами, кожне з позначкою (CSV)",
  },
};
// round 59 (owner approved: "titles in the words people search"): the questions people ask, answered from the research
// files. sQ3: the EU's sanctions (sanctions_r58.json: the Council regulations its categories name, the members and the
// adopters, the price cap coalition; frozen_amounts_r58.json: the reserves immobilised in the EU); rQ3: Russia's defence
// budget (russia_revenue_r58.json defence_yearly: the budget law and SIPRI, each said as what it is); rQ4: the federal
// budget's balance, shown only once the revenue file has the series named in seo_families.json research.revenue.balance
// (not yet: the hook waits for the research)
const RES59 = {
  en: {
    sQ3: "What are the EU sanctions on Russia?",
    sA3: "The EU's sanctions on Russia are set in Council Regulations {regs}, which every member agreed to in the Council. The EU's {nEu} members apply them, and {nAdopt} other European countries adopt them under their own law ({adoptList}).{if:nViaEU| Through the EU, its members are also in the price cap coalition on Russian oil.|}{if:euCbrOk| About {euCbr} of Bank of Russia reserves are immobilised in the EU ({euCbrDate}).|} Checked {checked}.",
    rQ3: "What is Russia's defence budget?",
    rA3: "Russia's budget law, as adopted, plans {defPlan} for “national defence” in {defYear}{if:prevOk|, after {defPrev} in {prevYear}|}. On a broader definition, SIPRI estimates Russia's military spending in {sipriYear} at {sipriRub}, {sipriGdp} of GDP. Budget money is pooled, so these figures are context: no revenue is set aside for defence.",
    rQ4: "What is Russia's budget deficit?",
    rA4: "Russia's federal budget balance in {balYear}: {if:bal<0|a deficit|a surplus} of {balRub}{if:gdpOk| ({balGdp} of GDP)|}, from the Ministry of Finance.",
  },
  de: {
    sQ3: "Was sind die EU-Sanktionen gegen Russland?",
    sA3: "Die Sanktionen der EU gegen Russland stehen in den Ratsverordnungen {regs}, denen jedes Mitglied im Rat zugestimmt hat. Die {nEu} EU-Mitglieder wenden sie an, und {nAdopt} weitere europäische Länder übernehmen sie nach eigenem Recht ({adoptList}).{if:nViaEU| Über die EU gehören ihre Mitglieder auch zur Preisobergrenzen-Koalition für russisches Öl.|}{if:euCbrOk| Etwa {euCbr} an Reserven der Bank von Russland sind in der EU immobilisiert ({euCbrDate}).|} Stand: {checked}.",
    rQ3: "Wie hoch ist Russlands Verteidigungshaushalt?",
    rA3: "Russlands Haushaltsgesetz sieht in der beschlossenen Fassung für {defYear} {defPlan} für „Landesverteidigung“ vor{if:prevOk| ({prevYear}: {defPrev})|}. Mit einer breiteren Abgrenzung schätzt SIPRI Russlands Militärausgaben {sipriYear} auf {sipriRub}, {sipriGdp} des BIP. Haushaltsmittel sind nicht zweckgebunden: Diese Zahlen sind Kontext, keine Einnahme ist für die Verteidigung reserviert.",
    rQ4: "Wie hoch ist Russlands Haushaltsdefizit?",
    rA4: "Saldo des russischen Bundeshaushalts {balYear}: {if:bal<0|ein Defizit|ein Überschuss} von {balRub}{if:gdpOk| ({balGdp} des BIP)|}, nach dem Finanzministerium.",
  },
  fr: {
    sQ3: "Quelles sont les sanctions de l'UE contre la Russie ?",
    sA3: "Les sanctions de l'UE contre la Russie sont fixées par les règlements du Conseil {regs}, que chaque membre a approuvés au Conseil. Les {nEu} membres de l'UE les appliquent, et {nAdopt} autres pays européens les adoptent dans leur propre droit ({adoptList}).{if:nViaEU| Par l'UE, ses membres font aussi partie de la coalition du plafonnement du prix du pétrole russe.|}{if:euCbrOk| Environ {euCbr} de réserves de la Banque de Russie sont immobilisés dans l'UE ({euCbrDate}).|} Vérifié le {checked}.",
    rQ3: "Quel est le budget de la défense de la Russie ?",
    rA3: "La loi de finances russe, telle qu'adoptée, prévoit {defPlan} pour la « défense nationale » en {defYear}{if:prevOk| ({defPrev} en {prevYear})|}. Selon une définition plus large, le SIPRI estime les dépenses militaires de la Russie en {sipriYear} à {sipriRub}, soit {sipriGdp} du PIB. Le budget n'affecte aucune recette à une dépense : ces chiffres sont un contexte.",
    rQ4: "Quel est le déficit budgétaire de la Russie ?",
    rA4: "Solde du budget fédéral russe en {balYear} : {if:bal<0|un déficit|un excédent} de {balRub}{if:gdpOk| ({balGdp} du PIB)|}, selon le ministère des Finances.",
  },
  es: {
    sQ3: "¿Cuáles son las sanciones de la UE contra Rusia?",
    sA3: "Las sanciones de la UE contra Rusia están en los Reglamentos del Consejo {regs}, que cada miembro aprobó en el Consejo. Los {nEu} miembros de la UE las aplican, y otros {nAdopt} países europeos las adoptan por ley propia ({adoptList}).{if:nViaEU| A través de la UE, sus miembros forman parte también de la coalición del tope al precio del petróleo ruso.|}{if:euCbrOk| Unos {euCbr} de reservas del Banco de Rusia están inmovilizados en la UE ({euCbrDate}).|} Comprobado el {checked}.",
    rQ3: "¿Cuál es el presupuesto de defensa de Rusia?",
    rA3: "La ley de presupuestos de Rusia, tal como se aprobó, prevé {defPlan} para «defensa nacional» en {defYear}{if:prevOk| ({defPrev} en {prevYear})|}. Con una definición más amplia, el SIPRI estima el gasto militar de Rusia en {sipriYear} en {sipriRub}, el {sipriGdp} del PIB. El dinero del presupuesto no se asigna a gastos concretos: estas cifras son contexto.",
    rQ4: "¿Cuál es el déficit presupuestario de Rusia?",
    rA4: "Saldo del presupuesto federal de Rusia en {balYear}: {if:bal<0|un déficit|un superávit} de {balRub}{if:gdpOk| ({balGdp} del PIB)|}, según el Ministerio de Finanzas.",
  },
  pl: {
    sQ3: "Jakie są sankcje UE wobec Rosji?",
    sA3: "Sankcje UE wobec Rosji określają rozporządzenia Rady {regs}, na które zgodził się w Radzie każdy członek. Stosuje je {nEu} państw członkowskich UE, a {nAdopt} innych krajów europejskich przyjmuje je we własnym prawie ({adoptList}).{if:nViaEU| Przez UE jej członkowie należą też do koalicji limitu cen rosyjskiej ropy.|}{if:euCbrOk| W UE zablokowano około {euCbr} rezerw Banku Rosji ({euCbrDate}).|} Sprawdzono: {checked}.",
    rQ3: "Jaki jest budżet obronny Rosji?",
    rA3: "Rosyjska ustawa budżetowa w przyjętej wersji przewiduje {defPlan} na „obronę narodową” w roku {defYear}{if:prevOk| ({defPrev} w roku {prevYear})|}. Według szerszej definicji SIPRI szacuje wydatki wojskowe Rosji w {sipriYear} r. na {sipriRub}, czyli {sipriGdp} PKB. Środki budżetu nie są przypisane do wydatków: te liczby to kontekst.",
    rQ4: "Jaki jest deficyt budżetowy Rosji?",
    rA4: "Saldo federalnego budżetu Rosji w {balYear} r.: {if:bal<0|deficyt|nadwyżka} w wysokości {balRub}{if:gdpOk| ({balGdp} PKB)|}, według Ministerstwa Finansów.",
  },
  nl: {
    sQ3: "Wat zijn de EU-sancties tegen Rusland?",
    sA3: "De EU-sancties tegen Rusland staan in de Raadsverordeningen {regs}, waarmee elk lid in de Raad instemde. De {nEu} EU-lidstaten passen ze toe, en {nAdopt} andere Europese landen nemen ze over in eigen wetgeving ({adoptList}).{if:nViaEU| Via de EU horen de lidstaten ook bij de prijsplafondcoalitie voor Russische olie.|}{if:euCbrOk| Ongeveer {euCbr} aan reserves van de Bank van Rusland is in de EU geïmmobiliseerd ({euCbrDate}).|} Gecontroleerd op {checked}.",
    rQ3: "Wat is de defensiebegroting van Rusland?",
    rA3: "De Russische begrotingswet, zoals aangenomen, voorziet {defPlan} voor ‘nationale defensie’ in {defYear}{if:prevOk| ({defPrev} in {prevYear})|}. Met een ruimere definitie schat SIPRI de Russische militaire uitgaven in {sipriYear} op {sipriRub}, {sipriGdp} van het bbp. Begrotingsgeld is niet geoormerkt: deze cijfers zijn context.",
    rQ4: "Wat is het begrotingstekort van Rusland?",
    rA4: "Saldo van de Russische federale begroting in {balYear}: {if:bal<0|een tekort|een overschot} van {balRub}{if:gdpOk| ({balGdp} van het bbp)|}, volgens het ministerie van Financiën.",
  },
  uk: {
    sQ3: "Які санкції ЄС проти Росії?",
    sA3: "Санкції ЄС проти Росії встановлюють регламенти Ради {regs}, які схвалив у Раді кожен член. Їх застосовують {nEu} членів ЄС, а ще {nAdopt} європейських країн ухвалюють їх власним законом ({adoptList}).{if:nViaEU| Через ЄС його члени також входять до коаліції цінової стелі на російську нафту.|}{if:euCbrOk| У ЄС знерухомлено близько {euCbr} резервів Банку Росії ({euCbrDate}).|} Перевірено {checked}.",
    rQ3: "Який оборонний бюджет Росії?",
    rA3: "Російський закон про бюджет в ухваленій редакції передбачає {defPlan} на «національну оборону» у {defYear} році{if:prevOk| ({defPrev} у {prevYear})|}. За ширшим визначенням SIPRI оцінює військові видатки Росії у {sipriYear} році в {sipriRub}, або {sipriGdp} ВВП. Бюджетні гроші не прив'язані до видатків: ці цифри — контекст.",
    rQ4: "Який дефіцит бюджету Росії?",
    rA4: "Сальдо федерального бюджету Росії у {balYear} році: {if:bal<0|дефіцит|профіцит} {balRub}{if:gdpOk| ({balGdp} ВВП)|}, за даними Мінфіну.",
  },
};
for (const l of LANGS) Object.assign(RES[l], RES59[l]);
export const res = (l, k, vars, nums) => {
  const x = (RES[l] && RES[l][k] !== undefined ? RES[l] : RES.en)[k];
  if (x === undefined) throw new Error("seo_i18n.mjs RES: no phrase " + k);
  return fmt(x, vars || {}, nums || {});
};
export const RES_KEYS = Object.keys(RES.en);

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
      downloads: "The data as CSV and JSON, with a field guide", sanctions: "Every country and territory by the sanctions on Russia that apply there, with the price cap coalition, export controls and Russia's own list of unfriendly states", revenue: "Russia's federal budget revenue from oil and gas by year and month, in roubles and euros, with export earnings and defence spending for context", how: "How it works: the method, page by page", limitations: "What the figures leave out", llmsFull: "One line per country" },
    markdown: "Every generated page also has a Markdown version at its own address with index.md added.",
    langs: "Languages: English at the root; uk, de, fr, pl, nl and es under /<language>/.",
    fullIntro: "One line per country: its name, the net as a share of one year's GDP with its range and chance, its support for Ukraine in euros, what Russia kept from trade with it against a world without the war, and its page.",
    noData: "no data of its own for the war years", party: "party to the war (with Russia), not ranked",
    hRevenue: "Russia's oil and gas revenue (federal budget, Ministry of Finance)", revLine: "{y}: {ogRub} ({ogEur}), {share} of federal revenue",
  },
};

// ----- round 59 (owner approved: "titles in the words people search", keyword discovery of 27 October 2026 with
// Google's monthly volumes): the questions a country page and a few topic pages answer, in the words people search -----
// A name in a question about it needs, in French and Dutch, its article ("la France", "les Pays-Bas", "de Verenigde
// Staten") and in Polish its gender for the verb ("Polska dała", "Niemcy dały"); English "the" is inSentence above.
// Rules by the name's form, as THE is for English. Only the localized questions of ASK use them, where that language's
// own searches name the country (seo_demand.json ask, seo_families.json country.phrasing).
const FR_PLURAL = /^(États-Unis|Pays-Bas|Émirats|Philippines|Maldives|Seychelles|Comores|Bahamas|Fidji|Îles|Samoa|Salomon|Marshall)/;
const FR_BARE = /^(Israël|Cuba|Singapour|Malte|Chypre|Monaco|Madagascar|Taïwan|Hong Kong|Macao|Bahreïn|Oman|Haïti|Maurice|Djibouti|Brunei|Nauru|Tuvalu|Kiribati|Saint|Sainte|São|Sao|Trinité|Antigua|Grenade|Aruba|Curaçao|Porto Rico|Guam|Jersey|Guernesey|Gibraltar|Tonga|Palaos|Vanuatu|Andorre)/;
const FR_MASC = /^(Mexique|Cambodge|Mozambique|Zimbabwe|Belize|Suriname|Royaume)/;
const NL_HET = /^Verenigd Koninkrijk/;
const NL_DE = /^(Verenigde|Filipijnen|Malediven|Seychellen|Comoren|Bahama|Dominicaanse Republiek|Centraal-Afrikaanse Republiek|Tsjechische Republiek|Salomonseilanden|Marshalleilanden|Kaaimaneilanden|Maagdeneilanden|Faeröer)/;
const NL_PLURAL = /(Staten|Emiraten|Filipijnen|Malediven|Seychellen|Comoren|eilanden|Bahama's)/;
// { Na: the name with its article where the language puts one, plural, fem, neu: for the verb }
export function grammar(l, N) {
  const n = String(N || ""), first = n.split(/[ -]/)[0];
  if (l === "fr") {
    const plural = FR_PLURAL.test(n);
    const Na = plural ? "les " + n : FR_BARE.test(n) ? n : /^[AEIOUÉÈÊÎÏÔÂ]/.test(n) ? "l'" + n : /e$/.test(first) && !FR_MASC.test(n) ? "la " + n : "le " + n;
    return { Na, plural, fem: false, neu: false };
  }
  if (l === "nl") return { Na: NL_HET.test(n) ? "het " + n : NL_DE.test(n) ? "de " + n : n, plural: NL_PLURAL.test(n), fem: false, neu: false };
  if (l === "pl") {
    const plural = /^(Stany|Zjednoczone)\b/.test(n) || /(y|ie)$/.test(n);
    return { Na: n, plural, fem: !plural && /[aśź]$/.test(n), neu: !plural && /[oaeiu]$/.test(n) && !/a$/.test(n) };
  }
  return { Na: n, plural: false, fem: false, neu: false };
}

// The country page's phrasings (seo_templates.mjs askOf picks one by seo_families.json country.phrasing):
//   given    the searched question about what it gave Ukraine (a title where its support is very likely), with tGiven
//   support / helping   the searched question about Russia ("Does Belarus support Russia?"), with the chance level's
//            tail (tHelp: the map's own words) and heading (h1Help); also the page's question (qHelp's place)
//   tTradeAsk, qTradeAsk "India–Russia trade": the trade section's heading and question where it is searched
// {N} the name, {Nt} in a sentence (English "the"), {Na} with its article (grammar above); values plural, fem, neu
const ASK = {
  en: { given: "How much has {Nt} given to Ukraine?", qGiven: "How much has {Nt} given to Ukraine?", h1Given: "How much has {Nt} given to Ukraine since 2022?", tGiven: ["{ua} since 2022", "{ua}"],
    support: "Does {Nt} support Russia?", helping: "Is {Nt} helping Russia?",
    tHelp: { u_sure: ["{netP} of GDP {netDir}"], r_sure: ["{rus} {if:rusX<0|more|less} for Russia from trade", "{netP} of GDP {netDir}"], lean: ["{leanWord}"], unc: ["{uncWordCap}"], zero: ["Net: {zeroWord}", "Net {zeroWord}"], party: ["{partyWord}, {netP} of GDP", "{partyWord}"] },
    h1Help: { u_sure: "What the money flows show", r_sure: "What the money flows show", lean: "{leanWord}", unc: "{uncWordCap}", zero: "The net is {zeroWord}", party: "{partyWord} (with Russia)" },
    tTradeAsk: "{N}–Russia trade", qTradeAsk: "{N}–Russia trade: how much since 2022?" },
  de: { given: "Ukraine-Hilfe {N}:", qGiven: "Ukraine-Hilfe {N}: Wie viel hat das Land der Ukraine gegeben?", h1Given: "Ukraine-Hilfe {N}: Wie viel hat das Land der Ukraine seit 2022 gegeben?", tGiven: ["{ua} seit 2022", "{ua}"],
    support: "{N}: Unterstützt das Land Russland?", helping: "{N}: Hilft das Land Russland?",
    tHelp: { u_sure: ["{netP} des BIP {netDir}"], r_sure: ["{rus} {if:rusX<0|mehr|weniger} für Russland", "{netP} des BIP"], lean: ["{leanWord}"], unc: ["{uncWordCap}"], zero: ["Saldo {zeroWord}"], party: ["{partyWord}, {netP} des BIP", "{partyWord}"] },
    h1Help: { u_sure: "Was die Geldströme zeigen", r_sure: "Was die Geldströme zeigen", lean: "{leanWord}", unc: "{uncWordCap}", zero: "Der Saldo ist {zeroWord}", party: "{partyWord} (mit Russland)" },
    tTradeAsk: "Handel {N}–Russland", qTradeAsk: "Handel {N}–Russland: Wie viel seit 2022?" },
  fr: { given: "Combien {Na} {if:plural|ont|a} donné à l'Ukraine ?", qGiven: "Combien {Na} {if:plural|ont|a} donné à l'Ukraine ?", h1Given: "Combien {Na} {if:plural|ont|a} donné à l'Ukraine depuis 2022 ?", tGiven: ["{ua} depuis 2022", "{ua}"],
    support: "{N} : le pays soutient-il la Russie ?", helping: "{N} : le pays aide-t-il la Russie ?",
    tHelp: { u_sure: ["{netP} du PIB {netDir}"], r_sure: ["{rus} {if:rusX<0|de plus|de moins}", ""], lean: ["{leanWord}"], unc: ["{uncWordCap}"], zero: ["Solde {zeroWord}"], party: ["{partyWord}"] },
    h1Help: { u_sure: "Ce que montrent les flux d'argent", r_sure: "Ce que montrent les flux d'argent", lean: "{leanWord}", unc: "{uncWordCap}", zero: "Le solde est {zeroWord}", party: "{partyWord} (avec la Russie)" },
    tTradeAsk: "Commerce {N}–Russie", qTradeAsk: "Commerce {N}–Russie : combien depuis 2022 ?" },
  es: { given: "¿Cuánto ha dado {N} a Ucrania?", qGiven: "¿Cuánto ha dado {N} a Ucrania?", h1Given: "¿Cuánto ha dado {N} a Ucrania desde 2022?", tGiven: ["{ua} desde 2022", "{ua}"],
    support: "{N}: ¿apoya a Rusia?", helping: "{N}: ¿ayuda a Rusia?",
    tHelp: { u_sure: ["{netP} del PIB {netDir}"], r_sure: ["{rus} {if:rusX<0|más|menos} para Rusia", "{netP} del PIB"], lean: ["{leanWord}"], unc: ["{uncWordCap}"], zero: ["Neto {zeroWord}"], party: ["{partyWord}"] },
    h1Help: { u_sure: "Lo que muestran los flujos de dinero", r_sure: "Lo que muestran los flujos de dinero", lean: "{leanWord}", unc: "{uncWordCap}", zero: "El neto es {zeroWord}", party: "{partyWord} (con Rusia)" },
    tTradeAsk: "Comercio {N}–Rusia", qTradeAsk: "Comercio {N}–Rusia: ¿cuánto desde 2022?" },
  pl: { given: "Ile {N} {if:plural|dały|{if:fem|dała|{if:neu|dało|dał}}} Ukrainie?", qGiven: "Ile {N} {if:plural|dały|{if:fem|dała|{if:neu|dało|dał}}} Ukrainie?", h1Given: "Ile {N} {if:plural|dały|{if:fem|dała|{if:neu|dało|dał}}} Ukrainie od 2022 roku?", tGiven: ["{ua} od 2022", "{ua}"],
    support: "Czy {N} wspiera Rosję?", helping: "{N}: czy ten kraj pomaga Rosji?",
    tHelp: { u_sure: ["{netP} PKB {netDir}"], r_sure: ["{rus} {if:rusX<0|więcej|mniej} dla Rosji", ""], lean: ["{leanWord}"], unc: ["{uncWordCap}"], zero: ["Saldo {zeroWord}"], party: ["{partyWord}"] },
    h1Help: { u_sure: "Co pokazują przepływy pieniędzy", r_sure: "Co pokazują przepływy pieniędzy", lean: "{leanWord}", unc: "{uncWordCap}", zero: "Saldo {zeroWord}", party: "{partyWord} (z Rosją)" },
    tTradeAsk: "Handel {N}–Rosja", qTradeAsk: "Handel {N}–Rosja: ile od 2022 roku?" },
  nl: { given: "Hoeveel {if:plural|hebben|heeft} {Na} aan Oekraïne gegeven?", qGiven: "Hoeveel {if:plural|hebben|heeft} {Na} aan Oekraïne gegeven?", h1Given: "Hoeveel {if:plural|hebben|heeft} {Na} sinds 2022 aan Oekraïne gegeven?", tGiven: ["{ua} sinds 2022", "{ua}"],
    support: "{N}: steunt het land Rusland?", helping: "{N}: helpt het land Rusland?",
    tHelp: { u_sure: ["{netP} van het bbp {netDir}"], r_sure: ["{rus} {if:rusX<0|meer|minder} voor Rusland", ""], lean: ["{leanWord}"], unc: ["{uncWordCap}"], zero: ["Saldo {zeroWord}"], party: ["{partyWord}"] },
    h1Help: { u_sure: "Wat de geldstromen laten zien", r_sure: "Wat de geldstromen laten zien", lean: "{leanWord}", unc: "{uncWordCap}", zero: "Het saldo is {zeroWord}", party: "{partyWord} (met Rusland)" },
    tTradeAsk: "Handel {N}–Rusland", qTradeAsk: "Handel {N}–Rusland: hoeveel sinds 2022?" },
  uk: { given: "{N}: скільки дали Україні?", qGiven: "{N}: скільки дали Україні?", h1Given: "{N}: скільки дали Україні з 2022 року?", tGiven: ["{ua} з 2022 року", "{ua}"],
    support: "Чи підтримує {N} Росію?", helping: "{N}: чи допомагає ця країна Росії?",
    tHelp: { u_sure: ["{netP} ВВП {netDir}"], r_sure: ["{rus} {if:rusX<0|більше|менше} для Росії", ""], lean: ["{leanWord}"], unc: ["{uncWordCap}"], zero: ["Нетто {zeroWord}"], party: ["{partyWord}"] },
    h1Help: { u_sure: "Що показують грошові потоки", r_sure: "Що показують грошові потоки", lean: "{leanWord}", unc: "{uncWordCap}", zero: "Нетто {zeroWord}", party: "{partyWord} (разом із Росією)" },
    tTradeAsk: "Торгівля {N}–Росія", qTradeAsk: "Торгівля {N}–Росія: скільки з 2022 року?" },
};
export const ASK_KEYS = Object.keys(ASK.en);
export const askPhrase = (l, k) => { const x = (ASK[l] && ASK[l][k]) ?? ASK.en[k]; if (x === undefined) throw new Error("seo_i18n.mjs ASK: no phrase " + k); return x; };
// a country page's title and heading in a phrasing (seo_templates.mjs askOf): the question with the first tail that
// fits, else the chance level's own title (it has the map's words); v and nums as countryText's, with Na and plural
export function askText(l, which, cat, v, nums, fallback) {
  const g = grammar(l, v.N), vv = { ...v, Na: g.Na }, nn = { ...nums, plural: g.plural, fem: g.fem, neu: g.neu };
  const one = s => fmt(s, vv, nn).trim();
  const head = one(askPhrase(l, which === "given" ? "given" : which));
  const tails = which === "given" ? askPhrase(l, "tGiven") : (askPhrase(l, "tHelp")[cat] || []);
  const forms = tails.map(t => (one(t) ? head + " " + one(t) : head));
  const title = forms.find(t => t.length <= TITLE_MAX) || fallback;
  const h1 = which === "given" ? one(askPhrase(l, "h1Given")) : head + " " + one(askPhrase(l, "h1Help")[cat] || "");
  return { title, h1: h1.trim() };
}
// a question of ASK filled for a country (the page's FAQ): k qGiven, support, helping, qTradeAsk; or a heading (tTradeAsk)
export function askQ(l, k, N) {
  const g = grammar(l, N);
  return fmt(askPhrase(l, k), { N, Nt: inSentence(l, N), Na: g.Na }, { plural: g.plural, fem: g.fem, neu: g.neu });
}

// The topic pages' words for what people search (seo_pages.mjs, every language; the English page's own config questions
// stay first): note, a line after the intro; faq, questions answered from the page's table and the research files.
// Values: {n} rows, {tops} the first three names, {t1} {topV} the first row and its figure, {sumUa} the support of the
// rows together, {nSure} the rows the map gives as very likely on the page's side, {sureWord} the map's word,
// {partyList} the parties to the war (value nParty), {partyWord} {partyWordLc} the map's word for them; {euroclear} {euroclearDate} {euCbr} {euCbrDate} from
// frozen_amounts_r58.json
export const TOPIC_X = {
  "countries-helping-russia": {
    en: { note: "Looking for Russia's allies? The site does not rate alliances, votes or diplomacy: it measures money, whether each country's aid, trade, fuel and arms since 2022 moved toward Ukraine or toward Russia.",
      faq: [{ q: "Who are Russia's allies?", a: "War Balance does not judge alliances; it measures money. {if:nSure|Since 2022 the money of {nSure} of the {n} countries listed is {sureWord} toward Russia; the table starts with {tops}.|The table starts with {tops}.}{if:nParty| {partyList}: {partyWordLc} (with Russia).|} Votes, statements and diplomacy are not in the number." }] },
    de: { note: "Auf der Suche nach Russlands Verbündeten? Die Seite bewertet keine Bündnisse, Abstimmungen oder Diplomatie: Sie misst Geld, ob Hilfe, Handel, Brennstoffe und Waffen jedes Landes seit 2022 Richtung Ukraine oder Russland gingen.",
      faq: [{ q: "Wer sind Russlands Verbündete?", a: "War Balance bewertet keine Bündnisse, sondern misst Geld. {if:nSure|Seit 2022 floss das Geld von {nSure} der {n} gelisteten Länder {sureWord} Richtung Russland; die Tabelle beginnt mit {tops}.|Die Tabelle beginnt mit {tops}.}{if:nParty| {partyList}: {partyWord} (mit Russland).|} Abstimmungen, Erklärungen und Diplomatie sind nicht in der Zahl." }] },
    fr: { note: "Vous cherchez les alliés de la Russie ? Le site ne juge ni les alliances, ni les votes, ni la diplomatie : il mesure l'argent, selon que l'aide, le commerce, l'énergie et les armes de chaque pays depuis 2022 sont allés vers l'Ukraine ou vers la Russie.",
      faq: [{ q: "Qui sont les alliés de la Russie ?", a: "War Balance ne juge pas les alliances : il mesure l'argent. {if:nSure|Depuis 2022, l'argent de {nSure} des {n} pays listés est allé {sureWord} vers la Russie ; le tableau commence par {tops}.|Le tableau commence par {tops}.}{if:nParty| {partyList} : {partyWordLc} (avec la Russie).|} Les votes, les déclarations et la diplomatie ne sont pas dans le chiffre." }] },
    es: { note: "¿Busca los aliados de Rusia? El sitio no valora alianzas, votos ni diplomacia: mide dinero, si la ayuda, el comercio, la energía y las armas de cada país desde 2022 fueron hacia Ucrania o hacia Rusia.",
      faq: [{ q: "¿Quiénes son los aliados de Rusia?", a: "War Balance no juzga alianzas: mide dinero. {if:nSure|Desde 2022, el dinero de {nSure} de los {n} países listados fue {sureWord} hacia Rusia; la tabla empieza por {tops}.|La tabla empieza por {tops}.}{if:nParty| {partyList}: {partyWordLc} (con Rusia).|} Los votos, las declaraciones y la diplomacia no están en la cifra." }] },
    pl: { note: "Szukasz sojuszników Rosji? Strona nie ocenia sojuszy, głosowań ani dyplomacji: mierzy pieniądze, czyli czy pomoc, handel, paliwa i broń każdego kraju od 2022 roku szły na rzecz Ukrainy czy Rosji.",
      faq: [{ q: "Kim są sojusznicy Rosji?", a: "War Balance nie ocenia sojuszy: mierzy pieniądze. {if:nSure|Od 2022 roku pieniądze {nSure} z {n} wymienionych krajów szły {sureWord} na rzecz Rosji; tabela zaczyna się od {tops}.|Tabela zaczyna się od {tops}.}{if:nParty| {partyList}: {partyWordLc} (z Rosją).|} Głosowania, deklaracje i dyplomacja nie są w tej liczbie." }] },
    nl: { note: "Op zoek naar de bondgenoten van Rusland? De site beoordeelt geen bondgenootschappen, stemmingen of diplomatie: ze meet geld, of de steun, handel, brandstof en wapens van elk land sinds 2022 richting Oekraïne of Rusland gingen.",
      faq: [{ q: "Wie zijn de bondgenoten van Rusland?", a: "War Balance beoordeelt geen bondgenootschappen: het meet geld. {if:nSure|Sinds 2022 ging het geld van {nSure} van de {n} landen in de lijst {sureWord} richting Rusland; de tabel begint met {tops}.|De tabel begint met {tops}.}{if:nParty| {partyList}: {partyWordLc} (met Rusland).|} Stemmingen, verklaringen en diplomatie zitten niet in het getal." }] },
    uk: { note: "Шукаєте союзників Росії? Сайт не оцінює союзи, голосування чи дипломатію: він вимірює гроші — чи йшли допомога, торгівля, паливо й зброя кожної країни з 2022 року на користь України чи Росії.",
      faq: [{ q: "Хто союзники Росії?", a: "War Balance не оцінює союзи: він вимірює гроші. {if:nSure|З 2022 року гроші {nSure} з {n} країн у списку йшли {sureWord} на користь Росії; таблиця починається з {tops}.|Таблиця починається з {tops}.}{if:nParty| {partyList}: {partyWordLc} (разом із Росією).|} Голосування, заяви й дипломатія до числа не входять." }] },
  },
  "ukraine-support-tracker": {
    en: { faq: [{ q: "Which countries are Ukraine's allies?", a: "War Balance does not judge alliances; it measures money. In euros since 2022 the support table starts with {tops}; the {n} countries listed gave {sumUa} together, each also shown as a share of GDP and per person. Votes, statements and diplomacy are not in the number." },
      { q: "Which countries give the most to Ukraine?", a: "In euros since 2022 the table starts with {tops}: {t1} {topV}. Together the {n} countries listed gave {sumUa}. As a share of GDP or per person the order changes; each row gives euros, the share of GDP and the amount per person." }] },
    de: { faq: [{ q: "Wer sind die Verbündeten der Ukraine?", a: "War Balance bewertet keine Bündnisse, sondern misst Geld. In Euro seit 2022 beginnt die Tabelle der Unterstützung mit {tops}; die {n} gelisteten Länder gaben zusammen {sumUa}, jeweils auch im Verhältnis zum BIP und pro Kopf. Abstimmungen, Erklärungen und Diplomatie sind nicht in der Zahl." },
      { q: "Wer unterstützt die Ukraine am meisten?", a: "In Euro seit 2022 beginnt die Tabelle mit {tops}: {t1} {topV}. Zusammen gaben die {n} gelisteten Länder {sumUa}. Pro Kopf oder im Verhältnis zum BIP ändert sich die Reihenfolge; jede Zeile zeigt Euro, Anteil am BIP und Betrag pro Kopf." }] },
    fr: { faq: [{ q: "Qui sont les alliés de l'Ukraine ?", a: "War Balance ne juge pas les alliances : il mesure l'argent. En euros depuis 2022, le tableau du soutien commence par {tops} ; les {n} pays listés ont donné {sumUa} ensemble, chacun aussi en part du PIB et par habitant. Les votes, les déclarations et la diplomatie ne sont pas dans le chiffre." },
      { q: "Quels pays donnent le plus à l'Ukraine ?", a: "En euros depuis 2022, le tableau commence par {tops} : {t1} {topV}. Ensemble, les {n} pays listés ont donné {sumUa}. En part du PIB ou par habitant, l'ordre change ; chaque ligne donne les euros, la part du PIB et le montant par habitant." }] },
    es: { faq: [{ q: "¿Quiénes son los aliados de Ucrania?", a: "War Balance no juzga alianzas: mide dinero. En euros desde 2022, la tabla del apoyo empieza por {tops}; los {n} países listados dieron {sumUa} en conjunto, cada uno también como parte del PIB y por persona. Los votos, las declaraciones y la diplomacia no están en la cifra." },
      { q: "¿Qué países dan más a Ucrania?", a: "En euros desde 2022, la tabla empieza por {tops}: {t1} {topV}. En conjunto, los {n} países listados dieron {sumUa}. Como parte del PIB o por persona el orden cambia; cada fila da los euros, la parte del PIB y el importe por persona." }] },
    pl: { faq: [{ q: "Kim są sojusznicy Ukrainy?", a: "War Balance nie ocenia sojuszy: mierzy pieniądze. W euro od 2022 roku tabela wsparcia zaczyna się od {tops}; {n} wymienionych krajów dało razem {sumUa}, każdy także jako udział w PKB i na mieszkańca. Głosowania, deklaracje i dyplomacja nie są w tej liczbie." },
      { q: "Które kraje dają Ukrainie najwięcej?", a: "W euro od 2022 roku tabela zaczyna się od {tops}: {t1} {topV}. Razem {n} wymienionych krajów dało {sumUa}. Jako udział w PKB lub na mieszkańca kolejność się zmienia; każdy wiersz podaje euro, udział w PKB i kwotę na mieszkańca." }] },
    nl: { faq: [{ q: "Wie zijn de bondgenoten van Oekraïne?", a: "War Balance beoordeelt geen bondgenootschappen: het meet geld. In euro sinds 2022 begint de tabel van de steun met {tops}; de {n} landen in de lijst gaven samen {sumUa}, elk ook als deel van het bbp en per inwoner. Stemmingen, verklaringen en diplomatie zitten niet in het getal." },
      { q: "Welke landen geven het meest aan Oekraïne?", a: "In euro sinds 2022 begint de tabel met {tops}: {t1} {topV}. Samen gaven de {n} landen in de lijst {sumUa}. Als deel van het bbp of per inwoner verandert de volgorde; elke rij geeft euro, het deel van het bbp en het bedrag per inwoner." }] },
    uk: { faq: [{ q: "Хто союзники України?", a: "War Balance не оцінює союзи: він вимірює гроші. У євро з 2022 року таблиця підтримки починається з {tops}; {n} країн у списку разом дали {sumUa}, кожна також як частка ВВП і на особу. Голосування, заяви й дипломатія до числа не входять." },
      { q: "Які країни дають Україні найбільше?", a: "У євро з 2022 року таблиця починається з {tops}: {t1} {topV}. Разом {n} країн у списку дали {sumUa}. Як частка ВВП чи на особу порядок інший; кожен рядок дає євро, частку ВВП і суму на особу." }] },
  },
  "frozen-russian-assets": {
    en: { faq: [{ q: "How much Russian money does Euroclear hold?", a: "Euroclear, the securities depository in Belgium, reports {euroclear} of sanctioned Russian assets on its balance sheet ({euroclearDate}). That figure overlaps the Bank of Russia reserves immobilised in the EU, about {euCbr} ({euCbrDate}), and is not added to them. The table counts the return Russia lost on frozen money in each country, not these amounts." }] },
    de: { faq: [{ q: "Wie viel russisches Geld hält Euroclear?", a: "Euroclear, der Wertpapierverwahrer in Belgien, meldet {euroclear} an sanktionierten russischen Vermögenswerten in seiner Bilanz ({euroclearDate}). Diese Zahl überschneidet sich mit den in der EU immobilisierten Reserven der Bank von Russland, etwa {euCbr} ({euCbrDate}), und wird nicht dazugezählt. Die Tabelle zählt die Rendite, die Russland auf eingefrorenes Geld in jedem Land entging, nicht diese Beträge." }] },
    fr: { faq: [{ q: "Combien d'argent russe Euroclear détient-il ?", a: "Euroclear, le dépositaire de titres situé en Belgique, déclare {euroclear} d'actifs russes sanctionnés à son bilan ({euroclearDate}). Ce chiffre recoupe les réserves de la Banque de Russie immobilisées dans l'UE, environ {euCbr} ({euCbrDate}), et ne s'y ajoute pas. Le tableau compte le rendement que la Russie a perdu sur l'argent gelé dans chaque pays, pas ces montants." }] },
    es: { faq: [{ q: "¿Cuánto dinero ruso tiene Euroclear?", a: "Euroclear, el depositario de valores con sede en Bélgica, declara {euroclear} en activos rusos sancionados en su balance ({euroclearDate}). Esa cifra se solapa con las reservas del Banco de Rusia inmovilizadas en la UE, unos {euCbr} ({euCbrDate}), y no se suma a ellas. La tabla cuenta el rendimiento que Rusia perdió por el dinero congelado en cada país, no estos importes." }] },
    pl: { faq: [{ q: "Ile rosyjskich pieniędzy ma Euroclear?", a: "Euroclear, depozyt papierów wartościowych w Belgii, wykazuje w bilansie {euroclear} objętych sankcjami rosyjskich aktywów ({euroclearDate}). Ta kwota pokrywa się z rezerwami Banku Rosji zablokowanymi w UE, około {euCbr} ({euCbrDate}), i nie jest do nich doliczana. Tabela liczy utracony przez Rosję zwrot z zamrożonych pieniędzy w każdym kraju, nie te kwoty." }] },
    nl: { faq: [{ q: "Hoeveel Russisch geld heeft Euroclear?", a: "Euroclear, de effectenbewaarder in België, meldt {euroclear} aan gesanctioneerde Russische tegoeden op zijn balans ({euroclearDate}). Dat cijfer overlapt met de in de EU geïmmobiliseerde reserves van de Bank van Rusland, ongeveer {euCbr} ({euCbrDate}), en wordt er niet bij opgeteld. De tabel telt het rendement dat Rusland op bevroren geld in elk land misliep, niet deze bedragen." }] },
    uk: { faq: [{ q: "Скільки російських грошей тримає Euroclear?", a: "Euroclear, депозитарій цінних паперів у Бельгії, показує на своєму балансі {euroclear} санкційних російських активів ({euroclearDate}). Ця сума перетинається з резервами Банку Росії, знерухомленими в ЄС, — близько {euCbr} ({euCbrDate}) — і до них не додається. Таблиця враховує дохід, який Росія втратила на заморожених грошах у кожній країні, а не ці суми." }] },
  },
};
// the research a topic's questions need (a question without its file is left out)
export const TOPIC_X_NEEDS = { "frozen-russian-assets": "frozen" };
// a topic page's note and questions in a language, filled (vars, nums: see above)
export function topicExtra(l, slug, vars, nums) {
  const x = (TOPIC_X[slug] || {})[l] || (TOPIC_X[slug] || {}).en;
  if (!x) return { note: "", faq: [] };
  return { note: x.note ? fmt(x.note, vars, nums) : "", faq: (x.faq || []).map(f => ({ q: fmt(f.q, vars, nums), a: fmt(f.a, vars, nums) })) };
}

// ----- every phrase above, for the wording guard (seo_check.py: node prints phraseList() as JSON) -----
export function phraseList() {
  const out = [];
  const walk = (x, key, lang) => {
    if (typeof x === "string") out.push({ file: "pipeline/seo_i18n.mjs", key, lang, text: x });
    else if (Array.isArray(x)) x.forEach((y, i) => walk(y, `${key}[${i}]`, lang));
    else if (x && typeof x === "object") for (const [k, y] of Object.entries(x)) walk(y, `${key}.${k}`, lang);
  };
  for (const [name, table] of Object.entries({ S, MEASURE, PART, SIDE, COPY, LABELS, DYN, EXPLAIN, LLMS, RES })) for (const [l, t] of Object.entries(table)) walk(t, name, l);
  for (const [slug, byLang] of Object.entries(TOPIC_T)) for (const [l, t] of Object.entries(byLang)) walk(t, `TOPIC_T.${slug}`, l);
  for (const [l, t] of Object.entries(ASK)) walk(t, "ASK", l);
  for (const [slug, byLang] of Object.entries(TOPIC_X)) for (const [l, t] of Object.entries(byLang)) walk(t, `TOPIC_X.${slug}`, l);
  return out;
}

// the strings above that a native speaker should read before they are relied on (new in round 56; reworded in round 57
// by the wording guard: the sort phrases, the comparison line, the year and part intros, every frame that said "first",
// "largest", "only" or a chance word)
export const REVIEW = ["S (page frames: de, fr, es, pl, nl, uk)", "MEASURE", "PART (37 part names)", "SIDE", "COPY.part", "COPY.year", "COPY.compare", "COPY.hub", "TOPIC_T (20 topics × 6 languages)", "COPY.topic", "COPY.country (7 chance levels)", "COPY.home", "LABELS", "DYN (round 57b: the country page's sections and questions, 6 languages)", "EXPLAIN (round 58: six explainers, 6 languages)", "S58 and DYN58 (round 58: armed items, cite line, downloads page, relations and armed questions, 6 languages)", "RES (round 58b: the sanctions section and page, the frozen amounts, the explainers' amounts, the oil and gas revenue page, 6 languages)", "ASK, TOPIC_X, RES59 and the retitled RES pages (round 59: the questions people search, 6 languages; the French, Dutch and Polish name rules of grammar())"];
