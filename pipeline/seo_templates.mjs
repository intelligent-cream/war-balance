// Round 54 (findable pages): the words of the static pages' titles, descriptions, headings, intros and short FAQs, filled
// with the live figures from the map (seo_extract.mjs). The wording is the approved SEO copy (seo_plan, 26 October 2026):
// variant A, question style, for every page; English for every country, the six other site languages for the home page
// and the ten countries most searched for. Titles are at most 60 characters and descriptions at most 155: each template
// lists shorter forms, the first that fits is used, and the last is always short (checked by check_data.py).
//
// Pure functions (no browser): pipeline/test_seo.mjs tests them.
//
// Round 56 (more findable pages): every country has a page in every language, for every chance level (the frames are
// in seo_i18n.mjs, the sentences about the country are the map's own in that language), and an English title asks
// "Does ... trade with Russia?" where people search for that far more than for its aid (pipeline/seo_demand.json).

import { P as PL, E as EL, countryCopyLang } from "./seo_i18n.mjs";

export const TITLE_MAX = 60, DESC_MAX = 155;
export const LANGS = ["en", "uk", "de", "fr", "pl", "nl", "es"];
export const OG_LOCALE = { en: "en_GB", uk: "uk_UA", de: "de_DE", fr: "fr_FR", pl: "pl_PL", nl: "nl_NL", es: "es_ES" };
export const LANG_NAMES = { en: "English", uk: "Українська", de: "Deutsch", fr: "Français", pl: "Polski", nl: "Nederlands", es: "Español" };
// the countries with a page in every language (the most searched for, terms.json)
export const TOP = ["USA", "DEU", "GBR", "FRA", "POL", "NLD", "ITA", "IND", "CHN", "HUN"];

// ----- numbers as the copy writes them -----
export const P = x => { const a = Math.abs(x); return (a >= 1 ? a.toFixed(1) : a >= 0.01 ? a.toFixed(2) : "<0.01") + "%"; };
export const E = bn => { const a = Math.abs(bn); return "€" + (a >= 100 ? Math.round(a).toLocaleString("en-GB") : a >= 1 ? a.toFixed(1) : a >= 0.1 ? a.toFixed(2) : Math.round(a * 1000) + "m").replace(/\.0$/, "") + (a >= 0.1 ? "bn" : ""); };
export const CH = p => (p >= 0.995 ? ">99%" : Math.floor(p * 100) + "%");
const rangeNet = (lo, hi) => (lo > 0 && hi > 0 ? `${P(lo)} to ${P(hi)} toward Ukraine` : lo < 0 && hi < 0 ? `${P(hi)} to ${P(lo)} toward Russia` : `${P(lo)} toward Russia to ${P(hi)} toward Ukraine`);
const cap = s => s[0].toUpperCase() + s.slice(1);
export const fit = (cands, max) => cands.find(s => s.length <= max) || cands[cands.length - 1];
const EU = new Set("AUT BEL BGR HRV CYP CZE DNK EST FIN FRA DEU GRC HUN IRL ITA LVA LTU LUX MLT NLD POL PRT ROU SVK SVN ESP SWE".split(" "));

// a country's name in a title and inside a sentence ("the US", "the Netherlands")
const NAME = { USA: ["US", "the US"], GBR: ["UK", "the UK"], NLD: ["Netherlands", "the Netherlands"], CZE: ["Czechia", "Czechia"], ARE: ["UAE", "the UAE"], TUR: ["Türkiye", "Türkiye"],
  PRK: ["North Korea", "North Korea"], VAT: ["Vatican City", "Vatican City"] };
const THE = /^(United |Central African Republic|Dominican Republic|Gambia|Bahamas|Philippines|Maldives|Comoros|Seychelles)|Islands$/;
export function names(iso, name) {
  if (NAME[iso]) return NAME[iso];
  return [name, THE.test(name) ? "the " + name : name];
}

// the copy's category: very likely toward Ukraine or Russia, leaning, too close to call, near or essentially zero, a party
export function category(f) {
  if (f.noData || !f.cN) return "nodata";
  if (f.party) return "party";
  const l = f.cN && f.cN.level;
  if (l === "sure") return f.cN.side === "ukraine" ? "u_sure" : "r_sure";
  if (l === "lean") return f.cN.side === "ukraine" ? "u_lean" : "r_lean";
  if (l === "unc") return "unc";
  return "zero";
}

