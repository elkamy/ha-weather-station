const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const test = require("node:test");

class FakeHTMLElement {
  attachShadow() {
    this.shadowRoot = { innerHTML: "" };
    return this.shadowRoot;
  }
}

const registry = new Map();
const windowStub = { customCards: [] };
const context = {
  HTMLElement: FakeHTMLElement,
  customElements: {
    define: (name, component) => registry.set(name, component),
    get: (name) => registry.get(name),
  },
  window: windowStub,
  setInterval: () => 0,
  clearInterval: () => {},
};

vm.runInNewContext(
  fs.readFileSync("custom_components/weather_station/www/weather-station-dashboard.js", "utf8"),
  context,
  { filename: "weather-station-dashboard.js" },
);

const Card = registry.get("weather-station-dashboard-card");
const HOUR = 3600 * 1000;

const ENTITIES = {
  temperature: "sensor.temp",
  feels_like: "sensor.jardin_feels_like",
  dew_point: "sensor.jardin_dew_point",
  humidity: "sensor.hum",
  pressure: "sensor.pres",
  wind_speed: "sensor.wind",
  wind_gust: "sensor.gust",
  wind_direction: "sensor.dir",
  rain_total: "sensor.jardin_rain_total",
};

function station(attributes = {}) {
  return {
    entity_id: "sensor.jardin_rain_today",
    state: "4.2",
    attributes: {
      weather_station: true,
      station_name: "Jardin",
      rain_week: 12.6,
      rain_month: 40.1,
      rain_year: 512,
      rain_rate: 3.1,
      raining: true,
      last_rain: new Date().toISOString(),
      hourly_rain: [...Array(21).fill(0), 1.5, 0, 2.7],
      battery: 87,
      temperature: 12.34, temperature_unit: "°C",
      feels_like: 10.1, feels_like_unit: "°C",
      dew_point: 7.2, dew_point_unit: "°C",
      humidity: 81, humidity_unit: "%",
      pressure: 1012.6, pressure_unit: "hPa",
      wind_speed: 18, wind_speed_unit: "km/h",
      wind_gust: 34, wind_gust_unit: "km/h",
      wind_direction: 315, wind_direction_unit: "°",
      entities: ENTITIES,
      ...attributes,
    },
  };
}

// history/history_during_period: {entity_id: [{s, lu}]}, timestamps in seconds.
function history(now) {
  const series = (values, step = HOUR) => values.map((s, index) => ({
    s: String(s), lu: (now - (values.length - 1 - index) * step) / 1000,
  }));
  return {
    "sensor.temp": series([8.1, 9, 10.5, 14.5, 12.3]),
    "sensor.hum": series([90, 88, 85, 81]),
    // 4 h ago 1010.1, now 1012.6: rising by 2.5 hPa in 3 h.
    "sensor.pres": series([1010.1, 1010.1, 1011, 1012, 1012.6]),
    "sensor.wind": series([5, 12, "unavailable", 18]),
    "sensor.gust": series([10, 20, 30, 34]),
    "sensor.dir": series(["NW", "NW", "NW", "S"]),
  };
}

function fakeHass(now, calls, states = { "sensor.jardin_rain_today": station() }) {
  return {
    states,
    locale: { language: "fr" },
    themes: { darkMode: false },
    callWS: async (message) => {
      calls.push(message);
      if (message.type === "history/history_during_period") {
        const all = history(now);
        return Object.fromEntries(message.entity_ids.map((id) => [id, all[id] || []]));
      }
      if (message.statistic_ids[0] === "sensor.jardin_rain_total") {
        // Statistics: start in milliseconds.
        const start = Date.parse(message.start_time);
        return { "sensor.jardin_rain_total": [{ start: start + 24 * HOUR, change: 3.5 }] };
      }
      return Object.fromEntries(message.statistic_ids.map((id) => [id, [
        { start: now - 48 * HOUR, mean: 10, min: 6, max: 14 },
        { start: now - 24 * HOUR, mean: 11, min: 7, max: 15 },
      ]]));
    },
  };
}

async function settle() {
  for (let index = 0; index < 5; index += 1) await new Promise((resolve) => setImmediate(resolve));
}

async function renderCard(config = {}, hassOptions = {}) {
  const calls = [];
  const card = new Card();
  card.setConfig(config);
  card.hass = fakeHass(Date.now(), calls, hassOptions.states);
  await settle();
  return { card, calls, html: card.shadowRoot.innerHTML };
}

