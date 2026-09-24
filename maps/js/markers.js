// Map labels for all 212 locations, rendered as HTML over the WebGL canvas with
// CSS2DRenderer so text stays crisp at any zoom. Like Google Maps:
//  - level of detail: which labels are eligible depends on how far the camera is
//    from each one (per-type thresholds), so detail fills in as you zoom;
//  - collision culling: labels are placed in priority order (cities, then regions,
//    towns, features) and any label that would overlap an already-placed one is hidden.
import * as THREE from "three";
import { CSS2DRenderer, CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";

// eligible when the camera is within `near` of the label (and, for labels that only
// make sense zoomed out, when the camera's own zoom distance is above `minZoom`)
const LOD = {
  city: { near: Infinity },
  town: { near: 2300 },
  region: { near: Infinity, minZoom: 450 },
  forest: { near: 2100 },
  mountain: { near: 2100 },
  river: { near: 2100 },
  island: { near: 2600 }
};
const PRIORITY = { city: 0, region: 1, town: 2, island: 3, river: 4, forest: 4, mountain: 4 };
const PAD = 3; // px of breathing room between labels

export function createMarkers(scene, container, entries, { onClick } = {}) {
  const labelRenderer = new CSS2DRenderer();
  const el = labelRenderer.domElement;
  el.className = "label-layer";
  container.appendChild(el);
  let viewW = 1, viewH = 1;

  const markers = entries.map(entry => {
    const div = document.createElement("div");
    div.className = `marker type-${entry.loc.type}`;
    div.innerHTML = `<span class="dot"></span><span class="label"></span>`;
    const label = div.querySelector(".label");
    label.textContent = entry.loc.name;
    div.title = entry.loc.name;
    div.addEventListener("click", e => { e.stopPropagation(); onClick && onClick(entry); });
    // let wheel-zoom pass straight through labels to the map underneath
    div.addEventListener("wheel", e => {
      e.preventDefault();
      container.querySelector("canvas").dispatchEvent(new WheelEvent("wheel", e));
    }, { passive: false });

    const obj = new CSS2DObject(div);
    obj.position.set(entry.x, 0, entry.z);
    scene.add(obj);
    return { entry, div, label, obj, shown: true, w: 0, h: 0, priority: PRIORITY[entry.loc.type] };
  });
  // placement order: priority first, then keep the data's own order (stable sort)
  const placementOrder = markers.slice().sort((a, b) => a.priority - b.priority);

  function resize(w, h) {
    viewW = w; viewH = h;
    labelRenderer.setSize(w, h);
  }

  const projected = new THREE.Vector3();
  const placed = [];

  function screenBox(m, sx, sy) {
    if (!m.w) {
      // measure once, the first time the label is actually laid out
      m.w = m.label.offsetWidth;
      m.h = m.label.offsetHeight;
    }
    const w = m.w || m.entry.loc.name.length * 8, h = m.h || 18;
    if (m.entry.loc.type === "region") {
      return [sx - w / 2 - PAD, sy - h / 2 - PAD, sx + w / 2 + PAD, sy + h / 2 + PAD];
    }
    return [sx - 8 - PAD, sy - h / 2 - PAD, sx + 10 + w + PAD, sy + h / 2 + PAD];
  }
  const overlaps = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];

  function update(camera, zoomDistance, liftFor) {
    placed.length = 0;
    for (const m of placementOrder) {
      const lift = liftFor ? liftFor(m.entry) : 0;
      m.obj.position.y = lift > 0 ? lift + 3 : 0;
      m.div.classList.toggle("raised", lift > 0.5);

      const rule = LOD[m.entry.loc.type];
      const d = camera.position.distanceTo(m.obj.position);
      let show = d < rule.near && (!rule.minZoom || zoomDistance > rule.minZoom);

      if (show) {
        projected.copy(m.obj.position).project(camera);
        const onScreen = projected.z < 1 && Math.abs(projected.x) < 1.2 && Math.abs(projected.y) < 1.2;
        if (onScreen) {
          const box = screenBox(m, (projected.x + 1) / 2 * viewW, (1 - projected.y) / 2 * viewH);
          if (placed.some(p => overlaps(p, box))) show = false;
          else placed.push(box);
        }
      }
      if (show !== m.shown) {
        m.shown = show;
        m.div.classList.toggle("off", !show);
      }
    }
  }

  function render(camera) { labelRenderer.render(scene, camera); }

  return { resize, update, render };
}
