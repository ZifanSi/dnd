// Tavern: low stone alehouse with a thatched roof, a big gable-end chimney for the
// hearth, wide glowing taproom windows, a red hanging sign, barrels and an outside bench.
import { C } from "./kit.js";

export default {
  type: "tavern", name: "Tavern", zh: "酒馆", lots: [1, 1],
  build(b) {
    const w = 10, d = 8;
    b.box(w, 4.2, d, C.stone);
    b.gable(w + 0.8, d + 1.4, 3.4, C.thatch, { y: 4.2 });
    b.box(1.5, 8.6, 1.5, C.stoneDark, { x: w / 2 + 0.2, z: 0 });
    b.door(-1.5, d / 2, { w: 1.6, h: 2.5 });
    b.box(3.2, 1.4, 0.2, C.glow, { x: 2.3, y: 1.2, z: d / 2 + 0.02, role: "detail" });
    b.windows(w, d, { rows: [1.2], sides: "nwe", color: C.glow });
    b.sign(-3.4, 3.0, d / 2, C.red);
    b.barrel(3.9, d / 2 + 1.0); b.barrel(4.7, d / 2 + 0.7); b.barrel(4.3, d / 2 + 1.0, { y: 0.9 });
    b.box(3, 0.45, 0.5, C.wood, { x: 1.8, z: d / 2 + 1.3, role: "detail" });
  }
};
