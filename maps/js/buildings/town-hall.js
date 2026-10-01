// Town hall: stone-and-plaster civic hall under a slate hip roof, a central clock tower
// with a spire rising from the facade, front steps and red civic banners.
import { C } from "./kit.js";

export default {
  type: "town-hall", name: "Town Hall", zh: "市政厅", lots: [1, 1],
  build(b) {
    const w = 12, d = 9;
    b.box(w, 3.6, d, C.stone, { z: -1 });
    b.box(w, 3.6, d, C.plaster, { y: 3.6, z: -1 });
    b.pyramid(w + 1, d + 1, 3.4, C.roofSlate, { y: 7.2, z: -1 });
    b.box(3.4, 15, 3.4, C.stoneLight, { z: 2.2 });
    b.pyramid(3.9, 3.9, 4.2, C.roofSlate, { y: 15, z: 2.2 });
    b.cone(0.25, 1.2, C.gold, { y: 19.1, z: 2.2 }, 6);
    b.cyl(1.0, 0.15, C.white, { y: 12.6, z: 3.95, rx: Math.PI / 2, role: "detail" }, { seg: 16 });
    b.box(0.12, 0.8, 0.1, C.iron, { y: 12.6, z: 4.05, role: "detail" });
    b.door(0, 3.9, { w: 1.6, h: 2.8 });
    for (let i = 0; i < 3; i++) b.box(4.4, 0.25, 0.6, C.stoneDark, { y: i * 0.25, z: 4.5 - i * 0.6 });
    b.windows(w, d, { cz: -1, rows: [1.2, 4.6], skipCenter: true });
    for (const x of [-4, 4]) b.box(1, 2.6, 0.08, C.red, { x, y: 4.2, z: 3.56, role: "detail" });
  }
};
