// Weather Station dashboard: the `weather-station-dashboard-card` Lovelace card
// and the `weather-station-panel` sidebar panel that shows it full page.

const WSD_TEXT = {
  fr: {
    name: "Tableau de bord météo",
    description: "Tous les relevés de votre station météo et leurs graphiques sur 24 heures, 7 jours ou 30 jours.",
    panelTitle: "Météo",
    alerts: { frost: "Risque de gel", strong_wind: "Vent fort" },
    forecast: "Prévisions",
    forecastFrom: (source) => `d'après ${source}`,
    today: "Aujourd'hui",
    rainChance: (value) => `${value} %`,
    forecastLabel: (day, condition, high, low, rain) => `${day} : ${condition}, ${high} / ${low}, pluie ${rain}`,
    conditions: {
      "clear-night": "Nuit dégagée", cloudy: "Nuageux", exceptional: "Exceptionnel", fog: "Brouillard",
      hail: "Grêle", lightning: "Orages", "lightning-rainy": "Orages et pluie", partlycloudy: "Partiellement nuageux",
      pouring: "Averses", rainy: "Pluvieux", snowy: "Neige", "snowy-rainy": "Neige et pluie", sunny: "Ensoleillé",
      windy: "Venteux", "windy-variant": "Venteux et nuageux",
    },
    noStation: "Aucune station Weather Station trouvée. Ajoutez l'intégration dans Paramètres › Appareils et services.",
    notFound: (entity) => `Station introuvable : ${entity}`,
    periods: { "24h": "24 h", "7d": "7 jours", "30d": "30 jours" },
    periodLabel: "Période des graphiques",
    raining: "Il pleut",
    dry: "Pas de pluie",
    lastRain: (age) => `dernière pluie ${age}`,
    noRainYet: "aucune pluie enregistrée",
    justNow: "à l’instant",
    minutesAgo: (n) => `il y a ${n} min`,
    hoursAgo: (n) => `il y a ${n} h`,
    daysAgo: (n) => `il y a ${n} j`,
    temperature: "Température",
    feels_like: "Ressenti",
    dew_point: "Point de rosée",
    humidity: "Humidité",
    pressure: "Pression",
    wind: "Vent",
    wind_speed: "Vent moyen",
    wind_gust: "Rafales",
    wind_direction: "Direction",
    windFrom: (cardinal) => `du ${cardinal}`,
    windOrigin: "Provenance",
    wind_lull: "Accalmie",
    calm: "Calme",
    calmShare: (share) => `Calme ${share}`,
    meanSpeed: "Vitesse moyenne",
    compare: "Comparer avec hier",
    yesterday: "Hier",
    speedScale: "Échelle de vitesse",
    night: "Nuit",
    windChartLabel: (mean, gust) => `Vent : moyenne jusqu'à ${mean}, rafales jusqu'à ${gust}`,
    rain: "Pluie",
    rainToday: "Aujourd'hui",
    rainRate: "Intensité",
    rainWeek: "Semaine",
    rainMonth: "Mois",
    rainYear: "Année",
    rainTotal: (value) => `${value} mm sur la période`,
    rainByMonth: (year) => `Pluie par mois en ${year}`,
    uv_index: "Indice UV",
    illuminance: "Luminosité",
    solar_radiation: "Rayonnement solaire",
    battery: "Batterie du pluviomètre",
    windRose: "Rose des vents",
    windRoseSpan: (days) => (days > 1 ? `Fréquence des directions sur ${days} jours` : "Fréquence des directions sur 24 h"),
    minMax: (min, max) => `min. ${min} · max. ${max} (24 h)`,
    trend: { rising: "En hausse", falling: "En baisse", stable: "Stable" },
    trendIn3h: (delta) => `${delta} en 3 h`,
    beaufort: [
      "Calme", "Très légère brise", "Légère brise", "Petite brise", "Jolie brise", "Bonne brise",
      "Vent frais", "Grand frais", "Coup de vent", "Fort coup de vent", "Tempête", "Violente tempête", "Ouragan",
    ],
    force: (n, name) => `Force ${n} · ${name}`,
    uvLevels: { low: "Faible", moderate: "Modéré", high: "Élevé", very_high: "Très élevé", extreme: "Extrême" },
    loading: "Chargement des données…",
    noData: "Pas encore de données pour cette période.",
    loadError: "Impossible de charger l'historique.",
    chartLabel: (title, min, max, last) => `${title} : de ${min} à ${max}, dernière valeur ${last}`,
    rainChartLabel: (total) => `Pluie : ${total} mm sur la période`,
    roseLabel: (cardinal, share) => `Vent dominant du ${cardinal} (${share} % du temps)`,
    share: (value) => `${value} % du temps`,
    editor: { entity: "Station", title: "Titre (facultatif)", period: "Période par défaut" },
  },
  en: {
    name: "Weather dashboard",
    description: "All the readings of your weather station and their charts over 24 hours, 7 days or 30 days.",
    panelTitle: "Weather",
    alerts: { frost: "Frost risk", strong_wind: "Strong wind" },
    forecast: "Forecast",
    forecastFrom: (source) => `from ${source}`,
    today: "Today",
    rainChance: (value) => `${value}%`,
    forecastLabel: (day, condition, high, low, rain) => `${day}: ${condition}, ${high} / ${low}, rain ${rain}`,
    conditions: {
      "clear-night": "Clear night", cloudy: "Cloudy", exceptional: "Exceptional", fog: "Fog",
      hail: "Hail", lightning: "Lightning", "lightning-rainy": "Lightning, rainy", partlycloudy: "Partly cloudy",
      pouring: "Pouring", rainy: "Rainy", snowy: "Snowy", "snowy-rainy": "Snowy, rainy", sunny: "Sunny",
      windy: "Windy", "windy-variant": "Windy, cloudy",
    },
    noStation: "No Weather Station found. Add the integration in Settings › Devices & services.",
    notFound: (entity) => `Station not found: ${entity}`,
    periods: { "24h": "24 h", "7d": "7 days", "30d": "30 days" },
    periodLabel: "Chart period",
    raining: "Raining",
    dry: "No rain",
    lastRain: (age) => `last rain ${age}`,
    noRainYet: "no rain recorded yet",
    justNow: "just now",
    minutesAgo: (n) => `${n} min ago`,
    hoursAgo: (n) => `${n} h ago`,
    daysAgo: (n) => `${n} d ago`,
    temperature: "Temperature",
    feels_like: "Feels like",
    dew_point: "Dew point",
    humidity: "Humidity",
    pressure: "Pressure",
    wind: "Wind",
    wind_speed: "Mean wind",
    wind_gust: "Gusts",
    wind_direction: "Direction",
    windFrom: (cardinal) => `from ${cardinal}`,
    windOrigin: "From",
    wind_lull: "Lull",
    calm: "Calm",
    calmShare: (share) => `Calm ${share}`,
    meanSpeed: "Mean speed",
    compare: "Compare with yesterday",
    yesterday: "Yesterday",
    speedScale: "Speed scale",
    night: "Night",
    windChartLabel: (mean, gust) => `Wind: mean up to ${mean}, gusts up to ${gust}`,
    rain: "Rain",
    rainToday: "Today",
    rainRate: "Rate",
    rainWeek: "Week",
    rainMonth: "Month",
    rainYear: "Year",
    rainTotal: (value) => `${value} mm over the period`,
    rainByMonth: (year) => `Rain per month in ${year}`,
    uv_index: "UV index",
    illuminance: "Illuminance",
    solar_radiation: "Solar radiation",
    battery: "Rain gauge battery",
    windRose: "Wind rose",
    windRoseSpan: (days) => (days > 1 ? `Direction frequency over ${days} days` : "Direction frequency over 24 h"),
    minMax: (min, max) => `min ${min} · max ${max} (24 h)`,
    trend: { rising: "Rising", falling: "Falling", stable: "Steady" },
    trendIn3h: (delta) => `${delta} in 3 h`,
    beaufort: [
      "Calm", "Light air", "Light breeze", "Gentle breeze", "Moderate breeze", "Fresh breeze",
      "Strong breeze", "Near gale", "Gale", "Strong gale", "Storm", "Violent storm", "Hurricane force",
    ],
    force: (n, name) => `Force ${n} · ${name}`,
    uvLevels: { low: "Low", moderate: "Moderate", high: "High", very_high: "Very high", extreme: "Extreme" },
    loading: "Loading data…",
    noData: "No data for this period yet.",
    loadError: "Could not load the history.",
    chartLabel: (title, min, max, last) => `${title}: from ${min} to ${max}, last value ${last}`,
    rainChartLabel: (total) => `Rain: ${total} mm over the period`,
    roseLabel: (cardinal, share) => `Prevailing wind from ${cardinal} (${share}% of the time)`,
    share: (value) => `${value}% of the time`,
    editor: { entity: "Station", title: "Title (optional)", period: "Default period" },
  },
};

const WSD_PERIODS = {
  "24h": { ms: 24 * 3600 * 1000, statistics: null, rain: "hour" },
  "7d": { ms: 7 * 24 * 3600 * 1000, statistics: "hour", rain: "day" },
  "30d": { ms: 30 * 24 * 3600 * 1000, statistics: "day", rain: "day" },
};
// The wind rose replays raw history, kept 10 days by default by the recorder.
const WSD_ROSE_MAX_MS = 7 * 24 * 3600 * 1000;
const WSD_REFRESH_MS = 5 * 60 * 1000;
const WSD_CARDINALS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
const WSD_BEAUFORT_KMH = [1, 6, 12, 20, 29, 39, 50, 62, 75, 89, 103, 118];
const WSD_TO_KMH = { "km/h": 1, "m/s": 3.6, mph: 1.609344, kn: 1.852, "ft/s": 1.09728 };
// Wind chart: one bar of mean wind per bucket, its gust on top, its direction below.
const WSD_WIND_BUCKETS = { "24h": 30 * 60 * 1000, "7d": 3 * 3600 * 1000, "30d": 24 * 3600 * 1000 };
// At most this many direction arrows, so they stay readable on a phone.
const WSD_MAX_ARROWS = 24;
// Wind classes by mean speed (km/h, Beaufort limits): calm, F1-2, F3, F4, F5, F6, F7 and more.
const WSD_WIND_CLASSES_KMH = [1, 12, 20, 29, 39, 50];
const WSD_DAY_MS = 24 * 3600 * 1000;
// Line charts, in display order: the series of each chart in fixed slot order.
const WSD_LINE_CHARTS = [
  { key: "temperature", series: ["temperature", "feels_like", "dew_point"] },
  { key: "humidity", series: ["humidity"], min: 0, max: 100 },
  { key: "pressure", series: ["pressure"] },
  { key: "wind", series: ["wind_speed", "wind_gust", "wind_lull"], min: 0 },
  { key: "uv_index", series: ["uv_index"], min: 0 },
  { key: "illuminance", series: ["illuminance"], min: 0 },
  { key: "solar_radiation", series: ["solar_radiation"], min: 0 },
];
const WSD_DIGITS = {
  temperature: 1, feels_like: 1, dew_point: 1, humidity: 0, pressure: 0, wind_speed: 0, wind_gust: 0, wind_lull: 0,
  uv_index: 1, illuminance: 0, solar_radiation: 0, rain: 1,
};
const WSD_NUMERIC = Object.keys(WSD_DIGITS).filter((key) => key !== "rain");
const WSD_FORECAST_DAYS = 5;
// WeatherEntityFeature.FORECAST_DAILY
const WSD_FORECAST_DAILY = 1;
const WSD_CONDITION_ICONS = {
  "clear-night": "mdi:weather-night", cloudy: "mdi:weather-cloudy", exceptional: "mdi:alert-circle-outline",
  fog: "mdi:weather-fog", hail: "mdi:weather-hail", lightning: "mdi:weather-lightning",
  "lightning-rainy": "mdi:weather-lightning-rainy", partlycloudy: "mdi:weather-partly-cloudy",
  pouring: "mdi:weather-pouring", rainy: "mdi:weather-rainy", snowy: "mdi:weather-snowy",
  "snowy-rainy": "mdi:weather-snowy-rainy", sunny: "mdi:weather-sunny", windy: "mdi:weather-windy",
  "windy-variant": "mdi:weather-windy-variant",
};
// Wind in m/s or knots needs a decimal (3.6 m/s), not in km/h or mph.
const WSD_FINE_WIND_UNITS = ["m/s", "kn", "ft/s"];

function wsdDigits(key, unit) {
  if (["wind_speed", "wind_gust", "wind_lull"].includes(key) && WSD_FINE_WIND_UNITS.includes(unit)) return 1;
  return WSD_DIGITS[key] ?? 1;
}

