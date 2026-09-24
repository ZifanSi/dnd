// Shortest-path routing between settlements over the road network built by
// tools/build_road_graph.py (data/road-graph.js). Pure logic — no DOM, no Three.js —
// so it can be unit-tested in Node.
//
// Algorithm: A* over the settlement graph. The heuristic is the straight-line
// distance times the cheapest possible cost per mile for the mode (fastest: miles at
// the best travel speed; shortest: miles at the lowest distance multiplier), which
// never overestimates the true remaining cost, so A* returns the same optimal route
// as Dijkstra while expanding fewer nodes. Pass { heuristic: false } to get plain
// Dijkstra (used by the tests to cross-check).

class MinHeap {
  constructor() { this.items = []; }
  get size() { return this.items.length; }
  push(item, priority) {
    const a = this.items;
    a.push({ item, priority });
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p].priority <= a[i].priority) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }
  pop() {
    const a = this.items;
    const top = a[0];
    const last = a.pop();
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < a.length && a[l].priority < a[m].priority) m = l;
        if (r < a.length && a[r].priority < a[m].priority) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]];
        i = m;
      }
    }
    return top.item;
  }
}

export const ROUTE_MODES = {
  fastest: { label: "最快", hint: "沿道路，按行程天数计算" },
  shortest: { label: "最短", hint: "里程最少，可翻山渡海" }
};

export function createRouter(graph) {
  const { nodes, pxPerMile } = graph;
  const byName = new Map(nodes.map((n, i) => [n.name.toLowerCase(), i]));

  // adjacency list per mode: node -> [{ to, edge, forward }]
  const adjacency = {};
  for (const [mode, { edges }] of Object.entries(graph.modes)) {
    const adj = nodes.map(() => []);
    edges.forEach(edge => {
      adj[edge.a].push({ to: edge.b, edge, forward: true });
      adj[edge.b].push({ to: edge.a, edge, forward: false });
    });
    adjacency[mode] = adj;
  }

  const straightMiles = (i, j) =>
    Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y) / pxPerMile;
  // measured between the grid cells the costs were computed on (towns in the water are
  // snapped to the nearest land cell), so it never exceeds the true remaining cost
  const gridMiles = (i, j) =>
    Math.hypot(nodes[i].cx - nodes[j].cx, nodes[i].cy - nodes[j].cy) / pxPerMile;

  function indexOf(nameOrIndex) {
    if (typeof nameOrIndex === "number") return nameOrIndex;
    const i = byName.get(String(nameOrIndex).toLowerCase());
    if (i === undefined) throw new Error(`Unknown settlement: ${nameOrIndex}`);
    return i;
  }

  /** Optimal route between two settlements. Returns null if unreachable. */
  function shortestPath(from, to, mode = "fastest", { heuristic = true } = {}) {
    const start = indexOf(from), goal = indexOf(to);
    const adj = adjacency[mode];
    if (!adj) throw new Error(`Unknown mode: ${mode}`);
    // tiny margin only guards against floating-point rounding in the stored costs
    const perMile = heuristic ? graph.modes[mode].heuristicPerMile * 0.9999 : 0;
    const h = i => gridMiles(i, goal) * perMile;

    const g = new Float64Array(nodes.length).fill(Infinity);
    const via = new Array(nodes.length).fill(null);
    const closed = new Uint8Array(nodes.length);
    const open = new MinHeap();
    g[start] = 0;
    open.push(start, h(start));
    let expanded = 0;

    while (open.size) {
      const u = open.pop();
      if (closed[u]) continue;
      closed[u] = 1;
      expanded++;
      if (u === goal) break;
      for (const link of adj[u]) {
        const nd = g[u] + link.edge.cost;
        if (nd < g[link.to]) {
          g[link.to] = nd;
          via[link.to] = { from: u, link };
          open.push(link.to, nd + h(link.to));
        }
      }
    }
    if (!Number.isFinite(g[goal])) return null;

    const legs = [];
    for (let v = goal; v !== start; v = via[v].from) {
      const { from: u, link } = via[v];
      const e = link.edge;
      // edge paths are stored a->b as a flat [x0,y0,x1,y1,...]; flip when walking b->a
      const pts = [];
      for (let k = 0; k < e.path.length; k += 2) pts.push([e.path[k], e.path[k + 1]]);
      if (!link.forward) pts.reverse();
      legs.push({
        from: u, to: v,
        fromName: nodes[u].name, toName: nodes[v].name,
        miles: e.miles, days: e.days, roadMiles: e.roadMiles, seaMiles: e.seaMiles,
        path: pts
      });
    }
    legs.reverse();
    return summarize({ mode, cost: g[goal], expanded, legs });
  }

  /** Route through several stops in order (e.g. [start, via1, via2, end]). */
  function route(stops, mode = "fastest", opts) {
    if (stops.length < 2) throw new Error("Need at least two stops");
    const parts = [];
    for (let i = 1; i < stops.length; i++) {
      const r = shortestPath(stops[i - 1], stops[i], mode, opts);
      if (!r) return null;
      parts.push(r);
    }
    return summarize({
      mode,
      cost: parts.reduce((s, r) => s + r.cost, 0),
      expanded: parts.reduce((s, r) => s + r.expanded, 0),
      legs: parts.flatMap(r => r.legs)
    });
  }

  function summarize(r) {
    const sum = key => r.legs.reduce((s, l) => s + l[key], 0);
    const nodeIds = r.legs.length ? [r.legs[0].from, ...r.legs.map(l => l.to)] : [];
    return {
      ...r,
      stops: nodeIds.map(i => nodes[i].name),
      miles: sum("miles"),
      days: sum("days"),
      roadMiles: sum("roadMiles"),
      seaMiles: sum("seaMiles"),
      straightMiles: nodeIds.length ? straightMiles(nodeIds[0], nodeIds[nodeIds.length - 1]) : 0
    };
  }

  return {
    nodes,
    has: name => byName.has(String(name).toLowerCase()),
    shortestPath,
    route
  };
}
