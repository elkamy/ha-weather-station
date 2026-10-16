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
        // The day before ("compare with yesterday"): the same readings, one day earlier.
        const all = history(Date.parse(message.end_time) < now - 12 * HOUR ? now - 24 * HOUR : now);
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
  // The last 24 h, and the day before for the "compare with yesterday" wind curve.
  assert.equal(calls.filter((call) => call.type === "history/history_during_period").length, 2);
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
  // Raw history is drawn in steps: each value holds until the next one.
  const temperaturePath = html.match(/data-chart="line-temperature"[^]*?class="line s1" d="([^"]+)"/)[1];
  assert.match(temperaturePath, /^M[\d.]+ [\d.]+H[\d.]+V/);
  // Wind: bars of mean wind per half hour, gust ticks on top, arrows below.
  const wind = html.match(/data-chart="wind"[^]*?role="img"[^]*?<\/svg>/)[0];
  // Bars coloured by wind class: 5 km/h and 12 km/h are both in class 1 (1-12 km/h)
  // or class 2 from 12 km/h.
  assert.ok((wind.match(/class="bar w[12]"/g) || []).length >= 3);
  assert.ok((wind.match(/class="gust"/g) || []).length >= 3);
  assert.match(html, /class="arrows"/);
  assert.match(html, /title="du NO"/);
  assert.match(html, /<i class="key bar w2"><\/i>Vent moyen <strong>18 km\/h/);
  assert.match(html, /class="speed-scale"/);
  assert.match(html, /data-compare aria-pressed="false">Comparer avec hier/);
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

test("aggregates the wind per bucket", () => {
  const H = 3600 * 1000;
  const buckets = [[0, H], [H, 2 * H]];
  // 10 for 15 min, then 20 for 45 min, then 4 for the next hour.
  const points = [{ t: -H, v: 10 }, { t: 0.25 * H, v: 20 }, { t: H, v: 4 }];
  const result = context.wsdHistoryBuckets(points, buckets, 2 * H);
  assert.equal(result[0].mean, 17.5);
  assert.equal(result[0].max, 20);
  assert.equal(result[1].mean, 4);

  const stats = [{ t: 0, v: 3, max: 9 }, { t: 0.5 * H, v: 5, max: 7 }, { t: H, v: null, max: null }];
  const fromStats = context.wsdStatisticBuckets(stats, buckets);
  assert.equal(fromStats[0].mean, 4);
  assert.equal(fromStats[0].max, 9);
  assert.equal(fromStats[1].mean, null);

  // 350° and 10° average to the north, not to the south.
  const north = context.wsdDirectionBuckets([{ t: 0, v: 350 }, { t: 0.5 * H, v: 10 }], [[0, H]], H)[0];
  assert.ok(north < 0.001 || north > 359.999);
  assert.equal(context.wsdDirectionBuckets([], [[0, H]], H)[0], null);

  const end = Date.now();
  const halfHours = context.wsdWindBuckets(end - 24 * H, end, "24h");
  assert.ok(halfHours.length === 48 || halfHours.length === 49);
  assert.equal(halfHours[halfHours.length - 1][1], end);
  assert.ok(context.wsdWindBuckets(end - 30 * 24 * H, end, "30d").length >= 30);
});

test("classifies the wind and finds the nights", () => {
  assert.equal(context.wsdWindClass(0.5, "km/h"), 0);
  assert.equal(context.wsdWindClass(5, "km/h"), 1);
  assert.equal(context.wsdWindClass(4, "m/s"), 2);
  assert.equal(context.wsdWindClass(60, "km/h"), 6);
  assert.equal(context.wsdWindClass(null, "km/h"), null);

  // Derval, 15 October 2026: sunrise about 08:15 and sunset about 19:10 (UTC+2).
  const noon = Date.UTC(2026, 9, 15, 12);
  const sun = context.wsdSunTimes(noon, 47.67, -1.67);
  const hours = (time) => new Date(time).getUTCHours() + new Date(time).getUTCMinutes() / 60;
  assert.ok(Math.abs(hours(sun.rise) - 6.25) < 0.25, String(hours(sun.rise)));
  assert.ok(Math.abs(hours(sun.set) - 17.17) < 0.25, String(hours(sun.set)));
  // Polar night: no sunrise.
  assert.equal(context.wsdSunTimes(Date.UTC(2026, 11, 21, 12), 80, 0), null);

  const nights = context.wsdNights(noon - 24 * 3600 * 1000, noon, 47.67, -1.67);
  assert.equal(nights.length, 1);
  assert.ok(nights[0][1] - nights[0][0] > 12 * 3600 * 1000);
  assert.equal(context.wsdNights(0, 1, Number.NaN, 0).length, 0);
});