test("registers the card, its editor and the panel", () => {
  assert.equal(typeof Card, "function");
  assert.equal(typeof registry.get("weather-station-dashboard-card-editor"), "function");
  assert.equal(typeof registry.get("weather-station-panel"), "function");
  assert.equal(windowStub.customCards[0].type, "weather-station-dashboard-card");
});

test("parses wind directions and names compass points", () => {
  assert.equal(context.wsdParseDirection("NO"), 315);
  assert.equal(context.wsdParseDirection("ssw"), 202.5);
  assert.equal(context.wsdParseDirection("-90"), 270);
  assert.equal(context.wsdParseDirection("unknown"), null);
  assert.equal(context.wsdCardinal(315, "fr"), "NO");
  assert.equal(context.wsdCardinal(350, "en"), "N");
  assert.equal(context.wsdCardinal(null, "fr"), "—");
});

test("computes the Beaufort force and the UV level", () => {
  assert.equal(context.wsdBeaufort(0.5, "km/h"), 0);
  assert.equal(context.wsdBeaufort(18, "km/h"), 3);
  assert.equal(context.wsdBeaufort(10, "m/s"), 5);
  assert.equal(context.wsdBeaufort(200, "km/h"), 12);
  assert.equal(context.wsdBeaufort(10, "furlongs"), null);
  assert.equal(context.wsdUvLevel(2), "low");
  assert.equal(context.wsdUvLevel(7), "high");
  assert.equal(context.wsdUvLevel(11), "extreme");
});

test("reads both websocket answer shapes", () => {
  const points = context.wsdHistoryPoints({ a: [{ s: "2", lu: 20 }, { s: "x", lu: 10 }] }, "a");
  assert.deepEqual(JSON.parse(JSON.stringify(points)), [{ t: 10000, v: null }, { t: 20000, v: 2 }]);
  const stats = context.wsdStatisticsPoints({ a: [{ start: 1791842400000, mean: 3, min: 1, max: 5 }] }, "a");
  assert.equal(stats[0].t, 1791842400000);
  assert.equal(stats[0].v, 3);
});

test("weights the wind rose by duration", () => {
  const rose = context.wsdWindRose([{ t: 0, v: 0 }, { t: 3000, v: 90 }, { t: 4000, v: null }], 4000);
  assert.equal(Math.round(rose[0]), 75);
  assert.equal(Math.round(rose[4]), 25);
  assert.equal(context.wsdWindRose([], 10), null);
});

test("measures the trend against the value in force hours ago", () => {
  const now = 10 * HOUR;
  const points = [{ t: 0, v: 1000 }, { t: 6 * HOUR, v: 1001 }, { t: 10 * HOUR, v: 1003 }];
  assert.equal(context.wsdTrend(points, 3, now), 2);
  assert.equal(context.wsdTrend(points.slice(2), 3, now), null);
});

test("rounds axis scales", () => {
  const scale = context.wsdScale(3.2, 17.9, 4);
  assert.equal(scale.min, 0);
  assert.equal(scale.max, 20);
  assert.deepEqual(Array.from(scale.ticks), [0, 5, 10, 15, 20]);
  assert.deepEqual(Array.from(context.wsdScale(40, 98, 4, 0, 100).ticks), [40, 60, 80, 100]);
});

