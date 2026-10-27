// Round 54 (findable pages): what the static pages show, read from the map itself. extractSite() runs inside the map
// page (page.evaluate in share_cards.mjs / seo_pages.mjs), after it says it is ready, and uses the map's own functions
// (calc, chanceInfo, chanceText, rangeWords, fmtMeasure, partSections, ...) in the chosen language, so every number,
// range and chance word on a country page is the one its panel shows. Nothing here computes a number of its own.

/* global DATA, byIso, LANG, methodBands, loadLang, regionName, ISO2, calc, chance, chanceInfo, chanceText, chanceSentence, uncertain, leaning, isNearZero,
   noDataAt, scaled, fmtMeasure, rangeWords, eur, headVerb, verbAround, verb, netSentence, keptWords, leadLine, partSections, plainName,
   partGrade, evidence, UA_PARTS, OWN_LINE, kielLine, partSourceIds, SRC, tData, docsOf, yearsOf, YEARS, FRAC, yi, PARTY_TO_WAR, PARTY_WHY, t, countrySlug,
   HEAD3, refs, kielFigure, REGION_OF, storyTags, decideLine, uncReason, frozenLine, sanctionNote, chplNote, remitNote, takenNote, noDataLine,
   fairnessNote, structuralNote, dualUseNote, partNote, dataText, num, money, METHOD_INPUTS, srcTier, REPO */

