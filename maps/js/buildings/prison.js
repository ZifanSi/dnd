// Prison: grim dark-stone cell block with barred windows and battlements, a walled
// exercise yard with an iron gate in front, and a round corner watchtower.
import { C } from "./kit.js";

export default {
  type: "prison", name: "Prison", zh: "监狱", lots: [1, 1],
  build(b) {
    b.box(10, 6, 7, C.stoneDark, { z: -2.2 });
    b.crenels(10, 7, 6, C.stoneDark, { cz: -2.2 });
    for (const x of [-3.6, -1.2, 1.2, 3.6]) {
      for (const y of [1.6, 4.0]) {
        b.box(1.1, 1.1, 0.2, C.window, { x, y, z: 1.32, role: "detail" });
        for (const dx of [-0.3, 0, 0.3]) b.box(0.08, 1.1, 0.12, C.iron, { x: x + dx, y, z: 1.45, role: "detail" });
      }
    }
    // yard wall with an iron gate in the middle
    b.box(4, 2.6, 0.5, C.stoneDark, { x: -3, z: 5.6 });
    b.box(4, 2.6, 0.5, C.stoneDark, { x: 3, z: 5.6 });
    for (let i = 0; i < 6; i++) b.box(0.1, 2.4, 0.1, C.iron, { x: -0.8 + i * 0.32, z: 5.6, role: "detail" });
    b.box(0.5, 2.6, 4.2, C.stoneDark, { x: -4.75, z: 3.4 });
    b.box(0.5, 2.6, 4.2, C.stoneDark, { x: 4.75, z: 3.4 });
    b.box(9, 0.05, 4, C.dirt, { z: 3.4, role: "detail" });
    b.cyl(1.7, 9, C.stone, { x: 5, z: -5.2 });
    b.crenelRing(1.9, 9, C.stoneDark, { x: 5, z: -5.2, count: 9 });
    b.cone(2.0, 2.6, C.roofSlate, { x: 5, y: 9.6, z: -5.2 }, 12);
    b.door(0, 1.3, { w: 1.4, h: 2.4, color: C.iron });
  }
};