// f: the figures of one country (seo_extract.mjs: fig plus iso, name, armedFull); € in billions, % of one year's GDP
export function countryCopyEn(f) {
  const iso = f.iso, [N, Nt] = names(iso, f.name), cat = category(f);
  if (cat === "nodata") {
    const A = { title: fit([`Is ${Nt} helping Ukraine or Russia? No data yet`, `${N}: Ukraine or Russia? No data yet`, `${N}: no data yet`], TITLE_MAX),
      description: fit([`There is no observation of ${Nt}'s own for the war years: no customs or partner records of its trade with Russia or Ukraine, no aid, no refugees counted.`,
        "There is no observation of its own for the war years: no records of its trade with Russia or Ukraine, no aid, no refugees counted."], DESC_MAX),
      h1: `${N}: no data yet on its money toward Ukraine or Russia`,
      intro: f.mostly ? `${cap(Nt)}'s trade with Russia has no record of its own for the war years: no customs or partner records of what it bought from or sold to Russia. Only small rough estimates are counted, too little to give it a direction, so it is not ranked and it is drawn hatched on the map.`
        : `There is no observation of ${Nt}'s own for the war years: no customs or partner records of its trade with Russia or Ukraine, no aid, no refugees counted. Nothing is counted, it is not ranked, and it is drawn hatched on the map.` };
    if (f.mostly) A.description = fit([`${cap(Nt)}'s trade with Russia has no record of its own for the war years; only small rough estimates are counted, so it is not ranked.`, "No record of its own trade with Russia for the war years; only small rough estimates are counted, so it is not ranked."], DESC_MAX);
    return { ...A, og_title: A.title, og_description: A.description, category: cat };
  }
  const netP = P(f.netPct), uaP = P(f.uaPct), rusP = P(f.rusPct), ch = CH(f.cN.p), rng = rangeNet(f.netLoPct, f.netHiPct);
  const uaE = E(f.ua), rusE = E(f.rus), netE = E(f.net);
  const cR = f.cR || { level: "sure" };
  const adv = cR.level === "sure" ? "" : cR.level === "lean" ? "probably " : cR.level === "unc" ? "may have " : "";
  const kept = `Russia ${adv}kept ${cR.level === "zero" ? "a negligible " + rusE : rusE} ${f.rus >= 0 ? "less" : "more"} from trade with ${Nt}`;
  const keptLvl = cR.level === "unc" ? " (too close to call)" : "";
  const parts = EU.has(iso) ? "aid, its EU share and refugee hosting" : "aid and refugee hosting";
  const an = s => (/^(8|11|18)/.test(s) ? "an " : "a ") + s;
  const support = f.uaPct < 0.01 ? "almost no measured support for Ukraine" : `support for Ukraine of ${uaE} (${uaP} of GDP)`;
  const fz = Math.abs(f.frozen) >= 0.05 ? ` and the return Russia lost on reserves frozen there (${E(f.frozen)})` : "";
  let A;
  // round 56: where searches ask far more whether it trades with Russia than what it gave (seo_demand.json), and both
  // numbers are very likely, the title asks that and answers it with what Russia kept
  const dm = f.demand || {}, tradeFirst = cat === "u_sure" && !TOP.includes(iso) && cR.level === "sure" && (dm.trade || 0) >= 400 && dm.trade >= 1.5 * Math.max(dm.aid || 0, dm.help || 0);
  if (tradeFirst) {
    const lm = f.rus >= 0 ? "less" : "more";
    A = { title: fit([`Does ${Nt} trade with Russia? Russia kept ${rusE} ${lm}`, `${N} and Russia: trade kept Russia ${rusE} ${lm}`, `${N}: ${netP} of GDP toward Ukraine`], TITLE_MAX),
      description: fit([`Since 2022 Russia kept ${rusE} ${lm} in taxes and profit from trade with ${Nt} than without the war. With ${uaE} for Ukraine: ${netP} of GDP toward Ukraine, very likely.`,
        `Since 2022 Russia kept ${rusE} ${lm} from trade with ${Nt} than without the war. With its support for Ukraine: ${netP} of GDP toward Ukraine, very likely.`], DESC_MAX),
      h1: `Does ${Nt} trade with Russia, and how much has it given Ukraine?`,
      intro: `${cap(Nt)} supported Ukraine with ${uaE} since 2022 (${uaP} of one year's GDP: ${parts}), and ${kept} than without the war. ${fz ? "Adding" + fz.replace(/^ and/, "") + ", the" : "The"} total is ${netP} of a year's GDP toward Ukraine (likely ${rng}; ${ch} chance of this direction).` };
  } else if (cat === "u_sure") {
    A = { title: fit([`How much has ${Nt} given Ukraine? ${uaE} since 2022`, `How much has ${Nt} given Ukraine? ${uaE}`, `${N}: ${uaE} for Ukraine since 2022`, `${N}: ${netP} of GDP toward Ukraine`], TITLE_MAX),
      description: fit([`${cap(Nt)} supported Ukraine with ${uaE} (${uaP} of one year's GDP) since 2022. With trade with Russia counted: ${netP} of GDP toward Ukraine, very likely.`,
        `${cap(Nt)} supported Ukraine with ${uaE} (${uaP} of GDP) since 2022. With trade with Russia: ${netP} of GDP toward Ukraine, very likely.`,
        `Support for Ukraine since 2022: ${uaE} (${uaP} of GDP). With trade with Russia: ${netP} of GDP toward Ukraine, very likely.`], DESC_MAX),
      h1: `How much has ${Nt} given Ukraine since 2022?`,
      intro: `${cap(Nt)} supported Ukraine with ${uaE} since 2022 (${uaP} of one year's GDP: ${parts}), and ${kept} than without the war. ${fz ? "Adding" + fz.replace(/^ and/, "") + ", the" : "The"} total is ${netP} of a year's GDP toward Ukraine (likely ${rng}; ${ch} chance of this direction).` };
  } else if (cat === "r_sure") {
    A = { title: fit([`Is ${Nt} helping Russia? ${rusE} more for Russia from trade`, `Is ${Nt} helping Russia? ${netP} of GDP toward Russia`, `${N}: ${netP} of GDP toward Russia`], TITLE_MAX),
      description: fit([`In money terms, very likely toward Russia (${ch}): Russia kept ${rusE} more in taxes and profit from trade with ${Nt} since 2022 than without the war.`,
        `Very likely toward Russia (${ch}): Russia kept ${rusE} more from trade with ${Nt} since 2022 than without the war (${rusP} of GDP).`,
        `Very likely toward Russia (${ch}): Russia kept ${rusE} more from trade since 2022 than without the war (${rusP} of GDP).`], DESC_MAX),
      h1: `Is ${Nt} helping Russia? What the money flows show`,
      intro: `Since 2022, Russia kept ${rusE} more in taxes and profit from trade with ${Nt} than it would have without the war (not the full sales value); with ${support}, the net is ${netP} of one year's GDP toward Russia (likely ${rng}; ${ch} chance of this direction).` };
  } else if (cat === "u_lean" || cat === "r_lean") {
    const side = cat === "u_lean" ? "Ukraine" : "Russia", aCh = an(ch);
    A = { title: fit([`Is ${Nt} helping Ukraine or Russia? Leaning ${side}`, `${N}: Ukraine or Russia? Leaning ${side}`, `${N}: leaning toward ${side}`], TITLE_MAX),
      description: fit([`Leaning toward ${side} (${ch} chance), not certain: ${netP} of one year's GDP since 2022, likely ${rng}. ${cap(uaP === "<0.01%" ? "Almost no support for Ukraine" : `support for Ukraine ${uaP}`)}; ${kept}${keptLvl}.`,
        `Leaning toward ${side} (${ch} chance), not certain: ${netP} of one year's GDP since 2022, likely ${rng}.`,
        `Leaning toward ${side} (${ch} chance), not certain: ${netP} of one year's GDP since 2022.`], DESC_MAX),
      h1: `Is ${Nt} helping Ukraine or Russia? Leaning toward ${side}`,
      intro: `The direction is likely but not certain: ${aCh} chance toward ${side}, ${netP} of one year's GDP since 2022 (likely ${rng}). ${cap(support)}; ${kept}${keptLvl} than without the war.` };
  } else if (cat === "unc") {
    A = { title: fit([`Is ${Nt} helping Ukraine or Russia? Too close to call`, `${N}: Ukraine or Russia? Too close to call`, `${N}: too close to call`], TITLE_MAX),
      description: fit([`Too close to call (${ch} ${f.cN.side === "ukraine" ? "toward Ukraine" : "toward Russia"}): support for Ukraine ${uaP} of GDP, ${kept}${keptLvl}. Net likely ${rng}.`,
        `Too close to call (${ch} ${f.cN.side === "ukraine" ? "toward Ukraine" : "toward Russia"}): support for Ukraine ${uaP} of GDP. Net likely ${rng}.`,
        `Too close to call (${ch} ${f.cN.side === "ukraine" ? "toward Ukraine" : "toward Russia"}): support for Ukraine ${uaP} of GDP since 2022.`], DESC_MAX),
      h1: `Is ${Nt} helping Ukraine or Russia? Too close to call`,
      intro: `${cap(Nt)} supported Ukraine with ${uaE} (${uaP} of one year's GDP); ${kept}${keptLvl} than without the war. The net, ${netP} of GDP, is too close to call (likely ${rng}).` };
  } else if (cat === "zero") {
    const lab = f.cN.level === "near" ? "near zero" : "essentially zero";
    A = { title: fit([`Is ${Nt} helping Russia or Ukraine? Net: ${lab}`, `${N}: Ukraine or Russia? Net ${lab}`, `${N}: net ${lab}`], TITLE_MAX),
      description: fit([`${cap(Nt)}'s net since 2022 is ${lab}: ${netP} of one year's GDP (likely ${rng}). Support for Ukraine ${uaP}; ${kept}${keptLvl}.`,
        `${cap(Nt)}'s net since 2022 is ${lab}: ${netP} of one year's GDP (likely ${rng}).`, `Net since 2022: ${lab}, ${netP} of one year's GDP (likely ${rng}).`], DESC_MAX),
      h1: `Is ${Nt} helping Russia or Ukraine? The net is ${lab}`,
      intro: `Since 2022 the money ${Nt} moved either way nearly cancels or is small: ${netP} of one year's GDP (likely ${rng}). ${cap(support)}; ${kept}${keptLvl} than without the war.` };
  } else {
    const tw = f.cN.level === "sure" ? `${netP} of one year's GDP toward Russia` : `leaning toward Russia by ${netP} of one year's GDP`;
    A = { title: fit([`Is ${Nt} helping Russia? Party to the war, ${netP} of GDP`, `Is ${Nt} helping Russia? A party to the war`, `${N}: a party to the war`], TITLE_MAX),
      description: fit([`Treated as a party to the war on Russia's side, so not ranked. Its money since 2022: ${tw} (${ch} chance).`, `A party to the war on Russia's side, not ranked. Its money since 2022: ${tw}.`], DESC_MAX),
      h1: `${N}: a party to the war on Russia's side`,
      intro: `${cap(Nt)} is shown but not ranked: it is treated as a party to the war with Russia. Its money numbers since 2022 come to ${tw} (likely ${rng}; ${ch} chance of this direction).` };
  }
  // the hand-written forms of the approved copy, used while the country stays in the category they were written for
  const ov = OVERRIDES[iso] && OVERRIDES[iso](f, { cat, N, Nt, netP, uaP, uaE, rusE, ch, rng });
  if (ov) Object.assign(A, ov);
  // a very long name: the shortest form that still says what the page answers
  if (A.title.length > TITLE_MAX) A.title = fit([`${N}: Ukraine or Russia?`, `${N.slice(0, TITLE_MAX - 22).trimEnd()}…: Ukraine or Russia?`], TITLE_MAX);
  if (A.description.length > DESC_MAX) A.description = A.description.slice(0, DESC_MAX - 1).replace(/\s+\S*$/, "") + "…";
  A.og_title = A.title;
  A.og_description = A.description;
  return { ...A, category: cat };
}