test("splits the wind rose by wind class with the calm share", () => {
  const H = 3600 * 1000;
  // North for 3 h, south for 1 h; calm the first hour, then 5 then 30 km/h.
  const directions = [{ t: 0, v: 0 }, { t: 3 * H, v: 180 }];
  const speeds = [{ t: 0, v: 0.2 }, { t: H, v: 5 }, { t: 2 * H, v: 30 }];
  const rose = context.wsdStackedRose(directions, speeds, "km/h", 4 * H);
  assert.equal(rose.calm, 25);
  assert.equal(rose.shares[0], 50);
  assert.equal(rose.sectors[0][1], 25);
  assert.equal(rose.sectors[0][4], 25);
  assert.equal(rose.shares[8], 25);
  assert.equal(rose.mean[0], 17.5);
  // Without a speed sensor, the plain direction frequency.
  const plain = context.wsdStackedRose(directions, [], "", 4 * H);
  assert.equal(plain.shares[0], 75);
  assert.equal(plain.speed, false);
});

test("draws the wind rose even when the wind stayed calm", async () => {
  const H = 3600 * 1000;
  const rose = context.wsdStackedRose([{ t: 0, v: 90 }], [{ t: 0, v: 0.1 }], "m/s", 2 * H);
  assert.equal(rose.calm, 100);
  const now = Date.now();
  const calls = [];
  const hass = fakeHass(now, calls, { s: station() });
  const base = hass.callWS;
  hass.callWS = async (message) => {
    const answer = await base(message);
    if (message.type !== "history/history_during_period") return answer;
    return Object.fromEntries(Object.entries(answer).map(([id, states]) => [id, id === "sensor.wind" ? states.map((state) => ({ ...state, s: "0" })) : states]));
  };
  const card = new Card();
  card.setConfig({});
  card.hass = hass;
  await settle();
  const html = card.shadowRoot.innerHTML;
  assert.match(html, /data-chart="rose"[^]*?class="calm"/);
  assert.match(html, /Vent calme, sans direction dominante \(Calme 100 %\)/);
});

test("compares the wind with yesterday on demand", async () => {
  const { card } = await renderCard();
  assert.doesNotMatch(card.shadowRoot.innerHTML, /class="line yesterday"/);
  card._onClick({ target: { closest: () => ({ dataset: { compare: "" } }) } });
  await settle();
  const html = card.shadowRoot.innerHTML;
  assert.match(html, /data-compare aria-pressed="true"/);
  assert.match(html, /class="line yesterday"/);
  assert.match(html, /<i class="key yesterday"><\/i>Hier/);
});