export async function extractSite({ lang, isos }) {
  if (lang !== "en") await loadLang(lang);
  // round 56 (every country in every language): the method band and the certainty of a number do not depend on the
  // language, and the panel's words ask for them many times; they are worked out once per country and year for the
  // whole run (kept on the page, started again with the English pass) and the map's own functions restored after
  const W = window;
  if (!W.__wbMemo || lang === "en") W.__wbMemo = { mb: new Map(), unc: new Map(), ch: new Map() };
  const _mb = methodBands, _unc = uncertain, _ch = chance, MM = W.__wbMemo;
  chance = (c, y, q) => { const k = c.iso3 + "|" + y + "|" + q; let v = MM.ch.get(k); if (v === undefined) MM.ch.set(k, (v = _ch(c, y, q))); return v; };   // eslint-disable-line no-global-assign
  methodBands = (c, y) => { const k = c.iso3 + "|" + y; let v = MM.mb.get(k); if (v === undefined) MM.mb.set(k, (v = _mb(c, y))); return v; };   // eslint-disable-line no-global-assign
  uncertain = (c, y, q) => { const k = c.iso3 + "|" + y + "|" + q; let v = MM.unc.get(k); if (v === undefined) MM.unc.set(k, (v = _unc(c, y, q))); return v; };   // eslint-disable-line no-global-assign
  try {
  const prevLang = LANG;
  LANG = lang;   // eslint-disable-line no-global-assign
  for (const c of Object.values(DATA)) c.name = regionName(ISO2[c.iso3], c.name_en);
  const Y = 2026, strip = h => String(h || "").replace(/<span class="ref">.*?<\/span>/g, "").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").replace(/\s+([.,;:])/g, "$1").trim();
  const pctOf = (c, v) => (c.gdp ? (100 * v) / c.gdp : null);
  // ----- the ranking (views.js renderRanking, the net view, % of GDP, all countries): groups and order -----
  function ranking(q) {
    const val = (k) => ({ net: k.shift, ua: k.uaBal, rus: k.rusBal })[q];
    const all = Object.values(DATA).map(c => { const k = calc(c, Y); return { c, k, bn: val(k), v: scaled(c, val(k), "gdp") }; }).filter(m => m.v != null).sort((a, b) => b.v - a.v);
    const party = all.filter(m => PARTY_TO_WAR.has(m.c.iso3)), nod = all.filter(m => noDataAt(m.c, Y));
    const rows = all.filter(m => !party.includes(m) && !nod.includes(m));
    for (const m of rows) {
      m.st = !uncertain(m.c, Y, q) ? "" : leaning(m.c, Y, q) ? "lean" : "unc";
      m.nz = !!m.st && isNearZero(m.c, Y, q);
      m.ch = chance(m.c, Y, q);
    }
    const grp = m => (m.nz ? 2 : m.st === "unc" ? 3 : m.st === "lean" ? (m.ch.side === "ukraine" ? 1 : 4) : m.v >= 0 ? 0 : 5);
    rows.sort((a, b) => grp(a) - grp(b) || b.v - a.v);
    const LABEL = q === "ua" ? ["Supported Ukraine", "Leaning: supported Ukraine", "Near zero", "Too close to call", "Leaning: below zero", "Below zero"]
      : ["Toward Ukraine", "Leaning toward Ukraine", "Near zero", "Too close to call", "Leaning toward Russia", "Toward Russia"];
    const groups = [0, 1, 2, 3, 4, 5].map(g => ({ g, label: t(LABEL[g]), list: rows.filter(m => grp(m) === g) })).filter(x => x.list.length);
    // numbered as in the map's Ranking view, which shows economies of €5bn of GDP and more by default (state.size)
    const MIN = 5;
    groups.forEach(({ g, list }) => { const bigs = list.filter(m => m.c.gdp >= MIN); bigs.forEach((m, i) => (m.rank = g === 0 ? i + 1 : g === 5 ? bigs.length - i : null)); });
    const row = m => ({ iso: m.c.iso3, rank: m.rank ?? null, small: m.c.gdp < 5, st: m.st, value: fmtMeasure(m.c, m.bn, "gdp", true), pct: m.v, eurBn: m.bn, eur: eur(m.bn, true),
      pp: m.c.pop ? fmtMeasure(m.c, m.bn, "pp", true) : "", chance: pct(m.ch.p), side: m.ch.side, sure: !m.st });
    return { groups: groups.map(x => ({ g: x.g, label: x.label, rows: x.list.map(row) })), party: party.map(m => ({ iso: m.c.iso3, value: fmtMeasure(m.c, m.bn, "gdp", true), eur: eur(m.bn, true) })),
      noData: nod.map(m => m.c.iso3), order: rows.map(m => m.c.iso3) };
  }
  const pct = p => (p >= 0.995 ? ">99%" : Math.floor(p * 100) + "%");
  const rank = { net: ranking("net"), ua: lang === "en" ? ranking("ua") : null, rus: lang === "en" ? ranking("rus") : null };
  // (round 56: the net ranking in each language gives the country pages' "nearby" lists their group names)
  // ----- one country, as its panel shows it -----
  function country(c) {
    const k = calc(c, Y), party = PARTY_TO_WAR.has(c.iso3), noData = !!k.noData, mostly = !!k.mostlyNoData;
    refs.splice(0, refs.length);
    const g = (v, signed = false) => fmtMeasure(c, v, "gdp", signed);
    const level = q => { const i = chanceInfo(c, Y, q); return i ? { level: i.level, p: i.p, side: i.side, pct: pct(i.p), sideWords: i.sideWords } : null; };
    const num = (q, v, lo, hi) => {
      const hv = headVerb(c, Y, q, v), [pre, post] = verbAround(q !== "net" && hv.key === "netLean" ? q : hv.key, hv.s);
      const unc = uncertain(c, Y, q) && !party;
      return { pre, post, big: hv.flip ? fmtMeasure(c, v, "gdp", true, false) : fmtMeasure(c, Math.abs(v), "gdp", false, false), signed: g(v, true),
        eur: eur(Math.abs(v)), eurSigned: eur(v, true), range: rangeWords(c, lo, hi, q === "ua" ? "ua" : "net", "gdp"), chance: party ? "" : chanceText(c, Y, q),
        chanceSentence: party ? "" : strip(chanceSentence(c, Y, q)), unc, pos: v >= 0, info: level(q),
        perYear: t("≈ {v}/yr", { v: fmtMeasure(c, Math.abs(v) / yearsOf(Y), "gdp") }) };
    };
    const out = { iso: c.iso3, slug: countrySlug(c), name: c.name, nameEn: c.name_en, party, noData, mostlyNoData: mostly,
      partyWhy: party ? t(PARTY_WHY[c.iso3]) : "", earner: !!k.earner, gdp: c.gdp, pop: c.pop || null,
      fig: { net: k.shift, netLo: k.shiftLo, netHi: k.shiftHi, ua: k.uaBal, uaLo: k.uaLo, uaHi: k.uaHi, rus: k.rusBal, rusLo: k.rusLo, rusHi: k.rusHi, frozen: k.frozen,
        netPct: pctOf(c, k.shift), netLoPct: pctOf(c, k.shiftLo), netHiPct: pctOf(c, k.shiftHi), uaPct: pctOf(c, k.uaBal), rusPct: pctOf(c, k.rusBal), frozenPct: pctOf(c, k.frozen),
        paidRussia: k.paidRussia || 0, cN: level("net"), cU: level("ua"), cR: level("rus") } };
    if (!c.gdp) return out;
    out.net = num("net", k.shift, k.shiftLo, k.shiftHi);
    out.ua = num("ua", k.uaBal, k.uaLo, k.uaHi);
    out.rus = num("rus", k.rusBal, k.rusLo, k.rusHi);
    out.netSentence = netSentence(c, k, "gdp");
    out.lead = noData || mostly ? "" : strip(leadLine(c, k));
    out.kept = keptWords(c, k, "gdp", true);
    out.uaVerb = verb("ua", k.uaBal, c, "gdp");
    out.frozen = Math.abs(k.frozen) >= 0.0005 ? { verb: verb("frozen", k.frozen, c, "gdp"), eur: eur(Math.abs(k.frozen)), value: g(Math.abs(k.frozen)) } : null;
    const ap = k.shiftParts.find(p => p.k === "aid");
    out.kiel = ap ? strip(kielLine(c, ap.v)) : "";
    // round 55 (topic and group pages, seo_topics.json): the measures a topic table can show, each as the panel has it
    // (€ bn, the likely range in the panel's words, the chance in its words where the number has one)
    const rw = (lo, hi, q) => rangeWords(c, lo, hi, q, "gdp"), ci = q => (party ? null : chanceInfo(c, Y, q));
    const M = (v, lo, hi, q, chq) => ({ v, lo, hi, range: lo == null ? "" : rw(lo, hi, q), chance: chq && !party ? chanceText(c, Y, chq) : "", level: chq && ci(chq) ? ci(chq).level : "",
      side: chq && ci(chq) ? ci(chq).side : "" });
    out.measures = { net: M(k.shift, k.shiftLo, k.shiftHi, "net", "net"), ua: M(k.uaBal, k.uaLo, k.uaHi, "ua", "ua"), rus: M(k.rusBal, k.rusLo, k.rusHi, "net", "rus"),
      frozen: M(k.frozen, k.frozenLo, k.frozenHi, "net"), paidGain: M(k.rusPaid, k.rusPaidLo, k.rusPaidHi, "net"), paid: M(k.paidRussia || 0, null, null),
      kiel: M(typeof kielFigure === "function" ? kielFigure(c) : null, null, null), aid: M(ap ? ap.v : 0, ap ? ap.lo : null, ap ? ap.hi : null, "ua") };
    // round 58 (owner: "the ranking does not work and the numbers make no sense"): a part is its value and its likely
    // range (lo, hi: the same sign convention as the value, as calc() gives them) and its side in the model: "ua" (a part
    // of support for Ukraine), "back" (money of the war effort spent in this economy: what it earned, subtracted from its
    // support), "rus" (trade with Russia), "frozen" (the return Russia lost on money frozen here) or "cost" (outside the
    // totals). A page writes the range in the value's own unit and sign (seo_topics.mjs); a part has no chance of its own
    const back = new Set(k.backShift.map(p => p.k));
    const sideOf = p => (back.has(p.k) ? "back" : UA_PARTS.has(p.k) ? "ua" : OWN_LINE.has(p.k) ? "frozen" : "rus");
    const PM = (p, side) => ({ v: p.v, lo: Math.min(p.lo, p.hi), hi: Math.max(p.lo, p.hi), range: "", chance: "", level: "", side: "", partSide: side });
    for (const p of k.shiftParts.concat(k.backShift)) out.measures["part:" + p.k] = PM(p, sideOf(p));
    // round 56 (more findable pages): the parts outside the totals (the oil discount, the cost of replacing Russian
    // energy, what Russia took from companies), marked as such, for their own pages
    // round 58: the cost view counts the discount gained on Russian oil below zero (it lowers the cost; calc() gives
    // it as "discount", the same amount above zero); its own page shows it as the discount gained, above zero
    const GAIN = new Set(["disc"]), asGain = p => (GAIN.has(p.k) ? { ...p, v: -p.v, lo: -p.hi, hi: -p.lo } : p);
    for (const p of k.costParts.concat(k.takenParts || [])) if (!out.measures["part:" + p.k]) out.measures["part:" + p.k] = { ...PM(asGain(p), "cost"), cost: true };
    // the fuel share of what it bought from Russia before the war (2018-2021, data.json), for the energy page
    out.fuelSharePreWar = c.to_rus && c.to_rus.gain && c.to_rus.gain.fossil_share != null ? c.to_rus.gain.fossil_share : null;
    out.region = typeof REGION_OF !== "undefined" ? REGION_OF[c.iso3] || "asia" : "";
    // weapons and troops sent to Russia at their full value (Russia's panel, "Armed Russia"), as information
    const iy = yi(Y);
    out.armedFull = c.military_rus ? (c.military_rus.alt || c.military_rus.years).slice(1, iy + 1).reduce((a, b) => a + b, 0) : 0;
    out.armedFullEur = out.armedFull > 0.001 ? eur(out.armedFull) : "";
    // round 56: as a measure too (Russia's panel, "Armed Russia"; information, not in the totals at this value)
    if (out.armedFull > 0.0005) out.measures.armed = M(out.armedFull, null, null);
    // the parts, by section, as the panel's "What makes up the number" (round 26)
    out.sections = noData ? [] : partSections(c, k).filter(s => s.parts.length || Math.abs(s.tile) >= 0.0005).map(sec => {
      let vk = sec.q, vs = sec.tile;
      if (sec.q !== "frozen") { const hv = headVerb(c, Y, sec.q, HEAD3(k)[sec.q]); vk = hv.key === "netLean" ? sec.q : hv.key; vs = hv.s; }
      const [pre, post] = verbAround(vk, vs), ss = sec.tile < 0 ? -1 : 1;
      return { q: sec.q, pre, post, amount: fmtMeasure(c, Math.abs(sec.tile), "gdp", false, true), eur: eur(Math.abs(sec.tile)),
        parts: sec.parts.filter(p => Math.abs(p.v) >= 0.0005).map(p => {
          const ev = evidence(p);
          return { k: p.k, name: strip(plainName(p, c)), sign: (p.v >= 0 ? 1 : -1) === ss ? "+" : "−", amount: fmtMeasure(c, Math.abs(p.v), "gdp", false, true), eur: eur(Math.abs(p.v)),
            letter: partGrade(p), ev: ev.kind === "press" ? t("press only") : ev.kind === "own" || ev.kind === "none" ? t("own estimate") : ev.off >= 2 ? t("{n} official sources", { n: ev.off }) : "",
            dir: p.v >= 0 ? "ua" : sec.q === "rus" ? "ru" : "mid" };
        }) };
    });
    // each year's own amount (calc() sums from 2022 up to the year chosen)
    let prev = { shift: 0, uaBal: 0, rusBal: 0, frozen: 0 };
    out.years = YEARS.filter(y => y >= 2022).map(y => {
      const kk = calc(c, y), row = { y, ytd: FRAC[yi(y)] < 1, ua: eur(kk.uaBal - prev.uaBal, true), rus: eur(kk.rusBal - prev.rusBal, true), net: eur(kk.shift - prev.shift, true),
        uaBn: kk.uaBal - prev.uaBal, rusBn: kk.rusBal - prev.rusBal, frozenBn: kk.frozen - prev.frozen, netBn: kk.shift - prev.shift, cum: g(kk.shift, true) };
      prev = kk;
      return row;
    });
    // the sources behind its parts, largest part first (the panel's list), with one link each
    const parts = k.shiftParts.concat(k.backShift).slice().sort((a, b) => Math.abs(b.v) - Math.abs(a.v));
    out.nSources = partSourceIds(parts).length;
    out.sources = partSourceIds(parts).slice(0, 12).map(id => {
      const s = SRC[id], docs = (typeof docsOf === "function" ? docsOf(id) : []) || [], d = docs.find(l => l.key) || docs[0];
      return { id, name: tData(s.name).s, url: (d && d.url) || s.url || "" };
    });
    out.dyn = dynOf(c, k, party, noData, mostly);
    return out;
  }
  // ----- round 57b (richer country pages, approved by the owner): the panel's own sentences for the page's sections,
  // in this language. Each is the map's function (storyTags, decideLine, uncReason, frozenLine, sanctionNote, the
  // marker notes, partNote, kielLine ...) or the map's own phrase through t(), as plain text: without the source
  // numbers, the certainty chips and the ⓘ and § links of the panel. The figures beside them (trade, refugees, loans,
  // the parts and their sources) are the data's; seo_country.mjs writes them with the phrase table (seo_i18n.mjs DYN).
  const box = document.createElement("div");
  const plain = h => {
    box.innerHTML = String(h || "");
    box.querySelectorAll(".ref,.chip,a.how,a.trace").forEach(e => e.remove());
    return box.textContent.replace(/\s+/g, " ").replace(/\s+([.,;:])/g, "$1").trim();
  };
  const sumY = a => (a ? a.slice(1, yi(Y) + 1).reduce((x, v) => x + (v || 0), 0) : 0);
  function dynOf(c, k, party, noData, mostly) {
    const d = { story: [], decide: null, notes: {}, facts: {}, coverage: [], parts: [] };
    const n = d.notes;
    n.noData = plain(noDataLine(c));
    d.coverage = (c.coverage || []).map(p => ({ part: t(p.part), key: p.part, status: p.status, word: t({ ok: "reported", est: "estimated", missing: "missing" }[p.status] || p.status), note: plain(dataText(p.note || "")) }));
    if (noData) return d;
    d.story = storyTags(c, k, Y).map(g => ({ key: g.key, label: plain(g.label), body: plain(g.body) }));
    const ci = party ? null : chanceInfo(c, Y, "net");
    if (ci && ci.level !== "sure" && !mostly) {
      // the panel's lines under the net (netBlock): why it is not certain, and what decides it (lean and too close only)
      const why = uncReason(c, Y, "net");
      d.decide = { level: ci.level, why: why ? plain(t(isNearZero(c, Y, "net") ? "Near zero, and not certain mostly because of {why}." : "Not certain, mostly because of {why}.", { why })) : "",
        flip: ci.level === "lean" || ci.level === "unc" ? plain(decideLine(c, k, "net")) : "" };
    }
    const all = k.shiftParts.concat(k.backShift), part = key => all.find(p => p.k === key);
    n.frozen = plain(frozenLine(c, k));
    n.sanction = plain(sanctionNote(c, k));
    n.chpl = plain(chplNote(c));
    n.remit = plain(remitNote(c));
    n.taken = plain(takenNote(c, k));
    n.fairness = plain(fairnessNote(c, k));
    n.structural = plain(structuralNote(c, k));
    n.dualUse = plain(dualUseNote(c));
    n.hub = c.hub ? plain(t("Transit hub:") + " " + dataText(c.hub)) + "." : "";
    const wf = part("windfall");
    n.windfall = wf && c.windfall && c.windfall.years ? plain(partNote(c, wf)) : "";
    // aid: what the Kiel Institute lists and what is not yet delivered (partNote "aid")
    const a = c.aid || {}, und = -(sumY(a.undeliv && a.undeliv.c) + sumY(a.undeliv_eu && a.undeliv_eu.c));
    n.undelivered = und > 0.005 ? plain(t("Military aid allocated but not yet delivered is not counted: {v} (Kiel's full allocation is the high end).", { v: eur(und) })) : "";
    d.facts.loans = a.loans_face ? { face: a.loans_face, ge: a.loans_grant_eq ?? a.loans_face * 0.26 } : null;
    d.facts.pledged = a.pledged_open != null && a.pledged_open >= 0.0005 ? a.pledged_open : null;
    // refugees: the map's sentences (storyTags "refugees", partNote "ref"); the cost per refugee-year only where the
    // hosting cost is reported (data coverage "Refugee hosting": ok), not where it is modelled
    const rp = c.people && c.people.refugees, refP = part("ref");
    if (rp && rp.count) {
      const per1k = c.pop ? rp.count / (c.pop * 1000) : 0;
      n.refHosted = plain(t("{n} refugees from Ukraine, {r} per 1,000 residents.", { n: num(rp.count), r: num(per1k, per1k >= 10 ? 0 : 1) }));
      const reported = (c.coverage || []).some(x => x.part === "Refugee hosting" && x.status === "ok");
      if (a.refugee_work_gain) {
        const g = sumY(a.refugee_work_gain), gross = sumY(a.refugee_gross_years);
        n.refGross = gross > 0.0005 ? plain(t("For {c}: {gross} spent on refugees, less {g}, its gain on the work refugees did here.", { c: c.name, gross: eur(gross), g: eur(g) })) : "";
        const py = sumY(a.refugee_person_years);
        n.refPerYear = reported && py >= 1000 && refP && refP.v > 0 ? plain(t("That is about {v} per refugee per year ({n} refugee-years).", { v: money(num(Math.round(refP.v * 1e9 / py))), n: num(Math.round(py)) })) : "";
      }
      d.facts.ref = { count: rp.count, per1k, asOf: rp.as_of, reported };
    }
    // trade before and after: what it bought from and sold to Russia, 2021 and the last full year (sales values)
    const tc = tr => (tr && tr.years && tr.years[0] > 0 ? { y0: tr.years[0], y1: tr.years[4] } : null);
    d.facts.trade = { bought: tc(c.to_rus), sold: tc(c.from_rus) };
    d.facts.fuelShare = c.to_rus && c.to_rus.gain && c.to_rus.gain.fossil_share != null ? c.to_rus.gain.fossil_share : null;
    d.facts.flowback = k.flowback > 0.0005 ? { gross: k.flowback, kept: k.flowbackProfit } : null;
    d.facts.hub = !!c.hub;
    // the parts, largest first, with their plain names, letters and sources (for the sections and "Sources, by part")
    d.parts = all.filter(p => Math.abs(p.v) >= 0.0005).sort((x, z) => Math.abs(z.v) - Math.abs(x.v))
      .map(p => ({ k: p.k, v: p.v, name: plain(plainName(p, c)), grade: partGrade(p), src: (p.src || []).filter(id => SRC[id]) }));
    return d;
  }
  const want = isos ? isos.map(i => byIso[i]).filter(Boolean) : Object.values(DATA);
  const res = { lang, dataTo: document.body.dataset.dataTo || "", countries: want.map(country), rank,
    // round 56: the map's chance words in this language, for the country pages' titles in it
    words: { leanU: t("Leaning toward Ukraine"), leanR: t("Leaning toward Russia"), near: t("near zero"), zero: t("essentially zero"), unc: t("too close to call"), party: t("Party to the war"),
      // round 57: the level words of a table cell ("very likely · 97%", "likely toward Russia · 80%"), without the figures,
      // so a page's sentences take every chance word from the map (the wording guard, seo_check.py)
      sure: t("very likely · {p}", { p: "" }).replace(/\s*·\s*$/, ""), lean: t("likely {side} · {p}", { side: "", p: "" }).replace(/\s*·\s*$/, "").trim() },
    // the chance levels explained, in the map's words (index.html CHANCE_KEY), for the ranking pages
    chanceKey: typeof CHANCE_KEY === "function" ? CHANCE_KEY() : "",
    // round 57b: every source as the panel lists it (its name in this language, its key document's link, its tier:
    // srcTier, with the method inputs apart), and the panel's labels the country page's sections use
    srcs: Object.fromEntries(Object.keys(SRC).map(id => {
      const s = SRC[id], docs = (typeof docsOf === "function" ? docsOf(id) : []) || [], d = docs.find(l => l.key) || docs[0];
      const note = ((s.note || "").match(/research\/[\w./-]+?\.(?:md|json)/) || [])[0];
      return [id, { name: tData(s.name).s, href: (d && d.url) || s.url || (note ? REPO + note : ""), tier: METHOD_INPUTS.has(id) ? "method" : srcTier(id) || "own" }];
    })),
    dynWords: { story: t("Its story in short"), coverage: t("Data coverage"), loansFace: t("Loans, full amount"), loansGE: t("Loans, grant equivalent"),
      pledged: t("Promised but not yet delivered"), noData: t("No data"),
      noDataBig: t("There is no observation of its own for the war years: no customs or partner records of its trade with Russia or Ukraine, no aid, no refugees counted. Nothing is counted, it is not ranked, and it is drawn hatched on the map.") } };
  if (lang === "en") {
    // How it works: the money flows, each with its method page (for the static How it works page)
    res.flows = (typeof FLOWS !== "undefined" ? FLOWS : []).map(f => ({ id: f.id, name: t(f.name), what: t(f.what), method: f.method || "" }));
  }
  LANG = prevLang;   // eslint-disable-line no-global-assign
  for (const c of Object.values(DATA)) c.name = regionName(ISO2[c.iso3], c.name_en);
  return res;
  } finally { methodBands = _mb; uncertain = _unc; chance = _ch; }   // eslint-disable-line no-global-assign
}