// ---------------------------------------------------------------- helpers

function wsdLanguage(hass) {
  const language = String(hass?.locale?.language || hass?.language || "fr").toLowerCase();
  return language.startsWith("fr") ? "fr" : "en";
}

function wsdPageLanguage() {
  const lang = typeof document !== "undefined" ? document.documentElement?.lang : "";
  return wsdLanguage({ language: lang || "fr" });
}

function wsdEscape(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

function wsdFinite(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function wsdNumber(value, language, digits = 1) {
  const number = wsdFinite(value);
  if (number === null) return "—";
  return number.toLocaleString(language === "fr" ? "fr-FR" : "en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function wsdWithUnit(value, unit, language, digits) {
  const text = wsdNumber(value, language, digits);
  if (text === "—" || !unit) return text;
  return unit === "%" || unit === "°" ? `${text}${language === "fr" && unit === "%" ? " " : ""}${unit}` : `${text} ${unit}`;
}

/** Degrees [0, 360) from degrees or a compass point (N, NNE…, French O for W). */
function wsdParseDirection(value) {
  const number = wsdFinite(value);
  if (number !== null) return ((number % 360) + 360) % 360;
  if (typeof value !== "string") return null;
  const name = value.trim().toUpperCase().replace(/O/g, "W");
  const index = WSD_CARDINALS.indexOf(name);
  return index < 0 ? null : index * 22.5;
}

function wsdCardinal(degrees, language) {
  const value = wsdFinite(degrees);
  if (value === null) return "—";
  const name = WSD_CARDINALS[Math.round((((value % 360) + 360) % 360) / 22.5) % 16];
  return language === "fr" ? name.replace(/W/g, "O") : name;
}

function wsdBeaufort(speed, unit) {
  const value = wsdFinite(speed);
  const factor = WSD_TO_KMH[unit || "km/h"];
  if (value === null || !factor) return null;
  const kmh = value * factor;
  const force = WSD_BEAUFORT_KMH.findIndex((limit) => kmh < limit);
  return force < 0 ? 12 : force;
}

function wsdUvLevel(uv) {
  const value = wsdFinite(uv);
  if (value === null) return null;
  if (value < 3) return "low";
  if (value < 6) return "moderate";
  if (value < 8) return "high";
  if (value < 11) return "very_high";
  return "extreme";
}

function wsdAge(iso, T, now = Date.now()) {
  const time = Date.parse(iso);
  if (!Number.isFinite(time)) return null;
  const minutes = Math.max(0, Math.floor((now - time) / 60000));
  if (minutes < 1) return T.justNow;
  if (minutes < 60) return T.minutesAgo(minutes);
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return T.hoursAgo(hours);
  return T.daysAgo(Math.floor(hours / 24));
}

function wsdMs(timestamp) {
  const value = wsdFinite(timestamp);
  if (value === null) return null;
  // The websockets answer in seconds (history) or milliseconds (statistics).
  return value < 1e12 ? value * 1000 : value;
}

/**
 * Points {t (ms), v} of an entity in a history/history_during_period answer:
 * {entity_id: [{s, lu, lc}]}, timestamps in seconds. Non-numeric states give
 * v = null, which breaks the line.
 */
function wsdHistoryPoints(answer, entityId, parse = wsdFinite) {
  return (answer?.[entityId] || [])
    .map((state) => ({ t: wsdMs(state.lu ?? state.lc), v: parse(state.s) }))
    .filter((point) => point.t !== null)
    .sort((a, b) => a.t - b.t);
}

/** Points {t, v, min, max, change} of a recorder/statistics_during_period answer. */
function wsdStatisticsPoints(answer, statisticId) {
  return (answer?.[statisticId] || [])
    .map((row) => ({
      t: wsdMs(row.start),
      v: wsdFinite(row.mean ?? row.state),
      min: wsdFinite(row.min),
      max: wsdFinite(row.max),
      change: wsdFinite(row.change),
    }))
    .filter((point) => point.t !== null)
    .sort((a, b) => a.t - b.t);
}

/**
 * Points of the source sensor completed by those of the station's own copy:
 * the source keeps its older statistics, the copy fills in what the source
 * does not record (no state_class) or no longer records (sensor replaced).
 */
function wsdMergePoints(primary, secondary) {
  const times = new Set(primary.map((point) => point.t));
  return [...primary, ...secondary.filter((point) => !times.has(point.t))].sort((a, b) => a.t - b.t);
}

function wsdMinMax(points, since = -Infinity) {
  const values = points.filter((point) => point.t >= since && point.v !== null).map((point) => point.v);
  return values.length ? { min: Math.min(...values), max: Math.max(...values) } : null;
}

/** Value change over `hours`: latest value minus the value in force `hours` ago. */
function wsdTrend(points, hours, now = Date.now()) {
  const valid = points.filter((point) => point.v !== null);
  if (valid.length < 2) return null;
  const target = now - hours * 3600 * 1000;
  const before = [...valid].reverse().find((point) => point.t <= target) || valid[0];
  if (valid[valid.length - 1].t - before.t < (hours * 3600 * 1000) / 2) return null;
  return valid[valid.length - 1].v - before.v;
}

/**
 * Share of time (%) the wind blew from each of the 16 compass points, from
 * direction history points (a reading lasts until the next one).
 */
function wsdWindRose(points, end = Date.now()) {
  const durations = new Array(16).fill(0);
  points.forEach((point, index) => {
    if (point.v === null) return;
    const next = index + 1 < points.length ? points[index + 1].t : end;
    const duration = Math.max(next - point.t, 0);
    durations[Math.round(point.v / 22.5) % 16] += duration;
  });
  const total = durations.reduce((sum, value) => sum + value, 0);
  return total > 0 ? durations.map((value) => (value / total) * 100) : null;
}

function wsdNiceStep(range, count) {
  const raw = range / Math.max(count, 1);
  const power = 10 ** Math.floor(Math.log10(raw));
  const unit = raw / power;
  return (unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 2.5 ? 2.5 : unit <= 5 ? 5 : 10) * power;
}

/** Rounded axis bounds and ticks around [min, max]. */
function wsdScale(min, max, count = 4, floor = null, ceil = null) {
  let low = min;
  let high = max;
  if (low === high) {
    const pad = Math.abs(low) * 0.05 || 1;
    low -= pad;
    high += pad;
  }
  const step = wsdNiceStep(high - low, count);
  low = Math.floor(low / step) * step;
  high = Math.ceil(high / step) * step;
  if (floor !== null) low = Math.max(low, floor);
  if (ceil !== null) high = Math.min(high, ceil);
  const ticks = [];
  for (let tick = low; tick <= high + step / 1000; tick += step) ticks.push(Number(tick.toFixed(6)));
  return { min: low, max: high, ticks };
}

function wsdTimeTicks(start, end, period) {
  const ticks = [];
  const date = new Date(start);
  if (period === "24h") {
    date.setMinutes(0, 0, 0);
    date.setHours(Math.ceil(date.getHours() / 6) * 6);
    for (; date.getTime() <= end; date.setHours(date.getHours() + 6)) ticks.push(date.getTime());
  } else {
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 1);
    const every = period === "7d" ? 1 : 5;
    for (; date.getTime() <= end; date.setDate(date.getDate() + every)) ticks.push(date.getTime());
  }
  return ticks.filter((tick) => tick >= start);
}

function wsdFormatTime(time, style, language) {
  const locale = language === "fr" ? "fr-FR" : "en-GB";
  const date = new Date(time);
  const options = {
    tick24h: { hour: "2-digit", minute: "2-digit" },
    tick7d: { weekday: "short" },
    tick30d: { day: "numeric", month: "numeric" },
    point: { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" },
    day: { weekday: "short", day: "numeric", month: "short" },
    month: { month: "long", year: "numeric" },
    monthShort: { month: "narrow" },
  }[style];
  return new Intl.DateTimeFormat(locale, options).format(date);
}

function wsdStations(hass) {
  return Object.values(hass?.states || {})
    .filter((state) => state?.attributes?.weather_station === true);
}

// Version of this file, kept equal to the integration's manifest version.
const WSD_VERSION = "0.7.2";
const WSD_OUTDATED_TEXT = {
  fr: (version) => `Une nouvelle version de Weather Station (${version}) est installée : rechargez la page (Ctrl+Maj+R). Dans l'application : Paramètres › Débogage › Réinitialiser le cache du frontend.`,
  en: (version) => `A new version of Weather Station (${version}) is installed: reload the page (Ctrl+Shift+R). In the app: Settings › Debugging › Reset frontend cache.`,
};

function wsdIsOlder(version, than) {
  const parts = (value) => String(value || "0").split(".").map((part) => parseInt(part, 10) || 0);
  const a = parts(version);
  const b = parts(than);
  for (let index = 0; index < 3; index += 1) {
    if ((a[index] || 0) !== (b[index] || 0)) return (a[index] || 0) < (b[index] || 0);
  }
  return false;
}

function wsdOutdatedBanner(element) {
  const root = element?.shadowRoot;
  if (!root || String(root.innerHTML).includes("ws-outdated")) return;
  const text = WSD_OUTDATED_TEXT[wsdPageLanguage()](WSD_VERSION);
  const style = "display:block;margin:0 0 8px;padding:10px 12px;border-radius:10px;background:#fab219;color:#1a1a19;font-size:13px;line-height:1.4";
  if (typeof document !== "undefined" && typeof root.prepend === "function") {
    const banner = document.createElement("div");
    banner.className = "ws-outdated";
    banner.setAttribute("role", "alert");
    banner.style.cssText = style;
    banner.textContent = text;
    root.prepend(banner);
  } else {
    root.innerHTML = `<div class="ws-outdated" role="alert" style="${style}">${wsdEscape(text)}</div>${root.innerHTML}`;
  }
}

/**
 * A browser cache can load an older copy of this file first: the older class
 * keeps the tag (custom elements cannot be redefined), so its cards would
 * silently miss the new features. This newer file then makes them show a
 * reload banner after each render.
 */
function wsdFlagOutdated(existing, renderMethod) {
  const proto = existing?.prototype;
  if (!proto || typeof proto[renderMethod] !== "function" || proto.__wsOutdatedFlagged) return;
  const original = proto[renderMethod];
  proto[renderMethod] = function renderWithOutdatedBanner(...args) {
    const result = original.apply(this, args);
    wsdOutdatedBanner(this);
    return result;
  };
  proto.__wsOutdatedFlagged = true;
}

function wsdDefine(tag, component, renderMethod = null) {
  component.WS_VERSION = WSD_VERSION;
  // Home Assistant's frontend replaces window.customElements with a scoped
  // registry while it starts: register again once the frontend and Lovelace exist.
  const define = () => {
    const registry = globalThis.customElements;
    const existing = registry.get(tag);
    if (!existing) registry.define(tag, component);
    else if (renderMethod && existing !== component && wsdIsOlder(existing.WS_VERSION, WSD_VERSION)) {
      wsdFlagOutdated(existing, renderMethod);
    }
  };
  define();
  for (const ready of ["home-assistant", "ha-panel-lovelace"]) {
    customElements.whenDefined?.(ready)?.then(define);
  }
}

// ----------------------------------------------------------------- charts

const WSD_W = 1000;
const WSD_H = 200;

/**
 * SVG path of a series. With `stepEnd` (raw history), each value holds until
 * the next one, as recorded, and the last one until `stepEnd`: Home Assistant
 * only stores changes, so a straight line between two of them would invent
 * values. Statistics (means of each hour or day) are joined by lines.
 */
function wsdPath(points, x, y, stepEnd = null) {
  let path = "";
  let open = false;
  for (const point of points) {
    if (point.v === null) {
      if (open && stepEnd !== null) path += `H${x(point.t).toFixed(1)}`;
      open = false;
      continue;
    }
    path += open && stepEnd !== null
      ? `H${x(point.t).toFixed(1)}V${y(point.v).toFixed(1)}`
      : `${open ? "L" : "M"}${x(point.t).toFixed(1)} ${y(point.v).toFixed(1)}`;
    open = true;
  }
  if (open && stepEnd !== null) path += `H${stepEnd.toFixed(1)}`;
  return path;
}

function wsdBand(points, x, y) {
  const valid = points.filter((point) => point.min !== null && point.max !== null);
  if (valid.length < 2) return "";
  const top = valid.map((point) => `${x(point.t).toFixed(1)} ${y(point.max).toFixed(1)}`);
  const bottom = valid.slice().reverse().map((point) => `${x(point.t).toFixed(1)} ${y(point.min).toFixed(1)}`);
  return `M${top.join("L")}L${bottom.join("L")}Z`;
}

/** A bar standing on the baseline, its data end rounded. */
function wsdBarPath(left, width, top) {
  const height = WSD_H - top;
  const r = Math.min(4, width / 2, height);
  return `M${left.toFixed(1)} ${WSD_H}V${(top + r).toFixed(1)}Q${left.toFixed(1)} ${top.toFixed(1)} ${(left + r).toFixed(1)} ${top.toFixed(1)}`
    + `H${(left + width - r).toFixed(1)}Q${(left + width).toFixed(1)} ${top.toFixed(1)} ${(left + width).toFixed(1)} ${(top + r).toFixed(1)}V${WSD_H}Z`;
}

/** Wind class of a speed: 0 calm … 6 near gale and more; null when unknown. */
function wsdWindClass(speed, unit) {
  const value = wsdFinite(speed);
  if (value === null) return null;
  const kmh = value * (WSD_TO_KMH[unit] || 1);
  const index = WSD_WIND_CLASSES_KMH.findIndex((limit) => kmh < limit);
  return index === -1 ? WSD_WIND_CLASSES_KMH.length : index;
}

/** Sunrise and sunset (ms) of the day containing `time`, or null (polar day or night). */
function wsdSunTimes(time, latitude, longitude) {
  const rad = Math.PI / 180;
  const julian = time / WSD_DAY_MS + 2440587.5;
  const n = Math.round(julian - 2451545 - 0.0009 + longitude / 360);
  const noon = n + 0.0009 - longitude / 360;
  const anomaly = (357.5291 + 0.98560028 * noon) % 360;
  const center = 1.9148 * Math.sin(anomaly * rad) + 0.02 * Math.sin(2 * anomaly * rad) + 0.0003 * Math.sin(3 * anomaly * rad);
  const ecliptic = (anomaly + center + 180 + 102.9372) % 360;
  const transit = 2451545 + noon + 0.0053 * Math.sin(anomaly * rad) - 0.0069 * Math.sin(2 * ecliptic * rad);
  const declination = Math.asin(Math.sin(ecliptic * rad) * Math.sin(23.4397 * rad));
  const cosHour = (Math.sin(-0.833 * rad) - Math.sin(latitude * rad) * Math.sin(declination))
    / (Math.cos(latitude * rad) * Math.cos(declination));
  if (cosHour < -1 || cosHour > 1) return null;
  const hour = Math.acos(cosHour) / rad / 360;
  const toMs = (day) => (day - 2440587.5) * WSD_DAY_MS;
  return { rise: toMs(transit - hour), set: toMs(transit + hour) };
}

/** Nights [from, to] overlapping [start, end] at this place. */
function wsdNights(start, end, latitude, longitude) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return [];
  const nights = [];
  for (let day = start - WSD_DAY_MS; day < end + WSD_DAY_MS; day += WSD_DAY_MS) {
    const today = wsdSunTimes(day, latitude, longitude);
    const tomorrow = wsdSunTimes(day + WSD_DAY_MS, latitude, longitude);
    if (!today || !tomorrow) continue;
    const from = Math.max(today.set, start);
    const to = Math.min(tomorrow.rise, end);
    if (to > from && !nights.some(([a, b]) => Math.abs(a - from) < 3600 * 1000 && Math.abs(b - to) < 3600 * 1000)) {
      nights.push([from, to]);
    }
  }
  return nights;
}

/**
 * Wind rose split by wind class: for each of the 16 compass points, the share
 * of time (%) in each class, plus the calm share and the mean speed. Time
 * with an unknown speed is left out; without any speed sensor, every reading
 * counts in a single class (null).
 */
function wsdStackedRose(directions, speeds, unit, end = Date.now()) {
  const times = [...new Set([...directions, ...speeds].map((point) => point.t))].sort((a, b) => a - b);
  const valueAt = (points, time) => {
    let value = null;
    for (const point of points) {
      if (point.t > time) break;
      value = point.v;
    }
    return value;
  };
  const sectors = Array.from({ length: 16 }, () => new Array(WSD_WIND_CLASSES_KMH.length + 1).fill(0));
  const speedSum = new Array(16).fill(0);
  let calm = 0;
  let total = 0;
  times.forEach((time, index) => {
    const duration = Math.max((times[index + 1] ?? end) - time, 0);
    if (!duration) return;
    const direction = valueAt(directions, time);
    const speed = speeds.length ? valueAt(speeds, time) : null;
    if (speeds.length && speed === null) return;
    const windClass = speeds.length ? wsdWindClass(speed, unit) : 1;
    if (windClass === 0) {
      calm += duration;
      total += duration;
      return;
    }
    if (direction === null) return;
    const sector = Math.round(direction / 22.5) % 16;
    sectors[sector][windClass] += duration;
    if (speed !== null) speedSum[sector] += speed * duration;
    total += duration;
  });
  if (!total) return null;
  const durations = sectors.map((classes) => classes.reduce((sum, value) => sum + value, 0));
  return {
    sectors: sectors.map((classes) => classes.map((value) => (value / total) * 100)),
    shares: durations.map((value) => (value / total) * 100),
    mean: durations.map((value, index) => (value && speeds.length ? speedSum[index] / value : null)),
    calm: (calm / total) * 100,
    speed: speeds.length > 0,
  };
}

/** [from, to] of each wind bucket: half hours, 3 hours or local days. */
function wsdWindBuckets(start, end, period) {
  const size = WSD_WIND_BUCKETS[period];
  const date = new Date(start);
  if (period === "30d") {
    date.setHours(0, 0, 0, 0);
  } else if (period === "7d") {
    date.setMinutes(0, 0, 0);
    date.setHours(date.getHours() - (date.getHours() % 3));
  } else {
    date.setSeconds(0, 0);
    date.setMinutes(date.getMinutes() < 30 ? 0 : 30);
  }
  const starts = [];
  while (date.getTime() < end) {
    starts.push(date.getTime());
    if (period === "30d") date.setDate(date.getDate() + 1);
    else date.setTime(date.getTime() + size);
  }
  return starts.map((from, index) => [from, starts[index + 1] ?? end]);
}

/** Overlap in ms of each recorded value of a history series with [from, to]. */
function wsdOverlaps(points, from, to, end) {
  return points.map((point, index) => {
    if (point.v === null) return 0;
    return Math.max(Math.min(points[index + 1]?.t ?? end, to) - Math.max(point.t, from), 0);
  });
}

/** Time-weighted mean and maximum of a raw history series in each bucket. */
function wsdHistoryBuckets(points, buckets, end) {
  return buckets.map(([from, to]) => {
    const overlaps = wsdOverlaps(points, from, to, end);
    let weighted = 0;
    let duration = 0;
    let max = null;
    let min = null;
    points.forEach((point, index) => {
      if (!overlaps[index]) return;
      weighted += point.v * overlaps[index];
      duration += overlaps[index];
      max = max === null ? point.v : Math.max(max, point.v);
      min = min === null ? point.v : Math.min(min, point.v);
    });
    return { mean: duration ? weighted / duration : null, max, min };
  });
}

/** Mean of the means and highest maximum of the statistics in each bucket. */
function wsdStatisticBuckets(points, buckets) {
  return buckets.map(([from, to]) => {
    const inside = points.filter((point) => point.t >= from && point.t < to && point.v !== null);
    if (!inside.length) return { mean: null, max: null, min: null };
    return {
      mean: inside.reduce((sum, point) => sum + point.v, 0) / inside.length,
      max: Math.max(...inside.map((point) => point.max ?? point.v)),
      min: Math.min(...inside.map((point) => point.min ?? point.v)),
    };
  });
}

/** Time-weighted circular mean of the wind direction in each bucket (°, or null). */
function wsdDirectionBuckets(points, buckets, end) {
  return buckets.map(([from, to]) => {
    const overlaps = wsdOverlaps(points, from, to, end);
    let east = 0;
    let north = 0;
    points.forEach((point, index) => {
      if (!overlaps[index]) return;
      const radians = (point.v * Math.PI) / 180;
      east += Math.sin(radians) * overlaps[index];
      north += Math.cos(radians) * overlaps[index];
    });
    if (Math.hypot(east, north) < 1e-9) return null;
    return ((Math.atan2(east, north) * 180) / Math.PI + 360) % 360;
  });
}

class WeatherStationDashboardCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement("weather-station-dashboard-card-editor");
  }

  static getStubConfig(hass) {
    const station = wsdStations(hass)[0];
    return { entity: station ? station.entity_id : "", period: "24h" };
  }

  // Sections dashboards: full width.
  getGridOptions() {
    return { columns: "full", min_columns: 6 };
  }

  getCardSize() {
    return 12;
  }

  setConfig(config) {
    this.config = { period: "24h", ...(config || {}) };
    if (!WSD_PERIODS[this.config.period]) this.config.period = "24h";
    if (!this._period || !this._periodChosen) this._period = this.config.period;
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.addEventListener?.("click", (event) => this._onClick(event));
      this.shadowRoot.addEventListener?.("pointermove", (event) => this._onHover(event));
      this.shadowRoot.addEventListener?.("pointerleave", () => this._hideHover(), true);
    }
    this._data = null;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    const station = this._station();
    const entities = Object.values(station?.attributes?.entities || {});
    const tracked = [station, ...entities.map((id) => hass?.states?.[id])];
    const changed = !this._tracked || tracked.length !== this._tracked.length
      || tracked.some((state, index) => state !== this._tracked[index]);
    this._tracked = tracked;
    if (station && !this._loading && (!this._data || this._dataStation !== station.entity_id)) this._load();
    this._subscribeForecast();
    if (changed) this._render();
  }

  connectedCallback() {
    this._timer = setInterval(() => this._load(), WSD_REFRESH_MS);
    this._subscribeForecast();
  }

  disconnectedCallback() {
    clearInterval(this._timer);
    this._unsubscribeForecast();
  }

  /** The station's weather entity, when it lends daily forecasts. */
  _forecastEntity() {
    const id = this._station()?.attributes?.entities?.weather;
    const features = Number(this._hass?.states?.[id]?.attributes?.supported_features) || 0;
    return id && (features & WSD_FORECAST_DAILY) ? id : null;
  }

  _subscribeForecast() {
    const entity = this._forecastEntity();
    if (entity === this._forecastSubscribed) return;
    this._unsubscribeForecast();
    if (!entity || !this._hass?.connection?.subscribeMessage) return;
    this._forecastSubscribed = entity;
    // The same subscription as Home Assistant's forecast card: pushed again
    // whenever the forecast changes.
    this._forecastUnsubscribe = Promise.resolve(this._hass.connection.subscribeMessage((message) => {
      if (this._forecastSubscribed !== entity) return;
      this._forecast = Array.isArray(message?.forecast) ? message.forecast : null;
      this._render();
    }, { type: "weather/subscribe_forecast", entity_id: entity, forecast_type: "daily" })).catch(() => null);
  }

  _unsubscribeForecast() {
    this._forecastUnsubscribe?.then((unsubscribe) => typeof unsubscribe === "function" && unsubscribe());
    this._forecastUnsubscribe = null;
    this._forecastSubscribed = null;
    this._forecast = null;
  }

  _station() {
    const entity = this.config?.entity;
    if (entity) return this._hass?.states?.[entity];
    return wsdStations(this._hass)[0];
  }

  _T() {
    return WSD_TEXT[wsdLanguage(this._hass)];
  }

  // ------------------------------------------------------------ data

  async _load() {
    const hass = this._hass;
    const station = this._station();
    if (!hass?.callWS || !station) return;
    const period = this._period;
    const config = WSD_PERIODS[period];
    const entities = station.attributes.entities || {};
    const measures = station.attributes.measures || {};
    const numeric = WSD_NUMERIC.filter((key) => entities[key]);
    const statisticIds = [...new Set(numeric.flatMap((key) => [entities[key], measures[key]]).filter(Boolean))];
    const now = Date.now();
    const start = now - config.ms;
    const iso = (time) => new Date(time).toISOString();
    const request = (this._request = (this._request || 0) + 1);
    this._loading = true;
    this._render();

    const yearStart = new Date(now);
    yearStart.setMonth(0, 1);
    yearStart.setHours(0, 0, 0, 0);
    const recent = [...numeric, "wind_direction"].filter((key) => entities[key]).map((key) => entities[key]);
    const roseStart = Math.max(start, now - WSD_ROSE_MAX_MS);
    const calls = {
      // Last 24 h of raw history: current tiles (min/max, trends) and 24 h charts.
      recent: recent.length ? hass.callWS({
        type: "history/history_during_period",
        start_time: iso(now - WSD_PERIODS["24h"].ms),
        end_time: iso(now),
        entity_ids: recent,
        minimal_response: true,
        no_attributes: true,
      }) : null,
      statistics: config.statistics && numeric.length ? hass.callWS({
        type: "recorder/statistics_during_period",
        start_time: iso(start),
        end_time: iso(now),
        statistic_ids: statisticIds,
        period: config.statistics,
        types: ["mean", "min", "max"],
      }) : null,
      rose: period !== "24h" && entities.wind_direction ? hass.callWS({
        type: "history/history_during_period",
        start_time: iso(roseStart),
        end_time: iso(now),
        entity_ids: [entities.wind_direction, entities.wind_speed].filter(Boolean),
        minimal_response: true,
        no_attributes: true,
      }) : null,
      rain: period !== "24h" && entities.rain_total ? hass.callWS({
        type: "recorder/statistics_during_period",
        start_time: iso(start),
        end_time: iso(now),
        statistic_ids: [entities.rain_total],
        period: config.rain,
        types: ["change"],
      }) : null,
      // The day before, for the "compare with yesterday" curve of the wind chart.
      yesterday: period === "24h" && entities.wind_speed ? hass.callWS({
        type: "history/history_during_period",
        start_time: iso(now - 2 * WSD_DAY_MS),
        end_time: iso(now - WSD_DAY_MS),
        entity_ids: [entities.wind_speed],
        minimal_response: true,
        no_attributes: true,
      }) : null,
      rainYear: entities.rain_total ? hass.callWS({
        type: "recorder/statistics_during_period",
        start_time: iso(yearStart.getTime()),
        end_time: iso(now),
        statistic_ids: [entities.rain_total],
        period: "month",
        types: ["change"],
      }) : null,
    };
    const results = {};
    let failed = false;
    await Promise.all(Object.entries(calls).map(async ([key, call]) => {
      try {
        results[key] = call ? await call : null;
      } catch (error) {
        failed = true;
        results[key] = null;
      }
    }));
    if (request !== this._request) return;
    this._data = { ...results, period, start, end: now, roseStart, failed };
    this._dataStation = station.entity_id;
    this._loading = false;
    this._render();
  }

  _series(key) {
    const data = this._data;
    const attributes = this._station()?.attributes;
    const id = attributes?.entities?.[key];
    if (!data || !id) return [];
    if (data.period === "24h" || !data.statistics) {
      return wsdHistoryPoints(data.recent, id).filter((point) => point.t >= data.start);
    }
    const measure = attributes.measures?.[key];
    return wsdMergePoints(
      wsdStatisticsPoints(data.statistics, id),
      measure ? wsdStatisticsPoints(data.statistics, measure) : [],
    );
  }

  _rainBars() {
    const data = this._data;
    const a = this._station()?.attributes || {};
    if (!data) return [];
    if (data.period === "24h") {
      // The station keeps the hourly rain of the last 24 h, current hour last.
      const hour = new Date(data.end);
      hour.setMinutes(0, 0, 0);
      return (a.hourly_rain || []).map((value, index, all) => ({
        t: hour.getTime() - (all.length - 1 - index) * 3600 * 1000,
        v: Math.max(wsdFinite(value) || 0, 0),
        style: "point",
      }));
    }
    const days = new Map();
    for (const point of wsdStatisticsPoints(data.rain, a.entities?.rain_total)) {
      days.set(new Date(point.t).setHours(0, 0, 0, 0), Math.max(point.change || 0, 0));
    }
    // Today from the station itself: statistics lag up to an hour.
    days.set(new Date(data.end).setHours(0, 0, 0, 0), Math.max(wsdFinite(a.rain_today ?? this._station()?.state) || 0, 0));
    const bars = [];
    const day = new Date(data.start);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() + 1);
    for (; day.getTime() <= data.end; day.setDate(day.getDate() + 1)) {
      bars.push({ t: day.getTime(), v: days.get(day.getTime()) || 0, style: "day" });
    }
    return bars;
  }

  _rainMonths() {
    const data = this._data;
    const station = this._station();
    const a = station?.attributes || {};
    if (!data) return [];
    const months = new Map();
    for (const point of wsdStatisticsPoints(data.rainYear, a.entities?.rain_total)) {
      const date = new Date(point.t);
      months.set(date.getMonth(), Math.max(point.change || 0, 0));
    }
    const now = new Date(data.end);
    months.set(now.getMonth(), Math.max(wsdFinite(a.rain_month) || 0, 0));
    return Array.from({ length: 12 }, (_value, month) => ({
      t: new Date(now.getFullYear(), month, 1).getTime(),
      v: month <= now.getMonth() ? months.get(month) || 0 : null,
      style: "month",
    }));
  }

  // ---------------------------------------------------------- render

  _render() {
    if (!this.shadowRoot || !this.config) return;
    if (!this._hass) {
      this.shadowRoot.innerHTML = "";
      return;
    }
    const language = wsdLanguage(this._hass);
    const T = WSD_TEXT[language];
    const station = this._station();
    if (!station) {
      const message = this.config.entity ? T.notFound(this.config.entity) : T.noStation;
      this.shadowRoot.innerHTML = `${this._style()}<ha-card><div class="empty">${wsdEscape(message)}</div></ha-card>`;
      this._parts = null;
      return;
    }
    this._charts = {};
    const parts = {
      header: this._header(station, language, T),
      tiles: this._tiles(station, language, T),
      forecast: this._forecastHtml(station, language, T),
      charts: this._chartsHtml(station, language, T),
    };
    const root = this.shadowRoot.querySelector?.(".dashboard");
    if (root && this._parts) {
      // Replace only what changed, so hovering a chart survives sensor updates.
      for (const [key, html] of Object.entries(parts)) {
        if (this._parts[key] !== html) {
          const section = root.querySelector(`[data-part="${key}"]`);
          if (section) section.innerHTML = html;
        }
      }
      root.classList.toggle("dark", Boolean(this._hass.themes?.darkMode));
      root.classList.toggle("loading", Boolean(this._loading));
    } else {
      this.shadowRoot.innerHTML = `${this._style()}
        <ha-card class="${this.config.panel ? "panel" : ""}">
          <div class="dashboard${this._hass.themes?.darkMode ? " dark" : ""}${this._loading ? " loading" : ""}">
            <div data-part="header">${parts.header}</div>
            <div data-part="tiles">${parts.tiles}</div>
            <div data-part="forecast">${parts.forecast}</div>
            <div data-part="charts">${parts.charts}</div>
          </div>
        </ha-card>`;
    }
    this._parts = parts;
  }

  _header(station, language, T) {
    const a = station.attributes;
    const raining = a.raining === true;
    const age = a.last_rain ? wsdAge(a.last_rain, T) : null;
    const sky = this._hass.states?.[a.entities?.weather]?.state;
    const skyLabel = T.conditions[sky];
    const status = raining
      ? T.raining
      : `${skyLabel ? `${skyLabel} · ` : ""}${T.dry} · ${age ? T.lastRain(age) : T.noRainYet}`;
    const title = this.config.title || a.station_name || T.name;
    const periods = Object.keys(WSD_PERIODS).map((key) => `
      <button type="button" data-period="${key}" aria-pressed="${key === this._period}" class="${key === this._period ? "selected" : ""}">${T.periods[key]}</button>`).join("");
    const battery = wsdFinite(a.battery);
    const alerts = [["frost", "mdi:snowflake-alert"], ["strong_wind", "mdi:weather-windy-variant"]]
      .filter(([key]) => this._hass.states?.[a.entities?.[key]]?.state === "on")
      .map(([key, icon]) => `<span class="alert ${key}"><ha-icon icon="${icon}"></ha-icon>${wsdEscape(T.alerts[key])}</span>`)
      .join("");
    return `
      <header>
        <div class="title">
          <div class="icon ${raining ? "wet" : ""}"><ha-icon icon="${raining ? "mdi:weather-pouring" : WSD_CONDITION_ICONS[sky] || "mdi:weather-partly-cloudy"}"></ha-icon></div>
          <div>
            <h2>${wsdEscape(title)}</h2>
            ${alerts ? `<div class="alerts">${alerts}</div>` : ""}
            <span class="status ${raining ? "wet" : ""}">${wsdEscape(status)}${battery !== null ? ` · <span class="${battery <= 20 ? "low" : ""}" title="${wsdEscape(T.battery)}"><ha-icon icon="${battery <= 20 ? "mdi:battery-alert" : "mdi:battery"}"></ha-icon>${wsdNumber(battery, language, 0)} %</span>` : ""}</span>
          </div>
        </div>
        <div class="periods" role="group" aria-label="${wsdEscape(T.periodLabel)}">${periods}</div>
      </header>`;
  }

  _forecastHtml(station, language, T) {
    const days = (this._forecast || []).filter((day) => day?.datetime).slice(0, WSD_FORECAST_DAYS);
    if (!days.length) return "";
    const weather = this._hass.states?.[station.attributes.entities?.weather];
    const tempUnit = weather?.attributes?.temperature_unit || "°C";
    const rainUnit = weather?.attributes?.precipitation_unit || "mm";
    const sourceId = weather?.attributes?.forecast_entity;
    const source = this._hass.states?.[sourceId]?.attributes?.friendly_name;
    const todayKey = new Date().toDateString();
    const cells = days.map((day) => {
      const date = new Date(day.datetime);
      const label = date.toDateString() === todayKey ? T.today : wsdFormatTime(date.getTime(), "tick7d", language);
      const condition = T.conditions[day.condition] || day.condition || "";
      const high = wsdWithUnit(day.temperature, tempUnit, language, 0);
      const low = wsdWithUnit(day.templow, tempUnit, language, 0);
      const rain = wsdFinite(day.precipitation);
      const rainText = rain === null ? "—" : `${wsdNumber(rain, language, rain > 0 && rain < 10 ? 1 : 0)} ${rainUnit}`;
      const chance = wsdFinite(day.precipitation_probability);
      return `
        <div class="day" role="listitem" aria-label="${wsdEscape(T.forecastLabel(label, condition, high, low, rainText))}">
          <span class="day-name">${wsdEscape(label)}</span>
          <ha-icon icon="${WSD_CONDITION_ICONS[day.condition] || "mdi:weather-cloudy-alert"}" title="${wsdEscape(condition)}"></ha-icon>
          <span class="day-temp"><strong>${wsdEscape(high)}</strong> <span>${wsdEscape(low)}</span></span>
          <span class="day-rain"><ha-icon icon="mdi:water"></ha-icon>${wsdEscape(rainText)}${chance !== null ? ` · ${wsdEscape(T.rainChance(wsdNumber(chance, language, 0)))}` : ""}</span>
        </div>`;
    }).join("");
    return `
      <section class="forecast">
        <div class="chart-head"><h3>${wsdEscape(T.forecast)}</h3>${source ? `<span class="chart-sub">${wsdEscape(T.forecastFrom(source))}</span>` : ""}</div>
        <div class="days" role="list">${cells}</div>
      </section>`;
  }

  _recent(key) {
    const id = this._station()?.attributes?.entities?.[key];
    return id && this._data ? wsdHistoryPoints(this._data.recent, id) : [];
  }

  _tile({ icon, label, value, sub = "", extra = "", wide = false }) {
    return `
      <div class="tile${wide ? " wide" : ""}">
        <div class="tile-label"><ha-icon icon="${icon}"></ha-icon>${wsdEscape(label)}</div>
        <div class="tile-value">${value}</div>
        ${sub ? `<div class="tile-sub">${sub}</div>` : ""}
        ${extra}
      </div>`;
  }

  _tiles(station, language, T) {
    const a = station.attributes;
    const has = (key) => Object.prototype.hasOwnProperty.call(a, key);
    const unit = (key) => a[`${key}_unit`] || "";
    const value = (key) => wsdWithUnit(a[key], unit(key), language, wsdDigits(key, unit(key)));
    const range = (key) => {
      const minMax = wsdMinMax(this._recent(key));
      return minMax ? T.minMax(wsdWithUnit(minMax.min, unit(key), language, wsdDigits(key, unit(key))), wsdWithUnit(minMax.max, unit(key), language, wsdDigits(key, unit(key)))) : "";
    };
    const tiles = [];

    if (has("temperature")) {
      const comfort = ["feels_like", "dew_point"].filter(has)
        .map((key) => `${wsdEscape(T[key])} ${wsdEscape(value(key))}`).join(" · ");
      tiles.push(this._tile({
        icon: "mdi:thermometer", label: T.temperature, value: wsdEscape(value("temperature")),
        sub: [comfort, wsdEscape(range("temperature"))].filter(Boolean).join("<br>"),
      }));
    }
    if (has("humidity")) {
      tiles.push(this._tile({ icon: "mdi:water-percent", label: T.humidity, value: wsdEscape(value("humidity")), sub: wsdEscape(range("humidity")) }));
    }
    if (has("pressure")) {
      const delta = wsdTrend(this._recent("pressure"), 3);
      let sub = "";
      if (delta !== null) {
        const direction = delta > 0.5 ? "rising" : delta < -0.5 ? "falling" : "stable";
        const arrow = { rising: "mdi:arrow-top-right", falling: "mdi:arrow-bottom-right", stable: "mdi:arrow-right" }[direction];
        const signed = `${delta > 0 ? "+" : delta < 0 ? "−" : ""}${wsdWithUnit(Math.abs(delta), unit("pressure"), language, 1)}`;
        sub = `<span class="trend"><ha-icon icon="${arrow}"></ha-icon>${wsdEscape(T.trend[direction])} · ${wsdEscape(T.trendIn3h(signed))}</span>`;
      }
      tiles.push(this._tile({ icon: "mdi:gauge", label: T.pressure, value: wsdEscape(value("pressure")), sub }));
    }
    if (has("wind_speed") || has("wind_direction") || has("wind_gust")) {
      const direction = wsdFinite(a.wind_direction);
      const force = has("wind_speed") ? wsdBeaufort(a.wind_speed, unit("wind_speed")) : null;
      const lines = [
        direction !== null ? T.windFrom(wsdCardinal(direction, language)) : "",
        has("wind_gust") || has("wind_lull")
          ? [has("wind_gust") ? `${T.wind_gust} ${value("wind_gust")}` : "", has("wind_lull") ? `${T.wind_lull.toLowerCase()} ${value("wind_lull")}` : ""].filter(Boolean).join(" · ")
          : "",
        force !== null ? T.force(force, T.beaufort[force]) : "",
      ].filter(Boolean).map(wsdEscape);
      tiles.push(this._tile({
        icon: "mdi:weather-windy",
        label: T.wind,
        value: wsdEscape(has("wind_speed") ? value("wind_speed") : wsdCardinal(direction, language)),
        sub: lines.join("<br>"),
        extra: direction !== null ? this._compass(direction, language) : "",
      }));
    }
    tiles.push(this._tile({
      icon: a.raining ? "mdi:weather-pouring" : "mdi:weather-rainy",
      label: T.rain,
      value: `${wsdNumber(station.state, language, 1)} mm <small>${wsdEscape(T.rainToday.toLocaleLowerCase(language))}</small>`,
      sub: [
        a.raining ? `${T.rainRate} ${wsdNumber(a.rain_rate, language, 1)} mm/h` : "",
        `${T.rainWeek} ${wsdNumber(a.rain_week, language, 1)} · ${T.rainMonth} ${wsdNumber(a.rain_month, language, 1)} · ${T.rainYear} ${wsdNumber(a.rain_year, language, 0)} mm`,
      ].filter(Boolean).map(wsdEscape).join("<br>"),
    }));
    if (has("uv_index")) {
      const level = wsdUvLevel(a.uv_index);
      tiles.push(this._tile({ icon: "mdi:sun-wireless", label: T.uv_index, value: wsdEscape(wsdNumber(a.uv_index, language, 1)), sub: level ? wsdEscape(T.uvLevels[level]) : "" }));
    }
    if (has("illuminance")) {
      tiles.push(this._tile({ icon: "mdi:brightness-5", label: T.illuminance, value: wsdEscape(value("illuminance")) }));
    }
    if (has("solar_radiation")) {
      tiles.push(this._tile({ icon: "mdi:solar-power-variant", label: T.solar_radiation, value: wsdEscape(value("solar_radiation")) }));
    }
    return `<div class="tiles">${tiles.join("")}</div>`;
  }

  _compass(direction, language) {
    // The arrow points where the wind blows to; the dot marks where it comes from.
    const ticks = [0, 90, 180, 270].map((angle) => {
      const radians = (angle * Math.PI) / 180;
      return `<text x="${(32 + Math.sin(radians) * 23).toFixed(1)}" y="${(32 - Math.cos(radians) * 23 + 3).toFixed(1)}">${wsdCardinal(angle, language)}</text>`;
    }).join("");
    return `
      <svg class="compass" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="30" class="ring"></circle>
        ${ticks}
        <g transform="rotate(${direction.toFixed(0)} 32 32)">
          <path d="M32 44 L27 30 L32 33 L37 30 Z" class="needle"></path>
          <circle cx="32" cy="6" r="4" class="from"></circle>
        </g>
      </svg>`;
  }

  _chartsHtml(station, language, T) {
    const data = this._data;
    if (!data) {
      return `<div class="charts-empty">${wsdEscape(this._loading ? T.loading : T.noData)}</div>`;
    }
    const a = station.attributes;
    const entities = a.entities || {};
    const charts = [this._rainChart(language, T)];
    for (const chart of WSD_LINE_CHARTS) {
      const keys = chart.series.filter((key) => entities[key]);
      if (!keys.length) continue;
      charts.push(chart.key === "wind" ? this._windChart(keys, language, T) : this._lineChart(chart, keys, language, T));
      if (chart.key === "wind" && entities.wind_direction) charts.push(this._roseChart(language, T));
    }
    if (!entities.wind_speed && entities.wind_direction) charts.push(this._roseChart(language, T));
    if (entities.rain_total) charts.push(this._monthChart(language, T));
    return `
      ${data.failed ? `<div class="charts-empty">${wsdEscape(T.loadError)}</div>` : ""}
      <div class="charts">${charts.join("")}</div>`;
  }

  _lineChart(chart, keys, language, T) {
    const data = this._data;
    const a = this._station().attributes;
    const unitKey = chart.key === "wind" ? keys[0] : chart.series[0];
    const unit = a[`${unitKey}_unit`] || "";
    const series = keys.map((key, index) => ({ key, slot: index + 1, label: T[key], points: this._series(key) }));
    const title = chart.key === "wind" ? T.wind : T[chart.key];
    const values = series.flatMap((serie) => serie.points.flatMap((point) => [point.v, point.min, point.max]))
      .filter((value) => value !== null && value !== undefined);
    const id = `line-${chart.key}`;
    if (!values.length) return this._chartFrame(id, title, unit, "", `<div class="chart-empty">${wsdEscape(T.noData)}</div>`);
    const scale = wsdScale(Math.min(...values), Math.max(...values), 4, chart.min ?? null, chart.max ?? null);
    const x = (time) => ((time - data.start) / (data.end - data.start)) * WSD_W;
    const y = (value) => WSD_H - ((value - scale.min) / (scale.max - scale.min || 1)) * WSD_H;
    const digits = wsdDigits(keys[0], unit);
    const grid = scale.ticks.map((tick) => `<line class="grid" x1="0" x2="${WSD_W}" y1="${y(tick).toFixed(1)}" y2="${y(tick).toFixed(1)}"></line>`).join("");
    const bands = data.period === "24h" ? "" : series.slice(0, 1).map((serie) => `<path class="band s${serie.slot}" d="${wsdBand(serie.points, x, y)}"></path>`).join("");
    const stepEnd = data.period === "24h" || !data.statistics ? x(data.end) : null;
    const lines = series.map((serie) => `<path class="line s${serie.slot}" d="${wsdPath(serie.points, x, y, stepEnd)}"></path>`).join("");
    const last = (serie) => [...serie.points].reverse().find((point) => point.v !== null)?.v ?? null;
    const legend = series.length > 1 ? `<div class="legend">${series.map((serie) => `
      <span><i class="key s${serie.slot}"></i>${wsdEscape(serie.label)} <strong>${wsdEscape(wsdWithUnit(last(serie), unit, language, digits))}</strong></span>`).join("")}</div>` : "";
    const first = series[0];
    const range = wsdMinMax(first.points);
    const label = T.chartLabel(title, wsdWithUnit(range?.min, unit, language, digits), wsdWithUnit(range?.max, unit, language, digits), wsdWithUnit(last(first), unit, language, digits));
    this._charts[id] = { kind: "line", series, start: data.start, end: data.end, unit, digits, language, style: data.period === "24h" ? "point" : (data.period === "7d" ? "point" : "day") };
    const body = `
      ${legend}
      <div class="plot" data-chart="${id}">
        ${this._yTicks(scale, y, unit, language, digits)}
        <svg viewBox="0 0 ${WSD_W} ${WSD_H}" preserveAspectRatio="none" role="img" aria-label="${wsdEscape(label)}">${this._nightRects(x)}${grid}${bands}${lines}</svg>
        ${this._xTicks(data.start, data.end, data.period, language)}
        <div class="crosshair"></div><div class="tooltip" role="status"></div>
      </div>`;
    return this._chartFrame(id, title, unit, "", body);
  }

  /** Mean wind, gust and direction of each bucket of the period. */
  _windData(keys) {
    const data = this._data;
    const entities = this._station().attributes.entities || {};
    const buckets = wsdWindBuckets(data.start, data.end, data.period);
    const raw = data.period === "24h" || !data.statistics;
    const aggregate = (key) => {
      if (!keys.includes(key)) return null;
      // Raw history: every recorded value, the one in force at the start included.
      return raw
        ? wsdHistoryBuckets(wsdHistoryPoints(data.recent, entities[key]), buckets, data.end)
        : wsdStatisticBuckets(this._series(key), buckets);
    };
    const mean = aggregate("wind_speed");
    const gust = aggregate("wind_gust");
    const lull = aggregate("wind_lull");
    // Yesterday's mean wind, moved forward one day onto today's buckets.
    const yesterday = data.yesterday && entities.wind_speed
      ? wsdHistoryBuckets(
        wsdHistoryPoints(data.yesterday, entities.wind_speed).map((point) => ({ ...point, t: point.t + WSD_DAY_MS })),
        buckets,
        data.end,
      )
      : null;
    const directionId = entities.wind_direction;
    const directions = directionId
      ? wsdDirectionBuckets(
        wsdHistoryPoints(data.period === "24h" ? data.recent : data.rose, directionId, wsdParseDirection),
        buckets,
        data.end,
      )
      : buckets.map(() => null);
    return buckets.map(([from, to], index) => ({
      t: from,
      to,
      mean: mean ? mean[index].mean : null,
      gust: gust ? gust[index].max : null,
      lull: lull ? lull[index].min : null,
      yesterday: yesterday ? yesterday[index].mean : null,
      direction: directions[index],
    }));
  }

  _windChart(keys, language, T) {
    const data = this._data;
    const a = this._station().attributes;
    const unit = a[`${keys[0]}_unit`] || "";
    const id = "wind";
    const buckets = this._windData(keys);
    const compare = Boolean(this._compare) && data.period === "24h" && buckets.some((bucket) => bucket.yesterday !== null);
    const values = buckets.flatMap((bucket) => [bucket.mean, bucket.gust, bucket.lull, compare ? bucket.yesterday : null])
      .filter((value) => value !== null);
    if (!values.length) return this._chartFrame(id, T.wind, unit, "", `<div class="chart-empty">${wsdEscape(T.noData)}</div>`);
    const highest = Math.max(...values);
    const scale = wsdScale(0, highest > 0 ? highest : 1, 4, 0);
    const span = data.end - data.start;
    const x = (time) => ((Math.min(Math.max(time, data.start), data.end) - data.start) / span) * WSD_W;
    const y = (value) => WSD_H - (value / (scale.max || 1)) * WSD_H;
    const digits = wsdDigits("wind_speed", unit);
    const grid = scale.ticks.map((tick) => `<line class="grid" x1="0" x2="${WSD_W}" y1="${y(tick).toFixed(1)}" y2="${y(tick).toFixed(1)}"></line>`).join("");
    const marks = buckets.map((bucket, index) => {
      const left = x(bucket.t);
      const slot = x(bucket.to) - left;
      if (slot <= 0) return "";
      // Thin bars with air between them, coloured by wind class; the gust and
      // lull ticks are a little wider.
      const width = Math.max(slot * 0.7, 1);
      const windClass = wsdWindClass(bucket.mean, unit);
      const bar = bucket.mean > 0
        ? `<path class="bar w${windClass}" data-index="${index}" d="${wsdBarPath(left + (slot - width) / 2, width, Math.min(y(bucket.mean), WSD_H - 2))}"></path>`
        : "";
      const tick = (value, kind) => (value > 0
        ? `<line class="${kind}" x1="${(left + slot * 0.1).toFixed(1)}" x2="${(left + slot * 0.9).toFixed(1)}" y1="${y(value).toFixed(1)}" y2="${y(value).toFixed(1)}"></line>`
        : "");
      return bar + tick(bucket.gust, "gust") + tick(bucket.lull, "lull");
    }).join("");
    const yesterday = compare
      ? `<path class="line yesterday" d="${wsdPath(buckets.map((bucket) => ({ t: bucket.t, v: bucket.yesterday })), x, y, x(data.end))}"></path>`
      : "";
    // Arrows above the chart point where the wind blows to, coloured like the
    // bars; none in a calm bucket.
    const every = Math.ceil(buckets.length / WSD_MAX_ARROWS);
    const arrows = buckets.map((bucket, index) => {
      const windy = (bucket.mean ?? 0) > 0 || (bucket.gust ?? 0) > 0;
      if (index % every || bucket.direction === null || !windy) return "";
      const center = ((x(bucket.t) + x(bucket.to)) / 2 / WSD_W) * 100;
      const cardinal = wsdCardinal(bucket.direction, language);
      const windClass = wsdWindClass(bucket.mean ?? bucket.gust, unit) ?? 1;
      return `<span class="w${windClass}" style="left:${center.toFixed(2)}%" title="${wsdEscape(T.windFrom(cardinal))}"><svg viewBox="0 0 10 10" style="transform:rotate(${Math.round(bucket.direction + 180)}deg)"><path d="M5 0.5L8.5 9L5 7L1.5 9Z"></path></svg></span>`;
    }).join("");
    const hasArrows = arrows.length > 0;
    const hasYesterday = data.period === "24h" && buckets.some((bucket) => bucket.yesterday !== null);
    const item = (key, mark, value, valueUnit = unit) => (keys.includes(key)
      ? `<span>${mark}${wsdEscape(T[key])} <strong>${wsdEscape(wsdWithUnit(value, valueUnit, language, digits))}</strong></span>`
      : "");
    const legend = `<div class="legend">
      ${item("wind_speed", `<i class="key bar w${wsdWindClass(a.wind_speed, unit) ?? 1}"></i>`, a.wind_speed)}
      ${item("wind_gust", '<i class="key gust"></i>', a.wind_gust, a.wind_gust_unit || unit)}
      ${item("wind_lull", '<i class="key lull"></i>', a.wind_lull, a.wind_lull_unit || unit)}
      ${compare ? `<span><i class="key yesterday"></i>${wsdEscape(T.yesterday)}</span>` : ""}
      ${hasArrows ? `<span><i class="key arrow"><svg viewBox="0 0 10 10"><path d="M5 0.5L8.5 9L5 7L1.5 9Z"></path></svg></i>${wsdEscape(T.windOrigin)}</span>` : ""}
      ${hasYesterday ? `<button class="toggle" data-compare aria-pressed="${compare}">${wsdEscape(T.compare)}</button>` : ""}
    </div>`;
    const maxOf = (field) => {
      const list = buckets.map((bucket) => bucket[field]).filter((value) => value !== null);
      return list.length ? wsdWithUnit(Math.max(...list), unit, language, digits) : "—";
    };
    const label = T.windChartLabel(maxOf("mean"), maxOf("gust"));
    this._charts[id] = { kind: "wind", buckets, start: data.start, end: data.end, unit, digits, language, period: data.period, compare };
    const body = `
      ${legend}
      <div class="plot${hasArrows ? " with-arrows" : ""}" data-chart="${id}">
        ${hasArrows ? `<div class="arrows" aria-hidden="true">${arrows}</div>` : ""}
        ${this._yTicks(scale, y, unit, language, digits)}
        <svg viewBox="0 0 ${WSD_W} ${WSD_H}" preserveAspectRatio="none" role="img" aria-label="${wsdEscape(label)}">${this._nightRects(x)}${grid}<line class="baseline" x1="0" x2="${WSD_W}" y1="${WSD_H}" y2="${WSD_H}"></line>${marks}${yesterday}</svg>
        ${this._xTicks(data.start, data.end, data.period, language)}
        <div class="tooltip" role="status"></div>
      </div>
      ${keys.includes("wind_speed") ? this._speedScale(unit, language, T) : ""}`;
    return this._chartFrame(id, T.wind, unit, "", body);
  }

  _barChart(id, title, subtitle, bars, start, end, ticksHtml, language, T, label) {
    const values = bars.map((bar) => bar.v).filter((value) => value !== null);
    const max = Math.max(...values, 0);
    const scale = wsdScale(0, max > 0 ? max : 1, 3, 0);
    const slot = WSD_W / Math.max(bars.length, 1);
    // Bars stay thin with air between them; the data end is rounded.
    const width = Math.min(slot * 0.7, 24 * (WSD_W / 600));
    const y = (value) => WSD_H - (value / (scale.max || 1)) * WSD_H;
    const grid = scale.ticks.map((tick) => `<line class="grid" x1="0" x2="${WSD_W}" y1="${y(tick).toFixed(1)}" y2="${y(tick).toFixed(1)}"></line>`).join("");
    const rects = bars.map((bar, index) => {
      if (!bar.v) return "";
      const height = Math.max(WSD_H - y(bar.v), 2);
      const left = index * slot + (slot - width) / 2;
      return `<path class="bar" data-index="${index}" d="${wsdBarPath(left, width, WSD_H - height)}"></path>`;
    }).join("");
    this._charts[id] = { kind: "bar", bars, unit: "mm", digits: 1, language };
    const body = `
      <div class="plot" data-chart="${id}">
        ${this._yTicks(scale, y, "mm", language, scale.max < 2 ? 1 : 0)}
        <svg viewBox="0 0 ${WSD_W} ${WSD_H}" preserveAspectRatio="none" role="img" aria-label="${wsdEscape(label)}">${grid}<line class="baseline" x1="0" x2="${WSD_W}" y1="${WSD_H}" y2="${WSD_H}"></line>${rects}</svg>
        ${ticksHtml}
        <div class="tooltip" role="status"></div>
      </div>`;
    return this._chartFrame(id, title, "mm", subtitle, body);
  }

  _rainChart(language, T) {
    const data = this._data;
    const bars = this._rainBars();
    const total = bars.reduce((sum, bar) => sum + (bar.v || 0), 0);
    const start = bars.length ? bars[0].t : data.start;
    const ticks = this._xTicks(data.start, data.end, data.period, language);
    return this._barChart("bar-rain", T.rain, T.rainTotal(wsdNumber(total, language, 1)), bars, start, data.end, ticks, language, T, T.rainChartLabel(wsdNumber(total, language, 1)));
  }

  _monthChart(language, T) {
    const months = this._rainMonths();
    const year = new Date(this._data.end).getFullYear();
    const total = months.reduce((sum, bar) => sum + (bar.v || 0), 0);
    const ticks = `<div class="xticks months">${months.map((bar) => `<span>${wsdEscape(wsdFormatTime(bar.t, "monthShort", language))}</span>`).join("")}</div>`;
    return this._barChart("bar-months", T.rainByMonth(year), `${wsdNumber(total, language, 0)} mm`, months, months[0].t, this._data.end, ticks, language, T, T.rainChartLabel(wsdNumber(total, language, 1)));
  }

  _roseChart(language, T) {
    const data = this._data;
    const a = this._station().attributes;
    const entities = a.entities;
    const source = data.period === "24h" ? data.recent : data.rose;
    const since = data.period === "24h" ? data.end - WSD_PERIODS["24h"].ms : data.roseStart;
    const recent = (points) => points.filter((point) => point.t >= since - 3600 * 1000);
    const directions = recent(wsdHistoryPoints(source, entities.wind_direction, wsdParseDirection));
    const speeds = entities.wind_speed ? recent(wsdHistoryPoints(source, entities.wind_speed)) : [];
    const unit = a.wind_speed_unit || "";
    const rose = wsdStackedRose(directions, speeds, unit, data.end);
    const days = Math.round((data.end - since) / WSD_DAY_MS);
    const subtitle = T.windRoseSpan(days);
    if (!rose || !rose.shares.some((share) => share > 0)) {
      if (rose && rose.calm > 0) {
        return this._chartFrame("rose", T.windRose, "", subtitle, `<div class="rose-caption">${wsdEscape(T.calmShare(`${wsdNumber(rose.calm, language, 0)} %`))}</div>`);
      }
      return this._chartFrame("rose", T.windRose, "", subtitle, `<div class="chart-empty">${wsdEscape(T.noData)}</div>`);
    }
    const max = Math.max(...rose.shares);
    const inner = 14;
    const point = (angle, r) => `${(100 + Math.sin(angle) * r).toFixed(1)} ${(100 - Math.cos(angle) * r).toFixed(1)}`;
    const petals = rose.sectors.map((classes, index) => {
      if (rose.shares[index] <= 0) return "";
      const from = ((index * 22.5 - 9) * Math.PI) / 180;
      const to = ((index * 22.5 + 9) * Math.PI) / 180;
      let radius = inner;
      // One segment per wind class, lightest wind nearest the centre.
      const segments = classes.map((share, windClass) => {
        if (share <= 0) return "";
        const outer = radius + (share / max) * (90 - inner);
        const d = `M${point(from, radius)}L${point(from, outer)}A${outer.toFixed(1)} ${outer.toFixed(1)} 0 0 1 ${point(to, outer)}L${point(to, radius)}A${radius.toFixed(1)} ${radius.toFixed(1)} 0 0 0 ${point(from, radius)}Z`;
        radius = outer;
        return `<path class="${rose.speed ? `w${windClass}` : "plain"}" d="${d}"></path>`;
      }).join("");
      return `<g class="petal" data-index="${index}">${segments}</g>`;
    }).join("");
    const rings = [36, 63, 90].map((r) => `<circle class="grid" cx="100" cy="100" r="${r}"></circle>`).join("");
    const labels = [0, 90, 180, 270].map((angle) => {
      const radians = (angle * Math.PI) / 180;
      return `<text x="${(100 + Math.sin(radians) * 96).toFixed(1)}" y="${(100 - Math.cos(radians) * 96 + 4).toFixed(1)}">${wsdCardinal(angle, language)}</text>`;
    }).join("");
    const calm = rose.speed
      ? `<circle class="calm" cx="100" cy="100" r="${inner - 2}"></circle><text class="calm-text" x="100" y="103">${wsdEscape(`${wsdNumber(rose.calm, language, 0)} %`)}</text>`
      : "";
    const top = rose.shares.indexOf(max);
    this._charts.rose = { kind: "rose", rose, language, unit, digits: wsdDigits("wind_speed", unit) };
    const label = T.roseLabel(wsdCardinal(top * 22.5, language), wsdNumber(max, language, 0));
    const caption = rose.speed ? `${label} · ${T.calmShare(`${wsdNumber(rose.calm, language, 0)} %`)}` : label;
    const body = `
      <div class="rose" data-chart="rose">
        <svg viewBox="0 0 200 200" role="img" aria-label="${wsdEscape(caption)}">${rings}${petals}${calm}${labels}</svg>
        <div class="tooltip" role="status"></div>
      </div>
      <div class="rose-caption">${wsdEscape(caption)}</div>
      ${rose.speed ? this._speedScale(unit, language, T) : ""}`;
    return this._chartFrame("rose", T.windRose, "", subtitle, body);
  }

  /** Night bands of a time chart (24 h and 7 days), from the home's sun times. */
  _nightRects(x) {
    const data = this._data;
    if (data.period === "30d") return "";
    const config = this._hass?.config || {};
    return wsdNights(data.start, data.end, Number(config.latitude), Number(config.longitude))
      .map(([from, to]) => `<rect class="night" x="${x(from).toFixed(1)}" y="0" width="${Math.max(x(to) - x(from), 0).toFixed(1)}" height="${WSD_H}"></rect>`)
      .join("");
  }

  /** Swatches of the wind classes, limits in the displayed unit. */
  _speedScale(unit, language, T) {
    const factor = WSD_TO_KMH[unit] || 1;
    const digits = WSD_FINE_WIND_UNITS.includes(unit) ? 1 : 0;
    const limits = WSD_WIND_CLASSES_KMH.map((kmh) => wsdNumber(kmh / factor, language, digits));
    const labels = [T.calm, ...limits.slice(1).map((limit, index) => `${index ? limits[index] : limits[0]}–${limit}`), `≥ ${limits[limits.length - 1]}`];
    return `<div class="speed-scale" aria-label="${wsdEscape(T.speedScale)}">${labels.map((label, index) => `<span><i class="swatch w${index}"></i>${wsdEscape(label)}</span>`).join("")}<span class="scale-unit">${wsdEscape(unit)}</span></div>`;
  }

  _chartFrame(id, title, unit, subtitle, body) {
    return `
      <section class="chart" data-id="${id}">
        <div class="chart-head">
          <h3>${wsdEscape(title)}${unit ? ` <span class="unit">(${wsdEscape(unit)})</span>` : ""}</h3>
          ${subtitle ? `<span class="chart-sub">${wsdEscape(subtitle)}</span>` : ""}
        </div>
        ${body}
      </section>`;
  }

  _yTicks(scale, y, unit, language, digits) {
    const tickDigits = scale.ticks.some((tick) => !Number.isInteger(tick)) ? Math.max(digits, 1) : 0;
    return `<div class="yticks">${scale.ticks.map((tick) => `<span style="top:${((y(tick) / WSD_H) * 100).toFixed(2)}%">${wsdNumber(tick, language, tickDigits)}</span>`).join("")}</div>`;
  }

  _xTicks(start, end, period, language) {
    const ticks = wsdTimeTicks(start, end, period);
    const style = period === "24h" ? "tick24h" : period === "7d" ? "tick7d" : "tick30d";
    return `<div class="xticks">${ticks.map((tick) => `<span style="left:${(((tick - start) / (end - start)) * 100).toFixed(2)}%">${wsdEscape(wsdFormatTime(tick, style, language))}</span>`).join("")}</div>`;
  }

  // ----------------------------------------------------------- events

  _onClick(event) {
    const button = event.target?.closest?.("[data-period], [data-compare]");
    if (!button) return;
    if (button.dataset?.compare !== undefined) {
      this._compare = !this._compare;
      this._render();
      return;
    }
    const period = button.dataset.period;
    if (!WSD_PERIODS[period] || period === this._period) return;
    this._period = period;
    this._periodChosen = true;
    this._parts = null;
    this._load();
  }

  _hideHover() {
    this.shadowRoot?.querySelectorAll?.(".tooltip.visible, .crosshair.visible, .hover").forEach((element) => {
      element.classList.remove("visible", "hover");
    });
  }

  _onHover(event) {
    const plot = event.target?.closest?.("[data-chart]");
    if (!plot) {
      this._hideHover();
      return;
    }
    const chart = this._charts?.[plot.dataset.chart];
    if (!chart) return;
    const tooltip = plot.querySelector(".tooltip");
    const box = plot.getBoundingClientRect();
    const fraction = Math.min(Math.max((event.clientX - box.left) / box.width, 0), 1);
    const T = WSD_TEXT[chart.language];
    const rows = [];
    let title = "";
    let left = fraction;

    if (chart.kind === "line") {
      const time = chart.start + fraction * (chart.end - chart.start);
      for (const serie of chart.series) {
        const point = this._nearest(serie.points, time);
        if (!point) continue;
        if (!title) {
          title = wsdFormatTime(point.t, chart.style === "day" ? "day" : "point", chart.language);
          left = (point.t - chart.start) / (chart.end - chart.start);
        }
        rows.push({ slot: serie.slot, label: serie.label, value: wsdWithUnit(point.v, chart.unit, chart.language, chart.digits) });
      }
      const crosshair = plot.querySelector(".crosshair");
      crosshair.style.left = `${(left * 100).toFixed(2)}%`;
      crosshair.classList.add("visible");
    } else if (chart.kind === "bar") {
      const index = Math.min(Math.floor(fraction * chart.bars.length), chart.bars.length - 1);
      const bar = chart.bars[index];
      if (!bar || bar.v === null) {
        tooltip.classList.remove("visible");
        return;
      }
      plot.querySelectorAll(".bar.hover").forEach((element) => element.classList.remove("hover"));
      plot.querySelector(`.bar[data-index="${index}"]`)?.classList.add("hover");
      title = wsdFormatTime(bar.t, bar.style === "point" ? "point" : bar.style, chart.language);
      left = (index + 0.5) / chart.bars.length;
      rows.push({ slot: 1, label: T.rain, value: `${wsdNumber(bar.v, chart.language, 1)} mm` });
    } else if (chart.kind === "wind") {
      const time = chart.start + fraction * (chart.end - chart.start);
      const index = chart.buckets.findIndex((bucket) => time >= bucket.t && time < bucket.to);
      const bucket = chart.buckets[index];
      plot.querySelectorAll(".bar.hover").forEach((element) => element.classList.remove("hover"));
      if (!bucket || (bucket.mean === null && bucket.gust === null)) {
        tooltip.classList.remove("visible");
        return;
      }
      plot.querySelector(`.bar[data-index="${index}"]`)?.classList.add("hover");
      title = chart.period === "30d"
        ? wsdFormatTime(bucket.t, "day", chart.language)
        : `${wsdFormatTime(bucket.t, "point", chart.language)} – ${wsdFormatTime(bucket.to, "tick24h", chart.language)}`;
      const middle = (Math.max(bucket.t, chart.start) + bucket.to) / 2;
      left = (middle - chart.start) / (chart.end - chart.start);
      if (bucket.mean !== null) rows.push({ slot: `bar w${wsdWindClass(bucket.mean, chart.unit) ?? 1}`, label: T.wind_speed, value: wsdWithUnit(bucket.mean, chart.unit, chart.language, chart.digits) });
      if (bucket.gust !== null) rows.push({ slot: "gust", label: T.wind_gust, value: wsdWithUnit(bucket.gust, chart.unit, chart.language, chart.digits) });
      if (bucket.lull !== null) rows.push({ slot: "lull", label: T.wind_lull, value: wsdWithUnit(bucket.lull, chart.unit, chart.language, chart.digits) });
      if (chart.compare && bucket.yesterday !== null) rows.push({ slot: "yesterday", label: T.yesterday, value: wsdWithUnit(bucket.yesterday, chart.unit, chart.language, chart.digits) });
      if (bucket.direction !== null) rows.push({ slot: 0, label: T.wind_direction, value: T.windFrom(wsdCardinal(bucket.direction, chart.language)) });
    } else if (chart.kind === "rose") {
      const petal = event.target.closest?.(".petal");
      const roseIndex = petal ? Number(petal.dataset.index) : null;
      plot.querySelectorAll(".petal.hover").forEach((element) => element.classList.remove("hover"));
      if (!petal) {
        tooltip.classList.remove("visible");
        return;
      }
      petal.classList.add("hover");
      const index = Number(petal.dataset.index);
      title = T.windFrom(wsdCardinal(index * 22.5, chart.language));
      rows.push({ slot: 1, label: T.wind_direction, value: T.share(wsdNumber(chart.rose.shares[index], chart.language, 0)) });
      if (chart.rose.mean[roseIndex] !== null) {
        rows.push({ slot: 0, label: T.meanSpeed, value: wsdWithUnit(chart.rose.mean[roseIndex], chart.unit, chart.language, chart.digits) });
      }
    }
    if (!rows.length) return;

    // Values come from sensors: build the tooltip with text nodes.
    tooltip.replaceChildren();
    const heading = document.createElement("div");
    heading.className = "tooltip-title";
    heading.textContent = title;
    tooltip.append(heading);
    for (const row of rows) {
      const line = document.createElement("div");
      line.className = "tooltip-row";
      const key = document.createElement("i");
      key.className = `key s${row.slot}`;
      const value = document.createElement("strong");
      value.textContent = row.value;
      const label = document.createElement("span");
      label.textContent = row.label;
      line.append(key, value, label);
      tooltip.append(line);
    }
    tooltip.style.left = `${(left * 100).toFixed(2)}%`;
    tooltip.classList.toggle("flip", left > 0.6);
    tooltip.classList.add("visible");
  }

  _nearest(points, time) {
    let best = null;
    for (const point of points) {
      if (point.v === null) continue;
      if (!best || Math.abs(point.t - time) < Math.abs(best.t - time)) best = point;
    }
    return best;
  }

  _style() {
    return `<style>
      :host{display:block}
      ha-card{overflow:hidden;border-radius:var(--ha-card-border-radius,16px);color:var(--primary-text-color)}
      ha-card.panel{border-radius:0;box-shadow:none;background:transparent;border:none}
      .dashboard{
        --ws-s1:#2a78d6;--ws-s2:#eb6834;--ws-s3:#1baf7a;
        --ws-grid:var(--divider-color,#e1e0d9);--ws-muted:var(--secondary-text-color,#52514e);
        padding:16px;display:flex;flex-direction:column;gap:16px}
      .dashboard.dark{--ws-s1:#3987e5;--ws-s2:#d95926;--ws-s3:#199e70}
      .dashboard{--ws-w0:#b9bec6;--ws-w1:#00c5c6;--ws-w2:#00a5ca;--ws-w3:#357fc5;--ws-w4:#505bae;--ws-w5:#5a398a;--ws-w6:#5c1658}
      .dashboard.dark{--ws-w0:#5b616b;--ws-w1:#007e80;--ws-w2:#0094b9;--ws-w3:#5aa3ec;--ws-w4:#9fb0ff;--ws-w5:#debdff;--ws-w6:#ffd3ff}
      .dashboard.loading [data-part="charts"]{opacity:.55;transition:opacity .2s}
      header{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px}
      .title{display:flex;align-items:center;gap:14px;min-width:0}
      .icon{display:grid;place-items:center;width:46px;height:46px;flex:0 0 46px;border-radius:14px;background:var(--secondary-background-color);color:var(--ws-muted)}
      .icon.wet{color:var(--ws-s1);background:color-mix(in srgb,var(--ws-s1) 14%,var(--card-background-color,#fff))}
      h2{margin:0;font-size:20px;font-weight:600;line-height:1.25}
      .status{color:var(--ws-muted);font-size:13px}.status.wet{color:var(--ws-s1);font-weight:500}
      .status ha-icon{--mdc-icon-size:15px;vertical-align:-2px}
      .status .low{color:var(--error-color,#d03b3b)}
      .alerts{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0}
      .alert{display:inline-flex;align-items:center;gap:4px;padding:2px 10px 2px 6px;border-radius:999px;font-size:12px;font-weight:600;color:var(--primary-text-color);background:color-mix(in srgb,var(--ws-alert) 18%,var(--card-background-color,#fff));border:1px solid var(--ws-alert)}
      .alert ha-icon{--mdc-icon-size:16px;color:var(--ws-alert)}
      .alert.frost{--ws-alert:#2a78d6}.alert.strong_wind{--ws-alert:#fab219}
      .periods{display:inline-flex;padding:3px;border-radius:999px;background:var(--secondary-background-color)}
      .periods button{border:none;background:transparent;color:var(--ws-muted);font:inherit;font-size:13px;padding:6px 14px;border-radius:999px;cursor:pointer}
      .periods button:hover{color:var(--primary-text-color)}
      .periods button.selected{background:var(--card-background-color,#fff);color:var(--primary-text-color);font-weight:600;box-shadow:0 1px 2px rgba(0,0,0,.12)}
      .periods button:focus-visible{outline:2px solid var(--primary-color);outline-offset:1px}
      .tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}
      .tile{position:relative;display:flex;flex-direction:column;gap:4px;padding:14px 16px;border-radius:14px;background:var(--secondary-background-color);min-height:96px}
      .tile-label{display:flex;align-items:center;gap:6px;color:var(--ws-muted);font-size:13px}
      .tile-label ha-icon{--mdc-icon-size:18px}
      .tile-value{font-size:26px;font-weight:600;line-height:1.15}
      .tile-value small{font-size:13px;font-weight:500;color:var(--ws-muted)}
      .tile-sub{color:var(--ws-muted);font-size:12px;line-height:1.5}
      .trend{display:inline-flex;align-items:center;gap:3px}.trend ha-icon{--mdc-icon-size:15px}
      .compass{position:absolute;top:12px;right:12px;width:58px;height:58px}
      .compass .ring{fill:var(--card-background-color,#fff);stroke:var(--ws-grid);stroke-width:1}
      .compass text{font-size:8px;fill:var(--ws-muted);text-anchor:middle}
      .compass .needle{fill:var(--primary-text-color)}
      .compass .from{fill:var(--ws-s1);stroke:var(--card-background-color,#fff);stroke-width:2}
      .forecast{display:flex;flex-direction:column;gap:10px;padding:14px 16px;border-radius:14px;border:1px solid var(--ws-grid)}
      .days{display:grid;grid-template-columns:repeat(auto-fit,minmax(96px,1fr));gap:8px}
      .day{display:flex;flex-direction:column;align-items:center;gap:4px;padding:6px 4px;text-align:center}
      .day-name{color:var(--ws-muted);font-size:12px;text-transform:capitalize}
      .day > ha-icon{--mdc-icon-size:30px;color:var(--primary-text-color)}
      .day-temp{font-size:14px}.day-temp span{color:var(--ws-muted)}
      .day-rain{display:inline-flex;align-items:center;gap:2px;color:var(--ws-muted);font-size:12px}
      .day-rain ha-icon{--mdc-icon-size:13px;color:var(--ws-s1)}
      .charts{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:12px}
      .chart{display:flex;flex-direction:column;gap:10px;padding:14px 16px 12px;border-radius:14px;border:1px solid var(--ws-grid)}
      .chart-head{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:4px 12px}
      h3{margin:0;font-size:15px;font-weight:600}
      .unit,.chart-sub{color:var(--ws-muted);font-size:12px;font-weight:400}
      .legend{display:flex;flex-wrap:wrap;gap:4px 16px;font-size:12px;color:var(--ws-muted)}
      .legend span{display:inline-flex;align-items:center;gap:6px}
      .legend strong{color:var(--primary-text-color);font-weight:600}
      .key{display:inline-block;width:14px;height:0;border-top:2px solid var(--ws-s1);border-radius:1px}
      .key.s2{border-top-color:var(--ws-s2)}.key.s3{border-top-color:var(--ws-s3);border-top-style:dashed}
      .plot{position:relative;height:180px;margin:0 0 20px 40px}
      .plot svg{display:block;width:100%;height:100%;overflow:visible}
      .grid{stroke:var(--ws-grid);stroke-width:1;vector-effect:non-scaling-stroke;fill:none}
      .baseline{stroke:var(--ws-muted);stroke-width:1;vector-effect:non-scaling-stroke;opacity:.5}
      .line{fill:none;stroke-width:2;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke}
      .line.s1{stroke:var(--ws-s1)}.line.s2{stroke:var(--ws-s2)}.line.s3{stroke:var(--ws-s3);stroke-dasharray:6 4}
      .band{fill:var(--ws-s1);opacity:.1;stroke:none}
      .bar{fill:var(--ws-s1)}.bar.hover{fill:color-mix(in srgb,var(--ws-s1) 75%,#fff)}
      .bar.w0{fill:var(--ws-w0)}.bar.w1{fill:var(--ws-w1)}.bar.w2{fill:var(--ws-w2)}.bar.w3{fill:var(--ws-w3)}
      .bar.w4{fill:var(--ws-w4)}.bar.w5{fill:var(--ws-w5)}.bar.w6{fill:var(--ws-w6)}
      .bar[class*=" w"].hover{opacity:.75}
      .gust,.lull{stroke-linecap:round;vector-effect:non-scaling-stroke}
      .gust{stroke:var(--primary-text-color);stroke-width:2.5;opacity:.8}
      .lull{stroke:var(--ws-muted);stroke-width:2;stroke-dasharray:3 3}
      .line.yesterday{stroke:var(--ws-muted);stroke-dasharray:5 4;opacity:.8}
      .night{fill:var(--ws-muted);opacity:.08}
      .dashboard.dark .night{fill:#000;opacity:.25}
      .key.bar{width:10px;height:10px;border:none;border-radius:2px;background:var(--ws-s1)}
      .key.w0{background:var(--ws-w0)}.key.w1{background:var(--ws-w1)}.key.w2{background:var(--ws-w2)}.key.w3{background:var(--ws-w3)}
      .key.w4{background:var(--ws-w4)}.key.w5{background:var(--ws-w5)}.key.w6{background:var(--ws-w6)}
      .key.gust{border-top:2.5px solid var(--primary-text-color);opacity:.8}
      .key.lull{border-top:2px dashed var(--ws-muted)}
      .key.yesterday{border-top:2px dashed var(--ws-muted)}
      .key.s0{width:0;border:none}
      .key.arrow{width:12px;height:12px;border:none}.key.arrow svg{display:block;width:100%;height:100%;fill:var(--ws-muted)}
      .plot.with-arrows{margin-top:22px}
      .arrows{position:absolute;left:0;right:0;top:-20px;height:14px}
      .arrows span{position:absolute;width:12px;height:12px;transform:translateX(-50%)}
      .arrows svg{display:block;width:100%;height:100%}
      .arrows .w0 svg,.arrows .w1 svg{fill:var(--ws-w1)}.arrows .w2 svg{fill:var(--ws-w2)}.arrows .w3 svg{fill:var(--ws-w3)}
      .arrows .w4 svg{fill:var(--ws-w4)}.arrows .w5 svg{fill:var(--ws-w5)}.arrows .w6 svg{fill:var(--ws-w6)}
      .toggle{margin-left:auto;border:1px solid var(--ws-grid);background:transparent;color:var(--ws-muted);font:inherit;font-size:12px;padding:3px 10px;border-radius:999px;cursor:pointer}
      .toggle[aria-pressed="true"]{background:var(--secondary-background-color);color:var(--primary-text-color)}
      .toggle:focus-visible{outline:2px solid var(--primary-color);outline-offset:1px}
      .speed-scale{display:flex;flex-wrap:wrap;align-items:center;gap:4px 10px;font-size:11px;color:var(--ws-muted)}
      .speed-scale span{display:inline-flex;align-items:center;gap:4px}
      .swatch{display:inline-block;width:10px;height:10px;border-radius:2px}
      .swatch.w0{background:var(--ws-w0)}.swatch.w1{background:var(--ws-w1)}.swatch.w2{background:var(--ws-w2)}.swatch.w3{background:var(--ws-w3)}
      .swatch.w4{background:var(--ws-w4)}.swatch.w5{background:var(--ws-w5)}.swatch.w6{background:var(--ws-w6)}
      .yticks{position:absolute;inset:0 auto 0 -40px;width:34px}
      .yticks span{position:absolute;right:0;transform:translateY(-50%);font-size:11px;color:var(--ws-muted);font-variant-numeric:tabular-nums}
      .xticks{position:absolute;left:0;right:0;bottom:-20px;height:16px}
      .xticks span{position:absolute;transform:translateX(-50%);font-size:11px;color:var(--ws-muted);white-space:nowrap}
      .xticks.months{display:flex;justify-content:space-around}.xticks.months span{position:static;transform:none}
      .crosshair{position:absolute;top:0;bottom:0;width:1px;background:var(--ws-muted);opacity:0;pointer-events:none}
      .crosshair.visible{opacity:.6}
      .tooltip{position:absolute;top:4px;transform:translateX(12px);min-width:120px;padding:8px 10px;border-radius:10px;background:var(--card-background-color,#fff);box-shadow:0 2px 10px rgba(0,0,0,.18);font-size:12px;pointer-events:none;opacity:0;z-index:2}
      .tooltip.flip{transform:translateX(calc(-100% - 12px))}
      .tooltip.visible{opacity:1}
      .tooltip-title{color:var(--ws-muted);margin-bottom:4px;white-space:nowrap}
      .tooltip-row{display:flex;align-items:center;gap:6px;white-space:nowrap}
      .tooltip-row strong{font-size:13px;color:var(--primary-text-color)}
      .tooltip-row span{color:var(--ws-muted)}
      .rose{position:relative;max-width:260px;width:100%;margin:0 auto}
      .rose svg{display:block;width:100%;height:auto}
      .rose text{font-size:11px;fill:var(--ws-muted);text-anchor:middle}
      .petal path{stroke:var(--card-background-color,#fff);stroke-width:1.5;cursor:default}
      .petal .plain{fill:var(--ws-s1)}
      .petal .w1{fill:var(--ws-w1)}.petal .w2{fill:var(--ws-w2)}.petal .w3{fill:var(--ws-w3)}
      .petal .w4{fill:var(--ws-w4)}.petal .w5{fill:var(--ws-w5)}.petal .w6{fill:var(--ws-w6)}
      .petal.hover{opacity:.75}
      .calm{fill:var(--secondary-background-color);stroke:var(--ws-w0);stroke-width:1.5}
      .rose .calm-text{font-size:9px;fill:var(--primary-text-color)}
      .rose .tooltip{left:50%}
      .rose-caption{text-align:center;color:var(--ws-muted);font-size:12px}
      .chart-empty,.charts-empty{color:var(--ws-muted);font-size:13px;padding:8px 0}
      .empty{padding:20px;color:var(--ws-muted)}
      @media (max-width:600px){.dashboard{padding:12px}.tile-value{font-size:22px}.plot{height:150px}}
    </style>`;
  }
}

