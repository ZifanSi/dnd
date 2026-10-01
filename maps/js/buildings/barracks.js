// Barracks: long two-storey stone dormitory under a slate hip roof, with a dirt training
// yard in front holding weapon racks, archery targets and a flagpole.
import { C } from "./kit.js";

export default {
  type: "barracks", name: "Barracks", zh: "兵营", lots: [2, 1],
  build(b) {
    b.box(22, 6, 7, C.stone, { z: -2.2 });
    b.pyramid(23, 8, 3, C.roofSlate, { y: 6, z: -2.2 });
    b.windows(22, 7, { cz: -2.2, rows: [1.4, 4.0], spacing: 2.4, skipCenter: true });
    for (const x of [-6, 0, 6]) b.door(x, 1.3, { w: 1.4, h: 2.4 });
    b.box(22, 0.05, 4.4, C.dirt, { z: 3.6, role: "detail" });
    for (const x of [-9, -7.4]) {
      b.box(1.2, 0.12, 0.3, C.timber, { x, y: 1.4, z: 4.6, role: "detail" });
      for (const dx of [-0.4, 0, 0.4]) b.box(0.06, 1.8, 0.06, C.iron, { x: x + dx, z: 4.6, role: "detail" });
    }
    for (const x of [4, 7]) {
      b.box(0.12, 1.4, 0.12, C.timber, { x, z: 5.4, role: "detail" });
      b.cyl(0.6, 0.12, C.red, { x, y: 1.6, z: 5.3, rx: Math.PI / 2, role: "detail" }, { seg: 14 });
      b.cyl(0.35, 0.14, C.white, { x, y: 1.6, z: 5.3, rx: Math.PI / 2, role: "detail" }, { seg: 12 });
    }
    b.flag(0, 0, 4.6, { pole: 7, color: C.red });
  }
};