// The method pages, the limitations and the changelog, rendered by the map's own Markdown step (loadContent, mdRender:
// marked, then DOMPurify), with the map's in-page links ("#view=how&sec=m-trade-...", "#DEU") turned into the static
// pages' addresses. Headings keep the ids the map gives them, so "/method/trade/#m-trade-re-export-hubs" works.
/* global loadContent, mdRender, pageHtml, MD_PAGES, secAlias, FLOWS, CHANCE_KEY */
export async function extractDocs() {
  const c = await loadContent();
  const flowMethod = Object.fromEntries((typeof FLOWS !== "undefined" ? FLOWS : []).map(f => [f.id, f.method || ""]));
  const pages = MD_PAGES.slice().sort((a, b) => b.length - a.length);
  const methodUrl = doc => { const [pg, anc] = doc.replace(/\.md/, "").split("#"); return pg ? `/method/${pg}/` + (anc ? `#m-${pg}-${anc}` : "") : "/how-it-works/"; };
  function rewrite(html) {
    const box = document.createElement("div");
    box.innerHTML = html;
    box.querySelectorAll("a[href]").forEach(a => {
      const h = a.getAttribute("href");
      if (/^https?:/.test(h)) { a.setAttribute("rel", "noopener"); return; }
      if (!h.startsWith("#")) return;
      const frag = decodeURIComponent(h.slice(1));
      let to = null;
      if (/^[A-Za-z]{3}$/.test(frag)) { const x = byIso[frag.toUpperCase()]; to = x ? "/country/" + countrySlug(x) + "/" : "/"; }
      else if (frag.includes("=")) {
        const p = new URLSearchParams(frag), v = p.get("view"), sec0 = p.get("sec"), sec = sec0 && secAlias(sec0), fl = p.get("flow");
        if (v === "rank") to = "/ranking/";
        else if (v === "how" || sec || fl) {
          if (sec === "changelog") to = "/changelog/";
          else if (sec && /^cl-/.test(sec)) to = "/changelog/#" + sec.replace(/^(cl-r\d+[a-z]?).*$/, "$1");
          else if (sec && /^clx-/.test(sec)) to = "/changelog/#" + sec;
          else if (sec && /^lim-/.test(sec)) to = "/limitations/#" + sec;
          else if (sec && /^m-/.test(sec)) { const pg = pages.find(x => sec.startsWith("m-" + x + "-") || sec === "m-" + x); to = pg ? `/method/${pg}/` + (sec === "m-" + pg ? "" : "#" + sec) : "/how-it-works/"; }
          else if (fl && flowMethod[fl]) to = methodUrl(flowMethod[fl]);
          else to = "/how-it-works/";
        } else if (p.get("c")) { const x = byIso[p.get("c").toUpperCase()]; to = x ? "/country/" + countrySlug(x) + "/" : "/"; }
        else to = "/";
      } else to = h;   // a heading on the same page
      a.setAttribute("href", to);
    });
    box.querySelectorAll("table").forEach(t => { const w = document.createElement("div"); w.className = "tbl"; t.parentNode.insertBefore(w, t); w.appendChild(t); });
    return box.innerHTML;
  }
  const firstPara = html => { const b = document.createElement("div"); b.innerHTML = html; const p = b.querySelector("p"); return p ? p.textContent : ""; };
  const method = MD_PAGES.map(pg => { const html = rewrite(pageHtml(c, pg)); return { page: pg, title: c.method[pg].title, html, first: firstPara(html) }; });
  const lim = rewrite(mdRender(c.limitations.replace(/^# .+\n/, ""), "lim-"));
  const cl = rewrite(mdRender(c.changelog.replace(/^# .+\n/, ""), "clx-"));
  return { method, limitations: { title: (c.limitations.match(/^# (.+)$/m) || [, "Limitations"])[1], html: lim, first: firstPara(lim) },
    changelog: { title: (c.changelog.match(/^# (.+)$/m) || [, "Changelog"])[1], html: cl, first: firstPara(cl) },
    flowMethod: Object.fromEntries(Object.entries(flowMethod).map(([k, v]) => [k, v ? methodUrl(v) : ""])) };
}