const OVERRIDES = {
  AUS: (f, x) => (x.cat === "zero" && f.rus < 0 ? {
    title: `How much has Australia given Ukraine? ${x.uaE} since 2022`,
    description: `Australia supported Ukraine with ${x.uaE} (${x.uaP} of one year's GDP) since 2022; Russia kept ${x.rusE} more from trade with it. Net: ${f.cN.level === "near" ? "near zero" : "essentially zero"}.`,
    h1: "How much has Australia given Ukraine since 2022?" } : null),
  SVK: (f, x) => (x.cat === "unc" && f.rus < 0 ? { description: `Too close to call (${x.ch}): Slovakia gave Ukraine ${x.uaP} of GDP since 2022, while its trade with Russia may have added to Russia's earnings.` } : null),
  IRN: (f, x) => (x.cat === "zero" && f.armedFull > 0.5 ? {
    title: "Is Iran helping Russia? The money side, since 2022",
    description: `In money terms, ${f.cN.level === "near" ? "near zero" : "essentially zero"} since 2022 (${x.netP} of GDP). Its drone and missile deliveries (about ${E(f.armedFull)} at full value) are listed on Russia's panel.`,
    h1: "Is Iran helping Russia? What the money flows show" } : null),
  PRK: (f, x) => (x.cat === "party" && f.cN.level === "sure" ? { intro: `North Korea is shown but not ranked: it is treated as a party to the war on Russia's side (its troops fought for Russia in the Kursk region and it supplied shells and missiles). Its money numbers since 2022 come to ${x.netP} of one year's GDP toward Russia (likely ${x.rng}; ${x.ch} chance of this direction).` } : null),
  BLR: (f, x) => (x.cat === "party" && f.cN.level !== "sure" && f.net < 0 ? { intro: `Belarus is shown but not ranked: it is treated as a party to the war, since Russia invaded Ukraine from its territory in February 2022. Its money numbers since 2022 lean toward Russia by ${x.netP} of one year's GDP (likely ${x.rng}; ${x.ch} chance of this direction).` } : null),
  KAZ: (f, x) => (x.cat === "zero" && f.netLoPct < 0 && f.netHiPct > 0 ? { description: `Kazakhstan's net since 2022 is ${f.cN.level === "near" ? "near zero" : "essentially zero"} (${x.netP} of one year's GDP), but the likely range is wide: ${x.rng}.` } : null),
};

// ----- the six other languages: the ten countries in TOP keep the hand-written forms of round 54 while very likely
// toward Ukraine or Russia; every other country and chance level uses seo_i18n.mjs countryCopyLang (round 56) -----
const PCT = Object.fromEntries(LANGS.map(l => [l, x => PL(l, x)])), EUR = Object.fromEntries(LANGS.map(l => [l, b => EL(l, b)]));
// names: [nominative, the form after "with"/"from" where the language needs it, plural verb?]
const NM = {
  de: { USA: ["die USA", "den USA", 1], DEU: ["Deutschland", "Deutschland"], GBR: ["Großbritannien", "Großbritannien"], FRA: ["Frankreich", "Frankreich"], POL: ["Polen", "Polen"], NLD: ["die Niederlande", "den Niederlanden", 1], ITA: ["Italien", "Italien"], IND: ["Indien", "Indien"], CHN: ["China", "China"], HUN: ["Ungarn", "Ungarn"] },
  fr: { USA: ["les États-Unis", "les États-Unis", 1], DEU: ["l'Allemagne", "l'Allemagne"], GBR: ["le Royaume-Uni", "le Royaume-Uni"], FRA: ["la France", "la France"], POL: ["la Pologne", "la Pologne"], NLD: ["les Pays-Bas", "les Pays-Bas", 1], ITA: ["l'Italie", "l'Italie"], IND: ["l'Inde", "l'Inde"], CHN: ["la Chine", "la Chine"], HUN: ["la Hongrie", "la Hongrie"] },
  es: { USA: ["Estados Unidos", "Estados Unidos"], DEU: ["Alemania", "Alemania"], GBR: ["Reino Unido", "Reino Unido"], FRA: ["Francia", "Francia"], POL: ["Polonia", "Polonia"], NLD: ["Países Bajos", "Países Bajos"], ITA: ["Italia", "Italia"], IND: ["India", "India"], CHN: ["China", "China"], HUN: ["Hungría", "Hungría"] },
  pl: { USA: ["USA", "z USA"], DEU: ["Niemcy", "z Niemcami"], GBR: ["Wielka Brytania", "z Wielką Brytanią"], FRA: ["Francja", "z Francją"], POL: ["Polska", "z Polską"], NLD: ["Holandia", "z Holandią"], ITA: ["Włochy", "z Włochami"], IND: ["Indie", "z Indiami"], CHN: ["Chiny", "z Chinami"], HUN: ["Węgry", "z Węgrami"] },
  nl: { USA: ["de VS", "de VS"], DEU: ["Duitsland", "Duitsland"], GBR: ["het VK", "het VK"], FRA: ["Frankrijk", "Frankrijk"], POL: ["Polen", "Polen"], NLD: ["Nederland", "Nederland"], ITA: ["Italië", "Italië"], IND: ["India", "India"], CHN: ["China", "China"], HUN: ["Hongarije", "Hongarije"] },
  uk: { USA: ["США", "із США"], DEU: ["Німеччина", "з Німеччиною"], GBR: ["Велика Британія", "з Великою Британією"], FRA: ["Франція", "з Францією"], POL: ["Польща", "з Польщею"], NLD: ["Нідерланди", "з Нідерландами"], ITA: ["Італія", "з Італією"], IND: ["Індія", "з Індією"], CHN: ["Китай", "з Китаєм"], HUN: ["Угорщина", "з Угорщиною"] },
};
const FRP = { USA: "ils", NLD: "ils", GBR: "il", DEU: "elle", FRA: "elle", POL: "elle", ITA: "elle", IND: "elle", CHN: "elle", HUN: "elle" };

// the language versions a country has: its own page in each language only where the copy fits its category
// round 56: every country, in every language
export function countryLangs() {
  return LANGS;
}

