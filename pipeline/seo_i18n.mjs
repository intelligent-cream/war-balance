// Round 56 (more findable pages): the words of the generated page families (parts, years, comparisons, the Topics hub)
// and of the topic, group and country pages in the six other site languages. Everything a page says about a country
// that is not here comes from the map in that language (seo_extract.mjs: the panel's own sentences, ranges and chance
// words); here are only the page frames, the names of the measures and parts, and the number formats.
//
// Pure (no browser): pipeline/test_seo.mjs tests it. New strings a native speaker should read are listed in
// REVIEW at the end.

export const LANGS = ["en", "uk", "de", "fr", "pl", "nl", "es"];
const TITLE_MAX = 60, DESC_MAX = 155;
export const fit = (cands, max) => cands.find(s => s.length <= max) || cands[cands.length - 1];
const cut = (s, max) => (s.length <= max ? s : s.slice(0, max - 1).replace(/\s+\S*$/, "") + "…");
export const fitTitle = c => cut(fit(c, TITLE_MAX), TITLE_MAX);
export const fitDesc = c => cut(fit(c, DESC_MAX), DESC_MAX);
const cap = s => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

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

// ----- the page frames' words -----
export const S = {
  en: { rankByYear: "Ranked by “{m}” {unit}, {first}, in {y}.", topics: "Topics", allTopics: "All topics", ranking: "Ranking", members: "Members", country: "Country", small: "small economy", related: "Related", questions: "Questions",
    totals: "Totals: the {n} members' best estimates added up, and as a share of their combined GDP. Each member's likely range and chance are on its row.",
    eachRow: "Each row: the best estimate, then the likely range and the chance of its direction, as in the country's panel.",
    eachRowYear: "Each row: that year's amount, a best estimate. The likely ranges and chances are for the totals since 2022, on each country's page.",
    moneyOnly: "These numbers measure money: aid to Ukraine and the change in what Russia keeps from trade, against a world without the war. Weapons sent, troops and diplomacy are not in them.",
    moneyMil: "These numbers measure money. Weapons and troops sent to Russia count in the totals only for the four countries that sent them, as the method page explains; diplomacy is not in them.",
    party: "Party to the war (with Russia), not ranked", sides: "{x}: one of the two sides the money is measured toward, so no figure of its own.", russia: "Russia", ukraine: "Ukraine",
    noData: "No data", noDataText: "No observation of their own for the war years: not ranked.", outside: "Outside the totals",
    rankBy: "Ranked by “{m}” {unit}, {first}, February 2022 to {to}.", unit: { gdp: "as a share of one year's GDP", eur: "in euros", pp: "per person" },
    first: { keptAsc: "where Russia kept most more first", ruAsc: "most toward Russia first", keptDesc: "where Russia kept most less first", netDesc: "most toward Ukraine first", largest: "largest first", abs: "largest amount first, either way" },
    minGdp: "Economies under €{n}bn of GDP are left out, as in the map's ranking.",
    legendKept: "more or less: how much more or less Russia kept (taxes and profit, not sales) than in a world without the war", legendSigned: "+ toward Ukraine, − toward Russia",
    ofGdp: "of GDP", perPerson: "per person", ofCombined: "of the members' combined GDP", less: "less", more: "more", toU: "toward Ukraine", toR: "toward Russia",
    totRus: "Russia kept {v} {lm} than without the war", totUa: "{v} in support", totFrozen: "{v} return lost", groupTotals: "Group totals",
    notInTotals: "Not in the totals: shown for information only (the cost view, kept in the full data download).",
    fuelShare: "of what it bought from Russia", openMap: "Open in the map", map: "Map",
    yearTo: "{y} (to {month})",
    more_about: "More about {name}", groups: "Groups", compared: "Compared with", partsRanked: "Its parts, ranked against other countries", byYearPages: "Every country, by year",
    supportYear: "Support for Ukraine in {y}", tradeYear: "Trade with Russia in {y}",
    hubParts: "Each part on its own", hubYears: "By year", hubCompare: "Countries compared", hubGroups: "Groups", hubTopics: "Topics", hubRankings: "Rankings", hubCountries: "Every country",
    sideBySide: "Side by side", theParts: "What makes up each number", yearByYear: "Year by year", measure: "Measure",
    rankings: [["Ranking", "/ranking/"], ["Support for Ukraine by country", "/support-for-ukraine/"], ["Trade with Russia by country", "/trade-with-russia/"]] },
  de: { rankByYear: "Gereiht nach „{m}“ {unit}, {first}, im Jahr {y}.", topics: "Themen", allTopics: "Alle Themen", ranking: "Rangliste", members: "Mitglieder", country: "Land", small: "kleine Volkswirtschaft", related: "Verwandte Seiten", questions: "Fragen",
    totals: "Summen: die besten Schätzungen der {n} Mitglieder addiert und als Anteil an ihrem gemeinsamen BIP. Spanne und Wahrscheinlichkeit jedes Mitglieds stehen in seiner Zeile.",
    eachRow: "Jede Zeile: die beste Schätzung, dann die wahrscheinliche Spanne und die Wahrscheinlichkeit der Richtung, wie im Bereich des Landes auf der Karte.",
    eachRowYear: "Jede Zeile: der Betrag dieses Jahres, eine beste Schätzung. Spannen und Wahrscheinlichkeiten gelten für die Summen seit 2022 auf der Seite jedes Landes.",
    moneyOnly: "Diese Zahlen messen Geld: Hilfe für die Ukraine und die Veränderung dessen, was Russland am Handel verdient, verglichen mit einer Welt ohne Krieg. Waffenlieferungen, Truppen und Diplomatie sind nicht enthalten.",
    moneyMil: "Diese Zahlen messen Geld. Waffen und Truppen für Russland zählen nur bei den vier Ländern, die sie geschickt haben, wie auf der Methodenseite erklärt; Diplomatie ist nicht enthalten.",
    party: "Kriegspartei (mit Russland), nicht gereiht", sides: "{x}: eine der beiden Seiten, zu denen das Geld gemessen wird, daher ohne eigene Zahl.", russia: "Russland", ukraine: "Ukraine",
    noData: "Keine Daten", noDataText: "Keine eigene Beobachtung für die Kriegsjahre: nicht gereiht.", outside: "Außerhalb der Summen",
    rankBy: "Gereiht nach „{m}“ {unit}, {first}, Februar 2022 bis {to}.", unit: { gdp: "als Anteil an einem Jahres-BIP", eur: "in Euro", pp: "pro Kopf" },
    first: { keptAsc: "zuerst, wo Russland am meisten mehr behielt", ruAsc: "am stärksten Richtung Russland zuerst", keptDesc: "zuerst, wo Russland am meisten weniger behielt", netDesc: "am stärksten Richtung Ukraine zuerst", largest: "größte zuerst", abs: "größter Betrag zuerst, in beide Richtungen" },
    minGdp: "Volkswirtschaften unter {n} Mrd. € BIP sind ausgelassen, wie in der Rangliste der Karte.",
    legendKept: "mehr oder weniger: wie viel mehr oder weniger Russland behielt (Steuern und Gewinn, nicht der Umsatz) als ohne Krieg", legendSigned: "+ Richtung Ukraine, − Richtung Russland",
    ofGdp: "des BIP", perPerson: "pro Kopf", ofCombined: "des gemeinsamen BIP der Mitglieder", less: "weniger", more: "mehr", toU: "Richtung Ukraine", toR: "Richtung Russland",
    totRus: "Russland behielt {v} {lm} als ohne Krieg", totUa: "{v} Unterstützung", totFrozen: "{v} entgangener Ertrag", groupTotals: "Summen der Gruppe",
    notInTotals: "Nicht in den Summen: nur zur Information (Kostenansicht, im vollständigen Datendownload).",
    fuelShare: "seiner Käufe aus Russland", openMap: "Auf der Karte öffnen", map: "Karte",
    yearTo: "{y} (bis {month})",
    more_about: "Mehr zu {name}", groups: "Gruppen", compared: "Im Vergleich mit", partsRanked: "Seine Teile im Ländervergleich", byYearPages: "Alle Länder nach Jahr",
    supportYear: "Unterstützung für die Ukraine {y}", tradeYear: "Handel mit Russland {y}",
    hubParts: "Jeder Teil einzeln", hubYears: "Nach Jahr", hubCompare: "Länder im Vergleich", hubGroups: "Gruppen", hubTopics: "Themen", hubRankings: "Ranglisten", hubCountries: "Alle Länder",
    sideBySide: "Nebeneinander", theParts: "Woraus sich jede Zahl zusammensetzt", yearByYear: "Jahr für Jahr", measure: "Größe",
    rankings: [["Rangliste", "/ranking/"]] },
  fr: { rankByYear: "Classé selon « {m} » {unit}, {first}, en {y}.", topics: "Thèmes", allTopics: "Tous les thèmes", ranking: "Classement", members: "Membres", country: "Pays", small: "petite économie", related: "Pages liées", questions: "Questions",
    totals: "Totaux : les meilleures estimations des {n} membres additionnées, et en part de leur PIB cumulé. La fourchette et la probabilité de chaque membre figurent sur sa ligne.",
    eachRow: "Chaque ligne : la meilleure estimation, puis la fourchette probable et la probabilité du sens, comme dans le panneau du pays.",
    eachRowYear: "Chaque ligne : le montant de l'année, une meilleure estimation. Fourchettes et probabilités portent sur les totaux depuis 2022, sur la page de chaque pays.",
    moneyOnly: "Ces chiffres mesurent de l'argent : l'aide à l'Ukraine et la variation de ce que la Russie tire du commerce, par rapport à un monde sans guerre. Armes envoyées, troupes et diplomatie n'y figurent pas.",
    moneyMil: "Ces chiffres mesurent de l'argent. Les armes et troupes envoyées à la Russie ne comptent que pour les quatre pays qui les ont envoyées, comme l'explique la page de méthode ; la diplomatie n'y figure pas.",
    party: "Partie au conflit (avec la Russie), non classée", sides: "{x} : l'un des deux côtés vers lesquels l'argent est mesuré, donc sans chiffre propre.", russia: "Russie", ukraine: "Ukraine",
    noData: "Pas de données", noDataText: "Aucune observation propre pour les années de guerre : non classés.", outside: "Hors des totaux",
    rankBy: "Classé selon « {m} » {unit}, {first}, de février 2022 à {to}.", unit: { gdp: "en part d'une année de PIB", eur: "en euros", pp: "par habitant" },
    first: { keptAsc: "d'abord là où la Russie a gardé le plus en plus", ruAsc: "le plus vers la Russie d'abord", keptDesc: "d'abord là où la Russie a gardé le plus en moins", netDesc: "le plus vers l'Ukraine d'abord", largest: "le plus grand d'abord", abs: "le plus gros montant d'abord, dans un sens ou l'autre" },
    minGdp: "Les économies de moins de {n} Md€ de PIB sont exclues, comme dans le classement de la carte.",
    legendKept: "en plus ou en moins : ce que la Russie a gardé (impôts et profits, pas les ventes) de plus ou de moins que sans la guerre", legendSigned: "+ vers l'Ukraine, − vers la Russie",
    ofGdp: "du PIB", perPerson: "par habitant", ofCombined: "du PIB cumulé des membres", less: "de moins", more: "de plus", toU: "vers l'Ukraine", toR: "vers la Russie",
    totRus: "la Russie a gardé {v} {lm} que sans la guerre", totUa: "{v} de soutien", totFrozen: "{v} de rendement perdu", groupTotals: "Totaux du groupe",
    notInTotals: "Hors des totaux : à titre d'information seulement (vue des coûts, dans le téléchargement complet des données).",
    fuelShare: "de ses achats à la Russie", openMap: "Ouvrir sur la carte", map: "Carte",
    yearTo: "{y} (jusqu'à {month})",
    more_about: "En savoir plus : {name}", groups: "Groupes", compared: "Comparé à", partsRanked: "Ses composantes, comparées aux autres pays", byYearPages: "Tous les pays, par année",
    supportYear: "Soutien à l'Ukraine en {y}", tradeYear: "Commerce avec la Russie en {y}",
    hubParts: "Chaque composante à part", hubYears: "Par année", hubCompare: "Pays comparés", hubGroups: "Groupes", hubTopics: "Thèmes", hubRankings: "Classements", hubCountries: "Tous les pays",
    sideBySide: "Côte à côte", theParts: "Ce qui compose chaque chiffre", yearByYear: "Année par année", measure: "Mesure",
    rankings: [["Classement", "/ranking/"]] },
  es: { rankByYear: "Ordenado por «{m}» {unit}, {first}, en {y}.", topics: "Temas", allTopics: "Todos los temas", ranking: "Clasificación", members: "Miembros", country: "País", small: "economía pequeña", related: "Páginas relacionadas", questions: "Preguntas",
    totals: "Totales: las mejores estimaciones de los {n} miembros sumadas, y como parte de su PIB conjunto. El rango y la probabilidad de cada miembro están en su fila.",
    eachRow: "Cada fila: la mejor estimación, luego el rango probable y la probabilidad de su dirección, como en el panel del país.",
    eachRowYear: "Cada fila: el importe de ese año, una mejor estimación. Los rangos y probabilidades son de los totales desde 2022, en la página de cada país.",
    moneyOnly: "Estas cifras miden dinero: la ayuda a Ucrania y el cambio en lo que Rusia obtiene del comercio, frente a un mundo sin guerra. No incluyen armas enviadas, tropas ni diplomacia.",
    moneyMil: "Estas cifras miden dinero. Las armas y tropas enviadas a Rusia cuentan solo para los cuatro países que las enviaron, como explica la página de método; la diplomacia no se incluye.",
    party: "Parte en la guerra (con Rusia), sin clasificar", sides: "{x}: uno de los dos lados hacia los que se mide el dinero, sin cifra propia.", russia: "Rusia", ukraine: "Ucrania",
    noData: "Sin datos", noDataText: "Sin observación propia para los años de guerra: sin clasificar.", outside: "Fuera de los totales",
    rankBy: "Ordenado por «{m}» {unit}, {first}, de febrero de 2022 a {to}.", unit: { gdp: "como parte de un año de PIB", eur: "en euros", pp: "por persona" },
    first: { keptAsc: "primero donde Rusia ganó más de más", ruAsc: "primero lo más hacia Rusia", keptDesc: "primero donde Rusia ganó más de menos", netDesc: "primero lo más hacia Ucrania", largest: "de mayor a menor", abs: "primero el mayor importe, en cualquier sentido" },
    minGdp: "Se excluyen las economías con menos de {n} 000 M€ de PIB, como en la clasificación del mapa.",
    legendKept: "más o menos: cuánto más o menos se quedó Rusia (impuestos y beneficios, no ventas) que en un mundo sin guerra", legendSigned: "+ hacia Ucrania, − hacia Rusia",
    ofGdp: "del PIB", perPerson: "por persona", ofCombined: "del PIB conjunto de los miembros", less: "menos", more: "más", toU: "hacia Ucrania", toR: "hacia Rusia",
    totRus: "Rusia se quedó con {v} {lm} que sin la guerra", totUa: "{v} de apoyo", totFrozen: "{v} de rendimiento perdido", groupTotals: "Totales del grupo",
    notInTotals: "Fuera de los totales: solo como información (vista de costes, en la descarga completa de datos).",
    fuelShare: "de lo que compró a Rusia", openMap: "Abrir en el mapa", map: "Mapa",
    yearTo: "{y} (hasta {month})",
    more_about: "Más sobre {name}", groups: "Grupos", compared: "Comparado con", partsRanked: "Sus partes, frente a otros países", byYearPages: "Todos los países, por año",
    supportYear: "Apoyo a Ucrania en {y}", tradeYear: "Comercio con Rusia en {y}",
    hubParts: "Cada parte por separado", hubYears: "Por año", hubCompare: "Países comparados", hubGroups: "Grupos", hubTopics: "Temas", hubRankings: "Clasificaciones", hubCountries: "Todos los países",
    sideBySide: "Lado a lado", theParts: "De qué se compone cada cifra", yearByYear: "Año por año", measure: "Medida",
    rankings: [["Clasificación", "/ranking/"]] },
  pl: { rankByYear: "Według „{m}” {unit}, {first}, w {y} r.", topics: "Tematy", allTopics: "Wszystkie tematy", ranking: "Ranking", members: "Członkowie", country: "Kraj", small: "mała gospodarka", related: "Powiązane strony", questions: "Pytania",
    totals: "Sumy: najlepsze szacunki {n} członków zsumowane i jako udział w ich łącznym PKB. Przedział i szansa każdego członka są w jego wierszu.",
    eachRow: "Każdy wiersz: najlepszy szacunek, potem prawdopodobny przedział i szansa kierunku, jak w panelu kraju.",
    eachRowYear: "Każdy wiersz: kwota z danego roku, najlepszy szacunek. Przedziały i szanse dotyczą sum od 2022 r., na stronie każdego kraju.",
    moneyOnly: "Te liczby mierzą pieniądze: pomoc dla Ukrainy i zmianę tego, co Rosja zatrzymuje z handlu, w porównaniu ze światem bez wojny. Nie obejmują wysłanej broni, wojsk ani dyplomacji.",
    moneyMil: "Te liczby mierzą pieniądze. Broń i wojska wysłane do Rosji liczą się tylko dla czterech krajów, które je wysłały, jak wyjaśnia strona metody; dyplomacja nie jest uwzględniona.",
    party: "Strona wojny (po stronie Rosji), poza rankingiem", sides: "{x}: jedna z dwóch stron, względem których mierzone są pieniądze, więc bez własnej liczby.", russia: "Rosja", ukraine: "Ukraina",
    noData: "Brak danych", noDataText: "Brak własnych obserwacji za lata wojny: poza rankingiem.", outside: "Poza sumami",
    rankBy: "Według „{m}” {unit}, {first}, od lutego 2022 do {to}.", unit: { gdp: "jako udział w rocznym PKB", eur: "w euro", pp: "na osobę" },
    first: { keptAsc: "najpierw tam, gdzie Rosja zatrzymała najwięcej więcej", ruAsc: "najpierw najbardziej w stronę Rosji", keptDesc: "najpierw tam, gdzie Rosja zatrzymała najwięcej mniej", netDesc: "najpierw najbardziej w stronę Ukrainy", largest: "od największych", abs: "od największej kwoty, w obie strony" },
    minGdp: "Gospodarki z PKB poniżej {n} mld € są pominięte, jak w rankingu na mapie.",
    legendKept: "więcej lub mniej: o ile więcej lub mniej Rosja zatrzymała (podatki i zysk, nie sprzedaż) niż w świecie bez wojny", legendSigned: "+ na rzecz Ukrainy, − na rzecz Rosji",
    ofGdp: "PKB", perPerson: "na osobę", ofCombined: "łącznego PKB członków", less: "mniej", more: "więcej", toU: "na rzecz Ukrainy", toR: "na rzecz Rosji",
    totRus: "Rosja zatrzymała {v} {lm} niż bez wojny", totUa: "{v} wsparcia", totFrozen: "{v} utraconego zwrotu", groupTotals: "Sumy grupy",
    notInTotals: "Poza sumami: tylko informacyjnie (widok kosztów, w pełnym pliku danych).",
    fuelShare: "jego zakupów z Rosji", openMap: "Otwórz na mapie", map: "Mapa",
    yearTo: "{y} (do {month})",
    more_about: "Więcej: {name}", groups: "Grupy", compared: "W porównaniu z", partsRanked: "Jego składniki na tle innych krajów", byYearPages: "Wszystkie kraje według roku",
    supportYear: "Wsparcie dla Ukrainy w {y} r.", tradeYear: "Handel z Rosją w {y} r.",
    hubParts: "Każdy składnik osobno", hubYears: "Według roku", hubCompare: "Porównania krajów", hubGroups: "Grupy", hubTopics: "Tematy", hubRankings: "Rankingi", hubCountries: "Wszystkie kraje",
    sideBySide: "Obok siebie", theParts: "Z czego składa się każda liczba", yearByYear: "Rok po roku", measure: "Miara",
    rankings: [["Ranking", "/ranking/"]] },
  nl: { rankByYear: "Gerangschikt op ‘{m}’ {unit}, {first}, in {y}.", topics: "Onderwerpen", allTopics: "Alle onderwerpen", ranking: "Ranglijst", members: "Leden", country: "Land", small: "kleine economie", related: "Verwante pagina's", questions: "Vragen",
    totals: "Totalen: de beste schattingen van de {n} leden opgeteld, en als aandeel van hun gezamenlijke bbp. Bandbreedte en kans van elk lid staan in zijn rij.",
    eachRow: "Elke rij: de beste schatting, dan de waarschijnlijke bandbreedte en de kans op de richting, zoals in het paneel van het land.",
    eachRowYear: "Elke rij: het bedrag van dat jaar, een beste schatting. Bandbreedtes en kansen gelden voor de totalen sinds 2022, op de pagina van elk land.",
    moneyOnly: "Deze cijfers meten geld: steun aan Oekraïne en de verandering in wat Rusland aan handel overhoudt, vergeleken met een wereld zonder oorlog. Geleverde wapens, troepen en diplomatie zitten er niet in.",
    moneyMil: "Deze cijfers meten geld. Wapens en troepen voor Rusland tellen alleen mee bij de vier landen die ze stuurden, zoals de methodepagina uitlegt; diplomatie zit er niet in.",
    party: "Partij in de oorlog (met Rusland), niet gerangschikt", sides: "{x}: een van de twee kanten waarnaar het geld gemeten wordt, dus zonder eigen cijfer.", russia: "Rusland", ukraine: "Oekraïne",
    noData: "Geen gegevens", noDataText: "Geen eigen waarneming voor de oorlogsjaren: niet gerangschikt.", outside: "Buiten de totalen",
    rankBy: "Gerangschikt op ‘{m}’ {unit}, {first}, februari 2022 tot {to}.", unit: { gdp: "als aandeel van een jaar bbp", eur: "in euro", pp: "per persoon" },
    first: { keptAsc: "eerst waar Rusland het meest meer overhield", ruAsc: "het meest richting Rusland eerst", keptDesc: "eerst waar Rusland het meest minder overhield", netDesc: "het meest richting Oekraïne eerst", largest: "grootste eerst", abs: "grootste bedrag eerst, beide kanten op" },
    minGdp: "Economieën onder €{n} mld bbp zijn weggelaten, zoals in de ranglijst van de kaart.",
    legendKept: "meer of minder: hoeveel meer of minder Rusland overhield (belasting en winst, geen omzet) dan zonder oorlog", legendSigned: "+ richting Oekraïne, − richting Rusland",
    ofGdp: "van het bbp", perPerson: "per persoon", ofCombined: "van het gezamenlijke bbp van de leden", less: "minder", more: "meer", toU: "richting Oekraïne", toR: "richting Rusland",
    totRus: "Rusland hield {v} {lm} over dan zonder oorlog", totUa: "{v} aan steun", totFrozen: "{v} gederfd rendement", groupTotals: "Totalen van de groep",
    notInTotals: "Niet in de totalen: alleen ter informatie (kostenweergave, in de volledige datadownload).",
    fuelShare: "van wat het van Rusland kocht", openMap: "Openen op de kaart", map: "Kaart",
    yearTo: "{y} (tot {month})",
    more_about: "Meer over {name}", groups: "Groepen", compared: "Vergeleken met", partsRanked: "Zijn onderdelen, naast andere landen", byYearPages: "Alle landen per jaar",
    supportYear: "Steun aan Oekraïne in {y}", tradeYear: "Handel met Rusland in {y}",
    hubParts: "Elk onderdeel apart", hubYears: "Per jaar", hubCompare: "Landen vergeleken", hubGroups: "Groepen", hubTopics: "Onderwerpen", hubRankings: "Ranglijsten", hubCountries: "Alle landen",
    sideBySide: "Naast elkaar", theParts: "Waaruit elk getal bestaat", yearByYear: "Jaar na jaar", measure: "Maat",
    rankings: [["Ranglijst", "/ranking/"]] },
  uk: { rankByYear: "За показником «{m}» {unit}, {first}, у {y} році.", topics: "Теми", allTopics: "Усі теми", ranking: "Рейтинг", members: "Члени", country: "Країна", small: "мала економіка", related: "Пов'язані сторінки", questions: "Запитання",
    totals: "Підсумки: найкращі оцінки {n} членів разом і як частка їхнього спільного ВВП. Діапазон і шанс кожного члена — у його рядку.",
    eachRow: "Кожен рядок: найкраща оцінка, далі ймовірний діапазон і шанс напрямку, як на панелі країни.",
    eachRowYear: "Кожен рядок: сума за цей рік, найкраща оцінка. Діапазони й шанси стосуються підсумків з 2022 року, на сторінці кожної країни.",
    moneyOnly: "Ці числа вимірюють гроші: допомогу Україні та зміну того, що Росія отримує від торгівлі, порівняно зі світом без війни. Надіслана зброя, війська й дипломатія сюди не входять.",
    moneyMil: "Ці числа вимірюють гроші. Зброя і війська, надіслані Росії, враховані лише для чотирьох країн, що їх надіслали, як пояснює сторінка методики; дипломатія сюди не входить.",
    party: "Сторона війни (на боці Росії), поза рейтингом", sides: "{x}: одна з двох сторін, щодо яких вимірюються гроші, тому без власного числа.", russia: "Росія", ukraine: "Україна",
    noData: "Немає даних", noDataText: "Власних спостережень за роки війни немає: поза рейтингом.", outside: "Поза підсумками",
    rankBy: "За показником «{m}» {unit}, {first}, з лютого 2022 до {to}.", unit: { gdp: "як частка річного ВВП", eur: "у євро", pp: "на особу" },
    first: { keptAsc: "спершу там, де Росія отримала найбільше більше", ruAsc: "спершу найбільше на бік Росії", keptDesc: "спершу там, де Росія отримала найбільше менше", netDesc: "спершу найбільше на користь України", largest: "від найбільшого", abs: "від найбільшої суми, в будь-який бік" },
    minGdp: "Економіки з ВВП менше {n} млрд € не враховано, як у рейтингу на карті.",
    legendKept: "більше чи менше: на скільки більше чи менше Росія отримала (податки й прибуток, не продажі), ніж у світі без війни", legendSigned: "+ на користь України, − на бік Росії",
    ofGdp: "ВВП", perPerson: "на особу", ofCombined: "спільного ВВП членів", less: "менше", more: "більше", toU: "на користь України", toR: "на бік Росії",
    totRus: "Росія отримала на {v} {lm}, ніж без війни", totUa: "{v} підтримки", totFrozen: "{v} втраченого доходу", groupTotals: "Підсумки групи",
    notInTotals: "Поза підсумками: лише для інформації (вигляд витрат, у повному завантаженні даних).",
    fuelShare: "її закупівель у Росії", openMap: "Відкрити на карті", map: "Карта",
    yearTo: "{y} (до {month})",
    more_about: "Більше про: {name}", groups: "Групи", compared: "У порівнянні з", partsRanked: "Її складники порівняно з іншими країнами", byYearPages: "Усі країни за роками",
    supportYear: "Підтримка України у {y} році", tradeYear: "Торгівля з Росією у {y} році",
    hubParts: "Кожен складник окремо", hubYears: "За роками", hubCompare: "Порівняння країн", hubGroups: "Групи", hubTopics: "Теми", hubRankings: "Рейтинги", hubCountries: "Усі країни",
    sideBySide: "Поруч", theParts: "З чого складається кожне число", yearByYear: "Рік за роком", measure: "Показник",
    rankings: [["Рейтинг", "/ranking/"]] },
};
export const s = (l, k, vars) => { let x = (S[l] && S[l][k] !== undefined ? S[l] : S.en)[k]; if (vars && typeof x === "string") x = x.replace(/\{(\w+)\}/g, (m, v) => (v in vars ? vars[v] : m)); return x; };

