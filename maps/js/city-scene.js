// Builds the 3D town shown on the map for a city or town.
//
// Cities use their sourced establishment records (data/cities/*.js): every documented
// place becomes the building model for its type (js/buildings/), laid out on a street
// grid around a central plaza — civic buildings near the centre, stables, warehouses,
// smithies and barracks toward the edge, each facing the plaza — with anonymous houses
// filling the gaps and, for cities, a crenellated wall with the named gatehouses set into
// it. Towns have no establishment data, so they get houses only (no invented businesses).
//
// The whole town is merged into a single vertex-coloured mesh (one draw call). Units are
// metres; cities-layer.js scales and positions the result on the map.
//
// A per-location override can be registered via registerCityConfig(name, config):
//   { houses, walls, ground }   (see js/cities/*.js)
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { getBuildingGeometry, getModel, LOT } from "./buildings/index.js";
import { ModelBuilder, seededRandom, C } from "./buildings/kit.js";
import { getCityData } from "../data/cities/index.js";

/* ---------- per-city config registry ---------- */
const cityConfigs = new Map();

/** Register a config object that overrides the defaults for one exact location name. */
export function registerCityConfig(name, config) {
  cityConfigs.set(name, config);
}

const DEFAULTS = {
  city: { houses: 16, walls: true, ground: C.cobble },
  town: { houses: 7, walls: false, ground: C.dirt }
};

function resolveConfig(loc) {
  return { ...DEFAULTS[loc.type === "city" ? "city" : "town"], ...cityConfigs.get(loc.name) };
}

function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return h;
}

/* ---------- establishments -> buildings ---------- */
// when one physical place has several functions, it is drawn as its most prominent one
const PROMINENCE = [
  "palace", "temple", "town-hall", "library", "theater", "guildhall", "bank", "bathhouse", "school",
  "barracks", "prison", "gatehouse", "guardhouse", "inn", "tavern", "healer", "general-store",
  "blacksmith", "stable", "warehouse"
];
const OUTSKIRTS = new Set(["stable", "warehouse", "blacksmith", "barracks", "prison", "guardhouse"]);

const RUINED = /ruin|abandon|destroy|historical|^pre-/i;
export function isRuined(place, city) {
  return RUINED.test(place.status || "") || RUINED.test(city?.status || "");
}

/** Group a city's records into physical places (one per name). */
export function placesOf(city) {
  const byName = new Map();
  for (const rec of city.establishments) {
    if (!byName.has(rec.name)) byName.set(rec.name, { name: rec.name, records: [] });
    byName.get(rec.name).records.push(rec);
  }
  return [...byName.values()].map(p => {
    const types = [...new Set(p.records.map(r => r.type))];
    const type = PROMINENCE.find(t => types.includes(t));
    return { ...p, types, type, ruined: p.records.every(r => isRuined(r, city)) };
  });
}

/* ---------- street-grid layout ---------- */
function layout(items, rand) {
  const lotsNeeded = items.reduce((s, it) => s + it.lots[0] * it.lots[1], 0);
  for (let n = Math.max(3, Math.ceil(Math.sqrt(lotsNeeded * 1.25 + 1))); n < 40; n++) {
    const placed = tryLayout(items, n, rand);
    if (placed) return { n, placed };
  }
  throw new Error("town layout failed");
}

