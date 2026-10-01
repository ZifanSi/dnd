// Blacksmith: squat stone workshop with a tall forge chimney, and an open-sided lean-to
// smithy beside it sheltering the glowing forge, an anvil and a quench barrel.
import { C } from "./kit.js";

export default {
  type: "blacksmith", name: "Blacksmith", zh: "铁匠铺", lots: [1, 1],
  build(b) {
    b.box(7, 4, 7, C.stone, { x: -2 });
    b.gable(7.8, 8, 2.6, C.roofSlate, { x: -2, y: 4 });
    b.box(1.6, 8.5, 1.6, C.stoneDark, { x: -4, z: -2.2 });
    b.door(-2, 3.5, { w: 1.8, h: 2.6 });
    b.windows(7, 7, { cx: -2, rows: [1.4], sides: "nw" });
    // lean-to smithy
    for (const [x, z] of [[1.6, -3.4], [5.4, -3.4], [1.6, 3.4], [5.4, 3.4]]) b.box(0.3, 3.2, 0.3, C.timber, { x, z });
    b.box(4.6, 0.2, 7.6, C.roofSlate, { x: 3.4, y: 3.4, rz: 0.18, role: "roof" });
    b.box(1.8, 1.0, 1.6, C.stoneDark, { x: 3.0, z: -1.6 });
    b.box(1.2, 0.15, 1.0, C.glow, { x: 3.0, y: 1.0, z: -1.6, role: "detail" });
    b.box(0.5, 0.7, 0.4, C.iron, { x: 3.6, z: 1.0, role: "detail" });
    b.box(1.0, 0.25, 0.4, C.iron, { x: 3.6, y: 0.7, z: 1.0, role: "detail" });
    b.cyl(0.45, 0.8, C.water, { x: 5.0, z: 2.2, role: "detail" }, { seg: 10 });
  }
};