test("completes the source statistics with the station's own copy", async () => {
  const merged = context.wsdMergePoints(
    [{ t: 2, v: 20 }, { t: 3, v: 30 }],
    [{ t: 1, v: 11 }, { t: 2, v: 99 }, { t: 4, v: 44 }],
  );
  // The source wins where both have a point; the copy fills the gaps.
  assert.equal(JSON.stringify(merged.map((point) => [point.t, point.v])), "[[1,11],[2,20],[3,30],[4,44]]");

  const withMeasures = station({ measures: { wind_speed: "sensor.jardin_wind_speed", temperature: "sensor.temp" } });
  const { calls } = await renderCard({ period: "30d" }, { states: { s: withMeasures } });
  const numeric = calls.find((call) => call.type === "recorder/statistics_during_period" && call.types.includes("mean"));
  assert.ok(numeric.statistic_ids.includes("sensor.jardin_wind_speed"));
  // The same entity is asked once.
  assert.equal(numeric.statistic_ids.filter((id) => id === "sensor.temp").length, 1);
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

test("shows the active alerts in the header", async () => {
  const alerting = station({ entities: { ...ENTITIES, frost: "binary_sensor.gel", strong_wind: "binary_sensor.vent" } });
  const states = {
    s: alerting,
    "binary_sensor.gel": { entity_id: "binary_sensor.gel", state: "on", attributes: {} },
    "binary_sensor.vent": { entity_id: "binary_sensor.vent", state: "off", attributes: {} },
  };
  const { html } = await renderCard({}, { states });
  assert.match(html, /class="alert frost"><ha-icon icon="mdi:snowflake-alert"><\/ha-icon>Risque de gel/);
  assert.doesNotMatch(html, /class="alert strong_wind"/);
});

function forecastHass(weatherAttributes = {}) {
  const subscriptions = [];
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const day = (offset) => new Date(today.getTime() + offset * 24 * HOUR).toISOString();
  const hass = fakeHass(Date.now(), [], {
    s: station({ entities: { ...ENTITIES, weather: "weather.jardin" } }),
    "weather.jardin": {
      entity_id: "weather.jardin",
      state: "partlycloudy",
      attributes: { supported_features: 3, temperature_unit: "°C", precipitation_unit: "mm", forecast_entity: "weather.mf", ...weatherAttributes },
    },
    "weather.mf": { entity_id: "weather.mf", state: "partlycloudy", attributes: { friendly_name: "Météo-France Derval" } },
  });
  hass.connection = {
    subscribeMessage: (callback, message) => {
      subscriptions.push(message);
      callback({ type: "daily", forecast: [
        { datetime: day(0), condition: "rainy", temperature: 18.4, templow: 9.6, precipitation: 3.2, precipitation_probability: 80 },
        { datetime: day(1), condition: "sunny", temperature: 21, templow: 8, precipitation: 0 },
        { datetime: day(2), condition: "cloudy", temperature: 17, templow: 10, precipitation: 12.4 },
        ...[3, 4, 5, 6].map((offset) => ({ datetime: day(offset), condition: "fog", temperature: 15, templow: 7 })),
      ] });
      return Promise.resolve(() => subscriptions.push("unsubscribed"));
    },
  };
  return { hass, subscriptions };
}

test("shows the next days of forecast from the station's weather entity", async () => {
  const { hass, subscriptions } = forecastHass();
  const card = new Card();
  card.setConfig({});
  card.hass = hass;
  await settle();
  const html = card.shadowRoot.innerHTML;
  assert.deepEqual(JSON.parse(JSON.stringify(subscriptions[0])), { type: "weather/subscribe_forecast", entity_id: "weather.jardin", forecast_type: "daily" });
  assert.match(html, /<h3>Prévisions<\/h3><span class="chart-sub">d&#39;après Météo-France Derval<\/span>/);
  assert.equal((html.match(/class="day"/g) || []).length, 5);
  assert.match(html, /Aujourd&#39;hui<\/span>\s*<ha-icon icon="mdi:weather-rainy" title="Pluvieux">/);
  assert.match(html, /<strong>18 °C<\/strong> <span>10 °C<\/span>/);
  assert.match(html, /3,2 mm · 80 %/);
  assert.match(html, /12 mm/);
  // The sky condition in the header, raining stays first.
  assert.match(html, /Il pleut/);
  card.disconnectedCallback();
  await settle();
  assert.equal(subscriptions.at(-1), "unsubscribed");
});

test("names the sky in the header when it is dry", async () => {
  const { hass } = forecastHass();
  hass.states.s = station({ raining: false, entities: { ...ENTITIES, weather: "weather.jardin" } });
  const card = new Card();
  card.setConfig({});
  card.hass = hass;
  await settle();
  assert.match(card.shadowRoot.innerHTML, /Partiellement nuageux · Pas de pluie/);
  assert.match(card.shadowRoot.innerHTML, /icon="mdi:weather-partly-cloudy"/);
});

test("no forecast section without daily forecasts", async () => {
  const { hass, subscriptions } = forecastHass({ supported_features: 0 });
  const card = new Card();
  card.setConfig({});
  card.hass = hass;
  await settle();
  assert.equal(subscriptions.length, 0);
  assert.doesNotMatch(card.shadowRoot.innerHTML, /<h3>Prévisions/);
});

test("the card version matches the integration version", () => {
  const manifest = JSON.parse(fs.readFileSync("custom_components/weather_station/manifest.json", "utf8"));
  assert.equal(registry.get("weather-station-dashboard-card").WS_VERSION, manifest.version);
  const init = fs.readFileSync("custom_components/weather_station/__init__.py", "utf8");
  assert.match(init, new RegExp(`CARD_VERSION = "${manifest.version.replace(/\./g, "\.")}"`));
});

test("an older cached card already registered shows a reload banner", () => {
  // The browser cache loaded an older copy first: its class owns the tag.
  class OldCard extends FakeHTMLElement {
    _render() { this.shadowRoot.innerHTML = "<ha-card>ancienne carte</ha-card>"; }
  }
  const tags = new Map([["weather-station-dashboard-card", OldCard]]);
  const sandbox = {
    HTMLElement: FakeHTMLElement,
    customElements: { define: (name, component) => tags.set(name, component), get: (name) => tags.get(name) },
    window: { customCards: [] },
  };
  vm.runInNewContext(fs.readFileSync("custom_components/weather_station/www/weather-station-dashboard.js", "utf8"), sandbox);
  assert.equal(tags.get("weather-station-dashboard-card"), OldCard);
  const old = new OldCard();
  old.attachShadow();
  old._render();
  assert.match(old.shadowRoot.innerHTML, /class="ws-outdated"[^>]*>Une nouvelle version de Weather Station \(0\.7\.3\) est installée/);
  assert.match(old.shadowRoot.innerHTML, /ancienne carte/);
  // Rendered again: still one banner.
  old._render();
  assert.equal((old.shadowRoot.innerHTML.match(/ws-outdated/g) || []).length, 1);
});

test("the same or a newer registered card gets no banner", () => {
  class Newer extends FakeHTMLElement {
    static WS_VERSION = "9.0.0";
    _render() { this.shadowRoot.innerHTML = "<ha-card>future</ha-card>"; }
  }
  const tags = new Map([["weather-station-dashboard-card", Newer]]);
  vm.runInNewContext(fs.readFileSync("custom_components/weather_station/www/weather-station-dashboard.js", "utf8"), {
    HTMLElement: FakeHTMLElement,
    customElements: { define: (name, component) => tags.set(name, component), get: (name) => tags.get(name) },
    window: { customCards: [] },
  });
  const card = new Newer();
  card.attachShadow();
  card._render();
  assert.doesNotMatch(card.shadowRoot.innerHTML, /ws-outdated/);
  assert.equal(context.wsdIsOlder("0.6.0", "0.6.1"), true);
  assert.equal(context.wsdIsOlder(undefined, "0.6.1"), true);
  assert.equal(context.wsdIsOlder("0.10.0", "0.9.9"), false);
});