// f.nameL: the country's name in that language (the map's); f.words: the map's chance words in it (seo_extract.mjs)
export function countryCopy(l, f) {
  if (l === "en") return countryCopyEn(f);
  const cat = category(f);
  if (!(TOP.includes(f.iso) && (cat === "u_sure" || cat === "r_sure"))) return countryCopyGeneric(l, f, cat);
  const iso = f.iso, [n, nw, pl] = NM[l][iso], p = PCT[l], e = EUR[l], ch = CH(f.cN.p);
  const ua = e(f.ua), uaP = p(f.uaPct), net = p(f.netPct), rus = e(f.rus), lo = p(f.netLoPct), hi = p(f.netHiPct);
  const toU = f.cN.side === "ukraine", noEu = iso === "USA" || iso === "GBR";
  const T = {
    de: toU ? {
      title: [`Wie viel ${pl ? "haben" : "hat"} ${n} der Ukraine gegeben? ${ua}`, `Wie viel ${pl ? "haben" : "hat"} ${n} der Ukraine gegeben?`],
      description: `${cap(n)} ${pl ? "unterstützten" : "unterstützte"} die Ukraine seit 2022 mit ${ua} (${uaP} eines Jahres-BIP). Mit dem Russlandhandel: ${net} des BIP Richtung Ukraine.`,
      h1: `Wie viel ${pl ? "haben" : "hat"} ${n} der Ukraine seit 2022 gegeben?`,
      intro: `${cap(n)} ${pl ? "unterstützten" : "unterstützte"} die Ukraine seit 2022 mit ${ua} (${uaP} eines Jahres-BIP: Hilfe${noEu ? "" : ", EU-Anteil"} und Aufnahme von Geflüchteten). Mit dem, was Russland am Handel weniger verdiente, und eingefrorenen Reserven sind es ${net} eines Jahres-BIP Richtung Ukraine (wahrscheinlich ${lo} bis ${hi}; Wahrscheinlichkeit dieser Richtung ${ch}).`,
      q2: `${pl ? "Helfen" : "Hilft"} ${n} Russland?`,
    } : {
      title: [`Hilft ${n} Russland? ${rus} mehr für Russland aus Handel`, `Hilft ${n} Russland? ${rus} mehr für Russland`],
      description: [`In Geld gemessen sehr wahrscheinlich Richtung Russland (${ch}): Russland verdiente seit 2022 am Handel mit ${nw} ${rus} mehr an Steuern und Gewinn als ohne Krieg.`, `Sehr wahrscheinlich Richtung Russland (${ch}): Russland verdiente seit 2022 am Handel mit ${nw} ${rus} mehr an Steuern und Gewinn als ohne Krieg.`],
      h1: `Hilft ${n} Russland? Was die Geldströme zeigen`,
      intro: `Seit 2022 verdiente Russland am Handel mit ${nw} ${rus} mehr an Steuern und Gewinn als ohne den Krieg (nicht der volle Umsatz). Netto sind das ${net} eines Jahres-BIP Richtung Russland (wahrscheinlich ${hi} bis ${lo}; Wahrscheinlichkeit ${ch}).`,
      q2: `Wie viel hat ${n} der Ukraine gegeben?`,
    },
    fr: toU ? {
      title: `Combien ${n} ${pl ? "ont" : "a"}-t-${FRP[iso]} donné à l'Ukraine ? ${ua}`.replace("ont-t-", "ont-"),
      description: [`${cap(n)} ${pl ? "ont" : "a"} soutenu l'Ukraine à hauteur de ${ua} (${uaP} d'une année de PIB) depuis 2022. Avec le commerce avec la Russie : ${net} du PIB vers l'Ukraine.`, `${cap(n)} ${pl ? "ont" : "a"} soutenu l'Ukraine à hauteur de ${ua} (${uaP} du PIB) depuis 2022. Commerce russe inclus : ${net} du PIB vers l'Ukraine.`],
      h1: `Combien ${n} ${pl ? "ont" : "a"}-t-${FRP[iso]} donné à l'Ukraine depuis 2022 ?`.replace("ont-t-", "ont-"),
      intro: `${cap(n)} ${pl ? "ont" : "a"} soutenu l'Ukraine à hauteur de ${ua} depuis 2022 (${uaP} d'une année de PIB : aide${noEu ? "" : ", part de l'UE"} et accueil des réfugiés). Avec ce que la Russie a perdu sur ses échanges et les réserves gelées, le total atteint ${net} d'une année de PIB vers l'Ukraine (fourchette probable ${lo} à ${hi} ; probabilité de ce sens ${ch}).`,
      q2: `${cap(n)} ${pl ? "aident" : "aide"}-t-${FRP[iso]} la Russie ?`,
    } : {
      title: [`${cap(n)} aide-t-${FRP[iso]} la Russie ? ${rus} de plus via le commerce`, `${cap(n)} aide-t-${FRP[iso]} la Russie ? ${rus} de plus pour Moscou`, `${cap(n)} aide-t-${FRP[iso]} la Russie ? ${rus} de plus`],
      description: [`En argent, très probablement vers la Russie (${ch}) : depuis 2022, la Russie a gagné ${rus} de plus (taxes et profits) sur son commerce avec ${nw} que sans la guerre.`, `Très probablement vers la Russie (${ch}) : depuis 2022, la Russie a gagné ${rus} de plus sur son commerce avec ${nw} que sans la guerre.`],
      h1: `${cap(n)} aide-t-${FRP[iso]} la Russie ? Ce que montrent les flux d'argent`,
      intro: `Depuis 2022, la Russie a conservé ${rus} de plus en taxes et profits sur son commerce avec ${nw} que sans la guerre (pas le montant total des ventes). Au net, ${net} d'une année de PIB vers la Russie (fourchette probable ${hi} à ${lo} ; probabilité ${ch}).`,
      q2: `Combien ${n} a-t-${FRP[iso]} donné à l'Ukraine ?`,
    },
    es: toU ? {
      title: [`¿Cuánto ha dado ${n} a Ucrania? ${ua} desde 2022`, `¿Cuánto ha dado ${n} a Ucrania? ${ua}`, `¿Cuánto ha dado ${n} a Ucrania?`],
      description: [`${n} apoyó a Ucrania con ${ua} (${uaP} de un año de PIB) desde 2022. Contando su comercio con Rusia: ${net} del PIB hacia Ucrania, muy probable.`, `${n} apoyó a Ucrania con ${ua} (${uaP} de un año de PIB) desde 2022. Con su comercio con Rusia: ${net} del PIB hacia Ucrania.`],
      h1: `¿Cuánto ha dado ${n} a Ucrania desde 2022?`,
      intro: `${n} apoyó a Ucrania con ${ua} desde 2022 (${uaP} de un año de PIB: ayuda${noEu ? "" : ", su parte de la UE"} y acogida de refugiados). Con lo que Rusia dejó de ganar en su comercio y las reservas congeladas, el total es ${net} de un año de PIB hacia Ucrania (rango probable ${lo} a ${hi}; probabilidad de esta dirección ${ch}).`,
      q2: `¿${n} ayuda a Rusia?`,
    } : {
      title: [`¿${n} ayuda a Rusia? ${rus} más para Rusia por comercio`, `¿${n} ayuda a Rusia? ${rus} más para Rusia`],
      description: [`En dinero, muy probablemente hacia Rusia (${ch}): desde 2022 Rusia ganó ${rus} más en impuestos y beneficios con su comercio con ${nw} que sin la guerra.`, `Muy probablemente hacia Rusia (${ch}): desde 2022 Rusia ganó ${rus} más (impuestos y beneficios) con su comercio con ${nw} que sin la guerra.`],
      h1: `¿${n} ayuda a Rusia? Lo que muestran los flujos de dinero`,
      intro: `Desde 2022, Rusia se quedó con ${rus} más en impuestos y beneficios de su comercio con ${nw} que sin la guerra (no el valor total de las ventas). En neto, ${net} de un año de PIB hacia Rusia (rango probable ${hi} a ${lo}; probabilidad ${ch}).`,
      q2: `¿Cuánto ha dado ${n} a Ucrania?`,
    },
    pl: toU ? {
      title: `Ile ${n} ${["DEU", "ITA", "USA"].includes(iso) ? "dały" : "dała"} Ukrainie? ${ua} od 2022`,
      description: `${n} ${["DEU", "ITA", "USA"].includes(iso) ? "wsparły" : "wsparła"} Ukrainę kwotą ${ua} (${uaP} rocznego PKB) od 2022 r. Z handlem z Rosją: ${net} PKB na rzecz Ukrainy, bardzo prawdopodobnie.`,
      h1: `Ile ${n} ${["DEU", "ITA", "USA"].includes(iso) ? "dały" : "dała"} Ukrainie od 2022 roku?`,
      intro: `${n} ${["DEU", "ITA", "USA"].includes(iso) ? "wsparły" : "wsparła"} Ukrainę kwotą ${ua} od 2022 r. (${uaP} rocznego PKB: pomoc${noEu ? "" : ", udział w pomocy UE"} i przyjęcie uchodźców). Wraz z tym, co Rosja straciła na handlu, i zamrożonymi rezerwami to ${net} rocznego PKB na rzecz Ukrainy (prawdopodobnie ${lo}–${hi}; szansa tego kierunku ${ch}).`,
      q2: `Czy ${n} ${["DEU", "ITA", "USA"].includes(iso) ? "pomagają" : "pomaga"} Rosji?`,
    } : {
      title: [`Czy ${n} ${["IND", "CHN", "HUN"].includes(iso) ? "pomagają" : "pomaga"} Rosji? ${rus} więcej dla Rosji z handlu`, `Czy ${n} ${["IND", "CHN", "HUN"].includes(iso) ? "pomagają" : "pomaga"} Rosji? ${rus} więcej dla Rosji`],
      description: `W pieniądzu bardzo prawdopodobnie na rzecz Rosji (${ch}): od 2022 r. Rosja zarobiła na handlu ${nw} ${rus} więcej (podatki i zysk) niż bez wojny.`,
      h1: `Czy ${n} ${["IND", "CHN", "HUN"].includes(iso) ? "pomagają" : "pomaga"} Rosji? Co pokazują przepływy pieniędzy`,
      intro: `Od 2022 r. Rosja zatrzymała z handlu ${nw} o ${rus} więcej w podatkach i zyskach niż bez wojny (nie pełna wartość sprzedaży). Netto to ${net} rocznego PKB na rzecz Rosji (prawdopodobnie ${hi}–${lo}; szansa ${ch}).`,
      q2: `Ile ${n} ${["IND", "CHN", "HUN"].includes(iso) ? "dały" : "dała"} Ukrainie?`,
    },
    nl: toU ? {
      title: `Hoeveel ${iso === "USA" ? "hebben" : "heeft"} ${n} aan Oekraïne gegeven? ${ua}`,
      description: `${cap(n)} ${iso === "USA" ? "steunden" : "steunde"} Oekraïne sinds 2022 met ${ua} (${uaP} van een jaar bbp). Met de handel met Rusland erbij: ${net} van het bbp richting Oekraïne.`,
      h1: `Hoeveel ${iso === "USA" ? "hebben" : "heeft"} ${n} sinds 2022 aan Oekraïne gegeven?`,
      intro: `${cap(n)} ${iso === "USA" ? "steunden" : "steunde"} Oekraïne sinds 2022 met ${ua} (${uaP} van een jaar bbp: hulp${noEu ? "" : ", EU-aandeel"} en opvang van vluchtelingen). Met wat Rusland aan handel misliep en bevroren reserves is het totaal ${net} van een jaar bbp richting Oekraïne (waarschijnlijk ${lo} tot ${hi}; kans op deze richting ${ch}).`,
      q2: `${iso === "USA" ? "Helpen" : "Helpt"} ${n} Rusland?`,
    } : {
      title: [`Helpt ${n} Rusland? ${rus} meer voor Rusland via handel`, `Helpt ${n} Rusland? ${rus} meer voor Rusland`],
      description: [`In geld zeer waarschijnlijk richting Rusland (${ch}): Rusland verdiende sinds 2022 ${rus} meer aan belasting en winst op de handel met ${nw} dan zonder oorlog.`, `Zeer waarschijnlijk richting Rusland (${ch}): Rusland verdiende sinds 2022 ${rus} meer aan de handel met ${nw} dan zonder oorlog.`],
      h1: `Helpt ${n} Rusland? Wat de geldstromen laten zien`,
      intro: `Sinds 2022 hield Rusland ${rus} meer aan belasting en winst over aan de handel met ${nw} dan zonder de oorlog (niet de volledige verkoopwaarde). Netto is dat ${net} van een jaar bbp richting Rusland (waarschijnlijk ${hi} tot ${lo}; kans ${ch}).`,
      q2: `Hoeveel heeft ${n} aan Oekraïne gegeven?`,
    },
    uk: toU ? {
      title: [`Скільки ${n} ${["USA", "NLD"].includes(iso) ? "дали" : "дала"} Україні? ${ua} з 2022 року`, `Скільки ${n} ${["USA", "NLD"].includes(iso) ? "дали" : "дала"} Україні? ${ua}`],
      description: `${n} ${["USA", "NLD"].includes(iso) ? "підтримали" : "підтримала"} Україну на ${ua} (${uaP} річного ВВП) з 2022 року. З урахуванням торгівлі з Росією: ${net} ВВП на користь України.`,
      h1: `Скільки ${n} ${["USA", "NLD"].includes(iso) ? "дали" : "дала"} Україні з 2022 року?`,
      intro: `${n} ${["USA", "NLD"].includes(iso) ? "підтримали" : "підтримала"} Україну на ${ua} з 2022 року (${uaP} річного ВВП: допомога${noEu ? "" : ", частка ЄС"} і прийом біженців). Разом із тим, що Росія недоотримала від торгівлі, і замороженими резервами це ${net} річного ВВП на користь України (ймовірно ${lo}–${hi}; шанс цього напрямку ${ch}).`,
      q2: `Чи ${["USA", "NLD"].includes(iso) ? "допомагають" : "допомагає"} ${n} Росії?`,
    } : {
      title: [`Чи допомагає ${n} Росії? ${rus} більше для Росії з торгівлі`, `Чи допомагає ${n} Росії? ${rus} більше для Росії`, `Чи допомагає ${n} Росії? +${rus} для Росії`],
      description: [`У грошах дуже ймовірно на користь Росії (${ch}): з 2022 року Росія заробила на торгівлі ${nw} на ${rus} більше податків і прибутку, ніж без війни.`, `Дуже ймовірно на користь Росії (${ch}): з 2022 року Росія заробила на торгівлі ${nw} на ${rus} більше податків і прибутку, ніж без війни.`],
      h1: `Чи допомагає ${n} Росії? Що показують грошові потоки`,
      intro: `З 2022 року Росія отримала від торгівлі ${nw} на ${rus} більше податків і прибутку, ніж без війни (не повна вартість продажів). Нетто це ${net} річного ВВП на користь Росії (ймовірно ${hi}–${lo}; шанс ${ch}).`,
      q2: `Скільки ${n} ${iso === "CHN" ? "дав" : "дала"} Україні?`,
    },
  }[l];
  const pick = (v, m) => (Array.isArray(v) ? fit(v, m) : v);
  const cut = (x, m) => (x.length <= m ? x : x.slice(0, m - 1).replace(/\s+\S*$/, "") + "…");
  const out = { title: cut(pick(T.title, TITLE_MAX), TITLE_MAX), description: cut(pick(T.description, DESC_MAX), DESC_MAX), h1: T.h1, intro: T.intro, q2: T.q2, category: category(f) };
  out.og_title = out.title; out.og_description = out.description;
  return out;
}