wsdDefine("weather-station-dashboard-card", WeatherStationDashboardCard, "_render");

class WeatherStationDashboardCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config || {};
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _render() {
    if (!this._config) return;
    const T = WSD_TEXT[wsdLanguage(this._hass)];
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.addEventListener("value-changed", (event) => {
        this._config = event.detail.value;
        this.dispatchEvent(new CustomEvent("config-changed", {
          detail: { config: this._config },
          bubbles: true,
          composed: true,
        }));
      });
      this.appendChild(this._form);
    }
    this._form.computeLabel = (schema) => T.editor[schema.name] || schema.name;
    this._form.hass = this._hass;
    this._form.schema = [
      { name: "entity", selector: { entity: { include_entities: wsdStations(this._hass).map((state) => state.entity_id) } } },
      { name: "title", selector: { text: {} } },
      {
        name: "period",
        selector: { select: { mode: "dropdown", options: Object.keys(WSD_PERIODS).map((value) => ({ value, label: T.periods[value] })) } },
      },
    ];
    this._form.data = { period: "24h", ...this._config };
  }
}

wsdDefine("weather-station-dashboard-card-editor", WeatherStationDashboardCardEditor);

// The sidebar panel: a toolbar, one tab per station, and the dashboard card.
class WeatherStationPanel extends HTMLElement {
  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  set narrow(narrow) {
    this._narrow = narrow;
    this._render();
  }

