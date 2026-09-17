// City/town 3D scene generator — Three.js version.
//
// A per-location override can be registered via registerCityConfig(name, config);
// buildCityGroup() looks the location's name up in that registry first and falls
// back to the generic city/town template when nothing is registered.
//
// Buildings are plain THREE.BoxGeometry meshes with a flat MeshLambertMaterial —
// light/shadow differentiation between faces comes from real scene lighting
// (see city3d-viewer.js), not from hand-picked per-face colors, so there is no
// hand-rolled 3D transform math left to get wrong.
import * as THREE from "three";

/* ---------- deterministic per-location RNG (same city always looks the same) ---------- */
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return h;
}

/* ---------- per-city config registry ---------- */
const cityConfigs = new Map();

/** Register a config object that overrides the generic template for one exact location name. */
export function registerCityConfig(name, config) {
  cityConfigs.set(name, config);
}

const DEFAULT_CITY = { buildingCount: 30, heightRange: [30, 95], hue: 30, saturation: 11, landmarks: [] };
const DEFAULT_TOWN = { buildingCount: 12, heightRange: [20, 48], hue: 30, saturation: 11, landmarks: [] };

function resolveConfig(loc) {
  const base = loc.type === "city" ? DEFAULT_CITY : DEFAULT_TOWN;
  const override = cityConfigs.get(loc.name);
  return { ...base, ...override, landmarks: (override && override.landmarks) || base.landmarks };
}

/** One building: a plain box mesh sitting on the ground (world y = 0), centered at (x, z). */
function createBuildingMesh(x, z, w, d, h, hue, saturation, lightness) {
  const geometry = new THREE.BoxGeometry(w, h, d);
  const material = new THREE.MeshLambertMaterial({ color: new THREE.Color(`hsl(${hue}, ${saturation}%, ${lightness}%)`) });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, h / 2, z);
  return mesh;
}

/**
 * Build a THREE.Group containing the ground plane + every building for one
 * city/town location, using its registered config (or the generic template).
 * The group is centered on its own local origin (0,0,0) — city3d-viewer.js
 * positions the *camera* around it rather than placing the group in world space.
 */
export function buildCityGroup(loc) {
  const config = resolveConfig(loc);
  const group = new THREE.Group();
  group.name = loc.name;

  const rand = mulberry32(hashStr(loc.name + "|" + loc.type));
  const count = config.buildingCount;
  const [hMin, hMax] = config.heightRange;
  const cols = Math.ceil(Math.sqrt(count));
  const spacing = 46;
  const groundSize = (cols + 2) * spacing;

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(groundSize, groundSize),
    new THREE.MeshLambertMaterial({ color: new THREE.Color(`hsl(${config.hue}, ${config.saturation}%, 22%)`) })
  );
  ground.rotation.x = -Math.PI / 2; // lay flat on the XZ plane
  group.add(ground);

  const buildings = [];
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const jitterX = (rand() - 0.5) * 16;
    const jitterZ = (rand() - 0.5) * 16;
    const x = (col - (cols - 1) / 2) * spacing + jitterX;
    const z = (row - (cols - 1) / 2) * spacing + jitterZ;
    const w = 20 + rand() * 14;
    const d = 20 + rand() * 14;
    const h = hMin + rand() * (hMax - hMin);
    buildings.push({ x, z, w, d, h, lightness: 42 + rand() * 14 });
  }
  // fixed, hand-placed landmark buildings from a per-city config (optional)
  config.landmarks.forEach(lm => {
    buildings.push({ x: lm.x, z: lm.z, w: lm.w, d: lm.d, h: lm.h, isLandmark: true, lightness: 48 });
  });

  // no manual draw-order sorting needed — the WebGL depth buffer in city3d-viewer.js
  // handles correct occlusion regardless of insertion order.
  buildings.forEach(b => {
    const hue = b.isLandmark ? (config.landmarkHue ?? config.hue) : config.hue;
    const sat = b.isLandmark ? (config.landmarkSaturation ?? config.saturation) : config.saturation;
    group.add(createBuildingMesh(b.x, b.z, b.w, b.d, b.h, hue, sat, b.lightness));
  });

  return group;
}