function countryCopyGeneric(l, f, cat) {
  const w = f.words || {}, side = f.cN && f.cN.side === "russia";
  const x = { N: f.nameL || f.name, ua: f.cN ? EL(l, f.ua) : "", uaP: f.cN ? PL(l, f.uaPct) : "", net: f.cN ? PL(l, f.netPct) : "", rus: f.cN ? EL(l, f.rus) : "", ch: f.cN ? CH(f.cN.p) : "",
    lean: side ? w.leanR : w.leanU, zeroWord: f.cN && f.cN.level === "near" ? w.near : w.zero, noDataText: L(l, "noDataText") };
  x.levelWord = { u_lean: x.lean, r_lean: x.lean, unc: w.unc, zero: x.zeroWord, party: w.party }[cat] || "";
  const c = countryCopyLang(l, cat, x);
  const out = { ...c, intro: f.introL || "", category: cat };
  out.og_title = out.title; out.og_description = out.description;
  return out;
}

// ----- the short FAQ (2 to 4 questions), phrased like the searches for that country, answered with its figures -----
// c: the country as seo_extract.mjs gives it (fig, years, frozen, kiel, partyWhy, ...); queries: terms.json's for it
export function faqEn(c, queries = []) {
  const f = { ...c.fig, iso: c.iso, name: c.nameEn, party: c.party }, [, Nt] = names(c.iso, c.nameEn), q = queries.join(" | ");
  const out = [];
  if (c.noData || c.mostlyNoData || !c.net) return out;
  const parts = EU.has(c.iso) ? "its own aid, its share of EU aid and the cost of hosting refugees" : "its aid and the cost of hosting refugees";
  // 1. what it gave
  out.push({ q: `How much has ${Nt} given Ukraine?`, a: f.uaPct < 0.01 && f.ua < 0.05
    ? `Almost nothing that can be measured: ${E(f.ua)} since 2022 (${P(f.uaPct)} of one year's GDP).`
    : `${cap(Nt)} supported Ukraine with ${E(f.ua)} from 2022 to August 2026, ${P(f.uaPct)} of one year's GDP (${c.ua.range}). That counts ${parts}, minus what flowed back; loans count only at their gift value.${c.kiel ? " " + c.kiel : ""}` });
  // 2. is it helping Russia (in money terms; weapons and diplomacy are not in the number)
  const side = f.net >= 0 ? "toward Ukraine" : "toward Russia";
  const rusSent = c.kept.charAt(0).toUpperCase() + c.kept.slice(1);
  let a2 = c.party ? `${cap(Nt)} is treated as a party to the war on Russia's side, so it is not ranked: ${c.partyWhy} ` : "";
  a2 += `In money terms: ${rusSent}. With its support for Ukraine, the net is ${P(f.netPct)} of one year's GDP ${side} (${c.net.range}${c.net.chance ? "; " + c.net.chance : ""}).`;
  if (c.armedFullEur) a2 += ` Weapons and troops it sent to Russia (about ${c.armedFullEur} at full value) are listed on Russia's panel; in the totals they count only at the seller's gain.`;
  a2 += " The number counts money only: arms deliveries, troops and diplomacy are not in it.";
  out.push({ q: f.net >= 0 && !c.party ? `Is ${Nt}'s trade helping Russia?` : `Is ${Nt} helping Russia?`, a: a2 });
  // 3 and 4: by year, what it paid Russia, frozen Russian money (where people search for it, else by year)
  const extra = [];
  const yearQ = { q: `How much did ${Nt} give Ukraine each year?`, a: `Support for Ukraine by year: ${c.years.map(y => `${y.y}${y.ytd ? " (January to August)" : ""} ${y.ua.replace(/^\+/, "")}`).join("; ")}. With trade with Russia, the net since 2022 is ${c.net.signed.replace(/^[+−]/, "")} of one year's GDP ${side}.` };
  const paidQ = f.paidRussia > 0.05 ? { q: `How much has ${Nt} paid Russia since 2022?`, a: `${cap(Nt)} paid Russia ${E(f.paidRussia)} for fuel and other goods from 2022 to August 2026. The number here is not that sum but the change in what Russia kept from it (taxes and profit above a normal return) against a world without the war: ${c.kept}.` } : null;
  const fzQ = c.frozen && Math.abs(f.frozen) >= 0.05 ? { q: `What about Russian money frozen in ${Nt}?`, a: `Russia lost ${E(f.frozen)} in returns on its reserves and private assets frozen in ${Nt} since 2022 (${c.frozen.value} of one year's GDP). This is the return lost, not the amount frozen, and it counts in the net only.` } : null;
  // round 56: "Does it trade with Russia?" where people search for its trade (seo_demand.json)
  const dm = c.demand || {};
  if (paidQ && (dm.trade || 0) >= 200) paidQ.q = `Does ${Nt} trade with Russia?`;
  if (fzQ && /frozen|assets/.test(q)) extra.push(fzQ);
  if (paidQ && (/oil|gas|trade|buy|import|sanction/.test(q) || (dm.trade || 0) >= 200)) extra.push(paidQ);
  if (f.ua >= 0.1) extra.push(yearQ);
  if (fzQ && !extra.includes(fzQ)) extra.push(fzQ);
  return out.concat(extra.slice(0, 2));
}

