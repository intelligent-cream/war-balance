// Round 60 (audit of the downloads, owner approved): the downloads beyond the map's own CSV export, and the guide to
// every column. seo_pages.mjs writes them into site/downloads/ with the other files and lists them on /downloads/:
//   war-balance-energy-cost.csv          the cost of replacing Russian energy and the discount gained on Russian oil
//                                        (outside the totals), per country, as the panel has them
//   war-balance-sources.csv              every source: id, title, type, its key document's address, date, documents
//   russia-budget-balance-yearly.csv     Russia's federal budget balance by year (russia_deficit_r59.json)
//   russia-budget-balance-monthly.csv    the same by month
//   russia-national-wealth-fund.csv      the National Wealth Fund, total and liquid assets, by date
//   war-balance-data-dictionary.csv/.md  every column of every CSV file: its unit and what it means
//   data-json-schema.md                  what data.json holds, key by key
//   SHA256SUMS.txt                       the SHA-256 checksum of every file, with its size
// Every column of every CSV file must be in the dictionary below: dictionary() stops the build when one is not, so a
// new column cannot go out undocumented (check 48 reads the files back too).
//
// Pure (no browser): pipeline/test_seo.mjs tests it.

import { createHash } from "node:crypto";

const q = v => (v === null || v === undefined || Number.isNaN(v) ? "" : typeof v === "number" ? String(+v.toFixed(6)) : typeof v === "boolean" ? String(v) : /[",\n]/.test(v) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
const row = a => a.map(q).join(",");

// ----- the extra CSV files -----
// countries: the map's extract (seo_extract.mjs, English): measures["part:prem"], measures["part:disc"] (the discount as
// a gain, above zero), period: the data's period in words
export function energyCsv(countries, period) {
  const head = ["iso3", "country", "period", "energy_switching_cost_eur_bn", "energy_switching_cost_low_eur_bn", "energy_switching_cost_high_eur_bn",
    "oil_discount_gained_eur_bn", "oil_discount_gained_low_eur_bn", "oil_discount_gained_high_eur_bn"];
  const lines = countries.slice().sort((a, b) => a.iso.localeCompare(b.iso)).filter(c => c.measures && (c.measures["part:prem"] || c.measures["part:disc"])).map(c => {
    const p = c.measures["part:prem"] || {}, d = c.measures["part:disc"] || {};
    return row([c.iso, c.nameEn, period, p.v ?? null, p.lo ?? null, p.hi ?? null, d.v ?? null, d.lo ?? null, d.hi ?? null]);
  });
  return [head.join(","), ...lines].join("\n");
}
// data.json sources: { id: { name, url, date, type, links: [{ url, key, ... }] } }
export function sourcesCsv(sources) {
  const head = ["id", "title", "type", "url", "date", "documents"];
  const lines = Object.keys(sources).sort().map(id => {
    const s = sources[id], links = s.links || [], key = links.find(x => x.key) || links[0];
    return row([id, s.name, s.type || "", (key && key.url) || s.url || "", s.date || "", links.length]);
  });
  return [head.join(","), ...lines].join("\n");
}
// russia_deficit_r59.json
export function budgetCsv(D) {
  const yearly = [["year", "months", "complete", "status", "revenue_rub_bn", "expenditure_rub_bn", "balance_rub_bn", "balance_eur_bn", "balance_pct_gdp", "non_oil_gas_balance_rub_bn", "gdp_rub_bn"].join(","),
    ...(D.yearly || []).map(y => row([y.year, y.months, !!y.complete, y.status || "", y.rev_rub, y.exp_rub, y.balance_rub, y.balance_eur, y.balance_pct_gdp, y.nonoil_balance_rub, y.gdp_rub_bn]))].join("\n");
  const monthly = [["month", "revenue_rub_bn", "expenditure_rub_bn", "balance_rub_bn", "balance_eur_bn", "non_oil_gas_balance_rub_bn", "balance_pct_annual_gdp", "eur_rub_monthly_average"].join(","),
    ...(D.monthly || []).map(m => row([m.ym, m.rev_rub, m.exp_rub, m.balance_rub, m.balance_eur, m.nonoil_balance_rub, m.balance_pct_annual_gdp, m.eur_rub_avg]))].join("\n");
  const nwf = [["as_of", "total_rub_bn", "liquid_rub_bn", "total_eur_bn", "liquid_eur_bn", "liquid_pct_gdp", "inflows_rub_bn", "withdrawals_rub_bn"].join(","),
    ...(D.nwf || []).map(x => row([x.as_of, x.total_rub_bn, x.liquid_rub_bn, x.total_eur_bn, x.liquid_eur_bn, x.liquid_pct_gdp, x.inflows_rub_bn, x.withdrawals_rub_bn]))].join("\n");
  return { yearly, monthly, nwf };
}

// ----- the dictionary: every column of every file, [column, unit, meaning] -----
const P = "the period of the file: 2022 to the data's last month, as the map shows it";
const SIGN = "above zero toward Ukraine, below zero toward Russia";
const RANGE = "the likely range (about 90%), from the parts' ranges combined";
const COUNTRY = [["iso3", "code", "the country's ISO 3166 alpha-3 code"], ["country", "text", "its English name, as the site writes it"]];
export const DICT = {
  "war-balance-countries.csv": [...COUNTRY,
    ["period", "text", P], ["net_of_flowback", "true/false", "whether money flowing back from the war effort is subtracted from support (the official figures: true)"],
    ["in_ranking", "true/false", "whether the country is in the map's ranking: an economy of €5bn of GDP or more with data of its own, not a party to the war"],
    ["rank_in_group", "number", "its number in the ranking where its net is very likely toward Ukraine (counted from the top) or toward Russia (1 = furthest toward Russia); empty otherwise"],
    ["group", "text", "its group in the map's ranking of the net: Toward Ukraine, Leaning toward Ukraine, Near zero, Essentially zero, Too close to call, Leaning toward Russia, Toward Russia; or Party to the war, No data"],
    ["no_data", "true/false", "no observation of its own for the war years (or only small rough estimates): not ranked, hatched on the map"],
    ["party_to_war", "true/false", "a party to the war on Russia's side (Belarus, North Korea): numbers shown, not ranked"],
    ["support_ukraine_eur_bn", "€ bn", "support for Ukraine: government aid (weapons at market value when delivered, loans at their gift value), its share of EU-level aid and of IMF, World Bank and EBRD lending, the public cost of hosting refugees, private donations, an estimate of undisclosed military aid and purchases from Ukraine against the no-war level, minus money flowing back to its own economy"],
    ["support_ukraine_low_eur_bn", "€ bn", "low end of " + RANGE], ["support_ukraine_high_eur_bn", "€ bn", "high end of " + RANGE],
    ["support_ukraine_pct_gdp", "% of GDP", "support for Ukraine as a share of one year's GDP (the 2022–2024 average)"],
    ["support_ukraine_chance_level", "text", "how sure its direction is: sure (very likely), lean (likely), unc (too close to call), near (near zero), zero (essentially zero); as on the map"],
    ["support_ukraine_direction_uncertain", "true/false", "whether the direction of support is not very likely"],
    ["trade_with_russia_toward_ukraine_eur_bn", "€ bn", "the change in Russia's earnings from trade with the country against a world without the war (taxes and profit above a normal return, not sales): " + SIGN + " (above zero: Russia kept less)"],
    ["trade_with_russia_toward_ukraine_low_eur_bn", "€ bn", "low end of " + RANGE], ["trade_with_russia_toward_ukraine_high_eur_bn", "€ bn", "high end of " + RANGE],
    ["trade_with_russia_toward_ukraine_pct_gdp", "% of GDP", "the same as a share of one year's GDP"],
    ["trade_with_russia_toward_ukraine_chance_level", "text", "how sure its direction is (sure, lean, unc, near, zero)"],
    ["trade_with_russia_toward_ukraine_direction_uncertain", "true/false", "whether its direction is not very likely"],
    ["trade_line_russias_gain_toward_ukraine_eur_bn", "€ bn", "the first of the trade number's two lines, Russia's own gain (what Russia kept from what it sold here, war-time prices, oil via other countries, services, taxes, its firms, arms, state projects, gold and hidden payments, weapons given to it): " + SIGN + "; the two lines add up to the trade number"],
    ["trade_line_russias_gain_toward_ukraine_low_eur_bn", "€ bn", "low end of this line's own range (the lines' ranges do not add up to the trade number's)"],
    ["trade_line_russias_gain_toward_ukraine_high_eur_bn", "€ bn", "high end of this line's own range"],
    ["trade_line_russias_gain_of_which_gas_cut_by_russia_eur_bn", "€ bn", "inside the first line, not beside it: the part of less fuel bought that was gas (or pipeline oil) Russia cut off itself or that stopped with the end of Ukraine's transit"],
    ["trade_line_own_gain_toward_ukraine_eur_bn", "€ bn", "the second line, the country's own gain from trade with Russia (its sales and services to Russia, the sanctions premium, shipping, payment agents, its firms' profits and stakes in Russia, weapons Russia paid for): " + SIGN + " (above zero: it kept less from Russia)"],
    ["trade_line_own_gain_toward_ukraine_low_eur_bn", "€ bn", "low end of this line's own range"], ["trade_line_own_gain_toward_ukraine_high_eur_bn", "€ bn", "high end of this line's own range"],
    ["russian_money_frozen_eur_bn_net_only", "€ bn", "the return Russia lost on its central-bank reserves and private assets frozen in the country; in the net only, not a payment"],
    ["russian_money_frozen_low_eur_bn_net_only", "€ bn", "low end of its range"], ["russian_money_frozen_high_eur_bn_net_only", "€ bn", "high end of its range"],
    ["russian_money_frozen_pct_gdp_net_only", "% of GDP", "the same as a share of one year's GDP"],
    ["russian_money_frozen_of_which_reserves_held_here_eur_bn", "€ bn", "inside Russian money frozen, not beside it: the return on central-bank reserves held in the country (at Euroclear and Clearstream, the host's share); empty where there is none"],
    ["russian_money_frozen_of_which_reserves_euroclear_clearstream_share_eur_bn", "€ bn", "inside Russian money frozen, not beside it: the country's share of the return on reserves held at Euroclear and Clearstream, allocated by share of EU aid (EU members); with the column before, the return on central-bank reserves"],
    ["net_shift_eur_bn", "€ bn", "the net: support for Ukraine + the trade number + Russian money frozen; " + SIGN],
    ["net_shift_low_eur_bn", "€ bn", "low end of " + RANGE], ["net_shift_high_eur_bn", "€ bn", "high end of " + RANGE],
    ["net_shift_pct_gdp", "% of GDP", "the net as a share of one year's GDP (the 2022–2024 average): the map's colour and ranking"],
    ["net_shift_eur_per_person", "€", "the net per person"],
    ["net_shift_chance_level", "text", "how sure the net's direction is (sure, lean, unc, near, zero), as on the map and in the ranking"],
    ["net_shift_direction_uncertain", "true/false", "whether the net's direction is not very likely"],
    ["net_shift_leaning", "text", "for a net that is not very likely: the side it leans to at a 65% chance or more (ukraine, russia), or empty"],
    ["net_shift_chance_toward_ukraine", "share 0–1", "the share of the simulation's draws in which the net is toward Ukraine (1 minus it: toward Russia)"],
    ["direction_note", "text", "where the middle value and the more likely side of the simulation differ: both, in words"],
    ["military_aid_allocated_not_yet_delivered_eur_bn", "€ bn", "military aid allocated but not delivered by the data's last month: not counted (the high end of aid takes it)"],
    ["refugees_hosted_not_counted_co_belligerent_eur_bn", "€ bn", "the cost of hosting refugees by a party to the war: shown, not counted as support"],
    ["remittances_from_russia_change_eur_bn_not_in_totals", "€ bn", "the change in migrants' money sent home from Russia against the no-war level: a marker, not in the totals"],
    ["remittances_from_russia_change_low_eur_bn_not_in_totals", "€ bn", "low end of its range"], ["remittances_from_russia_change_high_eur_bn_not_in_totals", "€ bn", "high end of its range"],
    ["remittances_from_russia_change_pct_gdp_not_in_totals", "% of GDP", "the same as a share of one year's GDP"],
    ["taken_by_russia_from_companies_eur_bn_not_in_totals", "€ bn", "what Russia took from the country's companies (seizures, forced discounts and exit fees): a marker, not in the totals"],
    ["taken_by_russia_from_companies_low_eur_bn_not_in_totals", "€ bn", "low end of its range"], ["taken_by_russia_from_companies_high_eur_bn_not_in_totals", "€ bn", "high end of its range"],
    ["taken_by_russia_from_companies_pct_gdp_not_in_totals", "% of GDP", "the same as a share of one year's GDP"],
    ["cost_to_the_country_eur_bn_not_shown_on_the_site", "€ bn", "the cost view (not shown on the site): aid with loans at grant equivalent, refugees, the extra paid to replace Russian energy minus the discount on Russian oil, income lost on sales to Russia, tariffs dropped, what Russia took"],
    ["cost_to_the_country_pct_gdp_not_shown_on_the_site", "% of GDP", "the same as a share of one year's GDP"],
    ["aid_kiel_eur_bn", "€ bn", "aid as recorded (the Kiel Institute's figures with its EU share, before the site's adjustments for market value, gift value and delivery)"],
    ["refugees_cost_eur_bn", "€ bn", "the public cost of hosting refugees counted as support (after the host's gain on their work)"],
    ["paid_to_russia_gross_eur_bn", "€ bn", "what the country paid Russia in all (purchases, oil via other countries, taxes, weapons, services, gold and hidden payments), not compared with a world without the war"],
    ["gdp_eur_bn_avg_2022_2024", "€ bn", "one year's GDP, the 2022–2024 average: the denominator of every share of GDP"],
    ["population_m", "million", "population"],
    ["figures", "text", "official, or which parts were switched off in a custom mix (the downloads hold the official figures)"]],
  "war-balance-parts.csv": [...COUNTRY, ["period", "text", P], ["net_of_flowback", "true/false", "whether money flowing back is subtracted (official: true)"],
    ["part", "code", "the part's key (back_ before money flowing back, taken_ before what Russia took, outside the totals); the parts add up to the net"],
    ["label", "text", "the part's technical label"], ["direction_label", "text", "the part as the panel names it, by its sign (for example: its companies made more profit in Russia)"],
    ["eur_bn", "€ bn", "the part's value: " + SIGN + " (in support, below zero is money it earned back or bought less from Ukraine than without the war)"],
    ["low_eur_bn", "€ bn", "low end of the part's likely range"], ["high_eur_bn", "€ bn", "high end of the part's likely range"],
    ["certainty", "A–D", "the part's letter: A reported, B measured estimate, C modelled estimate, D rough indication; capped by its sources (headline numbers have a chance instead)"],
    ["evidence", "text", "the best kind of source behind it: official, research, press, own"], ["sources", "codes", "the ids of its sources, as in war-balance-sources.csv"],
    ["figures", "text", "official, or the parts switched off in a custom mix"]],
  "war-balance-years.csv": [...COUNTRY, ["year", "year", "the year"], ["year_to_date", "true/false", "true for the year in progress (2026: January to the data's last month)"],
    ["support_ukraine_eur_bn", "€ bn", "that year's own support for Ukraine (a best estimate; ranges are for the totals)"],
    ["trade_with_russia_toward_ukraine_eur_bn", "€ bn", "that year's own change in Russia's earnings from trade: " + SIGN],
    ["frozen_return_lost_eur_bn", "€ bn", "that year's return Russia lost on frozen money"], ["net_shift_eur_bn", "€ bn", "that year's net: the three columns before it added up"]],
  "war-balance-energy-cost.csv": [...COUNTRY, ["period", "text", P],
    ["energy_switching_cost_eur_bn", "€ bn", "the extra paid to replace Russian energy (the volume replaced times the price premium, by fuel and month); outside the totals"],
    ["energy_switching_cost_low_eur_bn", "€ bn", "low end of its range"], ["energy_switching_cost_high_eur_bn", "€ bn", "high end of its range"],
    ["oil_discount_gained_eur_bn", "€ bn", "the discount gained by buying Russian oil below world prices, beyond Russia's pre-war discount; outside the totals"],
    ["oil_discount_gained_low_eur_bn", "€ bn", "low end of its range"], ["oil_discount_gained_high_eur_bn", "€ bn", "high end of its range"]],
  "war-balance-sources.csv": [["id", "code", "the source's id, as the parts file lists it"], ["title", "text", "the source's name"],
    ["type", "text", "data (official statistics), report, press, ours (the project's own model), notes (research notes)"], ["url", "address", "its key document"],
    ["date", "text", "its date or the date it was read"], ["documents", "number", "how many documents the source links"]],
  "war-balance-fuel-split.csv": [...COUNTRY, ["year", "year", "the year"], ["months", "number", "months in the year's figure"], ["fuel", "text", "crude, products, gas, LNG, coal or other goods"],
    ["site_basis_fob_eur_bn", "€ bn", "what the country bought from Russia on the map's basis (FOB, after reassigning fuel that hubs and refiners passed on)"],
    ["site_basis_low_eur_bn", "€ bn", "low end of its range"], ["site_basis_high_eur_bn", "€ bn", "high end of its range"],
    ["customs_cif_eur_bn", "€ bn", "the country's own customs records (CIF, freight included), before reassignment"], ["tracker_crea_eur_bn", "€ bn", "CREA's fossil fuel tracker"],
    ["quality", "A–D", "the figure's letter"]],
  "war-balance-military-split.csv": [...COUNTRY, ["military_eur_bn", "€ bn", "military aid as the site counts it: delivered, at market value"],
    ["military_low_eur_bn", "€ bn", "low end of its range"], ["military_high_eur_bn", "€ bn", "high end of its range"],
    ["military_record", "text", "recorded, or no record found (no military aid on record outside the Kiel tracker: not a zero)"],
    ["kiel_military_eur_bn", "€ bn", "the Kiel Institute's military figure"], ["military_pct_gdp", "% of GDP", "military aid as a share of one year's GDP"],
    ["financial_eur_bn", "€ bn", "financial aid, including the share of IMF, World Bank and EBRD lending"],
    ["financial_of_which_imf_world_bank_share_eur_bn", "€ bn", "inside financial aid: its share of IMF, World Bank and EBRD lending"],
    ["humanitarian_eur_bn", "€ bn", "humanitarian aid"], ["refugees_eur_bn", "€ bn", "the cost of hosting refugees counted as support"], ["eu_share_eur_bn", "€ bn", "its share of EU-level aid"],
    ["other_eur_bn", "€ bn", "private donations and purchases from Ukraine against the no-war level (negative where it bought less)"], ["flowback_eur_bn", "€ bn", "money flowing back to its own economy (below zero)"],
    ["support_total_eur_bn", "€ bn", "support for Ukraine: the columns of types added up, the map's figure"], ["basis", "text", "kiel (the Kiel tracker), or the other records used"], ["quality", "A–D", "the figure's letter"]],
  "russia-oil-gas-revenue-monthly.csv": [["month", "year-month", "the month"], ["oil_gas_revenue_rub_bn", "RUB bn", "federal budget oil and gas revenue (Ministry of Finance)"],
    ["oil_gas_revenue_eur_bn", "€ bn", "the same in euros at the month's average rate"], ["oil_gas_revenue_usd_bn", "$ bn", "the same in dollars"],
    ["federal_revenue_rub_bn", "RUB bn", "all federal budget revenue"], ["federal_revenue_eur_bn", "€ bn", "the same in euros"], ["oil_gas_share", "share 0–1", "oil and gas revenue over all federal revenue"],
    ["eur_rub_monthly_average", "RUB per €", "the Bank of Russia's average rate"], ["usd_rub_monthly_average", "RUB per $", "the Bank of Russia's average rate"]],
  "russia-oil-gas-revenue-yearly.csv": [["year", "year", "the year"], ["months", "number", "months in the figure"], ["complete", "true/false", "a full year"],
    ["oil_gas_revenue_rub_bn", "RUB bn", "federal budget oil and gas revenue"], ["oil_gas_revenue_eur_bn", "€ bn", "the same in euros"], ["oil_gas_revenue_usd_bn", "$ bn", "the same in dollars"],
    ["federal_revenue_rub_bn", "RUB bn", "all federal revenue"], ["federal_revenue_eur_bn", "€ bn", "the same in euros"], ["oil_gas_share", "share 0–1", "oil and gas over all federal revenue"],
    ["crea_fossil_export_eur_bn_estimate", "€ bn", "CREA's estimate of Russia's fossil fuel export revenue"], ["crea_oil_gas_export_eur_bn_estimate", "€ bn", "CREA's estimate for oil and gas"],
    ["national_defence_spent_rub_bn", "RUB bn", "federal spending on national defence, executed"], ["national_defence_budget_law_rub_bn", "RUB bn", "the same in the year's budget law"],
    ["sipri_military_spending_rub_bn", "RUB bn", "SIPRI's estimate of military spending"], ["sipri_military_share_gdp", "share 0–1", "SIPRI's estimate as a share of GDP"]],
  "russia-budget-balance-yearly.csv": [["year", "year", "the year"], ["months", "number", "months in the figure"], ["complete", "true/false", "a full year"], ["status", "text", "execution, or the kind of figure"],
    ["revenue_rub_bn", "RUB bn", "federal budget revenue"], ["expenditure_rub_bn", "RUB bn", "federal budget expenditure"], ["balance_rub_bn", "RUB bn", "revenue minus expenditure (below zero: a deficit)"],
    ["balance_eur_bn", "€ bn", "the same in euros"], ["balance_pct_gdp", "share 0–1", "the balance over the year's GDP"], ["non_oil_gas_balance_rub_bn", "RUB bn", "the balance without oil and gas revenue"], ["gdp_rub_bn", "RUB bn", "the year's GDP"]],
  "russia-budget-balance-monthly.csv": [["month", "year-month", "the month"], ["revenue_rub_bn", "RUB bn", "the month's federal revenue"], ["expenditure_rub_bn", "RUB bn", "the month's expenditure"],
    ["balance_rub_bn", "RUB bn", "the month's balance"], ["balance_eur_bn", "€ bn", "the same in euros"], ["non_oil_gas_balance_rub_bn", "RUB bn", "the balance without oil and gas"],
    ["balance_pct_annual_gdp", "share 0–1", "the month's balance over the year's GDP"], ["eur_rub_monthly_average", "RUB per €", "the Bank of Russia's average rate"]],
  "russia-national-wealth-fund.csv": [["as_of", "date", "the date of the figure"], ["total_rub_bn", "RUB bn", "the fund's total assets"], ["liquid_rub_bn", "RUB bn", "its liquid assets"],
    ["total_eur_bn", "€ bn", "total assets in euros at that date's rate"], ["liquid_eur_bn", "€ bn", "liquid assets in euros"], ["liquid_pct_gdp", "share 0–1", "liquid assets over GDP"],
    ["inflows_rub_bn", "RUB bn", "money paid into the fund in the month before"], ["withdrawals_rub_bn", "RUB bn", "money taken out in the month before"]],
  "war-balance-data-dictionary.csv": [["file", "text", "the file"], ["column", "text", "the column"], ["unit", "text", "its unit"], ["description", "text", "what it holds"]],
};
// files: [[name, text]]; every CSV's header must be in DICT. Returns the dictionary as CSV and Markdown
export function dictionary(files) {
  const csvs = files.filter(([f]) => f.endsWith(".csv"));
  for (const [f, text] of csvs) {
    const d = DICT[f];
    if (!d) throw new Error(`seo_downloads.mjs: ${f} has no entry in DICT`);
    const head = text.replace(/^﻿/, "").split("\n")[0].split(",");
    const missing = head.filter(h => !d.some(x => x[0] === h)), extra = d.filter(x => !head.includes(x[0])).map(x => x[0]);
    if (missing.length || extra.length) throw new Error(`seo_downloads.mjs: ${f}: columns not in DICT ${missing.join(" ")}; in DICT, not in the file ${extra.join(" ")}`);
  }
  const all = [...csvs.map(([f]) => f), "war-balance-data-dictionary.csv"];
  const csv = ["file,column,unit,description", ...all.flatMap(f => DICT[f].map(([c, u, d]) => row([f, c, u, d])))].join("\n");
  const md = ["# War Balance downloads: data dictionary", "", "Every column of every CSV file in /downloads/: its unit and what it holds. Amounts are totals for 2022 to the data's last month unless a column says otherwise; a share of GDP is against one year's GDP (the 2022–2024 average); " + SIGN + " unless a column says otherwise.", "",
    ...all.flatMap(f => [`## ${f}`, "", "| Column | Unit | Description |", "| --- | --- | --- |", ...DICT[f].map(([c, u, d]) => `| ${c} | ${u} | ${d.replace(/\|/g, "\\|")} |`), ""])].join("\n");
  return { csv, md };
}

// ----- data.json, key by key -----
const TOP = {
  generated: "the date the file was built", data_to: "the data's last month (YYYY-MM-DD)", years: "the years of every series: 2021 (the year before the war, the comparison year) to 2026",
  frac: "the share of each year the data cover (2026: January to August)", meta: "constants of the model (tariff rate, the fallback margin, the common refugee cost per person-year)",
  status_html: "the map's status line", sources: "every source by id: name, url, date, type (data, report, press, ours, notes) and its documents (links, with key documents marked)",
  countries: "every country and territory by ISO 3166 alpha-3 code (below)", included_in: "territories counted in another country's figures (code: the code of the country that holds them)",
};
const KEYS = {
  n: "the shape's id in countries-50m.json", iso3: "ISO 3166 alpha-3 code", name: "English name in the data (the site writes some differently: Türkiye, Vatican City)", kind: "country or territory",
  pop: "population, millions", gdp: "one year's GDP, € bn (2022–2024 average)", gdp_2024: "GDP in 2024, € bn (a method-band alternative)",
  to_rus: "purchases from Russia: yearly values (€ bn, years[0] = 2021), ranges, the no-war baseline and price indices, Russia's gain shares and the laundered-oil inputs",
  from_rus: "sales to Russia: yearly values, ranges and baseline", buy_ukr: "purchases from Ukraine", sell_ukr: "sales to Ukraine",
  aid: "aid to Ukraine: Kiel figures by year and category, the EU share, loans and their gift value, weapons at market value, aid not yet delivered, refugee costs and the host's gain on refugees' work",
  people: "people: refugees from Ukraine hosted (count and date)", energy: "the extra paid to replace Russian energy and the discount on Russian oil (outside the totals)",
  laund: "fuel made from Russian crude bought via other countries", hub: "a trade hub's note (re-exports, fuel trading, gold)", company: "taxes its companies pay in Russia",
  svc_bought: "services bought from Russia", svc_sold: "services sold to Russia", svc_ukr: "extra services sold to Ukraine", hidden: "gold and hidden payments to Russia",
  undisclosed: "undisclosed military aid (estimate)", private: "private donations to Ukraine", flowback: "money flowing back from the war effort (aid spent at home, others' aid spent here, arms Ukraine bought here)",
  shipping: "shipping and insuring Russian oil", extra: "parts without a series of their own (company profits in Russia, the sanctions premium, Russian-owned firms, arms bought from Russia, state projects, IMF/World Bank share, frozen money, Russian forces, payment agents); the frozen reserves part also carries own (the return on reserves held in the country) and eu (its share of the return on reserves held at Euroclear and Clearstream, allocated by share of EU aid), which add up to it",
  windfall: "the war-time fuel price premium paid to Russia", taken: "what Russia took from the country's companies (outside the totals)", chpl: "goods Russia's weapons need (a marker)",
  vk: "the share of money earned that is kept in the economy and genuinely extra, by kind of earning", ng_own: "the country's own net gain on its sales", no_data: "parts with no observation of the country's own for the war years",
  military_rus: "weapons and troops sent to Russia, and the share Russia paid for", sanctions: "how much of the cut in trade sanctions required, by flow", remit: "migrants' money sent home from Russia (a marker)",
  rusforces: "years Russian forces (Wagner, Africa Corps) operated here", party_to_war: "why it is a party to the war, with sources", ref_excluded: "refugees hosted by a party to the war (not counted)",
  pipeline_exempt: "the EU pipeline-oil exemption it used (a label)", dual_use_note: "dual-use goods inside its exports to Russia (already counted)", tariff_waiver: "import tariffs dropped for Ukraine",
  rusGain: "Russia's own gain, the first line of the trade number, by year (years) and cumulative with its range (cum: [middle, low, high] to each year), € bn, + toward Ukraine",
  ownGain: "the country's own gain from trade with Russia, the second line, in the same form", windfall_band: "the windfall's band", included: "territories it holds",
};
export function schemaMd(data) {
  const cs = Object.values(data.countries || {}), n = cs.length, keys = {};
  for (const c of cs) for (const [k, v] of Object.entries(c)) { const e = keys[k] || (keys[k] = { n: 0, type: Array.isArray(v) ? "array" : v === null ? "null" : typeof v }); e.n++; }
  const lines = ["# data.json: what it holds", "", "The file the map runs on (CC BY 4.0, credit War Balance). Amounts are € bn unless a key says otherwise; yearly series run from 2021 (index 0, the year before the war) to 2026; + is toward Ukraine. detail.json holds the data-coverage notes and the method band's rebuilt alternatives. The pipeline's own notes on each field: docs/reference/pipeline.md in the repository.", "",
    "## Top level", "", "| Key | What it holds |", "| --- | --- |", ...Object.keys(data).map(k => `| ${k} | ${TOP[k] || "see docs/reference/pipeline.md"} |`), "",
    `## countries.<ISO3> (${n} entries)`, "", "| Key | Type | Entries with it | What it holds |", "| --- | --- | --- | --- |",
    ...Object.keys(keys).sort().map(k => `| ${k} | ${keys[k].type} | ${keys[k].n} | ${KEYS[k] || "see docs/reference/pipeline.md"} |`), ""];
  return lines.join("\n");
}

// ----- checksums -----
export const sha256 = text => createHash("sha256").update(text).digest("hex");
export function sumsTxt(files) {
  return files.map(([f, text]) => `${sha256(text)}  ${f}`).join("\n") + "\n";
}
