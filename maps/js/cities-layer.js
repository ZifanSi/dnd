// Places a 3D town on the map at every city/town, built lazily the first time the camera
// comes near, and "rising" out of the ground (animated y-scale) as you zoom in — then
// sinking back when you zoom away, like Google Maps' 3D buildings. Named establishments
// (from the city data) get small clickable labels once you're close enough to read them.
import * as THREE from "three";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { buildCityGroup } from "./city-scene.js";
import { getModel } from "./buildings/index.js";

// town models are in metres; this maps them onto the map so a big city spans ~100 world
// units (the map is 10000 wide) without towns overlapping their neighbours
export const CITY_UNIT = 0.6;
const SHOW_DISTANCE = { city: 1500, town: 1000 };
const POI_DISTANCE = 330;   // labels of individual establishments appear inside this range
const RISE_RATE = 5;        // per second

const projected = new THREE.Vector3();

export function createCitiesLayer(scene, entries, { onPoiClick } = {}) {
  const items = entries
    .filter(e => e.loc.type === "city" || e.loc.type === "town")
    .map(e => ({ entry: e, group: null, rise: 0, pois: [] }));
  const byEntry = new Map(items.map(it => [it.entry, it]));

  function build(it) {
    const { x, z, loc } = it.entry;
    it.group = buildCityGroup(loc);
    it.group.position.set(x, 0, z);
    scene.add(it.group);
    it.pois = it.group.userData.pois.map(poi => {
      const el = document.createElement("div");
      el.className = `poi off${poi.ruined ? " ruined" : ""}`;
      el.innerHTML = `<span class="poi-dot"></span><span class="poi-name"></span>`;
      el.querySelector(".poi-dot").style.background = poiColor(poi.type);
      el.querySelector(".poi-name").textContent = poi.name;
      el.title = `${poi.name} — ${poi.types.map(t => getModel(t).zh).join(" / ")}`;
      el.addEventListener("click", e => { e.stopPropagation(); onPoiClick && onPoiClick(poi, it.group.userData.city, it.entry); });
      const obj = new CSS2DObject(el);
      scene.add(obj);
      return { poi, el, obj, shown: false, w: 0 };
    });
  }

  function update(camera, dt, viewW, viewH) {
    const k = 1 - Math.exp(-Math.max(0, dt) * RISE_RATE);
    const boxes = [];
    for (const it of items) {
      const { x, z, loc } = it.entry;
      const dx = camera.position.x - x, dy = camera.position.y, dz = camera.position.z - z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const target = dist < SHOW_DISTANCE[loc.type] ? 1 : 0;

      if (target && !it.group) build(it);
      it.rise += (target - it.rise) * k;
      if (Math.abs(target - it.rise) < 0.001) it.rise = target;
      if (!it.group) continue;

      it.group.visible = it.rise > 0.002;
      // uniform in x/z, only the height animates: the town grows straight up out of the map
      it.group.scale.set(CITY_UNIT, CITY_UNIT * Math.max(it.rise, 0.002), CITY_UNIT);

      for (const p of it.pois) {
        p.obj.position.set(x + p.poi.x * CITY_UNIT, p.poi.y * CITY_UNIT * it.rise, z + p.poi.z * CITY_UNIT);
        let show = it.rise > 0.9 && camera.position.distanceTo(p.obj.position) < POI_DISTANCE;
        if (show && viewW) {
          projected.copy(p.obj.position).project(camera);
          if (projected.z < 1) {
            if (!p.w) p.w = p.el.offsetWidth || p.poi.name.length * 7;
            const sx = (projected.x + 1) / 2 * viewW, sy = (1 - projected.y) / 2 * viewH;
            const box = [sx - 6, sy - 9, sx + p.w + 2, sy + 9];
            if (boxes.some(b => box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1])) show = false;
            else boxes.push(box);
          }
        }
        if (show !== p.shown) { p.shown = show; p.el.classList.toggle("off", !show); }
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

const POI_COLORS = {
  palace: "#d8a83c", "town-hall": "#d8a83c", temple: "#a662d6", library: "#5e9c86", school: "#5e9c86",
  inn: "#f0973a", tavern: "#f0973a", "general-store": "#3fa35a", blacksmith: "#6b6b6b",
  healer: "#3fa35a", bank: "#d8a83c", guildhall: "#2f5d9e", theater: "#b3332b", bathhouse: "#3d8fe0",
  guardhouse: "#2f5d9e", prison: "#3b3b3e", barracks: "#b3332b", gatehouse: "#857b6c",
  stable: "#8a6440", warehouse: "#8a6440"
};
function poiColor(type) { return POI_COLORS[type] || "#e6483c"; }
