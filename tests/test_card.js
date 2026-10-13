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
  fs.readFileSync("custom_components/weather_station/www/weather-station-card.js", "utf8"),
  context,
  { filename: "weather-station-card.js" },
);

const WeatherStationCard = registry.get("weather-station-card");

function station(state = "21.48", attributes = {}) {
  return {
    entity_id: "sensor.jardin_rain_today",
    state,
    attributes: {
      weather_station: true,
      station_name: "Jardin",
      rain_week: 30.4,
      rain_month: 52,
      rain_year: 612.3,
      rain_last_hour: 2.1,
      rain_last_24h: 21.48,
      rain_rate: 4.2,
      raining: true,
      last_rain: new Date().toISOString(),
      hourly_rain: [...Array(20).fill(0), 1, 0, 4.5, 2.1],
      ...attributes,
    },
  };
}

function render(states, config = {}, language = "fr") {
  const card = new WeatherStationCard();
  card.setConfig(config);
  card.hass = { states, locale: { language } };
  return card.shadowRoot.innerHTML;
}

test("registers the card and its editor", () => {
  assert.equal(windowStub.customCards[0].type, "weather-station-card");
  assert.equal(typeof registry.get("weather-station-card-editor"), "function");
});

test("shows today's rain, the rate and the totals in French", () => {
  const html = render({ "sensor.jardin_rain_today": station() });
  assert.match(html, /Jardin/);
  assert.match(html, /21,5<small> mm/);
  assert.match(html, /Il pleut · 4,2 mm\/h/);
  assert.match(html, /612,3<small> mm/);
  assert.match(html, /Pluie heure par heure/);
  assert.equal((html.match(/class="bar"/g) || []).length, 24);
});

test("uses English for an English interface", () => {
  const html = render({ "sensor.jardin_rain_today": station() }, {}, "en");
  assert.match(html, /Raining · 4.2 mm\/h/);
  assert.match(html, /21.5<small> mm/);
});

test("shows the last rain when it is dry", () => {
  const lastRain = new Date(Date.now() - 3 * 3600 * 1000).toISOString();
  const html = render({ s: station("0", { raining: false, last_rain: lastRain, hourly_rain: Array(24).fill(0) }) });
  assert.match(html, /Dernière pluie il y a 3 h/);
  assert.match(html, /Pas de pluie ces dernières 24 heures/);
});

test("hides the chart on request", () => {
  const html = render({ "sensor.jardin_rain_today": station() }, { show_chart: false });
  assert.doesNotMatch(html, /class="bar"/);
});

test("shows the optional sensors and a low battery", () => {
  const html = render({
    s: station("0", { temperature: 12.34, temperature_unit: "°C", humidity: null, humidity_unit: "%", battery: 15 }),
  });
  assert.match(html, /12,3 °C/);
  assert.match(html, /mdi:water-percent[^]*—/);
  assert.match(html, /extra low/);
  assert.doesNotMatch(html, /mdi:gauge/);
});

test("picks the configured station or reports it missing", () => {
  const other = { ...station("5"), entity_id: "sensor.toit_rain_today" };
  other.attributes = { ...other.attributes, station_name: "Toit" };
  const states = { "sensor.jardin_rain_today": station(), "sensor.toit_rain_today": other };
  assert.match(render(states, { entity: "sensor.toit_rain_today" }), /Toit/);
  assert.match(render(states, { entity: "sensor.absent" }), /Station introuvable : sensor.absent/);
  assert.match(render({}), /Aucune station Weather Station trouvée/);
});

test("escapes the station name", () => {
  const html = render({ s: station("1", { station_name: "<b>x</b>" }) });
  assert.match(html, /&lt;b&gt;x&lt;\/b&gt;/);
});

test("stub config points to the first station", () => {
  assert.deepEqual(
    JSON.parse(JSON.stringify(WeatherStationCard.getStubConfig({ states: { a: station() } }))),
    { entity: "sensor.jardin_rain_today", show_chart: true },
  );
});

test("registers again on a registry that replaced the native one", async () => {
  // Home Assistant's scoped registry polyfill can replace customElements after
  // the card ran; Lovelace then asks the new registry.
  const native = new Map();
  const ready = {};
  const resolved = {};
  const sandbox = {
    HTMLElement: FakeHTMLElement,
    customElements: {
      define: (name, component) => native.set(name, component),
      get: (name) => native.get(name),
      whenDefined: (name) => {
        ready[name] ||= new Promise((resolve) => { resolved[name] = resolve; });
        return ready[name];
      },
    },
    window: { customCards: [] },
  };
  vm.runInNewContext(
    fs.readFileSync("custom_components/weather_station/www/weather-station-card.js", "utf8"),
    sandbox,
  );
  const scoped = new Map();
  sandbox.customElements = {
    define: (name, component) => scoped.set(name, component),
    get: (name) => scoped.get(name),
  };
  resolved["ha-panel-lovelace"]();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(scoped.get("weather-station-card"), native.get("weather-station-card"));
  assert.equal(scoped.get("weather-station-card-editor"), native.get("weather-station-card-editor"));
});