  set panel(panel) {
    this._panel = panel;
  }

  set route(_route) {}

  _render() {
    if (!this._hass) return;
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.innerHTML = `
        <style>
          :host{display:block;min-height:100vh;background:var(--primary-background-color);color:var(--primary-text-color)}
          .toolbar{position:sticky;top:0;z-index:3;display:flex;align-items:center;gap:8px;height:var(--header-height,56px);padding:0 12px;background:var(--app-header-background-color,var(--primary-color));color:var(--app-header-text-color,#fff);border-bottom:var(--app-header-border-bottom,none)}
          .toolbar h1{margin:0 0 0 4px;font-size:20px;font-weight:400;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
          .tabs{display:flex;gap:4px;overflow-x:auto}
          .tabs button{border:none;background:transparent;color:inherit;font:inherit;font-size:14px;padding:8px 12px;border-radius:8px;cursor:pointer;opacity:.75}
          .tabs button.selected{opacity:1;font-weight:600;background:rgba(255,255,255,.16)}
          .content{max-width:1440px;margin:0 auto;padding:8px}
        </style>
        <div class="toolbar"><span class="menu"></span><h1></h1><div class="tabs" role="tablist"></div></div>
        <div class="content"></div>`;
      this.shadowRoot.querySelector(".tabs").addEventListener("click", (event) => {
        const button = event.target.closest("[data-entity]");
        if (!button) return;
        this._selected = button.dataset.entity;
        this._render();
      });
    }
    const T = WSD_TEXT[wsdLanguage(this._hass)];
    const stations = wsdStations(this._hass);
    if (!stations.some((station) => station.entity_id === this._selected)) {
      this._selected = stations[0]?.entity_id;
    }
    if (!this._menu) {
      this._menu = document.createElement("ha-menu-button");
      this.shadowRoot.querySelector(".menu").append(this._menu);
    }
    this._menu.hass = this._hass;
    this._menu.narrow = this._narrow;
    this.shadowRoot.querySelector("h1").textContent = T.panelTitle;
    const tabs = this.shadowRoot.querySelector(".tabs");
    const names = stations.map((station) => `${station.entity_id}|${station.attributes.station_name}`).join(",");
    if (tabs.dataset.names !== names || tabs.dataset.selected !== this._selected) {
      tabs.dataset.names = names;
      tabs.dataset.selected = this._selected || "";
      tabs.replaceChildren(...(stations.length > 1 ? stations.map((station) => {
        const button = document.createElement("button");
        button.type = "button";
        button.setAttribute("role", "tab");
        button.dataset.entity = station.entity_id;
        button.className = station.entity_id === this._selected ? "selected" : "";
        button.setAttribute("aria-selected", String(station.entity_id === this._selected));
        button.textContent = station.attributes.station_name || station.entity_id;
        return button;
      }) : []));
    }
    if (!this._card) {
      this._card = document.createElement("weather-station-dashboard-card");
      this.shadowRoot.querySelector(".content").append(this._card);
    }
    if (this._cardEntity !== this._selected) {
      this._cardEntity = this._selected;
      this._card.setConfig({ entity: this._selected || "", panel: true });
    }
    this._card.hass = this._hass;
  }
}

wsdDefine("weather-station-panel", WeatherStationPanel);

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === "weather-station-dashboard-card")) {
  window.customCards.push({
    type: "weather-station-dashboard-card",
    // The card picker is shown in the interface language, set on <html lang>.
    name: WSD_TEXT[wsdPageLanguage()].name,
    description: WSD_TEXT[wsdPageLanguage()].description,
    preview: false,
  });
}
