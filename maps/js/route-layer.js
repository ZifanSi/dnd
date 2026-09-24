// Draws a computed route on the 3D map, Google-Maps style: a thick blue line with a
// dark casing that "draws itself" from start to end, A/B pins, dots at every town
// the route passes through, and a fly-along tour that follows the route with the
// camera heading in the direction of travel.
import * as THREE from "three";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { pxToWorld } from "./geo.js";

const LINE_Y = 1.2;          // lifted just above the map so it never z-fights with it
const DRAW_IN_SECONDS = 1.1;
const TOUR_DISTANCE = 420;   // camera distance while flying along the route
const TOUR_SPEED = 260;      // world units per second (~70 miles/s of map)

/** Chaikin corner-cutting: softens the polyline's corners, keeping both endpoints fixed. */
function smooth(points, iterations = 2) {
  let pts = points;
  for (let it = 0; it < iterations; it++) {
    if (pts.length < 3) return pts;
    const out = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
      out.push([ax * 0.75 + bx * 0.25, az * 0.75 + bz * 0.25], [ax * 0.25 + bx * 0.75, az * 0.25 + bz * 0.75]);
    }
    out.push(pts[pts.length - 1]);
    pts = out;
  }
  return pts;
}

function pinElement(cls, text) {
  const el = document.createElement("div");
  el.className = `route-pin ${cls}`;
  el.innerHTML = `<div class="pin-body"><span></span></div>`;
  el.querySelector("span").textContent = text;
  return el;
}

