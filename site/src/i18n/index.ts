/**
 * Translations. Every visible string goes through `tr()`, keyed by its English
 * text, so a missing translation simply shows the English.
 *
 * The language follows where the visitor is: `?lang=` or a saved choice wins,
 * then the region implied by the time zone (someone in Berlin gets German even
 * with an English browser), then the browser's own languages, then English.
 * Only the chosen language's file is downloaded, before the app renders.
 * The song is never translated.
 */

export const LANGS = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  it: 'Italiano',
  pt: 'Português',
  nl: 'Nederlands',
  pl: 'Polski',
  ja: '日本語',
  ko: '한국어',
  zh: '中文',
} as const;
export type Lang = keyof typeof LANGS;
const isLang = (v: string | null | undefined): v is Lang => !!v && v in LANGS;

/** Time zones → the languages spoken there (first one wins unless the browser prefers another). */
const REGIONS: [RegExp, Lang[]][] = [
  [/^Europe\/(Berlin|Vienna|Busingen|Vaduz)$/, ['de']],
  [/^Europe\/Zurich$/, ['de', 'fr', 'it']],
  [/^Europe\/Luxembourg$/, ['fr', 'de']],
  [/^Europe\/Brussels$/, ['nl', 'fr', 'de']],
  [/^Europe\/(Paris|Monaco)$|^Africa\/(Abidjan|Dakar|Kinshasa|Douala|Libreville|Bamako|Niamey|Ouagadougou|Lome|Porto-Novo|Conakry)$|^Indian\/Reunion$|^America\/(Martinique|Guadeloupe|Cayenne)$|^Pacific\/(Tahiti|Noumea)$/, ['fr']],
  [/^Europe\/Madrid$|^Atlantic\/Canary$|^Africa\/Ceuta$|^America\/(Mexico_City|Cancun|Merida|Monterrey|Matamoros|Chihuahua|Ciudad_Juarez|Ojinaga|Hermosillo|Mazatlan|Bahia_Banderas|Tijuana|Bogota|Lima|Santiago|Punta_Arenas|Caracas|Montevideo|Asuncion|La_Paz|Guayaquil|Guatemala|El_Salvador|Tegucigalpa|Managua|Costa_Rica|Panama|Havana|Santo_Domingo|Puerto_Rico|Argentina\/.+|Buenos_Aires|Cordoba|Mendoza)$/, ['es']],
  [/^Europe\/(Rome|San_Marino|Vatican)$/, ['it']],
  [/^Europe\/Lisbon$|^Atlantic\/(Madeira|Azores)$|^America\/(Sao_Paulo|Bahia|Fortaleza|Recife|Belem|Manaus|Cuiaba|Campo_Grande|Porto_Velho|Boa_Vista|Rio_Branco|Maceio|Araguaina|Santarem|Noronha|Eirunepe)$|^Africa\/(Luanda|Maputo)$/, ['pt']],
  [/^Europe\/Amsterdam$|^America\/(Paramaribo|Curacao|Aruba)$/, ['nl']],
  [/^Europe\/Warsaw$/, ['pl']],
  [/^Asia\/Tokyo$/, ['ja']],
  [/^Asia\/Seoul$/, ['ko']],
  [/^Asia\/(Shanghai|Chongqing|Chungking|Harbin|Urumqi|Kashgar)$|^PRC$/, ['zh']],
];

const browserLangs = () =>
  (navigator.languages?.length ? navigator.languages : [navigator.language]).map((l) => (l || '').toLowerCase().split('-')[0]);

export function detectLang(): Lang {
  const fromUrl = new URLSearchParams(window.location.search).get('lang');
  if (isLang(fromUrl)) return fromUrl;
  try {
    const saved = localStorage.getItem('lang');
    if (isLang(saved)) return saved;
  } catch {
    /* storage unavailable */
  }
  const browser = browserLangs();
  let tz = '';
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch {
    /* no Intl */
  }
  for (const [re, langs] of REGIONS) {
    if (re.test(tz)) return langs.find((l) => browser.includes(l)) ?? langs[0];
  }
  return browser.find(isLang) ?? 'en';
}

let dict: Record<string, string> = {};
export let lang: Lang = 'en';

const loaders = import.meta.glob<{ default: Record<string, string> }>('./locales/*.ts');

/** Load a language before the app imports (module-level strings translate at import time). */
export async function loadLang(l: Lang) {
  lang = l;
  document.documentElement.lang = l;
  if (l === 'en') return;
  const load = loaders[`./locales/${l}.ts`];
  if (!load) return;
  try {
    dict = (await load()).default;
  } catch {
    dict = {}; // offline or a bad deploy: English it is
  }
}

/** Translate a string; `{name}` placeholders are filled from `vars`. */
export function tr(s: string, vars?: Record<string, string | number>) {
  let out = dict[s] ?? s;
  if (vars) for (const k in vars) out = out.split(`{${k}}`).join(String(vars[k]));
  return out;
}

/** A number in the visitor's format: 3.8 reads 3,8 in German. */
export function num(v: number, decimals = 0) {
  return new Intl.NumberFormat(lang, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(v);
}

/** Switch language: remember it and reload so every string re-renders. */
export function setLang(l: Lang) {
  try {
    localStorage.setItem('lang', l);
  } catch {
    /* storage unavailable */
  }
  const url = new URL(window.location.href);
  url.searchParams.delete('lang');
  window.location.replace(url.toString());
}
