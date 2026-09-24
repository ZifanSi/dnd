// Textured ground plane: the Sword Coast map itself, like the imagery layer in Google Maps.
// A small overview texture loads first so the map appears immediately, then 4x3 detail
// tiles (2048px each, safe for any GPU's max texture size) stream in on top of it.
import * as THREE from "three";
import { WORLD_W, WORLD_H } from "./geo.js";

const COLS = 4, ROWS = 3;
const PARCHMENT = 0xe2cd9c;

function assetUrl(name) {
  return new URL(`../assets/basemap/${name}`, import.meta.url).href;
}

export function createBasemap(renderer, { onProgress } = {}) {
  const group = new THREE.Group();
  const loader = new THREE.TextureLoader();
  const anisotropy = renderer.capabilities.getMaxAnisotropy();

  function prepare(tex) {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = anisotropy;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }
  function flatPlane(w, h, material) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
    mesh.rotation.x = -Math.PI / 2;
    return mesh;
  }

  // wide backdrop so tilted views near the map edge don't look into a void
  const surround = flatPlane(WORLD_W * 8, WORLD_H * 8, new THREE.MeshBasicMaterial({ color: 0xb8a377 }));
  surround.position.y = -3;
  group.add(surround);

  // whole-map low-res layer (also the fallback shown under any tile still loading)
  const overviewMat = new THREE.MeshBasicMaterial({ color: PARCHMENT });
  const overview = flatPlane(WORLD_W, WORLD_H, overviewMat);
  overview.position.y = -1;
  group.add(overview);

  const tiles = [];
  const tileW = WORLD_W / COLS, tileH = WORLD_H / ROWS;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const mat = new THREE.MeshBasicMaterial();
      const mesh = flatPlane(tileW, tileH, mat);
      mesh.position.set(-WORLD_W / 2 + (c + 0.5) * tileW, 0, -WORLD_H / 2 + (r + 0.5) * tileH);
      mesh.visible = false;
      group.add(mesh);
      tiles.push({ mesh, mat, file: `tile_r${r}_c${c}.jpg` });
    }
  }

  let imagery = true;
  let overviewTex = null;
  const total = tiles.length + 1;
  let loaded = 0;
  const bump = () => onProgress && onProgress(++loaded, total);

  function applyImagery() {
    overviewMat.map = imagery ? overviewTex : null;
    overviewMat.color.set(imagery && overviewTex ? 0xffffff : PARCHMENT);
    overviewMat.needsUpdate = true;
    tiles.forEach(t => { t.mesh.visible = imagery && !!t.mat.map; });
  }

  function load(file) {
    return new Promise(resolve => {
      loader.load(assetUrl(file), tex => resolve(prepare(tex)), undefined, () => resolve(null));
    });
  }

  const ready = (async () => {
    overviewTex = await load("overview.jpg");
    bump();
    applyImagery();
    // a few at a time so the first tiles appear quickly instead of all finishing together
    const queue = tiles.slice();
    async function worker() {
      while (queue.length) {
        const t = queue.shift();
        const tex = await load(t.file);
        if (tex) { t.mat.map = tex; t.mat.needsUpdate = true; }
        bump();
        applyImagery();
      }
    }
    await Promise.all([worker(), worker(), worker()]);
  })();

  return {
    group,
    ready,
    /** true = painted map imagery, false = plain parchment ground (labels/buildings only) */
    setImagery(on) { imagery = on; applyImagery(); },
    get imagery() { return imagery; }
  };
}
