// Healer: whitewashed house of healing with a blue roof, a green cross above the door,
// a small well and raised herb-garden beds beside it.
import { C } from "./kit.js";

export default {
  type: "healer", name: "Healer", zh: "医馆", lots: [1, 1],
  build(b) {
    const w = 8, d = 8;
    b.box(w, 4.4, d, C.white, { x: -1.5 });
    b.gable(w + 0.8, d + 1, 2.6, C.roofBlue, { x: -1.5, y: 4.4 });
    b.door(-1.5, d / 2, { w: 1.4, h: 2.4 });
    b.box(1.1, 0.35, 0.15, C.green, { x: -1.5, y: 3.1, z: d / 2 + 0.05, role: "detail" });
    b.box(0.35, 1.1, 0.15, C.green, { x: -1.5, y: 2.75, z: d / 2 + 0.05, role: "detail" });
    b.windows(w, d, { cx: -1.5, rows: [1.3], skipCenter: true });
    for (const z of [-3, -0.5, 2]) {
      b.box(2.2, 0.35, 1.6, C.wood, { x: 4.4, z, role: "detail" });
      b.box(2.0, 0.25, 1.4, C.grass, { x: 4.4, y: 0.35, z, role: "detail" });
    }
    b.cyl(0.8, 0.8, C.stone, { x: 4.4, z: 4.4 }, { seg: 12 });
    b.box(0.15, 1.8, 0.15, C.timber, { x: 3.8, y: 0.8, z: 4.4, role: "detail" });
    b.box(0.15, 1.8, 0.15, C.timber, { x: 5.0, y: 0.8, z: 4.4, role: "detail" });
    b.gable(1.6, 1.4, 0.6, C.roofBlue, { x: 4.4, y: 2.6, z: 4.4 });
  }
};
