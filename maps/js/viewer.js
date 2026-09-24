// The 3D map viewer: renderer, camera and Google-Maps-style navigation.
//
//   left-drag            pan
//   wheel / pinch        zoom toward the cursor
//   right-drag / ctrl+drag / two-finger twist   rotate & tilt
//   double-click         zoom in on that spot
//
// Like Google Maps, the camera looks straight down when zoomed out and tilts
// towards the horizon as you zoom in ("auto" tilt). Tilting by hand switches to
// "manual" until you zoom far out again; the 2D button forces a flat top-down view.
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { WORLD_W, WORLD_H } from "./geo.js";

const MIN_DISTANCE = 14;
const MAX_DISTANCE = 9500;
const TILT_FAR = 4500;   // zoomed out beyond this: top-down
const TILT_NEAR = 220;   // zoomed in to this: fully tilted
const AUTO_TILT_MAX = 1.02;  // rad (~58°) — the automatic tilt at street level
const USER_TILT_MAX = 1.32;  // rad (~76°) — how far you may tilt by hand at street level
const FLAT_PHI = 0.0001;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOutCubic = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** 0 when zoomed far out, 1 at street level (log-scaled, so it feels even across zoom levels). */
function zoomProgress(distance) {
  const u = (Math.log(TILT_FAR) - Math.log(distance)) / (Math.log(TILT_FAR) - Math.log(TILT_NEAR));
  return easeInOutCubic(clamp(u, 0, 1));
}

