// Modelling kit shared by every building model in this folder.
//
// Conventions for all models:
//   - units are metres; the model stands on y = 0, centred on its footprint
//   - the front (main door) faces +z
//   - a model fits its `lots`: one lot is LOT x LOT metres, minus a street margin,
//     so a 1x1 building stays within about 12 x 12 m and a 2x2 one within about 26 x 26 m
//   - colours are baked into a vertex-colour attribute, so a whole town can be merged
//     into a single mesh with one shared material (one draw call per town)
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const LOT = 14;

export const C = {
  stone: 0xb8ad9a, stoneDark: 0x857b6c, stoneLight: 0xd6cdbb, cobble: 0x9b9082,
  plaster: 0xeadfc6, plasterWarm: 0xe2c9a0, plasterRose: 0xe0b9a6,
  timber: 0x5a4130, wood: 0x8a6440, woodLight: 0xb08a5a, brick: 0xa65a3f,
  roofRed: 0xa4472f, roofBrown: 0x7d4a2e, roofSlate: 0x4d5663, roofBlue: 0x3d5a8a, thatch: 0xc9a55c,
  copper: 0x5e9c86, gold: 0xd8a83c, marble: 0xeee9df, marbleDark: 0xcfc6b6,
  door: 0x4b3422, window: 0x2a3644, glow: 0xf1c66a, iron: 0x3b3b3e,
  red: 0xb3332b, blue: 0x2f5d9e, green: 0x3c7d4a, purple: 0x6b3f86, white: 0xf4f1ea,
  hay: 0xd9b85a, water: 0x4e8fb5, grass: 0x7aa25a, dirt: 0xa58a63, sand: 0xd8c49a
};

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler();
const _p = new THREE.Vector3(), _s = new THREE.Vector3(), _c = new THREE.Color();

/** Triangular prism roof: ridge along x at height h, eaves along the z edges. */
function gableGeometry(w, d, h) {
  const x = w / 2, z = d / 2;
  const A = [-x, 0, -z], B = [x, 0, -z], Cc = [x, 0, z], D = [-x, 0, z], R1 = [-x, h, 0], R2 = [x, h, 0];
  const tris = [D, Cc, R2, D, R2, R1, B, A, R1, B, R1, R2, A, D, R1, Cc, B, R2, A, B, Cc, A, Cc, D];
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(tris.flat(), 3));
  g.computeVertexNormals();
  return g;
}

export class ModelBuilder {
  constructor() { this.parts = []; }

  /** Add any geometry with a colour and transform {x,y,z, rx,ry,rz, sx,sy,sz, role}. */
  add(geometry, color, t = {}) {
    let g = geometry.index ? geometry.toNonIndexed() : geometry;
    if (g === geometry) g = geometry.clone();
    if (g.getAttribute("uv")) g.deleteAttribute("uv");
    if (!g.getAttribute("normal")) g.computeVertexNormals();
    _e.set(t.rx || 0, t.ry || 0, t.rz || 0);
    _m.compose(_p.set(t.x || 0, t.y || 0, t.z || 0), _q.setFromEuler(_e), _s.set(t.sx ?? 1, t.sy ?? 1, t.sz ?? 1));
    g.applyMatrix4(_m);
    _c.set(color);
    const n = g.getAttribute("position").count;
    const col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { col[i * 3] = _c.r; col[i * 3 + 1] = _c.g; col[i * 3 + 2] = _c.b; }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    this.parts.push({ geometry: g, role: t.role || "body" });
    return this;
  }

