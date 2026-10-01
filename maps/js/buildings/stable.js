// Stable: long timber barn under a thatched roof with a row of stall doors and a hayloft
// door, hay bales, a water trough and a fenced paddock in front.
import { C } from "./kit.js";

export default {
  type: "stable", name: "Stable", zh: "马厩", lots: [1, 1],
  build(b) {
    b.box(11, 4, 7, C.wood, { z: -2 });
    b.gable(11.8, 8.4, 2.8, C.thatch, { y: 4, z: -2 });
    for (const x of [-3.9, -1.3, 1.3, 3.9]) {
      b.box(1.6, 2.2, 0.2, C.timber, { x, z: 1.55, role: "detail" });
      b.box(1.6, 0.12, 0.25, C.woodLight, { x, y: 1.1, z: 1.6, role: "detail" });
    }
    b.box(1.6, 1.2, 0.2, C.timber, { y: 4.4, z: 0.4, role: "detail" });
    b.box(1.2, 0.8, 0.9, C.hay, { x: -4.6, z: 2.5, role: "detail" });
    b.box(1.2, 0.8, 0.9, C.hay, { x: -4.6, y: 0.8, z: 2.5, role: "detail" });
    b.box(1.2, 0.8, 0.9, C.hay, { x: -3.3, z: 2.5, role: "detail" });
    b.box(2.2, 0.6, 0.6, C.wood, { x: 2.6, z: 3.2, role: "detail" });
    b.box(2.0, 0.1, 0.45, C.water, { x: 2.6, y: 0.55, z: 3.2, role: "detail" });
    b.fence(-5.5, 5.6, 5.5, 5.6);
    b.fence(-5.5, 2.0, -5.5, 5.6);
    b.fence(5.5, 2.0, 5.5, 5.6);
  }
};
