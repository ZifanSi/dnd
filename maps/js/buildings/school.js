// School: two-storey red-brick schoolhouse with rows of windows, a bell cupola on the
// ridge, and a fenced schoolyard in front.
import { C } from "./kit.js";

export default {
  type: "school", name: "School", zh: "学院", lots: [1, 1],
  build(b) {
    const w = 11, d = 7;
    b.box(w, 6.2, d, C.brick, { z: -2 });
    b.gable(w + 0.8, d + 1.2, 2.8, C.roofRed, { y: 6.2, z: -2 });
    for (const [x, z] of [[-0.7, -2.7], [0.7, -2.7], [-0.7, -1.3], [0.7, -1.3]]) b.box(0.18, 1.6, 0.18, C.white, { x, y: 8.4, z, role: "roof" });
    b.cyl(0.4, 0.6, C.gold, { y: 8.9, z: -2, role: "detail" }, { seg: 8 });
    b.pyramid(2, 2, 1.2, C.roofRed, { y: 10, z: -2 });
    b.door(0, 1.5, { w: 1.5, h: 2.6 });
    b.windows(w, d, { cz: -2, rows: [1.2, 4.2], skipCenter: true, spacing: 2 });
    b.box(9, 0.05, 3.6, C.dirt, { z: 3.6, role: "detail" });
    b.fence(-5, 5.6, -1.2, 5.6);
    b.fence(1.2, 5.6, 5, 5.6);
    b.fence(-5, 1.6, -5, 5.6);
    b.fence(5, 1.6, 5, 5.6);
  }
};
