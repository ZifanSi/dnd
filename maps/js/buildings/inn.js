// Inn: two-storey coaching inn — stone ground floor, jettied half-timbered upper floor
// with guest rooms, red tile roof with twin chimneys, lit taproom windows, hanging sign.
import { C } from "./kit.js";

export default {
  type: "inn", name: "Inn", zh: "旅馆", lots: [1, 1],
  build(b) {
    const w = 11, d = 9;
    b.box(w, 3.4, d, C.stone);
    b.box(w + 0.6, 3.4, d + 0.6, C.plaster, { y: 3.4 });
    for (const x of [-5.4, -2.7, 0, 2.7, 5.4]) b.box(0.25, 3.4, 0.15, C.timber, { x, y: 3.4, z: d / 2 + 0.35, role: "detail" });
    b.box(w + 0.6, 0.25, 0.2, C.timber, { y: 3.4, z: d / 2 + 0.35, role: "detail" });
    b.gable(w + 1.4, d + 1.6, 3.6, C.roofRed, { y: 6.8 });
    b.box(0.9, 3, 0.9, C.stoneDark, { x: -3.8, y: 8.2, z: -1.4, role: "roof" });
    b.box(0.9, 3, 0.9, C.stoneDark, { x: 3.8, y: 8.2, z: -1.4, role: "roof" });
    b.door(0, d / 2, { w: 1.8, h: 2.6 });
    b.windows(w, d, { rows: [1.0], color: C.glow, wh: 1.3, skipCenter: true });
    b.windows(w + 0.6, d + 0.6, { rows: [4.4], spacing: 2.6 });
    b.sign(2.4, 2.8, d / 2, C.gold);
    b.barrel(-4.6, d / 2 + 0.9);
    b.barrel(-3.7, d / 2 + 0.9);
  }
};
