const WEATHER_STATION_TEXT = {
  fr: {
    name: "Station météo",
    description: "Relevés de votre station météo : pluie du jour, intensité, cumuls et pluie heure par heure.",
    noStation: "Aucune station Weather Station trouvée. Ajoutez l'intégration dans Paramètres › Appareils et services.",
    notFound: (entity) => `Station introuvable : ${entity}`,
    raining: "Il pleut",
    dry: "Pas de pluie",
    rate: (value) => `${value} mm/h`,
    lastRain: (age) => `Dernière pluie ${age}`,
    noRainYet: "Aucune pluie enregistrée",
    today: "Aujourd'hui",
    lastHour: "1 h",
    last24h: "24 h",
    week: "Semaine",
    month: "Mois",
    year: "Année",
    chartTitle: "Pluie heure par heure (24 h)",
    chartLabel: (total) => `Pluie des dernières 24 heures : ${total} mm`,
    chartMax: (value) => `max. ${value} mm`,
    noRain24h: "Pas de pluie ces dernières 24 heures.",
    justNow: "à l’instant",
    minutesAgo: (n) => `il y a ${n} min`,
    hoursAgo: (n) => `il y a ${n} h`,
    daysAgo: (n) => `il y a ${n} j`,
    temperature: "Température",
    humidity: "Humidité",
    pressure: "Pression",
    wind_speed: "Vent",
    wind_gust: "Rafales",
    wind_direction: "Direction du vent",
    uv_index: "Indice UV",
    battery: "Batterie",
    editor: { entity: "Station", title: "Titre (facultatif)", show_chart: "Afficher la pluie heure par heure" },
  },
  en: {
    name: "Weather station",
    description: "Readings of your weather station: today's rain, rate, totals and hourly rain.",
    noStation: "No Weather Station found. Add the integration in Settings › Devices & services.",
    notFound: (entity) => `Station not found: ${entity}`,
    raining: "Raining",
    dry: "No rain",
    rate: (value) => `${value} mm/h`,
    lastRain: (age) => `Last rain ${age}`,
    noRainYet: "No rain recorded yet",
    today: "Today",
    lastHour: "1 h",
    last24h: "24 h",
    week: "Week",
    month: "Month",
    year: "Year",
    chartTitle: "Hourly rain (24 h)",
    chartLabel: (total) => `Rain over the last 24 hours: ${total} mm`,
    chartMax: (value) => `max ${value} mm`,
    noRain24h: "No rain over the last 24 hours.",
    justNow: "just now",
    minutesAgo: (n) => `${n} min ago`,
    hoursAgo: (n) => `${n} h ago`,
    daysAgo: (n) => `${n} d ago`,
    temperature: "Temperature",
    humidity: "Humidity",
    pressure: "Pressure",
    wind_speed: "Wind",
    wind_gust: "Gusts",
    wind_direction: "Wind direction",
    uv_index: "UV index",
    battery: "Battery",
    editor: { entity: "Station", title: "Title (optional)", show_chart: "Show hourly rain" },
  },
};

const WEATHER_STATION_EXTRAS = [
  { key: "temperature", icon: "mdi:thermometer" },
  { key: "humidity", icon: "mdi:water-percent" },
  { key: "pressure", icon: "mdi:gauge" },
  { key: "wind_speed", icon: "mdi:weather-windy" },
  { key: "wind_gust", icon: "mdi:weather-windy-variant" },
  { key: "wind_direction", icon: "mdi:compass-outline" },
  { key: "uv_index", icon: "mdi:sun-wireless" },
];
const WEATHER_STATION_CARDINALS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];

function weatherStationCardinal(degrees, language) {
  const value = Number(degrees);
  if (degrees === null || degrees === undefined || !Number.isFinite(value)) return "—";
  const name = WEATHER_STATION_CARDINALS[Math.round((((value % 360) + 360) % 360) / 22.5) % 16];
  return language === "fr" ? name.replace(/W/g, "O") : name;
}

function weatherStationLanguage(hass) {
  const language = String(hass?.locale?.language || hass?.language || "fr").toLowerCase();
  return language.startsWith("fr") ? "fr" : "en";
}

function weatherStationPageLanguage() {
  const lang = typeof document !== "undefined" ? document.documentElement?.lang : "";
  return weatherStationLanguage({ language: lang || "fr" });
}

