// Guardhouse: square stone watchtower with battlements, arrow-slit windows and a flag,
// plus a small guard hut attached at its foot.
import { C } from "./kit.js";

export default {
  type: "guardhouse", name: "Guardhouse", zh: "警卫所", lots: [1, 1],
  build(b) {
    b.box(6, 9, 6, C.stone, { x: -1.5, z: -1 });
    b.box(6.6, 0.5, 6.6, C.stoneDark, { x: -1.5, y: 9, z: -1 });
    b.crenels(6.6, 6.6, 9.5, C.stoneDark, { cx: -1.5, cz: -1 });
    b.windows(6, 6, { cx: -1.5, cz: -1, rows: [3.2, 6.4], ww: 0.3, wh: 1.4, spacing: 2 });
    b.door(-1.5, 2, { w: 1.3, h: 2.3 });
    b.flag(-1.5, 9.5, -1, { pole: 4, color: C.blue });
    b.box(4, 3, 4, C.stoneLight, { x: 3.5, z: 1 });
    b.gable(4.6, 4.8, 1.8, C.roofSlate, { x: 3.5, y: 3, z: 1 });
    b.door(3.5, 3, { w: 1.1, h: 2.1 });
  }
};