test("shows the current readings in tiles", async () => {
  const { html } = await renderCard();
  assert.match(html, /Jardin/);
  assert.match(html, /Il pleut/);
  assert.match(html, /12,3 °C/);
  assert.match(html, /Ressenti 10,1 °C · Point de rosée 7,2 °C/);
  assert.match(html, /min\. 8,1 °C · max\. 14,5 °C \(24 h\)/);
  assert.match(html, /81 %/);
  assert.match(html, /En hausse · \+2,5 hPa en 3 h/);
  assert.match(html, /du NO/);
  assert.match(html, /Rafales 34 km\/h/);
  assert.match(html, /Force 3 · Petite brise/);
  assert.match(html, /4,2 mm <small>aujourd&#39;hui/);
  assert.match(html, /87 %/);
  assert.match(html, /class="compass"/);
});

test("draws the 24 h charts from the raw history", async () => {
  const { html, calls } = await renderCard();
  assert.equal(calls.filter((call) => call.type === "history/history_during_period").length, 1);
  assert.equal(calls.some((call) => call.period === "hour"), false);
  for (const title of ["Pluie", "Température", "Humidité", "Pression", "Vent", "Rose des vents", "Pluie par mois en"]) {
    assert.match(html, new RegExp(`<h3>${title}`), title);
  }
  // Temperature: three series with a legend, the dew point dashed (slot 3).
  assert.match(html, /class="line s1"/);
  assert.match(html, /class="line s3"/);
  assert.match(html, /Point de rosée <strong>/);
  // Hourly rain from the station: two hours with rain.
  assert.match(html, /4,2 mm sur la période/);
  assert.equal((html.match(/data-chart="bar-rain"[^]*?<\/svg>/)[0].match(/class="bar"/g) || []).length, 2);
  // The unavailable wind reading breaks the line into two parts.
  const windPath = html.match(/data-chart="line-wind"[^]*?class="line s1" d="([^"]+)"/)[1];
  assert.equal((windPath.match(/M/g) || []).length, 2);
  // Wind from the north-west 3 hours out of 4 (the last reading has no duration yet).
  assert.match(html, /Vent dominant du NO \(100 % du temps\)/);
});

test("uses statistics for 7 and 30 days, with today's rain from the station", async () => {
  const { card, calls } = await renderCard({ period: "30d" });
  const statistics = calls.filter((call) => call.type === "recorder/statistics_during_period");
  assert.deepEqual(statistics.map((call) => call.period).sort(), ["day", "day", "month"]);
  const html = card.shadowRoot.innerHTML;
  // 3.5 mm from the statistics + 4.2 mm today.
  assert.match(html, /7,7 mm sur la période/);
  assert.match(html, /class="band s1"/);
  assert.match(html, /Fréquence des directions sur 7 jours/);
  assert.match(html, /aria-pressed="true" class="selected">30 jours/);
});

test("switches period on click and reloads", async () => {
  const { card, calls } = await renderCard();
  const before = calls.length;
  card._onClick({ target: { closest: () => ({ dataset: { period: "7d" } }) } });
  await settle();
  assert.ok(calls.length > before);
  assert.ok(calls.some((call) => call.period === "hour" && call.types.includes("mean")));
  assert.match(card.shadowRoot.innerHTML, /aria-pressed="true" class="selected">7 jours/);
});

test("only shows the sensors the station has", async () => {
  const minimal = station({ entities: { rain_total: "sensor.jardin_rain_total" } });
  for (const key of ["temperature", "feels_like", "dew_point", "humidity", "pressure", "wind_speed", "wind_gust", "wind_direction"]) {
    delete minimal.attributes[key];
  }
  const { html } = await renderCard({}, { states: { s: minimal } });
  assert.match(html, /<h3>Pluie/);
  assert.doesNotMatch(html, /<h3>Température/);
  assert.doesNotMatch(html, /Rose des vents/);
  assert.doesNotMatch(html, /mdi:thermometer/);
});

test("reports a missing station", async () => {
  assert.match((await renderCard({ entity: "sensor.absent" })).html, /Station introuvable : sensor.absent/);
  assert.match((await renderCard({}, { states: {} })).html, /Aucune station Weather Station trouvée/);
});

test("escapes the station name", async () => {
  const { html } = await renderCard({}, { states: { s: station({ station_name: "<img src=x>" }) } });
  assert.match(html, /&lt;img src=x&gt;/);
  assert.doesNotMatch(html, /<img src=x>/);
});

test("takes the full width of a sections dashboard", () => {
  assert.equal(new Card().getGridOptions().columns, "full");
});

test("shows wind in m/s with a decimal (WindNerd)", async () => {
  const windy = station({ wind_speed: 3.62, wind_speed_unit: "m/s", wind_gust: 7.15, wind_gust_unit: "m/s" });
  const { html } = await renderCard({}, { states: { s: windy } });
  assert.match(html, /<div class="tile-value">3,6 m\/s<\/div>/);
  assert.match(html, /Rafales 7,2 m\/s/);
  // 3.62 m/s = 13 km/h: force 3.
  assert.match(html, /Force 3 · Petite brise/);
  assert.equal(context.wsdDigits("wind_speed", "km/h"), 0);
  assert.equal(context.wsdDigits("wind_gust", "kn"), 1);
  assert.equal(context.wsdDigits("temperature", "°C"), 1);
});