function weatherStationEscape(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

function weatherStationNumber(value, language, digits = 1) {
  const number = Number(value);
  if (value === null || value === undefined || value === "" || !Number.isFinite(number)) return "—";
  return number.toLocaleString(language === "fr" ? "fr-FR" : "en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function weatherStationAge(iso, T, now = Date.now()) {
  const time = Date.parse(iso);
  if (!Number.isFinite(time)) return null;
  const minutes = Math.max(0, Math.floor((now - time) / 60000));
  if (minutes < 1) return T.justNow;
  if (minutes < 60) return T.minutesAgo(minutes);
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return T.hoursAgo(hours);
  return T.daysAgo(Math.floor(hours / 24));
}

// Home Assistant's frontend replaces window.customElements with a scoped
// registry while it starts: a card loaded from the cache may register on the
// native one first, so register again once the frontend and Lovelace exist.
// Version of this file, kept equal to the integration's manifest version.
const WEATHER_STATION_VERSION = "0.7.0";
const WEATHER_STATION_OUTDATED_TEXT = {
  fr: (version) => `Une nouvelle version de Weather Station (${version}) est installée : rechargez la page (Ctrl+Maj+R). Dans l'application : Paramètres › Débogage › Réinitialiser le cache du frontend.`,
  en: (version) => `A new version of Weather Station (${version}) is installed: reload the page (Ctrl+Shift+R). In the app: Settings › Debugging › Reset frontend cache.`,
};

function weatherStationIsOlder(version, than) {
  const parts = (value) => String(value || "0").split(".").map((part) => parseInt(part, 10) || 0);
  const a = parts(version);
  const b = parts(than);
  for (let index = 0; index < 3; index += 1) {
    if ((a[index] || 0) !== (b[index] || 0)) return (a[index] || 0) < (b[index] || 0);
  }
  return false;
}

function weatherStationOutdatedBanner(element) {
  const root = element?.shadowRoot;
  if (!root || String(root.innerHTML).includes("ws-outdated")) return;
  const text = WEATHER_STATION_OUTDATED_TEXT[weatherStationPageLanguage()](WEATHER_STATION_VERSION);
  const style = "display:block;margin:0 0 8px;padding:10px 12px;border-radius:10px;background:#fab219;color:#1a1a19;font-size:13px;line-height:1.4";
  if (typeof document !== "undefined" && typeof root.prepend === "function") {
    const banner = document.createElement("div");
    banner.className = "ws-outdated";
    banner.setAttribute("role", "alert");
    banner.style.cssText = style;
    banner.textContent = text;
    root.prepend(banner);
  } else {
    root.innerHTML = `<div class="ws-outdated" role="alert" style="${style}">${weatherStationEscape(text)}</div>${root.innerHTML}`;
  }
}

/**
 * A browser cache can load an older copy of this file first: the older class
 * keeps the tag (custom elements cannot be redefined), so its cards would
 * silently miss the new features. This newer file then makes them show a
 * reload banner after each render.
 */
function weatherStationFlagOutdated(existing, renderMethod) {
  const proto = existing?.prototype;
  if (!proto || typeof proto[renderMethod] !== "function" || proto.__wsOutdatedFlagged) return;
  const original = proto[renderMethod];
  proto[renderMethod] = function renderWithOutdatedBanner(...args) {
    const result = original.apply(this, args);
    weatherStationOutdatedBanner(this);
    return result;
  };
  proto.__wsOutdatedFlagged = true;
}

function weatherStationDefine(tag, component, renderMethod = null) {
  component.WS_VERSION = WEATHER_STATION_VERSION;
  const define = () => {
    const registry = globalThis.customElements;
    const existing = registry.get(tag);
    if (!existing) registry.define(tag, component);
    else if (renderMethod && existing !== component && weatherStationIsOlder(existing.WS_VERSION, WEATHER_STATION_VERSION)) {
      weatherStationFlagOutdated(existing, renderMethod);
    }
  };
  define();
  for (const ready of ["home-assistant", "ha-panel-lovelace"]) {
    customElements.whenDefined?.(ready)?.then(define);
  }
}

function weatherStationStations(hass) {
  return Object.values(hass?.states || {})
    .filter((state) => state?.attributes?.weather_station === true);
}

class WeatherStationCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement("weather-station-card-editor");
  }

  static getStubConfig(hass) {
    const station = weatherStationStations(hass)[0];
    return { entity: station ? station.entity_id : "", show_chart: true };
  }

  // Sections dashboards: half width by default.
  getGridOptions() {
    return { columns: 6, min_columns: 4 };
  }

  setConfig(config) {
    this.config = { show_chart: true, ...(config || {}) };
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    // Home Assistant sets hass on every state change: only re-render when the
    // station itself changed.
    const station = this._station();
    if (!this._hasRendered || station !== this._tracked) {
      this._hasRendered = true;
      this._tracked = station;
      this.render();
    }
  }

  connectedCallback() {
    // Keeps the "last rain" age current between updates.
    this._ageTimer = setInterval(() => this.render(), 60 * 1000);
  }

  disconnectedCallback() {
    clearInterval(this._ageTimer);
  }

  getCardSize() {
    return this.config?.show_chart === false ? 3 : 5;
  }

  _station() {
    const entity = this.config?.entity;
    if (entity) return this._hass?.states?.[entity];
    return weatherStationStations(this._hass)[0];
  }

  _chart(hourly, language, T) {
    const values = (Array.isArray(hourly) ? hourly : []).map((value) => Math.max(Number(value) || 0, 0));
    const total = values.reduce((sum, value) => sum + value, 0);
    if (!values.length || total <= 0) {
      return `<div class="chart"><div class="chart-heading">${T.chartTitle}</div><div class="chart-empty">${T.noRain24h}</div></div>`;
    }
    const max = Math.max(...values);
    const width = 240;
    const height = 64;
    const slot = width / values.length;
    const bars = values.map((value, index) => {
      const barHeight = value > 0 ? Math.max((value / max) * height, 2) : 0;
      return `<rect class="bar" x="${(index * slot + 1).toFixed(2)}" y="${(height - barHeight).toFixed(2)}" width="${(slot - 2).toFixed(2)}" height="${barHeight.toFixed(2)}" rx="1.5"></rect>`;
    }).join("");
    const now = new Date();
    const labels = [-23, -17, -11, -5, 0].map((offset) => {
      const date = new Date(now.getTime() + offset * 3600 * 1000);
      return `<span>${String(date.getHours()).padStart(2, "0")}h</span>`;
    }).join("");
    return `
      <div class="chart">
        <div class="chart-heading"><span>${T.chartTitle}</span><span class="chart-max">${T.chartMax(weatherStationNumber(max, language))}</span></div>
        <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="${weatherStationEscape(T.chartLabel(weatherStationNumber(total, language)))}">
          <line class="baseline" x1="0" y1="${height}" x2="${width}" y2="${height}"></line>
          ${bars}
        </svg>
        <div class="chart-labels">${labels}</div>
      </div>`;
  }

  render() {
    if (!this.shadowRoot || !this.config) return;
    const language = weatherStationLanguage(this._hass);
    const T = WEATHER_STATION_TEXT[language];
    const station = this._station();
    if (!this._hass) {
      this.shadowRoot.innerHTML = "";
      return;
    }
    if (!station) {
      const message = this.config.entity ? T.notFound(this.config.entity) : T.noStation;
      this.shadowRoot.innerHTML = `<ha-card><div class="empty">${weatherStationEscape(message)}</div></ha-card>${this._style()}`;
      return;
    }

    const a = station.attributes;
    const raining = a.raining === true;
    const age = a.last_rain ? weatherStationAge(a.last_rain, T) : null;
    const status = raining
      ? `${T.raining} · ${T.rate(weatherStationNumber(a.rain_rate, language))}`
      : (age ? T.lastRain(age) : T.noRainYet);
    const title = this.config.title || a.station_name || a.friendly_name || T.name;
    const tiles = [
      [T.lastHour, a.rain_last_hour],
      [T.last24h, a.rain_last_24h],
      [T.week, a.rain_week],
      [T.month, a.rain_month],
      [T.year, a.rain_year],
    ].map(([label, value]) => `
      <div class="tile"><span>${label}</span><strong>${weatherStationNumber(value, language)}<small> mm</small></strong></div>`).join("");

    const extras = WEATHER_STATION_EXTRAS
      .filter(({ key }) => Object.prototype.hasOwnProperty.call(a, key))
      .map(({ key, icon }) => {
        const value = a[key];
        if (key === "wind_direction") {
          return `<div class="extra" title="${weatherStationEscape(T[key])}"><ha-icon icon="${icon}"></ha-icon><span>${weatherStationCardinal(value, language)}</span></div>`;
        }
        const unit = a[`${key}_unit`] || "";
        // Wind in m/s or knots needs a decimal (3.6 m/s), not in km/h or mph.
        const fineWind = (key === "wind_speed" || key === "wind_gust") && ["m/s", "kn", "ft/s"].includes(unit);
        const digits = key === "temperature" || key === "uv_index" || fineWind ? 1 : 0;
        return `<div class="extra" title="${weatherStationEscape(T[key])}"><ha-icon icon="${icon}"></ha-icon><span>${weatherStationNumber(value, language, digits)}${value === null || value === undefined ? "" : weatherStationEscape(unit ? ` ${unit}` : "")}</span></div>`;
      });
    if (a.battery !== null && a.battery !== undefined) {
      const low = Number(a.battery) <= 20;
      extras.push(`<div class="extra${low ? " low" : ""}" title="${weatherStationEscape(T.battery)}"><ha-icon icon="${low ? "mdi:battery-alert" : "mdi:battery"}"></ha-icon><span>${weatherStationNumber(a.battery, language, 0)} %</span></div>`);
    }

    this.shadowRoot.innerHTML = `
      <ha-card>
        <header>
          <div class="icon ${raining ? "wet" : ""}"><ha-icon icon="${raining ? "mdi:weather-pouring" : "mdi:weather-partly-cloudy"}"></ha-icon></div>
          <div class="heading">
            <h2>${weatherStationEscape(title)}</h2>
            <span class="status ${raining ? "wet" : ""}">${weatherStationEscape(status)}</span>
          </div>
        </header>
        <div class="hero">
          <span>${T.today}</span>
          <strong>${weatherStationNumber(station.state, language)}<small> mm</small></strong>
        </div>
        <div class="tiles">${tiles}</div>
        ${this.config.show_chart === false ? "" : this._chart(a.hourly_rain, language, T)}
        ${extras.length ? `<div class="extras">${extras.join("")}</div>` : ""}
      </ha-card>
      ${this._style()}`;
  }

  _style() {
    return `<style>
      ha-card{overflow:hidden;border-radius:var(--ha-card-border-radius,16px);color:var(--primary-text-color)}
      header{display:flex;align-items:center;gap:14px;padding:16px 18px 6px}
      .icon{display:grid;place-items:center;width:46px;height:46px;flex:0 0 46px;border-radius:14px;background:var(--secondary-background-color);color:var(--secondary-text-color)}
      .icon.wet{color:var(--info-color,#039be5);background:color-mix(in srgb,var(--info-color,#039be5) 14%,var(--card-background-color,#fff))}
      .heading{display:flex;flex-direction:column;gap:3px;min-width:0}
      h2{margin:0;font-size:18px;font-weight:600;line-height:1.25;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .status{color:var(--secondary-text-color);font-size:13px}.status.wet{color:var(--info-color,#039be5);font-weight:500}
      .hero{display:flex;flex-direction:column;padding:8px 18px 14px}
      .hero span{color:var(--secondary-text-color);font-size:13px}
      .hero strong{font-size:40px;font-weight:600;line-height:1.1;font-variant-numeric:tabular-nums}
      small{font-size:.45em;font-weight:500;color:var(--secondary-text-color)}
      .tiles{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));border-top:1px solid var(--divider-color)}
      .tile{display:flex;flex-direction:column;gap:2px;padding:12px 8px;text-align:center;border-left:1px solid var(--divider-color)}
      .tile:first-child{border-left:none}
      .tile span{color:var(--secondary-text-color);font-size:11px}
      .tile strong{font-size:15px;font-variant-numeric:tabular-nums;white-space:nowrap}
      .tile small{font-size:.7em}
      .chart{padding:14px 18px;border-top:1px solid var(--divider-color)}
      .chart-heading{display:flex;justify-content:space-between;gap:8px;margin-bottom:8px;color:var(--secondary-text-color);font-size:12px}
      .chart svg{display:block;width:100%;height:64px}
      .bar{fill:var(--info-color,#039be5)}
      .baseline{stroke:var(--divider-color);stroke-width:1;vector-effect:non-scaling-stroke}
      .chart-labels{display:flex;justify-content:space-between;margin-top:4px;color:var(--secondary-text-color);font-size:10px}
      .chart-empty{color:var(--secondary-text-color);font-size:12px}
      .extras{display:flex;flex-wrap:wrap;gap:8px 16px;padding:12px 18px 16px;border-top:1px solid var(--divider-color)}
      .extra{display:flex;align-items:center;gap:6px;font-size:13px;font-variant-numeric:tabular-nums}
      .extra ha-icon{--mdc-icon-size:18px;color:var(--secondary-text-color)}
      .extra.low,.extra.low ha-icon{color:var(--error-color,#c62828)}
      .empty{padding:20px;color:var(--secondary-text-color)}
      @media (max-width:380px){.tiles{grid-template-columns:repeat(3,minmax(0,1fr))}.tile:nth-child(4){border-left:none}.tile:nth-child(n+4){border-top:1px solid var(--divider-color)}}
    </style>`;
  }
}

weatherStationDefine("weather-station-card", WeatherStationCard, "render");

class WeatherStationCardEditor extends HTMLElement {
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
    const T = WEATHER_STATION_TEXT[weatherStationLanguage(this._hass)];
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
      {
        name: "entity",
        selector: {
          entity: {
            include_entities: weatherStationStations(this._hass).map((state) => state.entity_id),
          },
        },
      },
      { name: "title", selector: { text: {} } },
      { name: "show_chart", selector: { boolean: {} } },
    ];
    this._form.data = { show_chart: true, ...this._config };
  }
}

weatherStationDefine("weather-station-card-editor", WeatherStationCardEditor);

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === "weather-station-card")) {
  window.customCards.push({
    type: "weather-station-card",
    // The card picker is shown in the interface language, set on <html lang>.
    name: WEATHER_STATION_TEXT[weatherStationPageLanguage()].name,
    description: WEATHER_STATION_TEXT[weatherStationPageLanguage()].description,
    preview: true,
  });
}
