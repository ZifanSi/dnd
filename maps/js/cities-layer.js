// Places a 3D building cluster on the map at every city/town, built lazily the first
// time the camera comes near, and "rising" out of the ground (animated y-scale) as
// you zoom in — then sinking back when you zoom away, like Google Maps' 3D buildings.
import { buildCityGroup } from "./city-scene.js";

// generator units -> world units (keeps a city cluster ~80 world units across, so
// neighbouring towns on the map don't overlap each other)
const CITY_UNIT = 0.22;
const SHOW_DISTANCE = { city: 1500, town: 1000 };
const RISE_RATE = 5; // per second

export function createCitiesLayer(scene, entries) {
  const items = entries
    .filter(e => e.loc.type === "city" || e.loc.type === "town")
    .map(e => ({ entry: e, group: null, rise: 0 }));
  const byEntry = new Map(items.map(it => [it.entry, it]));

  function update(camera, dt) {
    const k = 1 - Math.exp(-Math.max(0, dt) * RISE_RATE);
    for (const it of items) {
      const { x, z, loc } = it.entry;
      const dx = camera.position.x - x, dy = camera.position.y, dz = camera.position.z - z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const target = dist < SHOW_DISTANCE[loc.type] ? 1 : 0;

      if (target && !it.group) {
        it.group = buildCityGroup(loc);
        it.group.position.set(x, 0, z);
        scene.add(it.group);
      }
      it.rise += (target - it.rise) * k;
      if (Math.abs(target - it.rise) < 0.001) it.rise = target;

      if (it.group) {
        it.group.visible = it.rise > 0.002;
        // uniform in x/z, only the height animates: buildings grow straight up out of the map
        it.group.scale.set(CITY_UNIT, CITY_UNIT * Math.max(it.rise, 0.002), CITY_UNIT);
      }
    }
  }

  /** Current height (world units) of an entry's tallest building, so its label can float above it. */
  function liftFor(entry) {
    const it = byEntry.get(entry);
    if (!it || !it.group) return 0;
    return it.group.userData.maxHeight * CITY_UNIT * it.rise;
  }

  return { update, liftFor };
}