// ----- the measures a page can rank by -----
export const MEASURE = {
  en: { net: "Net", ua: "Support for Ukraine", rus: "Russia kept from trade, vs no war", frozen: "Russian money frozen (return lost)", paid: "Paid Russia since 2022", paidGain: "Russia kept from its purchases, vs no war", aid: "Aid counted here", kiel: "Kiel Institute figure", fuelShare: "Fuel share of purchases, 2018–21", armed: "Full value of deliveries" },
  de: { net: "Saldo", ua: "Unterstützung für die Ukraine", rus: "Russlands Handelsgewinn ggü. ohne Krieg", frozen: "Eingefrorenes russisches Geld (entgangener Ertrag)", paid: "An Russland gezahlt seit 2022", paidGain: "Russlands Gewinn aus seinen Käufen ggü. ohne Krieg", aid: "Hier gezählte Hilfe", kiel: "Zahl des Kiel Instituts", fuelShare: "Brennstoffanteil der Käufe 2018–21", armed: "Voller Wert der Lieferungen" },
  fr: { net: "Solde", ua: "Soutien à l'Ukraine", rus: "Gain russe sur le commerce, vs sans guerre", frozen: "Avoirs russes gelés (rendement perdu)", paid: "Payé à la Russie depuis 2022", paidGain: "Gain russe sur ses achats, vs sans guerre", aid: "Aide comptée ici", kiel: "Chiffre de l'Institut de Kiel", fuelShare: "Part des combustibles dans ses achats, 2018–21", armed: "Valeur totale des livraisons" },
  es: { net: "Neto", ua: "Apoyo a Ucrania", rus: "Ganancia rusa del comercio, vs sin guerra", frozen: "Dinero ruso congelado (rendimiento perdido)", paid: "Pagado a Rusia desde 2022", paidGain: "Ganancia rusa de sus compras, vs sin guerra", aid: "Ayuda contada aquí", kiel: "Cifra del Instituto de Kiel", fuelShare: "Peso de los combustibles en sus compras, 2018–21", armed: "Valor total de las entregas" },
  pl: { net: "Saldo", ua: "Wsparcie dla Ukrainy", rus: "Zysk Rosji z handlu wobec braku wojny", frozen: "Zamrożone rosyjskie środki (utracony zwrot)", paid: "Zapłacono Rosji od 2022", paidGain: "Zysk Rosji z jego zakupów wobec braku wojny", aid: "Pomoc liczona tutaj", kiel: "Dane Instytutu Kilońskiego", fuelShare: "Udział paliw w zakupach 2018–21", armed: "Pełna wartość dostaw" },
  nl: { net: "Saldo", ua: "Steun aan Oekraïne", rus: "Ruslands handelswinst t.o.v. geen oorlog", frozen: "Bevroren Russisch geld (gederfd rendement)", paid: "Aan Rusland betaald sinds 2022", paidGain: "Ruslands winst op zijn aankopen t.o.v. geen oorlog", aid: "Hier getelde hulp", kiel: "Cijfer van het Kiel Instituut", fuelShare: "Aandeel brandstof in aankopen 2018–21", armed: "Volle waarde van de leveringen" },
  uk: { net: "Нетто", ua: "Підтримка України", rus: "Прибуток Росії від торгівлі проти світу без війни", frozen: "Заморожені російські кошти (втрачений дохід)", paid: "Сплачено Росії з 2022", paidGain: "Прибуток Росії з її закупівель проти світу без війни", aid: "Допомога, врахована тут", kiel: "Дані Кільського інституту", fuelShare: "Частка палива в закупівлях 2018–21", armed: "Повна вартість поставок" },
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
const SIDE = {
  en: { ua: "One part of each country's support for Ukraine.", back: "Money flowing back from the war effort to the giver's own economy, subtracted from its support for Ukraine at its real gain.",
    rus: "One part of how much more or less Russia kept from trade with each country than in a world without the war (taxes and profit, not the sales value).", frozen: "The return Russia lost on money frozen in each country: counted in the net only, and not the amount frozen.", cost: "Not in the totals: shown for information only." },
  de: { ua: "Ein Teil der Unterstützung jedes Landes für die Ukraine.", back: "Geld, das aus der Kriegshilfe in die Wirtschaft des Gebers zurückfließt und von seiner Unterstützung abgezogen wird, zu seinem echten Gewinn.",
    rus: "Ein Teil dessen, wie viel mehr oder weniger Russland am Handel mit jedem Land behielt als ohne Krieg (Steuern und Gewinn, nicht der Umsatz).", frozen: "Der Ertrag, den Russland auf in jedem Land eingefrorenes Geld verlor: nur im Saldo gezählt, nicht der eingefrorene Betrag.", cost: "Nicht in den Summen: nur zur Information." },
  fr: { ua: "Une composante du soutien de chaque pays à l'Ukraine.", back: "L'argent de l'effort de guerre qui revient dans l'économie du donateur, déduit de son soutien à hauteur de son gain réel.",
    rus: "Une composante de ce que la Russie a gardé de plus ou de moins sur son commerce avec chaque pays par rapport à un monde sans guerre (impôts et profits, pas les ventes).", frozen: "Le rendement perdu par la Russie sur l'argent gelé dans chaque pays : compté dans le solde seulement, et non le montant gelé.", cost: "Hors des totaux : à titre d'information seulement." },
  es: { ua: "Una parte del apoyo de cada país a Ucrania.", back: "Dinero del esfuerzo de guerra que vuelve a la economía del donante, restado de su apoyo según su ganancia real.",
    rus: "Una parte de cuánto más o menos se quedó Rusia del comercio con cada país que en un mundo sin guerra (impuestos y beneficios, no las ventas).", frozen: "El rendimiento que Rusia perdió por el dinero congelado en cada país: cuenta solo en el neto, y no es el importe congelado.", cost: "Fuera de los totales: solo como información." },
  pl: { ua: "Jeden ze składników wsparcia każdego kraju dla Ukrainy.", back: "Pieniądze z pomocy wojennej wracające do gospodarki darczyńcy, odejmowane od jego wsparcia według jego rzeczywistego zysku.",
    rus: "Jeden ze składników tego, o ile więcej lub mniej Rosja zatrzymała z handlu z każdym krajem niż w świecie bez wojny (podatki i zysk, nie sprzedaż).", frozen: "Zwrot utracony przez Rosję na środkach zamrożonych w każdym kraju: liczony tylko w saldzie, nie jest to kwota zamrożona.", cost: "Poza sumami: tylko informacyjnie." },
  nl: { ua: "Een onderdeel van de steun van elk land aan Oekraïne.", back: "Geld uit de oorlogssteun dat terugvloeit naar de economie van de gever en van zijn steun wordt afgetrokken, tegen zijn werkelijke winst.",
    rus: "Een onderdeel van hoeveel meer of minder Rusland aan de handel met elk land overhield dan zonder oorlog (belasting en winst, geen omzet).", frozen: "Het rendement dat Rusland misliep op geld dat in elk land bevroren is: alleen in het saldo geteld, en niet het bevroren bedrag.", cost: "Niet in de totalen: alleen ter informatie." },
  uk: { ua: "Один зі складників підтримки України кожною країною.", back: "Гроші з воєнної допомоги, що повертаються в економіку донора й віднімаються від його підтримки за реальним прибутком.",
    rus: "Один зі складників того, на скільки більше чи менше Росія отримала від торгівлі з кожною країною, ніж у світі без війни (податки й прибуток, не продажі).", frozen: "Дохід, який Росія втратила на коштах, заморожених у кожній країні: враховано лише в нетто, і це не заморожена сума.", cost: "Поза підсумками: лише для інформації." },
};
export const sideText = (l, side) => (SIDE[l] || SIDE.en)[side] || "";

// ----- page copy for each family. ctx: n, top (names), topV (the first's figure), dataTo (month year), ... -----
export function partCopy(l, { key, n, top, topV, dataTo }) {
  const N = partName(l, key), t1 = top[0] || "";
  const T = {
    en: { label: N, title: [`${N} by country since 2022`, `${N} by country`, N], description: [`${N}, every country ranked, February 2022 to ${dataTo}. ${t1} first: ${topV}. Euros, % of GDP, likely ranges, sources.`, `${N}, every country ranked, February 2022 to ${dataTo}, in euros and % of GDP, with ranges and sources.`], h1: `${N}: every country since 2022` },
    de: { label: N, title: [`${N} nach Ländern seit 2022`, `${N} nach Ländern`, N], description: [`${N}: alle Länder gereiht, Februar 2022 bis ${dataTo}. An erster Stelle ${t1}: ${topV}. Euro, % des BIP, Spannen, Quellen.`, `${N}: alle Länder gereiht, Februar 2022 bis ${dataTo}, in Euro und % des BIP, mit Spannen und Quellen.`], h1: `${N}: alle Länder seit 2022` },
    fr: { label: N, title: [`${N} par pays depuis 2022`, `${N} par pays`, N], description: [`${N} : tous les pays classés, de février 2022 à ${dataTo}. En tête, ${t1} : ${topV}. Euros, % du PIB, fourchettes, sources.`, `${N} : tous les pays classés, de février 2022 à ${dataTo}, en euros et en % du PIB, avec fourchettes et sources.`], h1: `${N} : tous les pays depuis 2022` },
    es: { label: N, title: [`${N} por país desde 2022`, `${N} por país`, N], description: [`${N}: todos los países, de febrero de 2022 a ${dataTo}. Primero, ${t1}: ${topV}. Euros, % del PIB, rangos, fuentes.`, `${N}: todos los países, de febrero de 2022 a ${dataTo}, en euros y % del PIB, con rangos y fuentes.`], h1: `${N}: todos los países desde 2022` },
    pl: { label: N, title: [`${N} według krajów od 2022`, `${N} według krajów`, N], description: [`${N}: ranking krajów od lutego 2022 do ${dataTo}. Na czele ${t1}: ${topV}. W euro i % PKB, z przedziałami i źródłami.`, `${N}: ranking krajów od lutego 2022 do ${dataTo}, w euro i % PKB, z przedziałami i źródłami.`], h1: `${N}: wszystkie kraje od 2022 roku` },
    nl: { label: N, title: [`${N} per land sinds 2022`, `${N} per land`, N], description: [`${N}: alle landen gerangschikt, februari 2022 tot ${dataTo}. Bovenaan ${t1}: ${topV}. Euro, % van het bbp, bandbreedtes, bronnen.`, `${N}: alle landen gerangschikt, februari 2022 tot ${dataTo}, in euro en % van het bbp, met bandbreedtes en bronnen.`], h1: `${N}: alle landen sinds 2022` },
    uk: { label: N, title: [`${N} за країнами з 2022 року`, `${N} за країнами`, N], description: [`${N}: рейтинг країн з лютого 2022 до ${dataTo}. Перше місце — ${t1}: ${topV}. Євро, % ВВП, діапазони, джерела.`, `${N}: рейтинг країн з лютого 2022 до ${dataTo}, у євро та % ВВП, з діапазонами й джерелами.`], h1: `${N}: усі країни з 2022 року` },
  }[l];
  return { label: T.label, title: fitTitle(T.title), description: fitDesc(t1 ? T.description : T.description.slice(1)), h1: T.h1 };
}

export function partIntro(l, { key, side, n, top, dataTo }) {
  const tops = list3(l, top.slice(0, 3));
  const lead = { en: `${tops} lead, from February 2022 to ${dataTo}; ${n} countries have this part.`, de: `Vorn: ${tops} (Februar 2022 bis ${dataTo}); ${n} Länder haben diesen Teil.`,
    fr: `En tête : ${tops}, de février 2022 à ${dataTo} ; ${n} pays ont cette composante.`, es: `Encabezan ${tops}, de febrero de 2022 a ${dataTo}; ${n} países tienen esta parte.`,
    pl: `Na czele: ${tops}, od lutego 2022 do ${dataTo}; ten składnik ma ${n} krajów.`, nl: `Bovenaan: ${tops} (februari 2022 tot ${dataTo}); ${n} landen hebben dit onderdeel.`,
    uk: `Попереду: ${tops}, з лютого 2022 до ${dataTo}; цей складник має ${n} країн.` }[l];
  return `${sideText(l, side)} ${top.length ? lead : ""}`.trim();
}

export function yearCopy(l, { kind, y, partial, month, n, top, topV, dataTo }) {
  const Y = partial ? s(l, "yearTo", { y, month }) : String(y), t1 = top[0] || "", tops = list3(l, top.slice(0, 3));
  const T = kind === "ua" ? {
    en: { label: `Aid to Ukraine in ${y}`, title: partial ? [`Aid to Ukraine in ${y} so far: by country (to ${month})`, `Aid to Ukraine in ${y} so far, by country`] : [`Aid to Ukraine in ${y}: how much each country gave`, `Aid to Ukraine in ${y} by country`],
      description: [`Support for Ukraine in ${Y}: ${n} countries ranked in euros, with % of GDP. ${t1} gave most: ${topV}. Aid, EU share, refugee hosting.`, `Support for Ukraine in ${Y}, every country ranked in euros and % of GDP: aid, EU share and refugee hosting.`],
      h1: partial ? `How much has each country given Ukraine in ${y} so far?` : `How much did each country give Ukraine in ${y}?`,
      intro: `Each country's support for Ukraine in ${Y}: its aid (loans at their gift value), its share of EU aid and the cost of hosting refugees, minus money flowing back. ${tops} gave the most in euros.` },
    de: { label: `Hilfe für die Ukraine ${y}`, title: partial ? [`Ukraine-Hilfe ${y} bisher: nach Ländern (bis ${month})`, `Ukraine-Hilfe ${y} bisher, nach Ländern`] : [`Ukraine-Hilfe ${y}: Wie viel gab jedes Land?`, `Ukraine-Hilfe ${y} nach Ländern`],
      description: [`Unterstützung für die Ukraine ${Y}: ${n} Länder in Euro gereiht, mit % des BIP. Vorn: ${t1} mit ${topV}. Hilfe, EU-Anteil, Geflüchtete.`, `Unterstützung für die Ukraine ${Y}, alle Länder in Euro und % des BIP: Hilfe, EU-Anteil und Aufnahme von Geflüchteten.`],
      h1: partial ? `Wie viel hat jedes Land der Ukraine ${y} bisher gegeben?` : `Wie viel hat jedes Land der Ukraine ${y} gegeben?`,
      intro: `Die Unterstützung jedes Landes für die Ukraine ${Y}: Hilfe (Kredite zu ihrem Geschenkwert), EU-Anteil und Kosten der Aufnahme von Geflüchteten, abzüglich zurückfließenden Geldes. In Euro am meisten: ${tops}.` },
    fr: { label: `Aide à l'Ukraine en ${y}`, title: partial ? [`Aide à l'Ukraine en ${y} : par pays (jusqu'à ${month})`, `Aide à l'Ukraine en ${y} par pays`] : [`Aide à l'Ukraine en ${y} : combien chaque pays a donné`, `Aide à l'Ukraine en ${y} par pays`],
      description: [`Soutien à l'Ukraine en ${Y} : ${n} pays classés en euros, avec le % du PIB. En tête, ${t1} : ${topV}. Aide, part de l'UE, accueil des réfugiés.`, `Soutien à l'Ukraine en ${Y}, tous les pays en euros et en % du PIB : aide, part de l'UE et accueil des réfugiés.`],
      h1: partial ? `Combien chaque pays a-t-il donné à l'Ukraine en ${y} jusqu'ici ?` : `Combien chaque pays a-t-il donné à l'Ukraine en ${y} ?`,
      intro: `Le soutien de chaque pays à l'Ukraine en ${Y} : son aide (prêts à leur valeur de don), sa part de l'aide de l'UE et le coût de l'accueil des réfugiés, moins l'argent qui revient. Les plus gros montants en euros : ${tops}.` },
    es: { label: `Ayuda a Ucrania en ${y}`, title: partial ? [`Ayuda a Ucrania en ${y}: por país (hasta ${month})`, `Ayuda a Ucrania en ${y} por país`] : [`Ayuda a Ucrania en ${y}: cuánto dio cada país`, `Ayuda a Ucrania en ${y} por país`],
      description: [`Apoyo a Ucrania en ${Y}: ${n} países ordenados en euros, con % del PIB. Primero, ${t1}: ${topV}. Ayuda, parte de la UE, acogida de refugiados.`, `Apoyo a Ucrania en ${Y}, todos los países en euros y % del PIB: ayuda, parte de la UE y acogida de refugiados.`],
      h1: partial ? `¿Cuánto ha dado cada país a Ucrania en ${y} hasta ahora?` : `¿Cuánto dio cada país a Ucrania en ${y}?`,
      intro: `El apoyo de cada país a Ucrania en ${Y}: su ayuda (préstamos por su valor de donación), su parte de la ayuda de la UE y el coste de acoger refugiados, menos el dinero que vuelve. En euros, ${tops} dieron más.` },
    pl: { label: `Pomoc dla Ukrainy w ${y} r.`, title: partial ? [`Pomoc dla Ukrainy w ${y} r.: według krajów (do ${month})`, `Pomoc dla Ukrainy w ${y} r. według krajów`] : [`Pomoc dla Ukrainy w ${y} r.: ile dał każdy kraj?`, `Pomoc dla Ukrainy w ${y} r. według krajów`],
      description: [`Wsparcie dla Ukrainy w ${Y}: ranking ${n} krajów w euro, z % PKB. Najwięcej ${t1}: ${topV}. Pomoc, udział w pomocy UE, uchodźcy.`, `Wsparcie dla Ukrainy w ${Y}, wszystkie kraje w euro i % PKB: pomoc, udział w pomocy UE i przyjęcie uchodźców.`],
      h1: partial ? `Ile każdy kraj dał Ukrainie w ${y} roku do tej pory?` : `Ile każdy kraj dał Ukrainie w ${y} roku?`,
      intro: `Wsparcie każdego kraju dla Ukrainy w ${Y}: pomoc (pożyczki według wartości darowizny), udział w pomocy UE i koszt przyjęcia uchodźców, minus pieniądze, które wróciły. W euro najwięcej dały: ${tops}.` },
    nl: { label: `Steun aan Oekraïne in ${y}`, title: partial ? [`Steun aan Oekraïne in ${y} tot nu toe: per land (tot ${month})`, `Steun aan Oekraïne in ${y} per land`] : [`Steun aan Oekraïne in ${y}: hoeveel gaf elk land?`, `Steun aan Oekraïne in ${y} per land`],
      description: [`Steun aan Oekraïne in ${Y}: ${n} landen gerangschikt in euro, met % van het bbp. Bovenaan ${t1}: ${topV}. Hulp, EU-aandeel, opvang.`, `Steun aan Oekraïne in ${Y}, alle landen in euro en % van het bbp: hulp, EU-aandeel en opvang van vluchtelingen.`],
      h1: partial ? `Hoeveel heeft elk land Oekraïne in ${y} tot nu toe gegeven?` : `Hoeveel gaf elk land Oekraïne in ${y}?`,
      intro: `De steun van elk land aan Oekraïne in ${Y}: hulp (leningen tegen hun schenkingswaarde), het EU-aandeel en de kosten van de opvang van vluchtelingen, min het geld dat terugvloeit. Het meest in euro: ${tops}.` },
    uk: { label: `Допомога Україні у ${y} році`, title: partial ? [`Допомога Україні у ${y} році: за країнами (до ${month})`, `Допомога Україні у ${y} році за країнами`] : [`Допомога Україні у ${y} році: скільки дала кожна країна`, `Допомога Україні у ${y} році за країнами`],
      description: [`Підтримка України у ${Y}: рейтинг ${n} країн у євро, з % ВВП. Найбільше — ${t1}: ${topV}. Допомога, частка ЄС, прийом біженців.`, `Підтримка України у ${Y}, усі країни у євро та % ВВП: допомога, частка ЄС і прийом біженців.`],
      h1: partial ? `Скільки кожна країна дала Україні у ${y} році досі?` : `Скільки кожна країна дала Україні у ${y} році?`,
      intro: `Підтримка України кожною країною у ${Y}: допомога (кредити за вартістю дарунка), частка допомоги ЄС і витрати на прийом біженців, мінус гроші, що повернулися. У євро найбільше дали: ${tops}.` },
  }[l] : {
    en: { label: `Trade with Russia in ${y}`, title: partial ? [`Trade with Russia in ${y} so far: by country (to ${month})`, `Trade with Russia in ${y} so far, by country`] : [`Trade with Russia in ${y}: who added to Russia's earnings`, `Trade with Russia in ${y} by country`],
      description: [`Trade with Russia in ${Y}: how much more or less Russia kept from each country's trade than without the war. ${t1} first: ${topV} more.`, `Trade with Russia in ${Y}: how much more or less Russia kept from each country's trade than without the war, every country.`],
      h1: `Trade with Russia in ${Y}: whose trade raised or cut Russia's earnings?`,
      intro: `How much more or less Russia kept (taxes and profit, not the sales value) from trade with each country in ${Y} than in a world without the war. Russia kept the most more from trade with ${tops}.` },
    de: { label: `Handel mit Russland ${y}`, title: partial ? [`Handel mit Russland ${y} bisher: nach Ländern (bis ${month})`, `Handel mit Russland ${y} nach Ländern`] : [`Handel mit Russland ${y}: Wer erhöhte Russlands Einnahmen?`, `Handel mit Russland ${y} nach Ländern`],
      description: [`Handel mit Russland ${Y}: wie viel mehr oder weniger Russland am Handel jedes Landes behielt als ohne Krieg. Vorn ${t1}: ${topV} mehr.`, `Handel mit Russland ${Y}: wie viel mehr oder weniger Russland am Handel jedes Landes behielt als ohne Krieg, alle Länder.`],
      h1: `Handel mit Russland ${Y}: Wessen Handel erhöhte oder senkte Russlands Einnahmen?`,
      intro: `Wie viel mehr oder weniger Russland ${Y} am Handel mit jedem Land behielt (Steuern und Gewinn, nicht der Umsatz) als ohne Krieg. Die größten Zuwächse für Russland: ${tops}.` },
    fr: { label: `Commerce avec la Russie en ${y}`, title: partial ? [`Commerce avec la Russie en ${y} : par pays (jusqu'à ${month})`, `Commerce avec la Russie en ${y} par pays`] : [`Commerce avec la Russie en ${y} : qui a accru ses gains ?`, `Commerce avec la Russie en ${y} par pays`],
      description: [`Commerce avec la Russie en ${Y} : ce que la Russie a gardé de plus ou de moins sur le commerce de chaque pays que sans guerre. En tête, ${t1} : ${topV} de plus.`, `Commerce avec la Russie en ${Y} : ce que la Russie a gardé de plus ou de moins sur le commerce de chaque pays que sans la guerre.`],
      h1: `Commerce avec la Russie en ${Y} : quels pays ont accru ou réduit ses gains ?`,
      intro: `Ce que la Russie a gardé de plus ou de moins (impôts et profits, pas les ventes) sur son commerce avec chaque pays en ${Y}, par rapport à un monde sans guerre. Les plus fortes hausses pour la Russie : ${tops}.` },
    es: { label: `Comercio con Rusia en ${y}`, title: partial ? [`Comercio con Rusia en ${y}: por país (hasta ${month})`, `Comercio con Rusia en ${y} por país`] : [`Comercio con Rusia en ${y}: quién aumentó sus ingresos`, `Comercio con Rusia en ${y} por país`],
      description: [`Comercio con Rusia en ${Y}: cuánto más o menos se quedó Rusia del comercio de cada país que sin la guerra. Primero, ${t1}: ${topV} más.`, `Comercio con Rusia en ${Y}: cuánto más o menos se quedó Rusia del comercio de cada país que sin la guerra, todos los países.`],
      h1: `Comercio con Rusia en ${Y}: ¿quién aumentó o redujo sus ingresos?`,
      intro: `Cuánto más o menos se quedó Rusia (impuestos y beneficios, no las ventas) del comercio con cada país en ${Y} que en un mundo sin guerra. Los mayores aumentos para Rusia: ${tops}.` },
    pl: { label: `Handel z Rosją w ${y} r.`, title: partial ? [`Handel z Rosją w ${y} r.: według krajów (do ${month})`, `Handel z Rosją w ${y} r. według krajów`] : [`Handel z Rosją w ${y} r.: kto zwiększył jej dochody?`, `Handel z Rosją w ${y} r. według krajów`],
      description: [`Handel z Rosją w ${Y}: o ile więcej lub mniej Rosja zatrzymała z handlu każdego kraju niż bez wojny. Na czele ${t1}: ${topV} więcej.`, `Handel z Rosją w ${Y}: o ile więcej lub mniej Rosja zatrzymała z handlu każdego kraju niż bez wojny, wszystkie kraje.`],
      h1: `Handel z Rosją w ${Y}: czyj handel zwiększył lub zmniejszył jej dochody?`,
      intro: `O ile więcej lub mniej Rosja zatrzymała (podatki i zysk, nie sprzedaż) z handlu z każdym krajem w ${Y} niż w świecie bez wojny. Najwięcej więcej zatrzymała z handlu z: ${tops}.` },
    nl: { label: `Handel met Rusland in ${y}`, title: partial ? [`Handel met Rusland in ${y}: per land (tot ${month})`, `Handel met Rusland in ${y} per land`] : [`Handel met Rusland in ${y}: wie verhoogde de inkomsten?`, `Handel met Rusland in ${y} per land`],
      description: [`Handel met Rusland in ${Y}: hoeveel meer of minder Rusland aan de handel van elk land overhield dan zonder oorlog. Bovenaan ${t1}: ${topV} meer.`, `Handel met Rusland in ${Y}: hoeveel meer of minder Rusland aan de handel van elk land overhield dan zonder oorlog, alle landen.`],
      h1: `Handel met Rusland in ${Y}: wiens handel verhoogde of verlaagde Ruslands inkomsten?`,
      intro: `Hoeveel meer of minder Rusland (belasting en winst, geen omzet) in ${Y} aan de handel met elk land overhield dan zonder oorlog. De grootste stijging voor Rusland: ${tops}.` },
    uk: { label: `Торгівля з Росією у ${y} році`, title: partial ? [`Торгівля з Росією у ${y} році: за країнами (до ${month})`, `Торгівля з Росією у ${y} році за країнами`] : [`Торгівля з Росією у ${y} році: хто збільшив її доходи`, `Торгівля з Росією у ${y} році за країнами`],
      description: [`Торгівля з Росією у ${Y}: на скільки більше чи менше Росія отримала від торгівлі з кожною країною, ніж без війни. Попереду ${t1}: на ${topV} більше.`, `Торгівля з Росією у ${Y}: на скільки більше чи менше Росія отримала від торгівлі з кожною країною, ніж без війни.`],
      h1: `Торгівля з Росією у ${Y}: чия торгівля збільшила чи зменшила її доходи?`,
      intro: `На скільки більше чи менше Росія отримала (податки й прибуток, не продажі) від торгівлі з кожною країною у ${Y}, ніж у світі без війни. Найбільше більше — від торгівлі з: ${tops}.` },
  }[l];
  return { label: T.label, title: fitTitle(T.title), description: fitDesc(t1 ? T.description : T.description.slice(1)), h1: T.h1, intro: T.intro };
}

// a comparison of two countries. A, B: names as in a title; a, b: as inside a sentence
export function compareCopy(l, { A, B }) {
  const T = {
    en: { title: [`${A} vs ${B}: aid to Ukraine and trade with Russia`, `${A} vs ${B}: Ukraine aid and Russia trade`, `${A} vs ${B}: Ukraine or Russia?`, `${A} vs ${B}`],
      description: `${A} vs ${B} since 2022: support for Ukraine, what Russia kept from trade with each, and the net, side by side, with ranges, chances and sources.`,
      h1: `${A} vs ${B}: support for Ukraine and trade with Russia since 2022` },
    de: { title: [`${A} vs. ${B}: Ukraine-Hilfe und Handel mit Russland`, `${A} vs. ${B}: Ukraine-Hilfe und Russlandhandel`, `${A} vs. ${B}: Ukraine oder Russland?`, `${A} vs. ${B}`],
      description: `${A} und ${B} seit 2022 im Vergleich: Unterstützung für die Ukraine, Russlands Gewinn aus dem Handel und der Saldo, mit Spannen und Quellen.`,
      h1: `${A} vs. ${B}: Ukraine-Hilfe und Handel mit Russland seit 2022` },
    fr: { title: [`${A} vs ${B} : aide à l'Ukraine et commerce avec la Russie`, `${A} vs ${B} : aide à l'Ukraine, commerce russe`, `${A} vs ${B} : Ukraine ou Russie ?`, `${A} vs ${B}`],
      description: `${A} et ${B} depuis 2022 : soutien à l'Ukraine, gain russe sur leur commerce et solde, côte à côte, avec fourchettes, probabilités et sources.`,
      h1: `${A} vs ${B} : soutien à l'Ukraine et commerce avec la Russie depuis 2022` },
    es: { title: [`${A} vs. ${B}: ayuda a Ucrania y comercio con Rusia`, `${A} vs. ${B}: ayuda a Ucrania y Rusia`, `${A} vs. ${B}: ¿Ucrania o Rusia?`, `${A} vs. ${B}`],
      description: `${A} y ${B} desde 2022: apoyo a Ucrania, lo que Rusia ganó con su comercio y el neto, lado a lado, con rangos, probabilidades y fuentes.`,
      h1: `${A} vs. ${B}: apoyo a Ucrania y comercio con Rusia desde 2022` },
    pl: { title: [`${A} vs ${B}: pomoc dla Ukrainy i handel z Rosją`, `${A} vs ${B}: Ukraina czy Rosja?`, `${A} vs ${B}`],
      description: `${A} i ${B} od 2022 r.: wsparcie dla Ukrainy, zysk Rosji z handlu z nimi i saldo, obok siebie, z przedziałami, szansami i źródłami.`,
      h1: `${A} vs ${B}: wsparcie dla Ukrainy i handel z Rosją od 2022 roku` },
    nl: { title: [`${A} vs ${B}: steun aan Oekraïne en handel met Rusland`, `${A} vs ${B}: Oekraïne of Rusland?`, `${A} vs ${B}`],
      description: `${A} en ${B} sinds 2022: steun aan Oekraïne, wat Rusland aan de handel overhield en het saldo, naast elkaar, met bandbreedtes en bronnen.`,
      h1: `${A} vs ${B}: steun aan Oekraïne en handel met Rusland sinds 2022` },
    uk: { title: [`${A} чи ${B}: допомога Україні й торгівля з Росією`, `${A} чи ${B}: Україна чи Росія?`, `${A} чи ${B}`],
      description: `${A} і ${B} з 2022 року: підтримка України, прибуток Росії від торгівлі з ними і нетто, поруч, з діапазонами, шансами та джерелами.`,
      h1: `${A} чи ${B}: підтримка України й торгівля з Росією з 2022 року` },
  }[l];
  return { label: `${A} vs ${B}`.replace(/ vs /, l === "uk" ? " чи " : l === "de" || l === "es" ? " vs. " : " vs "), title: fitTitle(T.title), description: fitDesc([T.description]), h1: T.h1 };
}
// "In euros, A gave Ukraine more (x vs y); as a share of GDP, B did."
export function compareLine(l, { moreEur, lessEur, eurA, eurB, moreGdp, same }) {
  const T = {
    en: same ? `${moreEur} gave Ukraine more, both in euros (${eurA} against ${eurB}) and as a share of GDP.` : `In euros ${moreEur} gave Ukraine more (${eurA} against ${eurB}); as a share of GDP, ${moreGdp} did.`,
    de: same ? `Mehr für die Ukraine, in Euro (${eurA} gegenüber ${eurB}) wie als Anteil am BIP: ${moreEur}.` : `In Euro mehr für die Ukraine: ${moreEur} (${eurA} gegenüber ${eurB}); als Anteil am BIP: ${moreGdp}.`,
    fr: same ? `Plus de soutien à l'Ukraine, en euros (${eurA} contre ${eurB}) comme en part du PIB : ${moreEur}.` : `En euros, plus de soutien à l'Ukraine : ${moreEur} (${eurA} contre ${eurB}) ; en part du PIB : ${moreGdp}.`,
    es: same ? `Más apoyo a Ucrania, en euros (${eurA} frente a ${eurB}) y como parte del PIB: ${moreEur}.` : `En euros, más apoyo a Ucrania: ${moreEur} (${eurA} frente a ${eurB}); como parte del PIB: ${moreGdp}.`,
    pl: same ? `Więcej dla Ukrainy: ${moreEur}, zarówno w euro (${eurA} wobec ${eurB}), jak i jako udział w PKB.` : `W euro więcej dla Ukrainy: ${moreEur} (${eurA} wobec ${eurB}); jako udział w PKB: ${moreGdp}.`,
    nl: same ? `Meer steun aan Oekraïne, in euro (${eurA} tegenover ${eurB}) en als aandeel van het bbp: ${moreEur}.` : `In euro meer steun aan Oekraïne: ${moreEur} (${eurA} tegenover ${eurB}); als aandeel van het bbp: ${moreGdp}.`,
    uk: same ? `Більше підтримала Україну країна ${moreEur}: і в євро (${eurA} проти ${eurB}), і як частка ВВП.` : `У євро більше підтримала Україну країна ${moreEur} (${eurA} проти ${eurB}); як частка ВВП — ${moreGdp}.`,
  }[l];
  return T;
}

export function hubCopy(l, n) {
  const T = {
    en: { title: "Topics: every ranking, part, year and comparison", description: `All ${n} pages of War Balance by topic: rankings, groups, each part of the numbers, each year since 2022 and countries compared side by side.`, h1: "Every topic, part, year and comparison" },
    de: { title: "Themen: alle Ranglisten, Teile, Jahre und Vergleiche", description: `Alle ${n} Seiten von War Balance nach Thema: Ranglisten, Gruppen, jeder Teil der Zahlen, jedes Jahr seit 2022 und Länder im Vergleich.`, h1: "Alle Themen, Teile, Jahre und Vergleiche" },
    fr: { title: "Thèmes : classements, composantes, années, comparaisons", description: `Les ${n} pages de War Balance par thème : classements, groupes, chaque composante des chiffres, chaque année depuis 2022 et pays comparés.`, h1: "Tous les thèmes, composantes, années et comparaisons" },
    es: { title: "Temas: clasificaciones, partes, años y comparaciones", description: `Las ${n} páginas de War Balance por tema: clasificaciones, grupos, cada parte de las cifras, cada año desde 2022 y países comparados.`, h1: "Todos los temas, partes, años y comparaciones" },
    pl: { title: "Tematy: rankingi, składniki, lata i porównania", description: `Wszystkie ${n} stron War Balance według tematu: rankingi, grupy, każdy składnik liczb, każdy rok od 2022 i porównania krajów.`, h1: "Wszystkie tematy, składniki, lata i porównania" },
    nl: { title: "Onderwerpen: ranglijsten, onderdelen, jaren, vergelijkingen", description: `Alle ${n} pagina's van War Balance per onderwerp: ranglijsten, groepen, elk onderdeel van de cijfers, elk jaar sinds 2022 en landen vergeleken.`, h1: "Alle onderwerpen, onderdelen, jaren en vergelijkingen" },
    uk: { title: "Теми: рейтинги, складники, роки та порівняння", description: `Усі ${n} сторінок War Balance за темами: рейтинги, групи, кожен складник чисел, кожен рік з 2022 і порівняння країн.`, h1: "Усі теми, складники, роки й порівняння" },
  }[l];
  return { title: fitTitle([T.title]), description: fitDesc([T.description]), h1: T.h1 };
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
export function topicCopyLang(l, e, { n, top, topV, measure, unitKey, dataTo, sumUa, sumNetPct, netDir, isGroup }) {
  const [label, title, h1] = (TOPIC_T[e.slug] || {})[l] || [e.label, e.label, e.label];
  const t1 = top[0] || "", tops = list3(l, top.slice(0, 3)), unit = s(l, "unit")[unitKey];
  const D = {
    en: [`${label}: ${n} countries ranked by ${measure.toLowerCase()} since February 2022, to ${dataTo}. ${t1} first: ${topV}. Ranges and sources.`, `${label}: ${n} countries ranked since February 2022, to ${dataTo}, with ranges and sources.`],
    de: [`${label}: ${n} Länder nach „${measure}“ seit Februar 2022, bis ${dataTo}. Vorn ${t1}: ${topV}. Mit Spannen und Quellen.`, `${label}: ${n} Länder gereiht, Februar 2022 bis ${dataTo}, mit Spannen und Quellen.`],
    fr: [`${label} : ${n} pays classés selon « ${measure} », de février 2022 à ${dataTo}. En tête, ${t1} : ${topV}. Fourchettes et sources.`, `${label} : ${n} pays classés de février 2022 à ${dataTo}, avec fourchettes et sources.`],
    es: [`${label}: ${n} países según «${measure}», de febrero de 2022 a ${dataTo}. Primero, ${t1}: ${topV}. Con rangos y fuentes.`, `${label}: ${n} países, de febrero de 2022 a ${dataTo}, con rangos y fuentes.`],
    pl: [`${label}: ranking ${n} krajów według „${measure}”, od lutego 2022 do ${dataTo}. Na czele ${t1}: ${topV}. Z przedziałami i źródłami.`, `${label}: ranking ${n} krajów od lutego 2022 do ${dataTo}, z przedziałami i źródłami.`],
    nl: [`${label}: ${n} landen op ‘${measure}’, februari 2022 tot ${dataTo}. Bovenaan ${t1}: ${topV}. Met bandbreedtes en bronnen.`, `${label}: ${n} landen gerangschikt, februari 2022 tot ${dataTo}, met bandbreedtes en bronnen.`],
    uk: [`${label}: рейтинг ${n} країн за показником «${measure}», з лютого 2022 до ${dataTo}. Попереду ${t1}: ${topV}. З діапазонами й джерелами.`, `${label}: рейтинг ${n} країн з лютого 2022 до ${dataTo}, з діапазонами й джерелами.`],
  }[l];
  const I = isGroup ? {
    en: `${label}: ${n} members, from February 2022 to ${dataTo}. Together they supported Ukraine with ${sumUa}; with trade with Russia and frozen Russian money counted, the net is ${sumNetPct} of their combined GDP ${netDir}.`,
    de: `${label}: ${n} Mitglieder, Februar 2022 bis ${dataTo}. Zusammen unterstützten sie die Ukraine mit ${sumUa}; mit dem Russlandhandel und eingefrorenem russischem Geld beträgt der Saldo ${sumNetPct} ihres gemeinsamen BIP ${netDir}.`,
    fr: `${label} : ${n} membres, de février 2022 à ${dataTo}. Ensemble, ils ont soutenu l'Ukraine à hauteur de ${sumUa} ; avec le commerce avec la Russie et l'argent russe gelé, le solde est de ${sumNetPct} de leur PIB cumulé ${netDir}.`,
    es: `${label}: ${n} miembros, de febrero de 2022 a ${dataTo}. Juntos apoyaron a Ucrania con ${sumUa}; con el comercio con Rusia y el dinero ruso congelado, el neto es ${sumNetPct} de su PIB conjunto ${netDir}.`,
    pl: `${label}: ${n} członków, od lutego 2022 do ${dataTo}. Razem wsparli Ukrainę kwotą ${sumUa}; z handlem z Rosją i zamrożonymi rosyjskimi środkami saldo wynosi ${sumNetPct} ich łącznego PKB ${netDir}.`,
    nl: `${label}: ${n} leden, februari 2022 tot ${dataTo}. Samen steunden ze Oekraïne met ${sumUa}; met de handel met Rusland en bevroren Russisch geld is het saldo ${sumNetPct} van hun gezamenlijke bbp ${netDir}.`,
    uk: `${label}: ${n} членів, з лютого 2022 до ${dataTo}. Разом вони підтримали Україну на ${sumUa}; з торгівлею з Росією й замороженими російськими коштами нетто становить ${sumNetPct} їхнього спільного ВВП ${netDir}.`,
  }[l] : {
    en: `${n} countries ranked by ${measure.toLowerCase()} ${unit}, from February 2022 to ${dataTo}. ${tops} lead.`,
    de: `${n} Länder, gereiht nach „${measure}“ ${unit}, Februar 2022 bis ${dataTo}. Vorn: ${tops}.`,
    fr: `${n} pays classés selon « ${measure} » ${unit}, de février 2022 à ${dataTo}. En tête : ${tops}.`,
    es: `${n} países ordenados por «${measure}» ${unit}, de febrero de 2022 a ${dataTo}. Encabezan ${tops}.`,
    pl: `${n} krajów według „${measure}” ${unit}, od lutego 2022 do ${dataTo}. Na czele: ${tops}.`,
    nl: `${n} landen gerangschikt op ‘${measure}’ ${unit}, februari 2022 tot ${dataTo}. Bovenaan: ${tops}.`,
    uk: `${n} країн за показником «${measure}» ${unit}, з лютого 2022 до ${dataTo}. Попереду: ${tops}.`,
  }[l];
  return { label, title: fitTitle([title, label]), description: fitDesc(t1 ? D : D.slice(1)), h1, intro: I };
}

// ----- country pages in the other languages, for every chance level -----
// N: the country's name as the map gives it in that language. The phrasing keeps the name before a colon, so no
// grammatical case or gender is needed; the ten most searched countries keep their hand-written forms where they fit
// (seo_templates.mjs countryCopy). w: the map's own words for the chance level (site/i18n), so a title says "too close
// to call" exactly where the map does.
export function countryCopyLang(l, cat, { N, ua, uaP, net, rus, ch, lean, zeroWord, levelWord = "", noDataText = "" }) {
  const side = lean;   // "Tendenz Richtung Ukraine": the map's "Leaning toward ..." in this language
  const T = {
    de: { u_sure: [`${N}: Wie viel Hilfe für die Ukraine? ${ua}`, `${N}: ${ua} für die Ukraine seit 2022`, `${N}: Hilfe für die Ukraine`],
      r_sure: [`${N}: Hilft das Land Russland? ${rus} mehr für Russland`, `${N}: Hilft das Land Russland? ${net} des BIP`, `${N}: Richtung Russland`],
      lean: [`${N}: Ukraine oder Russland? ${side}`, `${N}: ${side}`], unc: [`${N}: Ukraine oder Russland? Zu knapp für eine Aussage`, `${N}: zu knapp für eine Aussage`],
      zero: [`${N}: Ukraine oder Russland? Saldo ${zeroWord}`, `${N}: Saldo ${zeroWord}`], party: [`${N}: Kriegspartei auf Russlands Seite`, `${N}: Kriegspartei`],
      nodata: [`${N}: Ukraine oder Russland? Noch keine Daten`, `${N}: noch keine Daten`],
      h1: { u_sure: `${N}: Wie viel hat das Land der Ukraine seit 2022 gegeben?`, r_sure: `${N}: Hilft das Land Russland? Was die Geldströme zeigen`, lean: `${N}: Ukraine oder Russland? ${side}`, unc: `${N}: Ukraine oder Russland? Zu knapp für eine Aussage`, zero: `${N}: Ukraine oder Russland? Der Saldo ist ${zeroWord}`, party: `${N}: Kriegspartei auf Russlands Seite`, nodata: `${N}: noch keine Daten zum Geld Richtung Ukraine oder Russland` },
      q2: { u: `${N}: Hilft das Land Russland?`, r: `${N}: Wie viel Hilfe für die Ukraine?` },
      desc: { u_sure: `${N}: Unterstützung für die Ukraine seit 2022 ${ua} (${uaP} eines Jahres-BIP). Mit dem Russlandhandel: ${net} des BIP Richtung Ukraine, sehr wahrscheinlich.`, r_sure: `${N}: sehr wahrscheinlich Richtung Russland (${ch}). Russland behielt seit 2022 ${rus} mehr an Steuern und Gewinn aus dem Handel als ohne Krieg.`, other: `${N} seit 2022: ${cap(levelWord)}. Unterstützung für die Ukraine ${uaP} des BIP; Saldo ${net} eines Jahres-BIP.` } },
    fr: { u_sure: [`${N} : combien d'aide à l'Ukraine ? ${ua}`, `${N} : ${ua} pour l'Ukraine depuis 2022`, `${N} : aide à l'Ukraine`],
      r_sure: [`${N} : le pays aide-t-il la Russie ? ${rus} de plus`, `${N} : le pays aide-t-il la Russie ?`, `${N} : vers la Russie`],
      lean: [`${N} : Ukraine ou Russie ? ${side}`, `${N} : ${side}`], unc: [`${N} : Ukraine ou Russie ? Trop serré pour trancher`, `${N} : trop serré pour trancher`],
      zero: [`${N} : Ukraine ou Russie ? Solde ${zeroWord}`, `${N} : solde ${zeroWord}`], party: [`${N} : partie à la guerre aux côtés de la Russie`, `${N} : partie à la guerre`],
      nodata: [`${N} : Ukraine ou Russie ? Pas encore de données`, `${N} : pas encore de données`],
      h1: { u_sure: `${N} : combien le pays a-t-il donné à l'Ukraine depuis 2022 ?`, r_sure: `${N} : le pays aide-t-il la Russie ? Ce que montrent les flux d'argent`, lean: `${N} : Ukraine ou Russie ? ${side}`, unc: `${N} : Ukraine ou Russie ? Trop serré pour trancher`, zero: `${N} : Ukraine ou Russie ? Le solde est ${zeroWord}`, party: `${N} : partie à la guerre aux côtés de la Russie`, nodata: `${N} : pas encore de données sur son argent vers l'Ukraine ou la Russie` },
      q2: { u: `${N} : le pays aide-t-il la Russie ?`, r: `${N} : combien d'aide à l'Ukraine ?` },
      desc: { u_sure: `${N} : soutien à l'Ukraine depuis 2022 de ${ua} (${uaP} d'une année de PIB). Avec le commerce avec la Russie : ${net} du PIB vers l'Ukraine, très probable.`, r_sure: `${N} : très probablement vers la Russie (${ch}). Depuis 2022, la Russie a gardé ${rus} de plus (impôts et profits) sur ce commerce que sans la guerre.`, other: `${N} depuis 2022 : ${levelWord}. Soutien à l'Ukraine de ${uaP} du PIB ; solde de ${net} d'une année de PIB.` } },
    es: { u_sure: [`${N}: ¿cuánto ha dado a Ucrania? ${ua}`, `${N}: ${ua} para Ucrania desde 2022`, `${N}: ayuda a Ucrania`],
      r_sure: [`${N}: ¿ayuda a Rusia? ${rus} más para Rusia`, `${N}: ¿ayuda a Rusia? ${net} del PIB`, `${N}: hacia Rusia`],
      lean: [`${N}: ¿Ucrania o Rusia? ${side}`, `${N}: ${side}`], unc: [`${N}: ¿Ucrania o Rusia? Demasiado ajustado para decir`, `${N}: demasiado ajustado para decir`],
      zero: [`${N}: ¿Ucrania o Rusia? Neto ${zeroWord}`, `${N}: neto ${zeroWord}`], party: [`${N}: parte en la guerra del lado de Rusia`, `${N}: parte en la guerra`],
      nodata: [`${N}: ¿Ucrania o Rusia? Aún sin datos`, `${N}: aún sin datos`],
      h1: { u_sure: `${N}: ¿cuánto ha dado a Ucrania desde 2022?`, r_sure: `${N}: ¿ayuda a Rusia? Lo que muestran los flujos de dinero`, lean: `${N}: ¿Ucrania o Rusia? ${side}`, unc: `${N}: ¿Ucrania o Rusia? Demasiado ajustado para decir`, zero: `${N}: ¿Ucrania o Rusia? El neto es ${zeroWord}`, party: `${N}: parte en la guerra del lado de Rusia`, nodata: `${N}: aún sin datos sobre su dinero hacia Ucrania o Rusia` },
      q2: { u: `${N}: ¿ayuda a Rusia?`, r: `${N}: ¿cuánto ha dado a Ucrania?` },
      desc: { u_sure: `${N}: apoyo a Ucrania desde 2022 de ${ua} (${uaP} de un año de PIB). Con su comercio con Rusia: ${net} del PIB hacia Ucrania, muy probable.`, r_sure: `${N}: muy probablemente hacia Rusia (${ch}). Desde 2022 Rusia se quedó con ${rus} más (impuestos y beneficios) de ese comercio que sin la guerra.`, other: `${N} desde 2022: ${levelWord}. Apoyo a Ucrania de ${uaP} del PIB; neto de ${net} de un año de PIB.` } },
    pl: { u_sure: [`${N}: ile pomocy dla Ukrainy? ${ua}`, `${N}: ${ua} dla Ukrainy od 2022`, `${N}: pomoc dla Ukrainy`],
      r_sure: [`${N}: czy ten kraj pomaga Rosji? ${rus} więcej dla Rosji`, `${N}: czy ten kraj pomaga Rosji?`, `${N}: w stronę Rosji`],
      lean: [`${N}: Ukraina czy Rosja? ${side}`, `${N}: ${side}`], unc: [`${N}: Ukraina czy Rosja? Zbyt blisko, by rozstrzygnąć`, `${N}: zbyt blisko, by rozstrzygnąć`],
      zero: [`${N}: Ukraina czy Rosja? Saldo ${zeroWord}`, `${N}: saldo ${zeroWord}`], party: [`${N}: strona wojny po stronie Rosji`, `${N}: strona wojny`],
      nodata: [`${N}: Ukraina czy Rosja? Brak danych`, `${N}: brak danych`],
      h1: { u_sure: `${N}: ile ten kraj dał Ukrainie od 2022 roku?`, r_sure: `${N}: czy ten kraj pomaga Rosji? Co pokazują przepływy pieniędzy`, lean: `${N}: Ukraina czy Rosja? ${side}`, unc: `${N}: Ukraina czy Rosja? Zbyt blisko, by rozstrzygnąć`, zero: `${N}: Ukraina czy Rosja? Saldo ${zeroWord}`, party: `${N}: strona wojny po stronie Rosji`, nodata: `${N}: brak danych o pieniądzach w stronę Ukrainy lub Rosji` },
      q2: { u: `${N}: czy ten kraj pomaga Rosji?`, r: `${N}: ile pomocy dla Ukrainy?` },
      desc: { u_sure: `${N}: wsparcie dla Ukrainy od 2022 r. ${ua} (${uaP} rocznego PKB). Z handlem z Rosją: ${net} PKB na rzecz Ukrainy, bardzo prawdopodobnie.`, r_sure: `${N}: bardzo prawdopodobnie na rzecz Rosji (${ch}). Od 2022 r. Rosja zatrzymała z tego handlu ${rus} więcej (podatki i zysk) niż bez wojny.`, other: `${N} od 2022 r.: ${levelWord}. Wsparcie dla Ukrainy ${uaP} PKB; saldo ${net} rocznego PKB.` } },
    nl: { u_sure: [`${N}: hoeveel steun aan Oekraïne? ${ua}`, `${N}: ${ua} voor Oekraïne sinds 2022`, `${N}: steun aan Oekraïne`],
      r_sure: [`${N}: helpt dit land Rusland? ${rus} meer voor Rusland`, `${N}: helpt dit land Rusland?`, `${N}: richting Rusland`],
      lean: [`${N}: Oekraïne of Rusland? ${side}`, `${N}: ${side}`], unc: [`${N}: Oekraïne of Rusland? Te krap om te zeggen`, `${N}: te krap om te zeggen`],
      zero: [`${N}: Oekraïne of Rusland? Saldo ${zeroWord}`, `${N}: saldo ${zeroWord}`], party: [`${N}: partij in de oorlog aan de kant van Rusland`, `${N}: partij in de oorlog`],
      nodata: [`${N}: Oekraïne of Rusland? Nog geen gegevens`, `${N}: nog geen gegevens`],
      h1: { u_sure: `${N}: hoeveel gaf dit land sinds 2022 aan Oekraïne?`, r_sure: `${N}: helpt dit land Rusland? Wat de geldstromen laten zien`, lean: `${N}: Oekraïne of Rusland? ${side}`, unc: `${N}: Oekraïne of Rusland? Te krap om te zeggen`, zero: `${N}: Oekraïne of Rusland? Het saldo is ${zeroWord}`, party: `${N}: partij in de oorlog aan de kant van Rusland`, nodata: `${N}: nog geen gegevens over het geld richting Oekraïne of Rusland` },
      q2: { u: `${N}: helpt dit land Rusland?`, r: `${N}: hoeveel steun aan Oekraïne?` },
      desc: { u_sure: `${N}: steun aan Oekraïne sinds 2022 ${ua} (${uaP} van een jaar bbp). Met de handel met Rusland: ${net} van het bbp richting Oekraïne, zeer waarschijnlijk.`, r_sure: `${N}: zeer waarschijnlijk richting Rusland (${ch}). Rusland hield sinds 2022 ${rus} meer (belasting en winst) aan deze handel over dan zonder oorlog.`, other: `${N} sinds 2022: ${levelWord}. Steun aan Oekraïne ${uaP} van het bbp; saldo ${net} van een jaar bbp.` } },
    uk: { u_sure: [`${N}: скільки допомоги Україні? ${ua}`, `${N}: ${ua} для України з 2022 року`, `${N}: допомога Україні`],
      r_sure: [`${N}: чи допомагає ця країна Росії? ${rus} більше для Росії`, `${N}: чи допомагає ця країна Росії?`, `${N}: на бік Росії`],
      lean: [`${N}: Україна чи Росія? ${side}`, `${N}: ${side}`], unc: [`${N}: Україна чи Росія? Надто близько, щоб визначити`, `${N}: надто близько, щоб визначити`],
      zero: [`${N}: Україна чи Росія? Нетто ${zeroWord}`, `${N}: нетто ${zeroWord}`], party: [`${N}: сторона війни на боці Росії`, `${N}: сторона війни`],
      nodata: [`${N}: Україна чи Росія? Даних поки немає`, `${N}: даних поки немає`],
      h1: { u_sure: `${N}: скільки ця країна дала Україні з 2022 року?`, r_sure: `${N}: чи допомагає ця країна Росії? Що показують грошові потоки`, lean: `${N}: Україна чи Росія? ${side}`, unc: `${N}: Україна чи Росія? Надто близько, щоб визначити`, zero: `${N}: Україна чи Росія? Нетто ${zeroWord}`, party: `${N}: сторона війни на боці Росії`, nodata: `${N}: даних про гроші на користь України чи Росії поки немає` },
      q2: { u: `${N}: чи допомагає ця країна Росії?`, r: `${N}: скільки допомоги Україні?` },
      desc: { u_sure: `${N}: підтримка України з 2022 року ${ua} (${uaP} річного ВВП). З торгівлею з Росією: ${net} ВВП на користь України, дуже ймовірно.`, r_sure: `${N}: дуже ймовірно на бік Росії (${ch}). З 2022 року Росія отримала від цієї торгівлі на ${rus} більше податків і прибутку, ніж без війни.`, other: `${N} з 2022 року: ${levelWord}. Підтримка України ${uaP} ВВП; нетто ${net} річного ВВП.` } },
  }[l];
  const key = cat === "u_lean" || cat === "r_lean" ? "lean" : cat;
  // a long name: cut it, never the chance words
  const forms = T[key].map(x => x);
  let title = fit(forms, TITLE_MAX);
  if (title.length > TITLE_MAX) { const rest = forms[forms.length - 1].slice(N.length); title = N.slice(0, Math.max(8, TITLE_MAX - rest.length - 1)).trimEnd() + "…" + rest; }
  const desc = cut(cat === "nodata" ? `${N}: ${noDataText}` : cat === "u_sure" ? T.desc.u_sure : cat === "r_sure" ? T.desc.r_sure : T.desc.other, DESC_MAX);
  return { title, description: desc, h1: T.h1[key], q2: cat.startsWith("r") || cat === "party" ? T.q2.r : T.q2.u };
}

// the strings above that a native speaker should read before they are relied on (all new in round 56)
export const REVIEW = ["S (page frames: de, fr, es, pl, nl, uk)", "MEASURE", "PART (37 part names)", "SIDE", "partCopy", "partIntro", "yearCopy", "compareCopy", "compareLine", "hubCopy", "TOPIC_T (20 topics × 6 languages)", "topicCopyLang", "countryCopyLang (7 chance levels)"];
