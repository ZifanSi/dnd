// Temple: classical marble temple on a stepped podium, a six-column portico, a pediment
// roof running front to back, bronze doors and a gilded finial on the front gable.
import { C } from "./kit.js";

export default {
  type: "temple", name: "Temple", zh: "神殿", lots: [1, 2],
  build(b) {
    const w = 12, d = 22;
    b.box(w, 1.2, d, C.marbleDark);
    for (let i = 0; i < 3; i++) b.box(w - 2, 0.4, 0.8, C.marbleDark, { y: i * 0.4, z: d / 2 + 2.0 - i * 0.8 });
    b.box(9, 7, 14, C.marble, { y: 1.2, z: -2.5 });
    b.columns(-5.2, 5.2, d / 2 - 1, 6, 7, { y: 1.2, r: 0.42 });
    b.columns(-5.2, 5.2, d / 2 - 3.6, 2, 7, { y: 1.2, r: 0.42 });
    b.box(w, 1.0, 6, C.marbleDark, { y: 8.2, z: d / 2 - 2.5 });
    b.gable(d + 0.4, w + 0.6, 3.2, C.roofRed, { y: 9.2, ry: Math.PI / 2 });
    b.cone(0.5, 1.4, C.gold, { y: 12.3, z: d / 2 + 0.1 }, 8);
    b.box(2.4, 4.4, 0.25, C.gold, { y: 1.2, z: 4.55, role: "detail" });
    b.windows(9, 14, { cz: -2.5, rows: [5], sides: "ew", ww: 0.7, wh: 2.2, spacing: 3 });
  }
};
