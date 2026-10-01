// Building gallery (buildings.html): every model from js/buildings/ laid out on a plaza,
// with orbit controls, click-to-focus labels, a "ruined" toggle and #type=<id> deep links.
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DRenderer, CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { ESTABLISHMENT_MODELS, MODELS, LOT, getBuildingGeometry } from "./buildings/index.js";

const container = document.getElementById("stage");
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
container.appendChild(renderer.domElement);
const labels = new CSS2DRenderer();
labels.domElement.className = "labels";
container.appendChild(labels.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcfe0ea);
scene.add(new THREE.HemisphereLight(0xffffff, 0x8f7d58, 1.1));
const sun = new THREE.DirectionalLight(0xfff0d8, 1.9);
sun.position.set(-60, 120, 80);
scene.add(sun);

const camera = new THREE.PerspectiveCamera(40, 1, 0.5, 2000);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2 - 0.05;

const material = new THREE.MeshLambertMaterial({ vertexColors: true });
const CELL = LOT * 2 + 6;
const COLS = 5;
const entries = [...ESTABLISHMENT_MODELS, MODELS.get("house")];
const rows = Math.ceil(entries.length / COLS);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(COLS * CELL + 20, rows * CELL + 20),
  new THREE.MeshLambertMaterial({ color: 0x8fae6a })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

let ruined = false;
const slots = entries.map((model, i) => {
  const x = ((i % COLS) - (COLS - 1) / 2) * CELL;
  const z = (Math.floor(i / COLS) - (rows - 1) / 2) * CELL;
  const pad = new THREE.Mesh(
    new THREE.PlaneGeometry(model.lots[0] * LOT, model.lots[1] * LOT),
    new THREE.MeshLambertMaterial({ color: 0xb9ab8f })
  );
  pad.rotation.x = -Math.PI / 2;
  pad.position.set(x, 0.02, z);
  scene.add(pad);

  const mesh = new THREE.Mesh(getBuildingGeometry(model.type), material);
  mesh.position.set(x, 0, z);
  scene.add(mesh);

  const el = document.createElement("div");
  el.className = "tag";
  el.dataset.type = model.type;
  el.innerHTML = `<b></b><span></span><small></small>`;
  el.querySelector("b").textContent = model.zh;
  el.querySelector("span").textContent = model.name;
  el.addEventListener("click", () => focus(model.type));
  const tag = new CSS2DObject(el);
  scene.add(tag);
  const slot = { model, mesh, tag, el, x, z };
  placeTag(slot);
  return slot;
});

function placeTag(slot) {
  const box = slot.mesh.geometry.boundingBox;
  slot.tag.position.set(slot.x, box.max.y + 3, slot.z);
  const tris = slot.mesh.geometry.getAttribute("position").count / 3;
  slot.el.querySelector("small").textContent = `${slot.model.type} · ${slot.model.lots.join("×")} 地块 · ${tris.toLocaleString()} 三角面`;
}

function setRuined(on) {
  ruined = on;
  for (const slot of slots) {
    slot.mesh.geometry = getBuildingGeometry(slot.model.type, { ruined: on });
    placeTag(slot);
  }
}
document.getElementById("ruinedToggle").addEventListener("change", e => setRuined(e.target.checked));

/* ---------- camera ---------- */
const flight = { active: false };
function overview() {
  controls.target.set(0, 0, 0);
  camera.position.set(0, rows * CELL * 0.8, rows * CELL * 0.85);
}
function focus(type) {
  const slot = slots.find(s => s.model.type === type);
  if (!slot) return;
  const box = slot.mesh.geometry.boundingBox;
  const size = Math.max(box.max.x - box.min.x, box.max.y, box.max.z - box.min.z);
  Object.assign(flight, {
    active: true, t: 0,
    fromPos: camera.position.clone(), fromTarget: controls.target.clone(),
    toTarget: new THREE.Vector3(slot.x, box.max.y * 0.4, slot.z),
    // high three-quarter view, so neighbouring models in the next row don't block it
    toPos: new THREE.Vector3(slot.x + size * 0.9, box.max.y * 0.6 + size * 1.3, slot.z + size * 1.4)
  });
  slots.forEach(s => s.el.classList.toggle("active", s === slot));
  document.getElementById("current").textContent = `${slot.model.zh} ${slot.model.name}`;
  history.replaceState(null, "", `#type=${type}`);
}
document.getElementById("overviewBtn").addEventListener("click", () => {
  flight.active = false; overview();
  slots.forEach(s => s.el.classList.remove("active"));
  document.getElementById("current").textContent = "全部建筑";
  history.replaceState(null, "", location.pathname);
});
renderer.domElement.addEventListener("pointerdown", () => { flight.active = false; });

function resize() {
  const w = container.clientWidth, h = container.clientHeight;
  renderer.setSize(w, h);
  labels.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);
resize();
overview();

const hash = decodeURIComponent(location.hash.slice(1));
if (hash.startsWith("type=")) {
  focus(hash.slice(5));
  if (hash.includes("&ruined")) { document.getElementById("ruinedToggle").checked = true; setRuined(true); }
  // jump straight there (no animation) when opened from a link
  flight.t = 1;
}

let last = performance.now();
function tick() {
  requestAnimationFrame(tick);
  const now = performance.now(), dt = Math.min(0.1, Math.max(0, (now - last) / 1000));
  last = now;
  if (flight.active) {
    flight.t = Math.min(1, flight.t + dt / 0.9);
    const e = flight.t < 0.5 ? 4 * flight.t ** 3 : 1 - (-2 * flight.t + 2) ** 3 / 2;
    camera.position.lerpVectors(flight.fromPos, flight.toPos, e);
    controls.target.lerpVectors(flight.fromTarget, flight.toTarget, e);
    if (flight.t >= 1) flight.active = false;
  }
  controls.update();
  renderer.render(scene, camera);
  labels.render(scene, camera);
}
tick();

window.__galleryReady = { count: slots.length, types: slots.map(s => s.model.type) };
