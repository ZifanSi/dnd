// Owns the single Three.js renderer/scene/camera/OrbitControls instance used
// for the "dive into a city" 3D view. Only one city is ever rendered at a time
// (the one the 2D map is currently zoomed/centered on) — that's a deliberate
// simplification from the old per-city floating CSS overlays: OrbitControls
// needs one camera to drive, so there is one shared 3D viewport that takes
// over the screen once you're fully "inside" a city.
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { buildCityGroup } from "./city-scene.js";

// Camera pose while still "diving in" (scale-driven, see map-view.js):
// starts almost directly overhead (matching the flat 2D map's top-down view)
// and eases down to a close, street-level oblique pose — like a camera swooping
// down out of the sky towards the rooftops.
const POSE_FAR = new THREE.Vector3(0, 640, 60);
const POSE_NEAR = new THREE.Vector3(130, 95, 170);
const LOOK_AT = new THREE.Vector3(0, 18, 0);

export function initCity3DViewer(canvas, { onExitRequest } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#bfe1f2");

  const camera = new THREE.PerspectiveCamera(55, 1, 1, 4000);
  camera.position.copy(POSE_FAR);
  camera.lookAt(LOOK_AT);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const sun = new THREE.DirectionalLight(0xfff2df, 1.15);
  sun.position.set(140, 260, 90);
  scene.add(sun);

  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(LOOK_AT);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 80;
  controls.maxDistance = 420;
  controls.minPolarAngle = 0.15;
  controls.maxPolarAngle = Math.PI / 2 - 0.03; // never dip below ground level
  controls.enabled = false;

  const groupCache = new Map(); // location name -> THREE.Group (built once, reused)
  let currentFocusName = null;
  let currentGroup = null;
  let engaged = false;   // true once the dive-in finished and OrbitControls owns the camera
  let visible = false;   // true whenever anything should be drawn at all

  function exitCityView() {
    engaged = false;
    controls.enabled = false;
    canvas.style.pointerEvents = "none";
    canvas.style.opacity = "0";
    visible = false;
    if (currentGroup) { scene.remove(currentGroup); currentGroup = null; }
    currentFocusName = null;
    if (onExitRequest) onExitRequest();
  }

  // dollying all the way back out while inside a city is how you "leave" it
  controls.addEventListener("change", () => {
    if (!engaged) return;
    const dist = camera.position.distanceTo(controls.target);
    if (dist >= controls.maxDistance - 1) exitCityView();
  });

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  /** Continuous render loop — needed independently of sync() so OrbitControls'
   *  damping/drag/wheel input (which never touches the 2D map's own event
   *  handlers) still redraws smoothly every frame while engaged. */
  function tick() {
    requestAnimationFrame(tick);
    if (!visible) return;
    if (engaged) controls.update();
    renderer.render(scene, camera);
  }
  requestAnimationFrame(tick);

  /**
   * Called from map-view.js's applyTransform()/updateCity3D() whenever the 2D
   * map's pan/zoom changes.
   *   candidate: { entry, factor } | null — the nearest-to-center city/town
   *              currently in range, and how "activated" it is (0..1).
   *   easedT:    the same 0..1 eased dive progress used to fade the 2D dot,
   *              reused here to drive the camera-position lerp so both
   *              animations stay perfectly in lockstep.
   */
  function sync({ candidate, easedT }) {
    if (!candidate || candidate.factor <= 0.004) {
      if (visible) exitCityView();
      return;
    }

    const name = candidate.entry.loc.name;
    if (name !== currentFocusName) {
      if (currentGroup) scene.remove(currentGroup);
      if (!groupCache.has(name)) groupCache.set(name, buildCityGroup(candidate.entry.loc));
      currentGroup = groupCache.get(name);
      scene.add(currentGroup);
      currentFocusName = name;
      engaged = false;
      controls.enabled = false;
    }

    visible = true;
    canvas.style.opacity = String(candidate.factor);

    if (!engaged) {
      camera.position.lerpVectors(POSE_FAR, POSE_NEAR, easedT);
      camera.lookAt(LOOK_AT);
      if (easedT >= 0.999 && candidate.factor >= 0.999) {
        engaged = true;
        controls.enabled = true;
        canvas.style.pointerEvents = "auto";
      }
    }
    // while engaged, camera position is owned entirely by OrbitControls (see tick()) —
    // we don't touch it here, so we never fight the user's own drag/wheel input.
  }

  return { sync };
}