function tryLayout(items, n, rand) {
  const used = Array.from({ length: n }, () => new Array(n).fill(false));
  const c = (n - 1) / 2;
  // central plaza: one lot, or 2x2 for bigger towns
  const plaza = n >= 7 ? [[Math.floor(c), Math.floor(c)], [Math.ceil(c), Math.floor(c)], [Math.floor(c), Math.ceil(c)], [Math.ceil(c), Math.ceil(c)]] : [[Math.round(c), Math.round(c)]];
  plaza.forEach(([i, j]) => { used[i][j] = true; });

  const cells = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) cells.push({ i, j, d: Math.hypot(i - c, j - c) + rand() * 0.6 });
  const inward = cells.slice().sort((a, b) => a.d - b.d);
  const outward = inward.slice().reverse();

  const fits = (i, j, fx, fz) => {
    if (i + fx > n || j + fz > n) return false;
    for (let a = i; a < i + fx; a++) for (let b = j; b < j + fz; b++) if (used[a][b]) return false;
    return true;
  };

  const placed = [];
  for (const it of items) {
    const orientations = it.lots[0] === it.lots[1] ? [[it.lots[0], it.lots[1], false]] : [[it.lots[0], it.lots[1], false], [it.lots[1], it.lots[0], true]];
    let spot = null;
    for (const cell of it.outskirts ? outward : inward) {
      for (const [fx, fz, turned] of orientations) {
        if (fits(cell.i, cell.j, fx, fz)) { spot = { i: cell.i, j: cell.j, fx, fz, turned }; break; }
      }
      if (spot) break;
    }
    if (!spot) return null;
    for (let a = spot.i; a < spot.i + spot.fx; a++) for (let b = spot.j; b < spot.j + spot.fz; b++) used[a][b] = true;
    const x = (spot.i + spot.fx / 2 - n / 2) * LOT;
    const z = (spot.j + spot.fz / 2 - n / 2) * LOT;
    // face the plaza: +z of the model points toward the town centre
    let rotY;
    if (spot.turned) rotY = x > 0 ? -Math.PI / 2 : Math.PI / 2;
    else if (it.lots[0] !== it.lots[1]) rotY = z > 0 ? Math.PI : 0;
    else rotY = Math.abs(x) > Math.abs(z) ? (x > 0 ? -Math.PI / 2 : Math.PI / 2) : (z > 0 ? Math.PI : 0);
    placed.push({ ...it, x, z, rotY });
  }
  return { placed, plaza: plaza.map(([i, j]) => [(i + 0.5 - n / 2) * LOT, (j + 0.5 - n / 2) * LOT]) };
}

/* ---------- town wall with gatehouses ---------- */
const GATE_SLOTS = [["s", 0], ["n", 0], ["e", 0], ["w", 0], ["s", -0.3], ["n", 0.3], ["e", -0.3], ["w", 0.3], ["s", 0.3], ["n", -0.3], ["e", 0.3], ["w", -0.3]];

function wallAndGates(b, half, gates) {
  const GATE_HALF = 6, H = 6, T = 1.6;
  const bySide = { s: [], n: [], e: [], w: [] };
  const placed = gates.slice(0, GATE_SLOTS.length).map((g, k) => {
    const [side, f] = GATE_SLOTS[k];
    const along = f * 2 * half;
    bySide[side].push(along);
    const pos = { s: [along, half, 0], n: [along, -half, Math.PI], e: [half, along, Math.PI / 2], w: [-half, along, -Math.PI / 2] }[side];
    return { ...g, x: pos[0], z: pos[1], rotY: pos[2] };
  });
  for (const side of ["s", "n", "e", "w"]) {
    const cuts = bySide[side].sort((a, b2) => a - b2);
    let from = -half;
    const segs = [];
    for (const g of cuts) { segs.push([from, g - GATE_HALF]); from = g + GATE_HALF; }
    segs.push([from, half]);
    for (const [a, z1] of segs) {
      const len = z1 - a;
      if (len <= 0.5) continue;
      const mid = (a + z1) / 2;
      const along = side === "s" || side === "n";
      const x = along ? mid : (side === "e" ? half : -half);
      const z = along ? (side === "s" ? half : -half) : mid;
      b.box(along ? len : T, H, along ? T : len, C.stone, { x, z });
      b.crenels(along ? len : T + 0.6, along ? T + 0.6 : len, H, C.stoneDark, { cx: x, cz: z, size: 0.7, sides: along ? "ns" : "ew" });
    }
  }
  for (const [x, z] of [[-half, -half], [half, -half], [-half, half], [half, half]]) {
    b.cyl(2.4, H + 3, C.stone, { x, z });
    b.crenelRing(2.6, H + 3, C.stoneDark, { x, z, count: 9 });
  }
  return placed;
}

