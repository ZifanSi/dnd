// Gatehouse: twin square towers flanking an arched gate passage, a fighting chamber
// bridging over the passage, a raised iron portcullis, battlements and flags. The
// towers' sides (±x) are where a town wall attaches.
import { C } from "./kit.js";

export default {
  type: "gatehouse", name: "Gatehouse", zh: "城门楼", lots: [1, 1],
  build(b) {
    for (const x of [-4, 4]) {
      b.box(4, 11, 7, C.stone, { x });
      b.box(4.4, 0.5, 7.4, C.stoneDark, { x, y: 11 });
      b.crenels(4.4, 7.4, 11.5, C.stoneDark, { cx: x, size: 0.7 });
      b.windows(4, 7, { cx: x, rows: [4, 7.5], sides: "sn", ww: 0.35, wh: 1.4, spacing: 2 });
      b.flag(x, 11.5, 0, { pole: 3, color: C.blue });
    }
    b.box(4, 4, 7, C.stone, { y: 5.4 });
    b.box(4, 0.4, 7.4, C.stoneDark, { y: 9.4 });
    b.crenels(4, 7.4, 9.8, C.stoneDark, { sides: "sn", size: 0.7 });
    for (let i = 0; i < 6; i++) b.box(0.12, 2.2, 0.12, C.iron, { x: -1.6 + i * 0.64, y: 3.2, z: 3.4, role: "detail" });
    b.box(4, 0.15, 0.15, C.iron, { y: 3.4, z: 3.4, role: "detail" });
    b.box(4, 0.05, 7, C.cobble, { role: "detail" });
  }
};
