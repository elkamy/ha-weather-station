// Weather Station dashboard: the `weather-station-dashboard-card` Lovelace card
// and the `weather-station-panel` sidebar panel that shows it full page.

const WSD_TEXT = {
  fr: {
    name: "Tableau de bord météo",
    description: "Tous les relevés de votre station météo et leurs graphiques sur 24 heures, 7 jours ou 30 jours.",
    panelTitle: "Météo",
    alerts: { frost: "Risque de gel", strong_wind: "Vent fort" },
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
// Line charts, in display order: the series of each chart in fixed slot order.
const WSD_LINE_CHARTS = [
  { key: "temperature", series: ["temperature", "feels_like", "dew_point"] },
  { key: "humidity", series: ["humidity"], min: 0, max: 100 },
  { key: "pressure", series: ["pressure"] },
  { key: "wind", series: ["wind_speed", "wind_gust"], min: 0 },
  { key: "uv_index", series: ["uv_index"], min: 0 },
  { key: "illuminance", series: ["illuminance"], min: 0 },
  { key: "solar_radiation", series: ["solar_radiation"], min: 0 },
];
const WSD_DIGITS = {
  temperature: 1, feels_like: 1, dew_point: 1, humidity: 0, pressure: 0, wind_speed: 0, wind_gust: 0,
  uv_index: 1, illuminance: 0, solar_radiation: 0, rain: 1,
};
const WSD_NUMERIC = Object.keys(WSD_DIGITS).filter((key) => key !== "rain");
// Wind in m/s or knots needs a decimal (3.6 m/s), not in km/h or mph.
const WSD_FINE_WIND_UNITS = ["m/s", "kn", "ft/s"];

function wsdDigits(key, unit) {
  if ((key === "wind_speed" || key === "wind_gust") && WSD_FINE_WIND_UNITS.includes(unit)) return 1;
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

function wsdDefine(tag, component) {
  // Home Assistant's frontend replaces window.customElements with a scoped
  // registry while it starts: register again once the frontend and Lovelace exist.
  const define = () => {
    const registry = globalThis.customElements;
    if (!registry.get(tag)) registry.define(tag, component);
  };
  define();
  for (const ready of ["home-assistant", "ha-panel-lovelace"]) {
    customElements.whenDefined?.(ready)?.then(define);
  }
}

// ----------------------------------------------------------------- charts

const WSD_W = 1000;
const WSD_H = 200;

function wsdPath(points, x, y) {
  let path = "";
  let open = false;
  for (const point of points) {
    if (point.v === null) {
      open = false;
      continue;
    }
    path += `${open ? "L" : "M"}${x(point.t).toFixed(1)} ${y(point.v).toFixed(1)}`;
    open = true;
  }
  return path;
}

function wsdBand(points, x, y) {
  const valid = points.filter((point) => point.min !== null && point.max !== null);
  if (valid.length < 2) return "";
  const top = valid.map((point) => `${x(point.t).toFixed(1)} ${y(point.max).toFixed(1)}`);
  const bottom = valid.slice().reverse().map((point) => `${x(point.t).toFixed(1)} ${y(point.min).toFixed(1)}`);
  return `M${top.join("L")}L${bottom.join("L")}Z`;
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
    if (changed) this._render();
  }

  connectedCallback() {
    this._timer = setInterval(() => this._load(), WSD_REFRESH_MS);
  }

  disconnectedCallback() {
    clearInterval(this._timer);
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
    const numeric = WSD_NUMERIC.filter((key) => entities[key]);
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
        statistic_ids: numeric.map((key) => entities[key]),
        period: config.statistics,
        types: ["mean", "min", "max"],
      }) : null,
      rose: period !== "24h" && entities.wind_direction ? hass.callWS({
        type: "history/history_during_period",
        start_time: iso(roseStart),
        end_time: iso(now),
        entity_ids: [entities.wind_direction],
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
    const id = this._station()?.attributes?.entities?.[key];
    if (!data || !id) return [];
    if (data.period === "24h" || !data.statistics) {
      return wsdHistoryPoints(data.recent, id).filter((point) => point.t >= data.start);
    }
    return wsdStatisticsPoints(data.statistics, id);
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
    const status = raining ? T.raining : `${T.dry} · ${age ? T.lastRain(age) : T.noRainYet}`;
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
          <div class="icon ${raining ? "wet" : ""}"><ha-icon icon="${raining ? "mdi:weather-pouring" : "mdi:weather-partly-cloudy"}"></ha-icon></div>
          <div>
            <h2>${wsdEscape(title)}</h2>
            ${alerts ? `<div class="alerts">${alerts}</div>` : ""}
            <span class="status ${raining ? "wet" : ""}">${wsdEscape(status)}${battery !== null ? ` · <span class="${battery <= 20 ? "low" : ""}" title="${wsdEscape(T.battery)}"><ha-icon icon="${battery <= 20 ? "mdi:battery-alert" : "mdi:battery"}"></ha-icon>${wsdNumber(battery, language, 0)} %</span>` : ""}</span>
          </div>
        </div>
        <div class="periods" role="group" aria-label="${wsdEscape(T.periodLabel)}">${periods}</div>
      </header>`;
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
        has("wind_gust") ? `${T.wind_gust} ${value("wind_gust")}` : "",
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
      charts.push(this._lineChart(chart, keys, language, T));
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
    const lines = series.map((serie) => `<path class="line s${serie.slot}" d="${wsdPath(serie.points, x, y)}"></path>`).join("");
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
        <svg viewBox="0 0 ${WSD_W} ${WSD_H}" preserveAspectRatio="none" role="img" aria-label="${wsdEscape(label)}">${grid}${bands}${lines}</svg>
        ${this._xTicks(data.start, data.end, data.period, language)}
        <div class="crosshair"></div><div class="tooltip" role="status"></div>
      </div>`;
    return this._chartFrame(id, title, unit, "", body);
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
      const r = Math.min(4, width / 2, height);
      const top = WSD_H - height;
      return `<path class="bar" data-index="${index}" d="M${left.toFixed(1)} ${WSD_H}V${(top + r).toFixed(1)}Q${left.toFixed(1)} ${top.toFixed(1)} ${(left + r).toFixed(1)} ${top.toFixed(1)}H${(left + width - r).toFixed(1)}Q${(left + width).toFixed(1)} ${top.toFixed(1)} ${(left + width).toFixed(1)} ${(top + r).toFixed(1)}V${WSD_H}Z"></path>`;
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
    const id = this._station().attributes.entities.wind_direction;
    const points = data.period === "24h"
      ? wsdHistoryPoints(data.recent, id, wsdParseDirection)
      : wsdHistoryPoints(data.rose, id, wsdParseDirection);
    const since = data.period === "24h" ? data.end - WSD_PERIODS["24h"].ms : data.roseStart;
    const rose = wsdWindRose(points.filter((point) => point.t >= since - 3600 * 1000), data.end);
    const days = Math.round((data.end - since) / (24 * 3600 * 1000));
    const subtitle = T.windRoseSpan(days);
    if (!rose) return this._chartFrame("rose", T.windRose, "", subtitle, `<div class="chart-empty">${wsdEscape(T.noData)}</div>`);
    const max = Math.max(...rose);
    const petals = rose.map((share, index) => {
      if (share <= 0) return "";
      const radius = 12 + (share / max) * 78;
      const from = ((index * 22.5 - 9) * Math.PI) / 180;
      const to = ((index * 22.5 + 9) * Math.PI) / 180;
      const point = (angle, r) => `${(100 + Math.sin(angle) * r).toFixed(1)} ${(100 - Math.cos(angle) * r).toFixed(1)}`;
      return `<path class="petal" data-index="${index}" d="M${point(from, 10)}L${point(from, radius)}A${radius.toFixed(1)} ${radius.toFixed(1)} 0 0 1 ${point(to, radius)}L${point(to, 10)}A10 10 0 0 0 ${point(from, 10)}Z"></path>`;
    }).join("");
    const rings = [30, 60, 90].map((r) => `<circle class="grid" cx="100" cy="100" r="${r}"></circle>`).join("");
    const labels = [0, 90, 180, 270].map((angle) => {
      const radians = (angle * Math.PI) / 180;
      return `<text x="${(100 + Math.sin(radians) * 96).toFixed(1)}" y="${(100 - Math.cos(radians) * 96 + 4).toFixed(1)}">${wsdCardinal(angle, language)}</text>`;
    }).join("");
    const top = rose.indexOf(max);
    this._charts.rose = { kind: "rose", rose, language };
    const label = T.roseLabel(wsdCardinal(top * 22.5, language), wsdNumber(max, language, 0));
    const body = `
      <div class="rose" data-chart="rose">
        <svg viewBox="0 0 200 200" role="img" aria-label="${wsdEscape(label)}">${rings}${petals}${labels}</svg>
        <div class="tooltip" role="status"></div>
      </div>
      <div class="rose-caption">${wsdEscape(label)}</div>`;
    return this._chartFrame("rose", T.windRose, "", subtitle, body);
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
    const button = event.target?.closest?.("[data-period]");
    if (!button) return;
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
    } else if (chart.kind === "rose") {
      const petal = event.target.closest?.(".petal");
      plot.querySelectorAll(".petal.hover").forEach((element) => element.classList.remove("hover"));
      if (!petal) {
        tooltip.classList.remove("visible");
        return;
      }
      petal.classList.add("hover");
      const index = Number(petal.dataset.index);
      title = T.windFrom(wsdCardinal(index * 22.5, chart.language));
      rows.push({ slot: 1, label: T.wind_direction, value: T.share(wsdNumber(chart.rose[index], chart.language, 0)) });
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
      .petal{fill:var(--ws-s1);stroke:var(--card-background-color,#fff);stroke-width:2;cursor:default}
      .petal.hover{fill:color-mix(in srgb,var(--ws-s1) 75%,#fff)}
      .rose .tooltip{left:50%}
      .rose-caption{text-align:center;color:var(--ws-muted);font-size:12px}
      .chart-empty,.charts-empty{color:var(--ws-muted);font-size:13px;padding:8px 0}
      .empty{padding:20px;color:var(--ws-muted)}
      @media (max-width:600px){.dashboard{padding:12px}.tile-value{font-size:22px}.plot{height:150px}}
    </style>`;
  }
}

wsdDefine("weather-station-dashboard-card", WeatherStationDashboardCard);

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