  /** Box with its base at t.y. */
  box(w, h, d, color, t = {}) {
    return this.add(new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0), color, t);
  }
  /** Cylinder (or frustum) with its base at t.y. */
  cyl(r, h, color, t = {}, { rTop = r, seg = 14, thetaStart = 0, thetaLength = Math.PI * 2 } = {}) {
    return this.add(new THREE.CylinderGeometry(rTop, r, h, seg, 1, false, thetaStart, thetaLength).translate(0, h / 2, 0), color, t);
  }
  /**
   * Ring sector (annulus) of height h with its base at t.y — e.g. one tier of seating.
   * Angles are measured from +x toward +z, so [0, PI] is the front (+z) half.
   */
  ring(rOuter, rInner, h, color, t = {}, { from = 0, to = Math.PI * 2, seg = 32 } = {}) {
    const shape = new THREE.Shape();
    // the shape is drawn in XY and rotated onto the ground below (y -> -z), hence the negated angles
    shape.absarc(0, 0, rOuter, -from, -to, true);
    shape.absarc(0, 0, rInner, -to, -from, false);
    const g = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false, curveSegments: seg }).rotateX(-Math.PI / 2);
    return this.add(g, color, t);
  }
  cone(r, h, color, t = {}, seg = 14) {
    return this.add(new THREE.ConeGeometry(r, h, seg).translate(0, h / 2, 0), color, { role: "roof", ...t });
  }
  dome(r, color, t = {}, seg = 18) {
    return this.add(new THREE.SphereGeometry(r, seg, Math.ceil(seg / 2), 0, Math.PI * 2, 0, Math.PI / 2), color, { role: "roof", ...t });
  }
  /** Gable roof, ridge along x (rotate with t.ry for a ridge along z). Base at t.y. */
  gable(w, d, h, color, t = {}) {
    return this.add(gableGeometry(w, d, h), color, { role: "roof", ...t });
  }
  /** Four-sided pyramid / hip-style roof covering w x d. Base at t.y. */
  pyramid(w, d, h, color, t = {}) {
    const g = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4).rotateY(Math.PI / 4).translate(0, 0.5, 0);
    return this.add(g, color, { role: "roof", ...t, sx: w, sy: h, sz: d });
  }

  /** Battlements along the edges of a w x d rectangle centred on (cx, cz), sitting at height y. */
  crenels(w, d, y, color, { cx = 0, cz = 0, size = 0.7, sides = "nsew" } = {}) {
    const step = size * 2;
    const along = (len, fn) => { const n = Math.max(1, Math.floor(len / step)); for (let i = 0; i < n; i++) fn(-len / 2 + step * (i + 0.5)); };
    if (sides.includes("s")) along(w, x => this.box(size, size, size, color, { x: cx + x, y, z: cz + d / 2 - size / 2 }));
    if (sides.includes("n")) along(w, x => this.box(size, size, size, color, { x: cx + x, y, z: cz - d / 2 + size / 2 }));
    if (sides.includes("e")) along(d, z => this.box(size, size, size, color, { x: cx + w / 2 - size / 2, y, z: cz + z }));
    if (sides.includes("w")) along(d, z => this.box(size, size, size, color, { x: cx - w / 2 + size / 2, y, z: cz + z }));
    return this;
  }
  /** Battlements around a round tower top. */
  crenelRing(r, y, color, { x = 0, z = 0, count = 10, size = 0.6 } = {}) {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      this.box(size, size, size, color, { x: x + Math.sin(a) * (r - size / 2), y, z: z + Math.cos(a) * (r - size / 2), ry: a });
    }
    return this;
  }

  /**
   * Windows on the walls of an axis-aligned w x d block centred on (cx, cz).
   * sides: any of "s" (front, +z), "n", "e", "w". rows: list of sill heights.
   */
  windows(w, d, { cx = 0, cz = 0, rows = [1.2], ww = 0.9, wh = 1.3, spacing = 2.4, sides = "nsew", color = C.window, skipCenter = false, margin = 1.2 } = {}) {
    const place = (len, fn) => {
      const n = Math.max(1, Math.floor((len - margin * 2) / spacing) + 1);
      const span = (n - 1) * spacing;
      for (let i = 0; i < n; i++) {
        const o = -span / 2 + i * spacing;
        if (skipCenter && Math.abs(o) < spacing / 2) continue;
        fn(o);
      }
    };
    for (const y of rows) {
      if (sides.includes("s")) place(w, o => this.box(ww, wh, 0.2, color, { x: cx + o, y, z: cz + d / 2 + 0.02, role: "detail" }));
      if (sides.includes("n")) place(w, o => this.box(ww, wh, 0.2, color, { x: cx + o, y, z: cz - d / 2 - 0.02, role: "detail" }));
      if (sides.includes("e")) place(d, o => this.box(0.2, wh, ww, color, { x: cx + w / 2 + 0.02, y, z: cz + o, role: "detail" }));
      if (sides.includes("w")) place(d, o => this.box(0.2, wh, ww, color, { x: cx - w / 2 - 0.02, y, z: cz + o, role: "detail" }));
    }
    return this;
  }

  /** Door on a front wall at z (facing +z). */
  door(x, z, { w = 1.4, h = 2.4, color = C.door } = {}) {
    return this.box(w, h, 0.25, color, { x, z: z + 0.05, role: "detail" });
  }
  /** Row of columns from x0 to x1 at depth z. */
  columns(x0, x1, z, count, h, { r = 0.35, color = C.marble, y = 0 } = {}) {
    for (let i = 0; i < count; i++) {
      const x = count === 1 ? x0 : x0 + ((x1 - x0) * i) / (count - 1);
      this.cyl(r, h, color, { x, y, z }, { seg: 10 });
    }
    return this;
  }
  /** Flag pole with a pennant. */
  flag(x, y, z, { pole = 4, color = C.red, ry = 0 } = {}) {
    this.cyl(0.08, pole, C.iron, { x, y, z, role: "detail" }, { seg: 6 });
    return this.box(1.6, 1, 0.05, color, { x: x + Math.cos(ry) * 0.8, y: y + pole - 1.1, z: z - Math.sin(ry) * 0.8, ry, role: "detail" });
  }
  /** Hanging shop sign on a bracket, next to a front wall at z. */
  sign(x, y, z, color = C.gold) {
    this.box(0.12, 0.12, 1.2, C.iron, { x, y: y + 0.9, z: z + 0.6, role: "detail" });
    return this.box(0.9, 0.7, 0.08, color, { x, y, z: z + 1.0, ry: Math.PI / 2, role: "detail" });
  }
  barrel(x, z, { y = 0, color = C.wood } = {}) {
    return this.cyl(0.4, 0.9, color, { x, y, z, role: "detail" }, { seg: 10 });
  }
  crate(x, z, { s = 0.8, y = 0, color = C.woodLight, ry = 0 } = {}) {
    return this.box(s, s, s, color, { x, y, z, ry, role: "detail" });
  }
  /** Simple post-and-rail fence from (x0,z0) to (x1,z1). */
  fence(x0, z0, x1, z1, { h = 1.1, color = C.wood } = {}) {
    const len = Math.hypot(x1 - x0, z1 - z0), ry = Math.atan2(-(z1 - z0), x1 - x0);
    const n = Math.max(2, Math.round(len / 2) + 1);
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      this.box(0.18, h, 0.18, color, { x: x0 + (x1 - x0) * t, z: z0 + (z1 - z0) * t, role: "detail" });
    }
    for (const yy of [h * 0.45, h * 0.85]) {
      this.box(len, 0.1, 0.08, color, { x: (x0 + x1) / 2, y: yy, z: (z0 + z1) / 2, ry, role: "detail" });
    }
    return this;
  }

  /**
   * Merge everything into one BufferGeometry (position, normal, color).
   * ruined: drop roofs and small details and weather the colours — for sites the
   * city data marks as ruined, abandoned or historical.
   */
  toGeometry({ ruined = false } = {}) {
    const keep = ruined ? this.parts.filter(p => p.role === "body") : this.parts;
    const merged = mergeGeometries(keep.map(p => p.geometry), false);
    if (ruined) {
      const col = merged.getAttribute("color");
      for (let i = 0; i < col.count; i++) {
        const r = col.getX(i), g = col.getY(i), b = col.getZ(i);
        const grey = (r + g + b) / 3;
        col.setXYZ(i, (r * 0.35 + grey * 0.65) * 0.62, (g * 0.35 + grey * 0.65) * 0.6, (b * 0.35 + grey * 0.65) * 0.55);
      }
    }
    merged.computeBoundingBox();
    return merged;
  }
}

/** Small deterministic RNG so each model variant always looks the same. */
export function seededRandom(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pick one item from a list with the given rng. */
export const pick = (rand, list) => list[Math.floor(rand() * list.length)];
