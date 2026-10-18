// ===== Languages =====
// The English text in index.html and views.js is the key: t("...") looks it up in the chosen language and falls back to
// English, so a string missing in a dictionary simply shows in English. Placeholders like {name} are filled in after translating,
// so word order can differ per language. Country names are not translated here: they come from the browser
// (Intl.DisplayNames). Text from data.json (status banner, sources, notes) goes through tData(), which also matches numbers as {n0}, {n1}...
const LANGS = { en: "English", uk: "Українська", de: "Deutsch", fr: "Français", pl: "Polski", nl: "Nederlands", es: "Español" };
// each language's dictionary is its own file, i18n/<lang>.js (it sets I18N.<lang>), fetched only when that language is chosen
const I18N = {};

// ISO 3166 alpha-3 to alpha-2 for every country in data.json (for Intl.DisplayNames), packed as "ABWAW AFGAF ..."
const ISO2 = Object.fromEntries(`
ABWAW AFGAF AGOAO AIAAI ALBAL ANDAD AREAE ARGAR ARMAM ASMAS ATAAQ ATFTF ATGAG AUSAU AUTAT AZEAZ BDIBI BELBE BENBJ BESBQ BFABF BGDBD BGRBG BHRBH BHSBS
BIHBA BLMBL BLRBY BLZBZ BMUBM BOLBO BRABR BRBBB BRNBN BTNBT BVTBV BWABW CAFCF CANCA CCKCC CHECH CHLCL CHNCN CIVCI CMRCM CODCD COGCG COKCK COLCO COMKM
CPVCV CRICR CUBCU CUWCW CXRCX CYMKY CYPCY CZECZ DEUDE DJIDJ DMADM DNKDK DOMDO DZADZ ECUEC EGYEG ERIER ESHEH ESPES ESTEE ETHET FINFI FJIFJ FLKFK FRAFR
FROFO FSMFM GABGA GBRGB GEOGE GHAGH GIBGI GINGN GMBGM GNBGW GNQGQ GRCGR GRDGD GRLGL GTMGT GUMGU GUYGY HKGHK HNDHN HRVHR HTIHT HUNHU IDNID INDIN IOTIO
IRLIE IRNIR IRQIQ ISLIS ISRIL ITAIT JAMJM JORJO JPNJP KAZKZ KENKE KGZKG KHMKH KIRKI KNAKN KORKR KWTKW LAOLA LBNLB LBRLR LBYLY LCALC LKALK LSOLS LTULT
LUXLU LVALV MACMO MARMA MDAMD MDGMG MDVMV MEXMX MHLMH MKDMK MLIML MLTMT MMRMM MNEME MNGMN MNPMP MOZMZ MRTMR MSRMS MUSMU MWIMW MYSMY NAMNA NCLNC NERNE
NFKNF NGANG NICNI NIUNU NLDNL NORNO NPLNP NRUNR NZLNZ OMNOM PAKPK PANPA PCNPN PERPE PHLPH PLWPW PNGPG POLPL PRKKP PRTPT PRYPY PSEPS PYFPF QATQA ROURO
RWARW SAUSA SDNSD SENSN SGPSG SGSGS SHNSH SLBSB SLESL SLVSV SMRSM SOMSO SPMPM SRBRS SSDSS STPST SURSR SVKSK SVNSI SWESE SWZSZ SXMSX SYCSC SYRSY TCATC
TCDTD TGOTG THATH TJKTJ TKLTK TKMTM TLSTL TONTO TTOTT TUNTN TURTR TUVTV TWNTW TZATZ UGAUG UMIUM URYUY USAUS UZBUZ VATVA VCTVC VENVE VGBVG VNMVN VUTVU
WLFWF WSMWS YEMYE ZAFZA ZMBZM ZWEZW`.split(/\s+/).filter(Boolean).map(x => [x.slice(0, 3), x.slice(3)]));
// map shapes without their own entry in data.json (numeric ids of the world atlas), for the tooltip name
const NUM_ISO2 = { "804": "UA", "643": "RU", "850": "VI", "630": "PR", "832": "JE", "831": "GG", "833": "IM", "492": "MC", "438": "LI", "663": "MF", "248": "AX", "334": "HM" };