export function createRouteLayer(scene, viewer) {
  const group = new THREE.Group();
  group.name = "route";
  scene.add(group);

  // the casing doesn't write depth: it sits at the same depth as the blue line on top of it,
  // and would otherwise win the depth test in spots and speckle through it
  const casingMat = new LineMaterial({ color: 0x0b3d91, linewidth: 10, worldUnits: false, depthWrite: false });
  const lineMat = new LineMaterial({ color: 0x3b8bff, linewidth: 6, worldUnits: false });
  const materials = [casingMat, lineMat];

  let current = null;   // { points, lengths, total, legEnds, lines, objects }
  let drawT = 1;
  let tour = null;
  const tourListeners = { progress: [], end: [] };

  const traveller = document.createElement("div");
  traveller.className = "route-traveller";
  const travellerObj = new CSS2DObject(traveller);
  travellerObj.visible = false;
  group.add(travellerObj);

  function clear() {
    stopTour();
    if (!current) return;
    current.lines.forEach(l => { group.remove(l); l.geometry.dispose(); });
    current.objects.forEach(o => { group.remove(o); o.element.remove(); });
    current = null;
  }

  /** Show a route returned by routing.js (legs with source-pixel paths). */
  function show(route, nodesByName) {
    clear();
    const points = [];
    const legEnds = [];     // index into `points` where each leg ends
    route.legs.forEach((leg, i) => {
      const world = smooth(leg.path.map(([px, py]) => { const w = pxToWorld(px, py); return [w.x, w.z]; }));
      points.push(...(i === 0 ? world : world.slice(1)));
      legEnds.push(points.length - 1);
    });

    const lengths = [0];
    for (let i = 1; i < points.length; i++) {
      lengths.push(lengths[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]));
    }

    const flat = [];
    points.forEach(([x, z]) => flat.push(x, LINE_Y, z));
    const lines = materials.map((mat, i) => {
      const geo = new LineGeometry();
      geo.setPositions(flat);
      const line = new Line2(geo, mat);
      line.computeLineDistances();
      line.renderOrder = 10 + i;
      group.add(line);
      return line;
    });

    // pins: A at the start, B at the destination, small dots at towns passed through
    const objects = [];
    const addPin = (el, name) => {
      const n = nodesByName(name);
      const obj = new CSS2DObject(el);
      obj.position.set(n.x, LINE_Y, n.z);
      group.add(obj);
      objects.push(obj);
    };
    addPin(pinElement("start", "A"), route.stops[0]);
    route.stops.slice(1, -1).forEach(name => {
      const el = document.createElement("div");
      el.className = "route-stop";
      addPin(el, name);
    });
    addPin(pinElement("end", "B"), route.stops[route.stops.length - 1]);

    current = { points, lengths, total: lengths[lengths.length - 1], legEnds, lines, objects };
    drawT = 0;
    setReveal(0);
  }

  function setReveal(t) {
    if (!current) return;
    const segments = current.points.length - 1;
    const count = Math.max(1, Math.ceil(segments * t));
    current.lines.forEach(l => { l.geometry.instanceCount = count; });
  }

  /** World-space bounding box of the whole route, or of one leg. */
  function bounds(legIndex = null) {
    if (!current) return null;
    const from = legIndex === null || legIndex === 0 ? 0 : current.legEnds[legIndex - 1];
    const to = legIndex === null ? current.points.length - 1 : current.legEnds[legIndex];
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (let i = from; i <= to; i++) {
      const [x, z] = current.points[i];
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
    }
    return { minX, maxX, minZ, maxZ };
  }

  /** Fly the camera so the route (or one leg) fills the screen. */
  function frame(legIndex = null) {
    const b = bounds(legIndex);
    if (!b) return;
    const aspect = viewer.camera.aspect;
    const spanX = (b.maxX - b.minX) * 1.35 + 60, spanZ = (b.maxZ - b.minZ) * 1.35 + 60;
    const halfFov = THREE.MathUtils.degToRad(viewer.camera.fov / 2);
    const distance = Math.max(spanZ, spanX / aspect) / (2 * Math.tan(halfFov));
    viewer.flyTo({ x: (b.minX + b.maxX) / 2, z: (b.minZ + b.maxZ) / 2 }, { distance, theta: 0, autoTilt: true });
  }

  /* ---------- fly-along tour ---------- */
  function pointAt(s) {
    const { points, lengths } = current;
    let i = 1;
    while (i < lengths.length - 1 && lengths[i] < s) i++;
    const seg = lengths[i] - lengths[i - 1] || 1;
    const t = Math.min(1, Math.max(0, (s - lengths[i - 1]) / seg));
    const [ax, az] = points[i - 1], [bx, bz] = points[i];
    return { x: ax + (bx - ax) * t, z: az + (bz - az) * t, index: i };
  }

  function startTour() {
    if (!current) return;
    drawT = 1; setReveal(1);
    const start = pointAt(0);
    const ahead = pointAt(Math.min(current.total, 40));
    tour = { s: 0, heading: Math.atan2(-(ahead.x - start.x), -(ahead.z - start.z)) };
    travellerObj.visible = true;
  }
  function stopTour() {
    if (!tour) return;
    tour = null;
    travellerObj.visible = false;
    tourListeners.end.forEach(fn => fn());
  }
  // any direct camera input takes over from the tour
  const canvas = viewer.renderer.domElement;
  canvas.addEventListener("pointerdown", stopTour);
  canvas.addEventListener("wheel", stopTour, { passive: true });

  function legAt(pointIndex) {
    return current.legEnds.findIndex(end => pointIndex <= end);
  }

  function update(dt) {
    if (!current) return;
    if (drawT < 1) {
      drawT = Math.min(1, drawT + dt / DRAW_IN_SECONDS);
      setReveal(1 - Math.pow(1 - drawT, 3));
    }
    if (tour) {
      tour.s = Math.min(current.total, tour.s + TOUR_SPEED * dt);
      const p = pointAt(tour.s);
      // look ahead to get a steady direction of travel; the camera sits behind it
      const ahead = pointAt(Math.min(current.total, tour.s + 60));
      if (ahead.x !== p.x || ahead.z !== p.z) {
        const target = Math.atan2(-(ahead.x - p.x), -(ahead.z - p.z));
        let diff = target - tour.heading;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        tour.heading += diff * (1 - Math.exp(-dt * 2.5));
      }
      travellerObj.position.set(p.x, LINE_Y, p.z);
      viewer.jumpTo({ x: p.x, z: p.z, distance: TOUR_DISTANCE, theta: tour.heading });
      tourListeners.progress.forEach(fn => fn(legAt(p.index), tour.s / current.total));
      if (tour.s >= current.total) stopTour();
    }
  }

  function resize(w, h) { materials.forEach(m => m.resolution.set(w, h)); }

  return {
    show, clear, frame, update, resize, startTour, stopTour,
    get active() { return !!current; },
    get touring() { return !!tour; },
    onTourProgress(fn) { tourListeners.progress.push(fn); },
    onTourEnd(fn) { tourListeners.end.push(fn); }
  };
}