export function createViewer(container) {
  const canvas = document.createElement("canvas");
  canvas.className = "map-canvas";
  container.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const sky = new THREE.Color(0xcfe0ea);
  scene.background = sky;
  scene.fog = new THREE.Fog(sky, 1e6, 2e6);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x8f7d58, 1.1));
  const sun = new THREE.DirectionalLight(0xfff0d8, 1.9);
  sun.position.set(-2500, 6000, 3500); // from the south-west, so east/north walls fall in shade
  scene.add(sun);

  const camera = new THREE.PerspectiveCamera(45, 1, 1, 1e5);

  const controls = new OrbitControls(camera, canvas);
  // MapControls-style configuration: pan along the ground, rotate with the right button
  controls.screenSpacePanning = false;
  controls.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE };
  controls.touches = { ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_ROTATE };
  controls.enableDamping = true;
  controls.dampingFactor = 0.12;
  controls.zoomToCursor = true;
  controls.zoomSpeed = 1.4;
  controls.rotateSpeed = 0.6;
  controls.minDistance = MIN_DISTANCE;
  controls.maxDistance = MAX_DISTANCE;
  controls.minPolarAngle = 0;

  // start: whole map, top-down, north up
  controls.target.set(0, 0, 0);
  camera.position.set(0, 8200, 0.01);
  camera.lookAt(controls.target);

  let tiltMode = "auto"; // "auto" | "manual" | "flat"
  let flight = null;
  const frameCallbacks = [];
  const resizeCallbacks = [];
  const idleCallbacks = [];

  const offset = new THREE.Vector3();
  const spherical = new THREE.Spherical();

  function getView() {
    offset.copy(camera.position).sub(controls.target);
    spherical.setFromVector3(offset);
    return {
      x: controls.target.x, z: controls.target.z,
      distance: spherical.radius, phi: spherical.phi, theta: spherical.theta
    };
  }
  function setView({ x, z, distance, phi, theta }) {
    controls.target.set(x, 0, z);
    spherical.set(distance, Math.max(phi, FLAT_PHI), theta);
    offset.setFromSpherical(spherical);
    camera.position.copy(controls.target).add(offset);
    camera.lookAt(controls.target);
  }

  function maxPhiFor(distance) {
    return tiltMode === "flat" ? 0.02 : lerp(0.2, USER_TILT_MAX, zoomProgress(distance));
  }
  function restingPhiFor(distance, currentPhi) {
    if (tiltMode === "flat") return FLAT_PHI;
    if (tiltMode === "auto") return AUTO_TILT_MAX * zoomProgress(distance);
    return Math.min(currentPhi, maxPhiFor(distance));
  }

  /* ---------- user input bookkeeping ---------- */
  canvas.addEventListener("contextmenu", e => e.preventDefault());
  canvas.addEventListener("pointerdown", e => {
    flight = null;
    const rotating = e.button === 2 || (e.button === 0 && (e.ctrlKey || e.metaKey || e.shiftKey));
    if (rotating && tiltMode !== "manual") tiltMode = "manual";
  });
  canvas.addEventListener("wheel", () => { flight = null; }, { passive: true });

  // double-click: zoom in on the clicked spot of the ground
  const raycaster = new THREE.Raycaster();
  const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  canvas.addEventListener("dblclick", e => {
    const rect = canvas.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    raycaster.setFromCamera(ndc, camera);
    const hit = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(ground, hit)) {
      flyTo({ x: hit.x, z: hit.z }, { distance: getView().distance / 2.5, duration: 0.7 });
    }
  });

  /* ---------- animated camera flights ---------- */
  /**
   * Fly to a world point. Like Google Maps, long trips pull back (zoom out) mid-flight
   * and come back down at the destination. Options: distance, theta (heading), duration (s),
   * autoTilt (leave manual tilt and use the automatic zoom-based tilt again).
   */
  function flyTo({ x, z }, opts = {}) {
    // flying to a place brings back the automatic tilt, unless the user chose the flat 2D view
    if (opts.autoTilt && tiltMode === "manual") tiltMode = "auto";
    const from = getView();
    const distance = clamp(opts.distance ?? from.distance, MIN_DISTANCE, MAX_DISTANCE);
    let theta = opts.theta ?? from.theta;
    // turn the short way round
    while (theta - from.theta > Math.PI) theta -= Math.PI * 2;
    while (theta - from.theta < -Math.PI) theta += Math.PI * 2;
    const to = { x, z, distance, theta, phi: restingPhiFor(distance, from.phi) };

    const travel = Math.hypot(x - from.x, z - from.z);
    const arc = clamp(Math.log((travel + 1) / Math.min(from.distance, distance)) * 0.35, 0, 1.4);
    const duration = opts.duration ?? clamp(0.9 + 0.35 * Math.log10(1 + travel / 150), 0.9, 2.4);
    flight = { from, to, arc, duration, t: 0 };
  }

  function advanceFlight(dt) {
    flight.t = Math.min(1, flight.t + dt / flight.duration);
    const e = easeInOutCubic(flight.t);
    const { from, to, arc } = flight;
    const logD = lerp(Math.log(from.distance), Math.log(to.distance), e) + arc * Math.sin(Math.PI * e);
    setView({
      x: lerp(from.x, to.x, e),
      z: lerp(from.z, to.z, e),
      distance: Math.exp(logD),
      phi: lerp(from.phi, to.phi, e),
      theta: lerp(from.theta, to.theta, e)
    });
    if (flight.t >= 1) { flight = null; notifyIdleSoon(); }
  }

  function zoomBy(factor) {
    const v = getView();
    flyTo({ x: v.x, z: v.z }, { distance: v.distance * factor, duration: 0.35 });
  }
  function resetNorth() {
    const v = getView();
    flyTo({ x: v.x, z: v.z }, { theta: 0, duration: 0.6 });
  }
  function setTiltMode(mode) {
    tiltMode = mode;
    const v = getView();
    flyTo({ x: v.x, z: v.z }, { duration: 0.6 });
  }

  /* ---------- idle notifications (used to keep the URL in sync) ---------- */
  let idleTimer = null;
  function notifyIdleSoon() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => idleCallbacks.forEach(fn => fn(getView())), 350);
  }
  controls.addEventListener("end", notifyIdleSoon);
  canvas.addEventListener("wheel", notifyIdleSoon, { passive: true });

  /* ---------- per-frame ---------- */
  function keepInBounds() {
    const t = controls.target;
    const cx = clamp(t.x, -WORLD_W / 2, WORLD_W / 2);
    const cz = clamp(t.z, -WORLD_H / 2, WORLD_H / 2);
    if (cx !== t.x || cz !== t.z || t.y !== 0) {
      camera.position.x += cx - t.x;
      camera.position.z += cz - t.z;
      camera.position.y -= t.y;
      t.set(cx, 0, cz);
    }
  }

  function updateClipAndFog(distance) {
    // near/far follow the zoom level, keeping depth precision good from orbit to street level
    scene.fog.near = distance * 2.6;
    scene.fog.far = distance * 10 + 400;
    camera.near = Math.max(0.05, distance * 0.004);
    camera.far = scene.fog.far * 1.1;
    camera.updateProjectionMatrix();
  }

  function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    resizeCallbacks.forEach(fn => fn(w, h));
  }
  window.addEventListener("resize", resize);

  let last = performance.now();
  function tick() {
    requestAnimationFrame(tick);
    // measured here rather than from rAF's timestamp: that is the frame's *start* time and
    // can precede `last`, which would give a negative dt and make every eased value explode
    const now = performance.now();
    const dt = clamp((now - last) / 1000, 0, 0.1);
    last = now;

    if (flight) {
      advanceFlight(dt);
      // let the flight's own tilt through, then update() just burns off leftover damping
      const v = getView();
      controls.maxPolarAngle = Math.max(maxPhiFor(v.distance), v.phi + 1e-3);
      controls.update();
    } else {
      const v = getView();
      if (tiltMode === "manual" && v.distance > TILT_FAR) tiltMode = "auto";
      controls.maxPolarAngle = maxPhiFor(v.distance);
      if (tiltMode !== "manual") {
        const target = restingPhiFor(v.distance, v.phi);
        const k = 1 - Math.exp(-dt * 7);
        setView({ ...v, phi: v.phi + (target - v.phi) * k });
      }
      controls.update();
    }
    keepInBounds();

    const view = getView();
    updateClipAndFog(view.distance);
    frameCallbacks.forEach(fn => fn(camera, view, dt));
    renderer.render(scene, camera);
  }

  return {
    scene,
    camera,
    renderer,
    container,
    start() { resize(); requestAnimationFrame(tick); },
    onFrame(fn) { frameCallbacks.push(fn); },
    onResize(fn) { resizeCallbacks.push(fn); },
    onIdle(fn) { idleCallbacks.push(fn); },
    flyTo,
    zoomBy,
    resetNorth,
    setTiltMode,
    getView,
    /** jump without animation (used when restoring a view from the URL) */
    jumpTo(view) {
      flight = null;
      const next = { ...getView(), ...view };
      next.distance = clamp(next.distance, MIN_DISTANCE, MAX_DISTANCE);
      if (view.phi === undefined) next.phi = restingPhiFor(next.distance, next.phi);
      else if (tiltMode === "auto" && Math.abs(view.phi - restingPhiFor(next.distance, view.phi)) > 0.05) tiltMode = "manual";
      setView(next);
    },
    get tiltMode() { return tiltMode; }
  };
}