/* ---------- build ---------- */
const MATERIAL = new THREE.MeshLambertMaterial({ vertexColors: true });

/**
 * Build the THREE.Group for one map location (metres, centred on the group origin).
 * group.userData = { maxHeight, radius, pois } — pois are the named establishments with
 * their local label anchor { x, y, z }.
 */
export function buildCityGroup(loc) {
  const config = resolveConfig(loc);
  const rand = seededRandom(hashStr(loc.name + "|" + loc.type));
  const city = loc.type === "city" ? getCityData(loc.name) : null;
  const places = city ? placesOf(city) : [];
  // a city the data marks as ruined (e.g. Myth Drannor) is ruins throughout: houses and walls too
  const cityRuined = RUINED.test(city?.status || "");

  const items = [];
  const gates = [];
  for (const p of places) {
    const item = { ...p, lots: getModel(p.type).lots, outskirts: OUTSKIRTS.has(p.type), variant: 0 };
    if (p.type === "gatehouse" && config.walls) gates.push(item); else items.push(item);
  }
  for (let i = 0; i < config.houses; i++) {
    items.push({ type: "house", lots: [1, 1], variant: Math.floor(rand() * 8), outskirts: rand() < 0.5, anonymous: true, ruined: cityRuined });
  }
  // big footprints first, so they get room near the plaza
  items.sort((a, b) => (b.lots[0] * b.lots[1]) - (a.lots[0] * a.lots[1]) || (a.anonymous ? 1 : 0) - (b.anonymous ? 1 : 0));

  const { n, placed: res } = layout(items, rand);
  const half = (n * LOT) / 2 + 4;

  const extras = new ModelBuilder();
  extras.box(n * LOT + 4, 0.15, n * LOT + 4, config.ground);
  res.plaza.forEach(([x, z]) => extras.box(LOT, 0.2, LOT, C.stoneLight, { x, z }));
  if (res.plaza.length === 1) extras.cyl(1.2, 2.2, C.marble, { x: res.plaza[0][0], z: res.plaza[0][1] });
  else extras.cyl(2.2, 0.9, C.marbleDark, { x: (res.plaza[0][0] + res.plaza[3][0]) / 2, z: (res.plaza[0][1] + res.plaza[3][1]) / 2 });
  let buildings = res.placed;
  if (config.walls) {
    if (!gates.length) gates.push({ type: "gatehouse", lots: [1, 1], variant: 0, anonymous: true, ruined: cityRuined });
    buildings = buildings.concat(wallAndGates(extras, half, gates));
  }

  const parts = [extras.toGeometry({ ruined: cityRuined })];
  const m = new THREE.Matrix4();
  for (const bld of buildings) {
    const g = getBuildingGeometry(bld.type, { variant: bld.variant, ruined: !!bld.ruined }).clone();
    m.makeRotationY(bld.rotY).setPosition(bld.x, 0, bld.z);
    parts.push(g.applyMatrix4(m));
  }
  const geometry = mergeGeometries(parts, false);
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  const group = new THREE.Group();
  group.name = loc.name;
  group.add(new THREE.Mesh(geometry, MATERIAL));

  const pois = buildings.filter(bld => !bld.anonymous).map(bld => {
    const g = getBuildingGeometry(bld.type, { variant: bld.variant, ruined: !!bld.ruined });
    return {
      name: bld.name, type: bld.type, types: bld.types, records: bld.records, ruined: bld.ruined,
      x: bld.x, y: g.boundingBox.max.y + 2, z: bld.z
    };
  });

  group.userData = { maxHeight: geometry.boundingBox.max.y, radius: half + 3, pois, city };
  return group;
}
