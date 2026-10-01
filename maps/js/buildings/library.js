// Library: square stone hall of learning with tall reading-room windows, a green copper
// dome on a drum topped by a small lantern, and a two-column entrance portico.
import { C } from "./kit.js";

export default {
  type: "library", name: "Library", zh: "图书馆", lots: [1, 1],
  build(b) {
    const w = 11, d = 10;
    b.box(w, 8, d, C.stoneLight, { z: -1 });
    b.box(w + 0.4, 0.5, d + 0.4, C.stone, { y: 8, z: -1 });
    b.cyl(3.8, 2, C.stoneLight, { y: 8.5, z: -1 }, { seg: 20 });
    b.dome(3.8, C.copper, { y: 10.5, z: -1 }, 20);
    b.cyl(0.7, 1.2, C.stoneLight, { y: 14.2, z: -1, role: "roof" }, { seg: 8 });
    b.cone(0.9, 1.2, C.copper, { y: 15.4, z: -1 }, 8);
    b.windows(w, d, { cz: -1, rows: [1.6], ww: 0.9, wh: 4.4, spacing: 2.6, skipCenter: true });
    b.columns(-1.8, 1.8, 5.2, 2, 6, { r: 0.35 });
    b.box(5, 0.8, 1.6, C.stone, { y: 6, z: 4.8 });
    b.gable(5.4, 1.8, 1.2, C.copper, { y: 6.8, z: 4.8 });
    b.door(0, 4, { w: 1.6, h: 3 });
    for (let i = 0; i < 2; i++) b.box(4.6, 0.3, 0.7, C.stone, { y: i * 0.3, z: 5.9 - i * 0.6 });
  }
};
