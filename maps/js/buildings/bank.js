// Bank: solid marble counting-house with a columned portico, a shallow pediment roof,
// a heavy cornice, bronze doors and a gold coin emblem on the pediment.
import { C } from "./kit.js";

export default {
  type: "bank", name: "Bank", zh: "银行", lots: [1, 1],
  build(b) {
    const w = 11, d = 8;
    b.box(w + 0.6, 0.8, d + 3, C.marbleDark, { z: 0.4 });
    b.box(w, 6.4, d, C.marble, { y: 0.8, z: -1 });
    b.columns(-4.4, 4.4, 4.0, 4, 5.6, { y: 0.8, r: 0.38 });
    b.box(w + 0.6, 0.9, d + 3, C.marbleDark, { y: 6.4, z: 0.4 });
    b.gable(d + 3.2, w + 0.8, 1.8, C.marbleDark, { y: 7.3, z: 0.4, ry: Math.PI / 2 });
    b.cyl(0.75, 0.15, C.gold, { y: 7.9, z: 5.9, rx: Math.PI / 2, role: "detail" }, { seg: 16 });
    b.door(0, 3, { w: 1.8, h: 3, color: C.gold });
    b.windows(w, d, { cz: -1, rows: [2.4], sides: "sew", ww: 0.6, wh: 2.2, spacing: 2.4, skipCenter: true, color: C.iron });
  }
};
