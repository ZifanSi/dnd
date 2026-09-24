// City/town 3D building cluster generator.
//
// A per-location override can be registered via registerCityConfig(name, config);
// buildCityGroup() looks the location's name up in that registry first and falls
// back to the generic city/town template when nothing is registered.
//
// All buildings of one city share a single InstancedMesh (one draw call per city).
// Faces are shaded by the scene's real lights (see viewer.js), not by hand.
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

// unit cube with its base on y=0, so instance scale (w, h, d) gives a box standing on the ground
const UNIT_BOX = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
const BUILDING_MATERIAL = new THREE.MeshLambertMaterial({ color: 0xffffff });

/**
 * Build a THREE.Group containing a ground footprint + every building for one
 * city/town, in the generator's own units (buildings ~20-34 wide, 20-175 tall),
 * centered on the group's local origin. The caller positions/scales the group.
 * group.userData = { maxHeight, radius } in those same local units.
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

  // soft round "town square" under the buildings
  const footprint = new THREE.Mesh(
    new THREE.CircleGeometry(groundSize * 0.58, 48),
    new THREE.MeshLambertMaterial({
      color: new THREE.Color().setStyle(`hsl(${config.hue}, ${config.saturation + 8}%, 45%)`),
      transparent: true,
      opacity: 0.22,
      depthWrite: false
    })
  );
  footprint.rotation.x = -Math.PI / 2;
  footprint.position.y = 1;
  group.add(footprint);

  const buildings = [];
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const jitterX = (rand() - 0.5) * 16;
    const jitterZ = (rand() - 0.5) * 16;
    buildings.push({
      x: (col - (cols - 1) / 2) * spacing + jitterX,
      z: (row - (cols - 1) / 2) * spacing + jitterZ,
      w: 20 + rand() * 14,
      d: 20 + rand() * 14,
      h: hMin + rand() * (hMax - hMin),
      hue: config.hue,
      sat: config.saturation,
      light: 50 + rand() * 16
    });
  }
  // fixed, hand-placed landmark buildings from a per-city config (optional)
  config.landmarks.forEach(lm => {
    buildings.push({
      ...lm,
      hue: config.landmarkHue ?? config.hue,
      sat: config.landmarkSaturation ?? config.saturation,
      light: 58
    });
  });

  const mesh = new THREE.InstancedMesh(UNIT_BOX, BUILDING_MATERIAL, buildings.length);
  const matrix = new THREE.Matrix4();
  const rotation = new THREE.Quaternion();
  const position = new THREE.Vector3();
  const size = new THREE.Vector3();
  const color = new THREE.Color();
  let maxHeight = 0;
  buildings.forEach((b, i) => {
    matrix.compose(position.set(b.x, 0, b.z), rotation, size.set(b.w, b.h, b.d));
    mesh.setMatrixAt(i, matrix);
    mesh.setColorAt(i, color.setStyle(`hsl(${b.hue}, ${b.sat}%, ${b.light}%)`));
    maxHeight = Math.max(maxHeight, b.h);
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.instanceColor.needsUpdate = true;
  // the shared unit-box bounds don't describe the spread-out instances; only nearby
  // cities are ever visible anyway, so skip per-city frustum culling
  mesh.frustumCulled = false;
  group.add(mesh);

  group.userData = { maxHeight, radius: groundSize / 2 };
  return group;
}
