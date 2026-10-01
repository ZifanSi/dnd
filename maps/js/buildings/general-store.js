// General store: timber-and-plaster shop with a big display window, a striped canvas
// awning over the front, goods (crates and barrels) set out on the street, slate roof.
import { C } from "./kit.js";

export default {
  type: "general-store", name: "General Store", zh: "杂货铺", lots: [1, 1],
  build(b) {
    const w = 9, d = 8;
    b.box(w, 5, d, C.plasterWarm);
    b.box(w + 0.1, 0.9, d + 0.1, C.wood, { role: "body" });
    b.gable(w + 0.8, d + 1.2, 3, C.roofSlate, { y: 5 });
    b.door(-2.6, d / 2, { w: 1.3, h: 2.4 });
    b.box(4.2, 1.8, 0.2, C.glow, { x: 1.6, y: 1.0, z: d / 2 + 0.02, role: "detail" });
    b.windows(w, d, { rows: [3.2], sides: "s", ww: 0.8, wh: 1.0 });
    b.windows(w, d, { rows: [1.4], sides: "nwe" });
    for (let i = 0; i < 8; i++) {
      b.box(1.1, 0.08, 2.2, i % 2 ? C.white : C.red, { x: -3.85 + i * 1.1, y: 3.15, z: d / 2 + 1.0, rx: 0.32, role: "detail" });
    }
    b.crate(3.4, d / 2 + 1.6); b.crate(2.5, d / 2 + 1.7, { ry: 0.3 }); b.crate(3.0, d / 2 + 1.6, { y: 0.8, s: 0.6 });
    b.barrel(-4.0, d / 2 + 1.3);
    b.sign(-3.8, 2.9, d / 2, C.green);
  }
};