// ?lang= wins, then the choice stored on this device, then the browser's languages, then English
function pickLang() {
  const q = new URLSearchParams(location.search).get("lang");
  if (q && LANGS[q]) return q;
  try { const s = localStorage.getItem("lang"); if (s && LANGS[s]) return s; } catch (e) { /* storage blocked */ }
  for (const l of navigator.languages || [navigator.language || ""]) { const b = (l || "").slice(0, 2).toLowerCase(); if (LANGS[b]) return b; }
  return "en";
}
let LANG = pickLang();

function t(str, vars) {
  const s = (LANG !== "en" && I18N[LANG] && I18N[LANG][str]) || str;
  return vars ? s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m)) : s;
}
// Text that comes from data.json (source names, notes, the status line): looked up like t(); numbers inside it are
// matched as {n0}, {n1}... so one translation covers "only the paid share (90%) counts" and "(30%)". Untranslated text
// stays English and is marked lang="en".
function tData(str) {
  if (!str || LANG === "en" || !I18N[LANG]) return { s: str, en: LANG !== "en" };
  if (I18N[LANG][str]) return { s: I18N[LANG][str], en: false };
  const nums = [];
  const key = str.replace(/\d+(?:[.,]\d+)*/g, m => `{n${nums.push(m) - 1}}`);
  const tr = nums.length && I18N[LANG][key];
  return tr ? { s: tr.replace(/\{n(\d+)\}/g, (m, i) => nums[i] ?? m), en: false } : { s: str, en: true };
}
const dataText = (str, tag = "span") => { const r = tData(str); return r.en ? `<${tag} lang="en">${r.s}</${tag}>` : r.s; };
const regionNames = {};
// the browser's name for a country in the chosen language; English (and any failure) keeps the name given
function regionName(iso2, fallback) {
  if (LANG === "en" || !iso2) return fallback;
  try {
    const n = (regionNames[LANG] = regionNames[LANG] || new Intl.DisplayNames([LANG], { type: "region" })).of(iso2);
    return n && n !== iso2 ? n : fallback;
  } catch (e) { return fallback; }
}

// static text in the page: data-i18n (text), data-i18n-aria, data-i18n-ph (placeholder) and data-i18n-title hold the English key
function applyStatic() {
  document.documentElement.lang = LANG;
  document.title = t("Follow the Money: Ukrainian Aid");
  document.querySelectorAll("[data-i18n]").forEach(el => (el.textContent = t(el.dataset.i18n)));
  document.querySelectorAll("[data-i18n-aria]").forEach(el => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
  document.querySelectorAll("[data-i18n-ph]").forEach(el => el.setAttribute("placeholder", t(el.dataset.i18nPh)));
  document.querySelectorAll("[data-i18n-title]").forEach(el => el.setAttribute("title", t(el.dataset.i18nTitle)));
  const brand = document.getElementById("brand");
  if (brand) brand.innerHTML = `${t("Follow the Money: Ukrainian Aid")}<span>${t("change since before the war")}</span>`;
  const sel = document.getElementById("lang");
  // the picker's label is read out in the chosen language and in English, so it can be found from any language
  if (sel) sel.setAttribute("aria-label", LANG === "en" ? "Language" : `${t("Language")} (Language)`);
}
// a script tag, not fetch, so it also works when the page is opened as a file; a failed load falls back to English
function loadLang(l) {
  if (l === "en" || I18N[l]) return Promise.resolve();
  return new Promise(done => {
    const s = document.createElement("script");
    s.src = `i18n/${l}.js`; s.onload = s.onerror = () => done();
    document.head.appendChild(s);
  });
}
function setLang(l) {
  if (!LANGS[l] || l === LANG) return;
  try { localStorage.setItem("lang", l); } catch (e) { /* storage blocked */ }
  // keep a shared ?lang= link in step with the choice
  try { const u = new URL(location.href); if (u.searchParams.has("lang")) { u.searchParams.set("lang", l); history.replaceState(null, "", u); } } catch (e) { /* file:// */ }
  loadLang(l).then(() => {
    LANG = l;
    applyStatic();
    if (window.onLangChange) window.onLangChange();
  });
}
(() => {
  const sel = document.getElementById("lang");
  if (sel) {
    sel.innerHTML = Object.entries(LANGS).map(([k, v]) => `<option value="${k}" lang="${k}"${k === LANG ? " selected" : ""}>${v}</option>`).join("");
    sel.onchange = () => setLang(sel.value);
  }
})();
// the page waits for this before its first render (see Load in index.html)
const I18N_READY = loadLang(LANG).then(applyStatic);
