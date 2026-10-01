// Palace: walled royal compound — crenellated curtain walls with a front gateway, round
// corner towers with blue conical roofs, a paved courtyard and a tall central keep with
// corner turrets and a gilded dome, flags flying.
import { C } from "./kit.js";

export default {
  type: "palace", name: "Palace", zh: "宫殿", lots: [2, 2],
  build(b) {
    const S = 24, h = 7, t = 1.2;
    b.box(S, 0.1, S, C.cobble, { role: "detail" });
    b.box(S, h, t, C.stoneLight, { z: -S / 2 + t / 2 });
    b.box(t, h, S, C.stoneLight, { x: -S / 2 + t / 2 });
    b.box(t, h, S, C.stoneLight, { x: S / 2 - t / 2 });
    b.box(9.5, h, t, C.stoneLight, { x: -7.25, z: S / 2 - t / 2 });
    b.box(9.5, h, t, C.stoneLight, { x: 7.25, z: S / 2 - t / 2 });
    b.box(5, 2.6, t + 0.4, C.stoneLight, { y: h - 2.6, z: S / 2 - t / 2 });
    b.crenels(S, S, h, C.stone, { size: 0.8 });
    b.box(4.6, 4.4, 0.15, C.gold, { z: S / 2 - t - 0.2, role: "detail" });
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const tx = x * (S / 2 - 1.5), tz = z * (S / 2 - 1.5);
      b.cyl(2.6, 11, C.stoneLight, { x: tx, z: tz });
      b.crenelRing(2.8, 11, C.stone, { x: tx, z: tz, count: 10 });
      b.cone(2.9, 5, C.roofBlue, { x: tx, y: 11.6, z: tz }, 14);
      b.flag(tx, 16.4, tz, { pole: 2.5, color: C.red });
    }
    b.box(11, 16, 11, C.marble, { z: -2 });
    b.box(11.6, 0.6, 11.6, C.marbleDark, { y: 16, z: -2 });
    b.crenels(11.6, 11.6, 16.6, C.marbleDark, { cz: -2, size: 0.7 });
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      b.cyl(1.2, 3.5, C.marble, { x: x * 5.5, y: 16, z: -2 + z * 5.5 });
      b.cone(1.4, 2.6, C.roofBlue, { x: x * 5.5, y: 19.5, z: -2 + z * 5.5 }, 10);
    }
    b.cyl(3.6, 1.5, C.marbleDark, { y: 16.6, z: -2 }, { seg: 20 });
    b.dome(3.4, C.gold, { y: 18.1, z: -2 });
    b.windows(11, 11, { cz: -2, rows: [3, 7, 11], ww: 0.9, wh: 2, spacing: 2.6 });
    b.door(0, 3.5, { w: 2.4, h: 3.6, color: C.gold });
  }
};
