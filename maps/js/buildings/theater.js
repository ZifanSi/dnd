// Theater: open-air amphitheatre — a half-bowl of stone seating tiers (rings that step up
// away from the stage) opening toward the street (front, +z), a sand orchestra floor, and
// a decorated stage building (arches, columns, pennants) closing the back.
import { C } from "./kit.js";

export default {
  type: "theater", name: "Theater", zh: "剧院", lots: [2, 2],
  build(b) {
    const front = { from: 0, to: Math.PI, seg: 28 };
    const z = -1.5;
    b.cyl(4.8, 0.25, C.sand, { z }, { thetaStart: -Math.PI / 2, thetaLength: Math.PI, seg: 24 });
    for (let i = 0; i < 5; i++) {
      const rIn = 4.8 + i * 1.6;
      b.ring(rIn + 1.6, rIn, 0.7 + i * 0.95, i % 2 ? C.stoneLight : C.stone, { z }, front);
    }
    // outer wall wraps just outside the top tier (sharing its surface would z-fight)
    b.ring(13.3, 12.8, 6.6, C.stoneDark, { z }, front);
    for (const x of [-12.9, 12.9]) b.box(1.0, 6.6, 1.2, C.stoneDark, { x, z: z - 0.4 });
    // stage + stage building (scaenae frons) facing the audience
    b.box(18, 1.2, 3.4, C.wood, { z: z - 3.2 });
    b.box(20, 8.5, 2.4, C.plasterWarm, { z: z - 6.2 });
    for (const x of [-6, 0, 6]) b.box(2.4, 3.6, 0.2, C.window, { x, y: 1.2, z: z - 4.92, role: "detail" });
    b.columns(-9, 9, z - 4.8, 7, 7.3, { y: 1.2, r: 0.3, color: C.marble });
    b.box(20.6, 0.8, 3, C.roofRed, { y: 8.5, z: z - 6.2, role: "roof" });
    for (const [x, color] of [[-8, C.red], [-2.7, C.blue], [2.7, C.gold], [8, C.purple]]) b.flag(x, 9.3, z - 6.2, { pole: 3, color });
  }
};