// in the other languages: the heading's question (answered by the intro) and the opposite question, answered with the
// panel's own words in that language (netSentence, chance, support or what Russia kept)
export function faqLang(c, copy) {
  if (c.noData || c.mostlyNoData || !c.net || !copy.intro) return [];
  const first = { q: copy.h1, a: copy.intro };
  const f = c.fig, toU = f.cN && f.cN.side === "ukraine" && !c.party;
  const paren = [c.net.range, c.net.chance].filter(Boolean).join("; ");
  const a2 = toU ? `${c.netSentence} (${paren}). ${c.kept.charAt(0).toUpperCase() + c.kept.slice(1)}.`
    : `${c.uaVerb} (${c.ua.eur}). ${c.netSentence} (${paren}).`;
  return [first, { q: copy.q2, a: a2 }];
}

// ----- static pages (English; the home page in every language). n: countries ranked; facts: from the live ranking -----
const UK_COUNTRIES = n => (n % 10 === 1 && n % 100 !== 11 ? "країни" : "країн");
export function homeCopy(l, n) {
  const H = {
    en: { title: "Countries helping Ukraine or Russia: money map since 2022", description: "Interactive map: how much each country moved toward Ukraine or Russia since 2022, through aid and trade, as % of GDP and in euros. Ranges, sources.", h1: "Where did each country's money move: toward Ukraine or toward Russia?", intro: `For ${n} countries: support for Ukraine plus how much less, or more, Russia kept from trade with each, against a world without the war, from February 2022 to August 2026, with a likely range and a chance for every direction.` },
    de: { title: "Wer hilft der Ukraine, wer Russland? Geld-Karte seit 2022", description: "Interaktive Karte: wie viel Geld jedes Land seit 2022 Richtung Ukraine oder Russland bewegt hat, durch Hilfe und Handel, in % des BIP und Euro.", h1: "Wohin ist das Geld jedes Landes geflossen: Richtung Ukraine oder Russland?", intro: `Für ${n} Länder: Unterstützung für die Ukraine plus wie viel weniger oder mehr Russland am Handel mit ihnen verdiente, verglichen mit einer Welt ohne Krieg, Februar 2022 bis August 2026, jeweils mit Spanne und Wahrscheinlichkeit.` },
    fr: { title: "Qui aide l'Ukraine, qui aide la Russie ? Carte depuis 2022", description: "Carte interactive : l'argent que chaque pays a orienté vers l'Ukraine ou la Russie depuis 2022, par l'aide et le commerce, en % du PIB et en euros.", h1: "Où est allé l'argent de chaque pays : vers l'Ukraine ou vers la Russie ?", intro: `Pour ${n} pays : le soutien à l'Ukraine plus ce que la Russie a gagné en moins, ou en plus, sur son commerce avec eux, par rapport à un monde sans guerre, de février 2022 à août 2026, avec une fourchette et une probabilité.` },
    es: { title: "¿Quién ayuda a Ucrania y quién a Rusia? Mapa desde 2022", description: "Mapa interactivo: cuánto dinero movió cada país hacia Ucrania o hacia Rusia desde 2022, por ayuda y comercio, en % del PIB y en euros. Con fuentes.", h1: "¿Hacia dónde fue el dinero de cada país: hacia Ucrania o hacia Rusia?", intro: `Para ${n} países: el apoyo a Ucrania más cuánto menos, o más, ganó Rusia con su comercio, frente a un mundo sin guerra, de febrero de 2022 a agosto de 2026, con rango probable y probabilidad.` },
    pl: { title: "Kto pomaga Ukrainie, a kto Rosji? Mapa pieniędzy od 2022", description: "Interaktywna mapa: ile pieniędzy każdy kraj skierował do Ukrainy lub Rosji od 2022 r., przez pomoc i handel, w % PKB i w euro. Ze źródłami.", h1: "Dokąd popłynęły pieniądze każdego kraju: do Ukrainy czy do Rosji?", intro: `Dla ${n} krajów: wsparcie dla Ukrainy plus to, ile mniej lub więcej Rosja zarobiła na handlu z nimi w porównaniu ze światem bez wojny, od lutego 2022 do sierpnia 2026, z przedziałem i szansą kierunku.` },
    nl: { title: "Wie helpt Oekraïne, wie helpt Rusland? Geldkaart sinds 2022", description: "Interactieve kaart: hoeveel geld elk land sinds 2022 richting Oekraïne of Rusland bewoog, via steun en handel, in % van het bbp en in euro.", h1: "Waar ging het geld van elk land heen: richting Oekraïne of Rusland?", intro: `Voor ${n} landen: steun aan Oekraïne plus hoeveel minder, of meer, Rusland aan de handel met hen verdiende dan zonder oorlog, februari 2022 tot augustus 2026, met een waarschijnlijke bandbreedte en kans.` },
    uk: { title: "Хто допомагає Україні, а хто Росії? Карта грошей з 2022", description: "Інтерактивна карта: скільки грошей кожна країна спрямувала до України чи Росії з 2022 року через допомогу й торгівлю, у % ВВП і в євро.", h1: "Куди пішли гроші кожної країни: до України чи до Росії?", intro: `Для ${n} ${UK_COUNTRIES(n)}: підтримка України плюс те, скільки менше чи більше Росія заробила на торгівлі з нею порівняно зі світом без війни, з лютого 2022 до серпня 2026 року, з діапазоном і ймовірністю.` },
  }[l];
  return { ...H, og_title: H.title, og_description: H.description };
}

