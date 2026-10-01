// Bathhouse: marble bath hall crowned with three small copper domes over the hot rooms,
// fronted by a colonnaded courtyard around an open-air plunge pool.
import { C } from "./kit.js";

export default {
  type: "bathhouse", name: "Bathhouse", zh: "浴场", lots: [1, 1],
  build(b) {
    b.box(12, 5, 6.5, C.marble, { z: -2.7 });
    b.box(12.4, 0.4, 6.9, C.marbleDark, { y: 5, z: -2.7 });
    for (const x of [-3.8, 0, 3.8]) {
      b.cyl(1.7, 0.8, C.marble, { x, y: 5.4, z: -2.7 }, { seg: 16 });
      b.dome(1.7, C.copper, { x, y: 6.2, z: -2.7 }, 16);
    }
    b.door(0, 0.55, { w: 1.6, h: 2.6 });
    b.windows(12, 6.5, { cz: -2.7, rows: [2.2], sides: "sew", ww: 0.9, wh: 1.6, spacing: 3, skipCenter: true });
    b.box(11, 0.3, 5, C.marbleDark, { z: 3.4 });
    b.box(6.4, 0.08, 3, C.water, { y: 0.3, z: 3.4, role: "detail" });
    for (const x of [-5.2, 5.2]) {
      b.columns(x, x, 1.8, 1, 3.4, { r: 0.28, y: 0.3 });
      b.columns(x, x, 5.4, 1, 3.4, { r: 0.28, y: 0.3 });
      b.box(1.2, 0.3, 4.6, C.marbleDark, { x, y: 3.7, z: 3.6 });
    }
  }
};
