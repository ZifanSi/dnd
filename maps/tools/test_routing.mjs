// Cross-checks js/routing.js on every settlement pair.   Run: node maps/tools/test_routing.mjs
import { roadGraph } from "../data/road-graph.js";
import { createRouter } from "../js/routing.js";

const router = createRouter(roadGraph);
const n = router.nodes.length;
let failures = 0;
const fail = msg => { failures++; if (failures <= 20) console.log("FAIL", msg); };

for (const mode of Object.keys(roadGraph.modes)) {
  let pairs = 0, expA = 0, expD = 0, worstDetour = 0, worstPair = "";
  const t0 = performance.now();
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const a = router.shortestPath(i, j, mode);
      const d = router.shortestPath(i, j, mode, { heuristic: false });
      if (!a || !d) { fail(`${mode} ${i}->${j} unreachable`); continue; }
      pairs++; expA += a.expanded; expD += d.expanded;
      if (Math.abs(a.cost - d.cost) > 1e-9 * Math.max(1, d.cost)) fail(`${mode} ${a.stops[0]}->${a.stops.at(-1)}: A* ${a.cost} != Dijkstra ${d.cost}`);
      if (a.expanded > d.expanded) fail(`${mode} A* expanded more than Dijkstra for ${i}->${j}`);
      if (a.legs[0].from !== i || a.legs.at(-1).to !== j) fail(`${mode} ${i}->${j} wrong endpoints`);
      for (let k = 1; k < a.legs.length; k++) if (a.legs[k].from !== a.legs[k - 1].to) fail(`${mode} ${i}->${j} legs not chained`);
      const detour = a.miles / a.straightMiles;
      if (detour < 0.97) fail(`${mode} ${a.stops[0]}->${a.stops.at(-1)} shorter than straight line (${detour.toFixed(2)})`);
      if (detour > worstDetour) { worstDetour = detour; worstPair = `${a.stops[0]} -> ${a.stops.at(-1)}`; }
    }
  }
  const ms = performance.now() - t0;
  console.log(`[${mode}] ${pairs} pairs OK-checked in ${ms.toFixed(0)} ms | avg nodes expanded: A* ${(expA / pairs).toFixed(1)} vs Dijkstra ${(expD / pairs).toFixed(1)} | worst detour ${worstDetour.toFixed(2)}x (${worstPair})`);
}

// the two modes should each win on their own metric
let modeViolations = 0;
for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
  if (i === j) continue;
  const f = router.shortestPath(i, j, "fastest"), s = router.shortestPath(i, j, "shortest");
  if (f.days > s.days * 1.03 || s.miles > f.miles * 1.03) modeViolations++;
}
console.log(`mode sanity: ${modeViolations} pairs where a mode loses on its own metric by >3%`);

const show = (a, b, mode) => {
  const r = router.shortestPath(a, b, mode);
  console.log(`${mode.padEnd(8)} ${a} -> ${b}: ${r.miles.toFixed(0)} mi, ${r.days.toFixed(1)} days, road ${r.roadMiles.toFixed(0)} mi, sea ${r.seaMiles.toFixed(0)} mi | ${r.stops.join(" > ")}`);
};
for (const [a, b] of [["Waterdeep", "Baldur's Gate"], ["Neverwinter", "Silverymoon"], ["Luskan", "Candlekeep"], ["Waterdeep", "Ruathym"], ["Baldur's Gate", "Arabel"]]) {
  show(a, b, "fastest"); show(a, b, "shortest");
}
console.log(failures ? `\n${failures} FAILURE(S)` : "\nALL CHECKS PASSED");
process.exit(failures ? 1 : 0);