const list3 = a => (a.length > 2 ? a.slice(0, -1).join(", ") + " and " + a[a.length - 1] : a.join(" and "));
// facts: { n, topUa: [names], topRu: [names], parties: [names], euroTop: [[name, bn]x2], shareTop: [names], ruMore: [[name, bn]x2], ruLess: [name, bn] }
export function staticCopy(page, x) {
  const c = {
    ranking: () => ({ title: "Which countries help Ukraine most? Ranking by % of GDP",
      description: fit([`${list3(x.topUa)} lead toward Ukraine; ${list3(x.topRu)} lead toward Russia, as a share of GDP since 2022. Ranges and chances.`,
        "Who moved most money toward Ukraine, and who toward Russia, since 2022? Aid plus trade with Russia against a no-war world, with a range for each country."], DESC_MAX),
      h1: "Ranking: every country's money toward Ukraine or Russia since 2022",
      intro: `${x.n} countries ranked by the net as a share of one year's GDP, grouped by how certain the direction is: very likely, leaning, too close to call, near zero. ${list3(x.parties)} ${x.parties.length > 1 ? "are parties" : "is a party"} to the war and not ranked.` }),
    "support-for-ukraine": () => ({ title: "Ukraine aid by country as % of GDP: who gave the most?",
      description: fit([`Support for Ukraine since 2022: ${x.euroTop.map(([n, v]) => `${n} (${E(v)})`).join(" and ")} gave most in euros; ${list3(x.shareTop)} most as a share of GDP.`,
        "Every country's support for Ukraine since 2022, aid, EU share and refugee hosting, in euros and % of GDP, each with a likely range and its sources."], DESC_MAX),
      h1: "Support for Ukraine by country since 2022",
      intro: "Aid (loans at their gift value), each EU member's share of EU aid and the cost of hosting refugees, minus what flowed back, for every country, in euros and as a share of one year's GDP." }),
    "trade-with-russia": () => ({ title: "Which countries boosted Russia's trade earnings since 2022?",
      description: fit([`Russia kept ${E(x.ruMore[0][1])} more from trade with ${x.ruMore[0][0]} and ${E(x.ruMore[1][1])} more with ${x.ruMore[1][0]} than without the war, while ${x.ruLess[0]}'s cut cost it ${E(x.ruLess[1])}. Taxes and profit.`,
        "Not sales but what Russia keeps: the change in its taxes and profit from trade with each country since 2022, against a no-war world, country by country."], DESC_MAX),
      h1: "Trade with Russia: who raised and who cut Russia's earnings since 2022",
      intro: "For every country, how much more or less Russia kept from trade with it (taxes and profit above a normal return, not the full sales value) than in a world without the war: oil, gas, coal, goods, services and shipping." }),
    "how-it-works": () => ({ title: "How War Balance measures money toward Ukraine or Russia",
      description: "Support for Ukraine plus the change in what Russia keeps from trade (taxes and profit, not sales), against a no-war world, as % of one year's GDP.",
      h1: "How it works: one scale for aid, trade and frozen reserves",
      intro: "Each number is a change against what a country would have done without the war, valued at each year's prices, summed from 2022 and set against one year's GDP, with a likely range, a chance for its direction and its sources." }),
  }[page]();
  return { ...c, og_title: c.title, og_description: c.description };
}

// a document page (a method page, the limitations, the changelog): its title from its heading
export function docCopy(heading, firstPara) {
  const clean = s => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  const h = clean(heading), p = clean(firstPara || "");
  const title = fit([`${h} | War Balance method`, `${h} | War Balance`, h, h.slice(0, TITLE_MAX - 1).replace(/\s+\S*$/, "") + "…"], TITLE_MAX);
  const sentences = p.match(/[^.!?]+[.!?]+/g) || [p];
  let description = "";
  for (const s of sentences) { if ((description + s).trim().length > DESC_MAX) break; description = (description + s).trim(); }
  if (!description) description = p.slice(0, DESC_MAX - 1).replace(/\s+\S*$/, "") + "…";
  return { title, description, h1: h, og_title: title, og_description: description };
}

