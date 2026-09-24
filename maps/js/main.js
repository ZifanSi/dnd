// Entry point: wire the data, per-city 3D overrides, the 3D map viewer and directions together.
import { locations } from "../data/locations.js";
import { registerCityConfig } from "./city-scene.js";
import baldursGateConfig from "./cities/baldurs-gate.js";
import waterdeepConfig from "./cities/waterdeep.js";
import { toWorld, FLY_DISTANCE } from "./geo.js";
import { createViewer } from "./viewer.js";
import { createBasemap } from "./basemap.js";
import { createCitiesLayer } from "./cities-layer.js";
import { createMarkers } from "./markers.js";
import { createRouteLayer } from "./route-layer.js";
import { createDirections } from "./directions.js";
import { createUI } from "./ui.js";

// Locations without a registered config fall back to the generic city/town
// template inside city-scene.js. Add more cities/*.js files and register them
// here to customize any other place.
registerCityConfig("Baldur's Gate", baldursGateConfig);
registerCityConfig("Waterdeep", waterdeepConfig);

const entries = locations.map(loc => ({ loc, ...toWorld(loc) }));
const byName = new Map(entries.map(e => [e.loc.name.toLowerCase(), e]));

const container = document.getElementById("map");
const viewer = createViewer(container);

const basemap = createBasemap(viewer.renderer, { onProgress: (d, t) => ui.setLoading(d, t) });
viewer.scene.add(basemap.group);

const cities = createCitiesLayer(viewer.scene, entries);
const markers = createMarkers(viewer.scene, container, entries, { onClick: onPlaceClicked });
const routeLayer = createRouteLayer(viewer.scene, viewer);

const directions = createDirections({
  entries,
  routeLayer,
  onChange: r => {
    if (r) history.replaceState(null, "", `#route=${encodeURIComponent(r.from)}~${encodeURIComponent(r.to)}~${r.mode}`);
    else if (location.hash.startsWith("#route=")) history.replaceState(null, "", location.pathname);
  }
});

const ui = createUI({
  entries,
  viewer,
  onPick: flyToEntry,
  onToggleImagery: on => basemap.setImagery(on),
  canRoute: entry => directions.isSettlement(entry),
  onRouteFrom: entry => directions.setFrom(entry),
  onRouteTo: entry => directions.setTo(entry)
});

function flyToEntry(entry) {
  viewer.flyTo(entry, { distance: FLY_DISTANCE[entry.loc.type], autoTilt: true });
  ui.showPlace(entry);
}

// with the directions panel open, clicking a town fills the empty start/destination
function onPlaceClicked(entry) {
  if (directions.offerPlace(entry)) return;
  flyToEntry(entry);
}

viewer.onResize((w, h) => { markers.resize(w, h); routeLayer.resize(w, h); });
viewer.onFrame((camera, view, dt) => {
  cities.update(camera, dt);
  routeLayer.update(dt);
  markers.update(camera, view.distance, cities.liftFor);
  markers.render(camera);
  ui.updateControls(view, viewer.tiltMode);
});

/* ---------- shareable URL state ----------
   #place=Waterdeep                  jump straight to a place
   #fly=Waterdeep                    start zoomed out and fly there
   #route=Waterdeep~Baldur's Gate~fastest   open directions with that route
   #@x,z,distance,heading,tilt       exact camera (written automatically as you move) */
const deg = r => (r * 180) / Math.PI;
const rad = d => (d * Math.PI) / 180;

function restoreFromHash() {
  const hash = decodeURIComponent(location.hash.slice(1));
  if (!hash) return;
  const eq = hash.indexOf("=");
  const key = eq > 0 ? hash.slice(0, eq) : hash;
  const value = eq > 0 ? hash.slice(eq + 1) : "";
  const entry = byName.get(value.toLowerCase());
  if (key === "place" && entry) {
    viewer.jumpTo({ x: entry.x, z: entry.z, distance: FLY_DISTANCE[entry.loc.type] });
    ui.showPlace(entry);
  } else if (key === "fly" && entry) {
    setTimeout(() => flyToEntry(entry), 400);
  } else if (key === "route") {
    const [from, to, mode] = value.split("~");
    directions.restore({ from, to, mode });
  } else if (hash.startsWith("@")) {
    const [x, z, distance, heading, tilt] = hash.slice(1).split(",").map(parseFloat);
    if ([x, z, distance].every(Number.isFinite)) {
      viewer.jumpTo({
        x, z, distance,
        ...(Number.isFinite(heading) ? { theta: rad(heading) } : {}),
        ...(Number.isFinite(tilt) ? { phi: rad(tilt) } : {})
      });
    }
  }
}

viewer.onIdle(view => {
  if (directions.active) return; // the URL describes the route instead
  const h = `#@${view.x.toFixed(0)},${view.z.toFixed(0)},${view.distance.toFixed(0)},${deg(view.theta).toFixed(1)},${deg(view.phi).toFixed(1)}`;
  history.replaceState(null, "", h);
});

restoreFromHash();
viewer.start();
window.__mapReady = true;
