// Warehouse: big brick storehouse with a tall slate roof, wide loading doors, a hoist
// beam over the upper loft door, and crates and barrels stacked on the loading apron.
import { C } from "./kit.js";

export default {
  type: "warehouse", name: "Warehouse", zh: "仓库", lots: [1, 1],
  build(b) {
    const w = 12, d = 9;
    b.box(w, 7.5, d, C.brick, { z: -1.4 });
    b.gable(w + 0.8, d + 1, 3.6, C.roofSlate, { y: 7.5, z: -1.4 });
    b.box(3.2, 4, 0.25, C.wood, { z: 3.15, role: "detail" });
    b.box(1.8, 1.8, 0.25, C.wood, { y: 5, z: 3.15, role: "detail" });
    b.box(0.3, 0.3, 1.8, C.timber, { y: 7.2, z: 3.9, role: "detail" });
    b.box(0.06, 2.4, 0.06, C.iron, { y: 4.8, z: 4.7, role: "detail" });
    b.windows(w, d, { cz: -1.4, rows: [2, 5.2], sides: "ew", ww: 0.7, wh: 1.0, spacing: 2.6 });
    b.box(w, 0.4, 2.4, C.stoneDark, { z: 4.3, role: "detail" });
    b.crate(-4.3, 4.3, { y: 0.4 }); b.crate(-3.4, 4.3, { y: 0.4 }); b.crate(-3.9, 4.3, { y: 1.2 });
    b.crate(4.0, 4.3, { y: 0.4, s: 1 });
    b.barrel(2.8, 4.4, { y: 0.4 }); b.barrel(2.8, 3.6, { y: 0.4 });
  }
};