// ----- the static pages' own words (the rest of a page's text is the map's own, in its language) -----
export const LABELS = {
  en: { openMap: "Open in the map", map: "Map", ranking: "Ranking", how: "How it works", net: "The net", support: "Support for Ukraine", trade: "Russia's earnings from trade", frozen: "Russian money frozen", parts: "What makes up the number", byYear: "By year", year: "Year", netYear: "Net", total: "Net since 2022", yearNote: "Each year's amount: + toward Ukraine, − toward Russia. 2026 is January to August.", faq: "Questions", nearby: "Nearby in the ranking", sources: "Sources", moreSources: "{n} sources in all; the map's panel lists every one, with its documents.", dataTo: "Figures to {to} · page updated {upd}", measured: "How this is measured", preview: "Research preview: check a figure's sources before you quote it.", notRanked: "Not ranked", noData: "No data", noDataText: "There is no observation of its own for the war years, so nothing is counted for it and it is not ranked.", chance: "Chance", ofGdp: "of a year's GDP since 2022", lettersKey: "Letters: A reported, B measured estimate, C modelled estimate, D rough indication.", languages: "Languages", rankOf: "{group} · {rank}", allCountries: "All countries, A to Z", changelog: "Changelog", limitations: "Limitations", supportPage: "Support for Ukraine by country", tradePage: "Trade with Russia by country", party: "Party to the war (with Russia), not ranked", perCapita: "Per person", eur: "Euros", share: "% of GDP", country: "Country", method: "Method" },
  de: { openMap: "Auf der Karte öffnen", map: "Karte", ranking: "Rangliste", how: "So funktioniert es", net: "Der Saldo", support: "Unterstützung für die Ukraine", trade: "Russlands Einnahmen aus dem Handel", frozen: "Eingefrorenes russisches Geld", parts: "Woraus sich die Zahl zusammensetzt", byYear: "Nach Jahr", year: "Jahr", netYear: "Saldo", total: "Saldo seit 2022", yearNote: "Betrag je Jahr: + Richtung Ukraine, − Richtung Russland. 2026 ist Januar bis August.", faq: "Fragen", nearby: "In der Rangliste daneben", sources: "Quellen", moreSources: "Insgesamt {n} Quellen; der Bereich auf der Karte nennt jede, mit ihren Dokumenten.", dataTo: "Zahlen bis {to} · Seite aktualisiert am {upd}", measured: "Wie das gemessen wird", preview: "Forschungsvorschau: Prüfen Sie die Quellen einer Zahl, bevor Sie sie zitieren.", notRanked: "Nicht gereiht", noData: "Keine Daten", noDataText: "Für die Kriegsjahre gibt es keine eigene Beobachtung; es wird nichts gezählt und das Land wird nicht gereiht.", chance: "Wahrscheinlichkeit", ofGdp: "eines Jahres-BIP seit 2022", lettersKey: "Buchstaben: A gemeldet, B gemessene Schätzung, C modellierte Schätzung, D grober Anhaltspunkt.", languages: "Sprachen", rankOf: "{group} · {rank}", allCountries: "Alle Länder von A bis Z", changelog: "Änderungen", limitations: "Grenzen", supportPage: "Unterstützung für die Ukraine nach Land", tradePage: "Handel mit Russland nach Land", party: "Kriegspartei (mit Russland), nicht gereiht", perCapita: "Pro Kopf", eur: "Euro", share: "% des BIP", country: "Land", method: "Methode" },
  fr: { openMap: "Ouvrir sur la carte", map: "Carte", ranking: "Classement", how: "Fonctionnement", net: "Le solde", support: "Soutien à l'Ukraine", trade: "Gains de la Russie sur le commerce", frozen: "Avoirs russes gelés", parts: "Ce qui compose le chiffre", byYear: "Par année", year: "Année", netYear: "Solde", total: "Solde depuis 2022", yearNote: "Montant de chaque année : + vers l'Ukraine, − vers la Russie. 2026 va de janvier à août.", faq: "Questions", nearby: "Voisins au classement", sources: "Sources", moreSources: "{n} sources en tout ; le panneau de la carte les donne toutes, avec leurs documents.", dataTo: "Chiffres jusqu'au {to} · page mise à jour le {upd}", measured: "Comment c'est mesuré", preview: "Version de recherche : vérifiez les sources d'un chiffre avant de le citer.", notRanked: "Non classé", noData: "Pas de données", noDataText: "Aucune observation propre pour les années de guerre : rien n'est compté et le pays n'est pas classé.", chance: "Probabilité", ofGdp: "d'une année de PIB depuis 2022", lettersKey: "Lettres : A déclaré, B estimation mesurée, C estimation modélisée, D indication approximative.", languages: "Langues", rankOf: "{group} · {rank}", allCountries: "Tous les pays de A à Z", changelog: "Journal des modifications", limitations: "Limites", supportPage: "Soutien à l'Ukraine par pays", tradePage: "Commerce avec la Russie par pays", party: "Partie au conflit (avec la Russie), non classée", perCapita: "Par habitant", eur: "Euros", share: "% du PIB", country: "Pays", method: "Méthode" },
  es: { openMap: "Abrir en el mapa", map: "Mapa", ranking: "Clasificación", how: "Cómo funciona", net: "El neto", support: "Apoyo a Ucrania", trade: "Ganancias de Rusia por comercio", frozen: "Dinero ruso congelado", parts: "De qué se compone la cifra", byYear: "Por año", year: "Año", netYear: "Neto", total: "Neto desde 2022", yearNote: "Importe de cada año: + hacia Ucrania, − hacia Rusia. 2026 es de enero a agosto.", faq: "Preguntas", nearby: "Cerca en la clasificación", sources: "Fuentes", moreSources: "{n} fuentes en total; el panel del mapa las muestra todas, con sus documentos.", dataTo: "Cifras hasta el {to} · página actualizada el {upd}", measured: "Cómo se mide", preview: "Versión de investigación: compruebe las fuentes de una cifra antes de citarla.", notRanked: "Sin clasificar", noData: "Sin datos", noDataText: "No hay observación propia para los años de guerra: no se cuenta nada y no se clasifica.", chance: "Probabilidad", ofGdp: "de un año de PIB desde 2022", lettersKey: "Letras: A declarado, B estimación medida, C estimación modelizada, D indicación aproximada.", languages: "Idiomas", rankOf: "{group} · {rank}", allCountries: "Todos los países de la A a la Z", changelog: "Registro de cambios", limitations: "Limitaciones", supportPage: "Apoyo a Ucrania por país", tradePage: "Comercio con Rusia por país", party: "Parte en la guerra (con Rusia), sin clasificar", perCapita: "Por persona", eur: "Euros", share: "% del PIB", country: "País", method: "Método" },
  pl: { openMap: "Otwórz na mapie", map: "Mapa", ranking: "Ranking", how: "Jak to działa", net: "Saldo", support: "Wsparcie dla Ukrainy", trade: "Zyski Rosji z handlu", frozen: "Zamrożone rosyjskie środki", parts: "Z czego składa się liczba", byYear: "Według roku", year: "Rok", netYear: "Saldo", total: "Saldo od 2022", yearNote: "Kwota w danym roku: + na rzecz Ukrainy, − na rzecz Rosji. 2026 to styczeń–sierpień.", faq: "Pytania", nearby: "Obok w rankingu", sources: "Źródła", moreSources: "Łącznie {n} źródeł; panel na mapie podaje każde, z dokumentami.", dataTo: "Dane do {to} · strona zaktualizowana {upd}", measured: "Jak to jest mierzone", preview: "Wersja badawcza: sprawdź źródła liczby, zanim ją zacytujesz.", notRanked: "Poza rankingiem", noData: "Brak danych", noDataText: "Brak własnych obserwacji za lata wojny: nic nie jest liczone i kraj nie jest w rankingu.", chance: "Szansa", ofGdp: "rocznego PKB od 2022", lettersKey: "Litery: A zgłoszone, B zmierzone szacunki, C szacunki z modelu, D przybliżenie.", languages: "Języki", rankOf: "{group} · {rank}", allCountries: "Wszystkie kraje od A do Z", changelog: "Lista zmian", limitations: "Ograniczenia", supportPage: "Wsparcie dla Ukrainy według kraju", tradePage: "Handel z Rosją według kraju", party: "Strona wojny (z Rosją), poza rankingiem", perCapita: "Na osobę", eur: "Euro", share: "% PKB", country: "Kraj", method: "Metoda" },
  nl: { openMap: "Openen op de kaart", map: "Kaart", ranking: "Ranglijst", how: "Hoe het werkt", net: "Het saldo", support: "Steun aan Oekraïne", trade: "Ruslands inkomsten uit handel", frozen: "Bevroren Russisch geld", parts: "Waaruit het getal bestaat", byYear: "Per jaar", year: "Jaar", netYear: "Saldo", total: "Saldo sinds 2022", yearNote: "Bedrag per jaar: + richting Oekraïne, − richting Rusland. 2026 is januari tot augustus.", faq: "Vragen", nearby: "In de buurt in de ranglijst", sources: "Bronnen", moreSources: "In totaal {n} bronnen; het paneel op de kaart noemt ze allemaal, met hun documenten.", dataTo: "Cijfers tot {to} · pagina bijgewerkt op {upd}", measured: "Hoe dit gemeten wordt", preview: "Onderzoeksversie: controleer de bronnen van een getal voordat u het citeert.", notRanked: "Niet gerangschikt", noData: "Geen gegevens", noDataText: "Er is geen eigen waarneming voor de oorlogsjaren: er wordt niets geteld en het land staat niet in de ranglijst.", chance: "Kans", ofGdp: "van een jaar bbp sinds 2022", lettersKey: "Letters: A gemeld, B gemeten schatting, C gemodelleerde schatting, D ruwe indicatie.", languages: "Talen", rankOf: "{group} · {rank}", allCountries: "Alle landen van A tot Z", changelog: "Wijzigingen", limitations: "Beperkingen", supportPage: "Steun aan Oekraïne per land", tradePage: "Handel met Rusland per land", party: "Partij in de oorlog (met Rusland), niet gerangschikt", perCapita: "Per persoon", eur: "Euro", share: "% van het bbp", country: "Land", method: "Methode" },
  uk: { openMap: "Відкрити на карті", map: "Карта", ranking: "Рейтинг", how: "Як це працює", net: "Нетто", support: "Підтримка України", trade: "Прибутки Росії від торгівлі", frozen: "Заморожені російські кошти", parts: "З чого складається число", byYear: "За роками", year: "Рік", netYear: "Нетто", total: "Нетто з 2022", yearNote: "Сума за рік: + на користь України, − на користь Росії. 2026 — з січня до серпня.", faq: "Запитання", nearby: "Поруч у рейтингу", sources: "Джерела", moreSources: "Усього {n} джерел; панель на карті показує кожне з документами.", dataTo: "Дані до {to} · сторінку оновлено {upd}", measured: "Як це виміряно", preview: "Дослідницька версія: перевірте джерела числа, перш ніж цитувати його.", notRanked: "Поза рейтингом", noData: "Немає даних", noDataText: "Власних спостережень за роки війни немає: нічого не враховано, і країна не в рейтингу.", chance: "Шанс", ofGdp: "річного ВВП з 2022", lettersKey: "Літери: A звітні дані, B виміряна оцінка, C модельна оцінка, D приблизна вказівка.", languages: "Мови", rankOf: "{group} · {rank}", allCountries: "Усі країни від А до Я", changelog: "Зміни", limitations: "Обмеження", supportPage: "Підтримка України за країнами", tradePage: "Торгівля з Росією за країнами", party: "Сторона війни (з Росією), поза рейтингом", perCapita: "На особу", eur: "Євро", share: "% ВВП", country: "Країна", method: "Методика" },
};
export const L = (l, key, vars) => { const s = (LABELS[l] && LABELS[l][key]) || LABELS.en[key]; return vars ? s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m)) : s; };
