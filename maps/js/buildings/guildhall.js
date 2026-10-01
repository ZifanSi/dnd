// Guildhall: tall three-storey half-timbered hall, each storey jettied out over the one
// below, a steep brown roof, long guild banners and a gilded crest above double doors.
import { C } from "./kit.js";

export default {
  type: "guildhall", name: "Guildhall", zh: "公会大厅", lots: [1, 1],
  build(b) {
    const w = 11, d = 9;
    b.box(w, 3.4, d, C.stone);
    b.box(w + 0.5, 3.2, d + 0.5, C.plasterWarm, { y: 3.4 });
    b.box(w + 1, 3.2, d + 1, C.plasterWarm, { y: 6.6 });
    for (const [y, ww, dd] of [[3.4, w + 0.5, d + 0.5], [6.6, w + 1, d + 1]]) {
      for (let i = 0; i <= 6; i++) b.box(0.22, 3.2, 0.12, C.timber, { x: -ww / 2 + (ww * i) / 6, y, z: dd / 2 + 0.03, role: "detail" });
      b.box(ww, 0.22, 0.14, C.timber, { y, z: dd / 2 + 0.03, role: "detail" });
      b.box(ww, 0.22, 0.14, C.timber, { y: y + 1.6, z: dd / 2 + 0.03, role: "detail" });
    }
    b.gable(w + 1.6, d + 2, 5, C.roofBrown, { y: 9.8 });
    b.door(0, d / 2, { w: 2.2, h: 2.8 });
    b.cyl(0.8, 0.15, C.gold, { y: 3.9, z: d / 2 + 0.3, rx: Math.PI / 2, role: "detail" }, { seg: 14 });
    b.windows(w, d, { rows: [1.2], skipCenter: true });
    b.windows(w + 1, d + 1, { rows: [4.4, 7.6], spacing: 2.4 });
    for (const x of [-4.2, 4.2]) b.box(1.1, 4, 0.08, C.blue, { x, y: 4.6, z: d / 2 + 0.6, role: "detail" });
  }
};
