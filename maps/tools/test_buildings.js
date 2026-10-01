// In-browser test for the building models and generated towns (Three.js comes from the
// CDN import map, so this runs in a page rather than in Node). With the local server up,
// open http://localhost:8073/buildings.html and run in the browser console:
//   await (await import("./tools/test_buildings.js")).run()
import { ESTABLISHMENT_TYPES } from "../data/cities/schema.js";
import { cityData } from "../data/cities/index.js";
import { locations } from "../data/locations.js";
import { MODELS, LOT, getBuildingGeometry, getModel } from "../js/buildings/index.js";
import { buildCityGroup, placesOf } from "../js/city-scene.js";

export async function run() {
  const failures = [];
  const fail = m => failures.push(m);
  const report = {};

  // 1. one model per establishment type, plus the filler house
  for (const type of ESTABLISHMENT_TYPES) if (!MODELS.has(type)) fail(`no model for type ${type}`);
  for (const type of MODELS.keys()) if (type !== "house" && !ESTABLISHMENT_TYPES.includes(type)) fail(`model ${type} is not a schema type`);

  // 2. every model builds, has no NaNs, stands on the ground and fits its lots
  report.models = {};
  for (const [type, model] of MODELS) {
    for (const ruined of [false, true]) {
      for (const variant of type === "house" ? [0, 1, 2, 3, 4, 5, 6, 7] : [0]) {
        const g = getBuildingGeometry(type, { variant, ruined });
        const pos = g.getAttribute("position"), col = g.getAttribute("color"), nor = g.getAttribute("normal");
        if (!pos || !col || !nor || pos.count === 0) { fail(`${type}: missing attributes`); continue; }
        if (pos.array.some(Number.isNaN) || nor.array.some(Number.isNaN)) fail(`${type}: NaN in geometry`);
        const b = g.boundingBox;
        const maxX = (model.lots[0] * LOT) / 2, maxZ = (model.lots[1] * LOT) / 2;
        if (b.min.y < -0.01) fail(`${type}: below ground (${b.min.y.toFixed(2)})`);
        if (b.max.x > maxX + 0.5 || b.min.x < -maxX - 0.5 || b.max.z > maxZ + 0.5 || b.min.z < -maxZ - 0.5) {
          fail(`${type}${ruined ? " (ruined)" : ""}: footprint x ${b.min.x.toFixed(1)}..${b.max.x.toFixed(1)} z ${b.min.z.toFixed(1)}..${b.max.z.toFixed(1)} exceeds ${model.lots.join("x")} lots (±${maxX}, ±${maxZ})`);
        }
        if (!ruined && variant === 0) report.models[type] = { tris: pos.count / 3, height: +b.max.y.toFixed(1) };
      }
    }
  }

  // 3. every settlement builds a town; every named establishment becomes a labelled building
  report.towns = {};
  const t0 = performance.now();
  for (const loc of locations.filter(l => l.type === "city" || l.type === "town")) {
    let group;
    try { group = buildCityGroup(loc); } catch (e) { fail(`${loc.name}: ${e.message}`); continue; }
    const { pois, maxHeight } = group.userData;
    const mesh = group.children[0];
    if (loc.type === "city") {
      const city = cityData.find(c => c.name === loc.name);
      const expected = placesOf(city).map(p => p.name).sort();
      const got = pois.map(p => p.name).sort();
      if (JSON.stringify(expected) !== JSON.stringify(got)) fail(`${loc.name}: ${expected.length} places in data, ${got.length} labelled (${expected.filter(n => !got.includes(n)).join(", ")})`);
      for (const p of pois) if (getModel(p.type) === undefined) fail(`${loc.name}: ${p.name} has no model`);
      report.towns[loc.name] = { places: pois.length, ruined: pois.filter(p => p.ruined).length, tris: mesh.geometry.getAttribute("position").count / 3, height: +maxHeight.toFixed(1) };
    } else if (pois.length) {
      fail(`${loc.name}: town without data has named establishments`);
    }
  }
  report.buildAllMs = Math.round(performance.now() - t0);
  return { ok: failures.length === 0, failures, report };
}
