// Ordinary dwelling used to fill out towns between named establishments (not an
// establishment type itself). Each variant differs in size, storeys, walls and roof.
import { C, pick } from "./kit.js";

export default {
  type: "house", name: "House", zh: "民居", lots: [1, 1],
  build(b, rand) {
    const w = 6 + rand() * 3, d = 5 + rand() * 2.5;
    const storeys = rand() < 0.35 ? 2 : 1;
    const h = 3.2 * storeys;
    b.box(w, h, d, pick(rand, [C.plaster, C.plasterWarm, C.plasterRose, C.stoneLight]));
    b.gable(w + 0.6, d + 0.8, 2.2 + rand() * 1.2, pick(rand, [C.roofRed, C.roofBrown, C.thatch, C.roofSlate]), { y: h });
    b.box(0.7, 2.4, 0.7, C.stoneDark, { x: w / 2 - 1.2, y: h + 0.6, z: -d / 4, role: "roof" });
    b.door(0, d / 2, { w: 1.1, h: 2.1 });
    b.windows(w, d, { rows: storeys === 2 ? [1.1, 4.3] : [1.1], ww: 0.8, wh: 1.1, spacing: 2.2, skipCenter: true });
  }
};
