"""Build the settlement road network used for route finding (maps/data/road-graph.js).

Pipeline
  1. Classify the high-res map into an 8x8-px cell grid:
       road (red dashed lines) / land / forest / mountain & ice / water / off-map.
  2. Give every cell a travel cost for two routing modes:
       fastest  - travel time in days (roads fast, forest & mountains slow, sea by boat)
       shortest - true distance in miles over any passable terrain
  3. From every city/town, run Dijkstra over the cell grid and keep only *direct* links:
     a path to another settlement that doesn't pass through a third one (that would be two
     hops in the graph instead). Each link stores its real path geometry, miles and days.
  4. Write a small ES module the browser imports; the browser then runs A* over this graph
     (a few dozen nodes), which is instant.

Run:  python maps/tools/build_road_graph.py            (add --preview to also write debug PNGs)
"""
import csv, json, math, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import dijkstra

Image.MAX_IMAGE_PIXELS = None
HERE = os.path.dirname(os.path.abspath(__file__))
MAPS = os.path.join(HERE, "..")
SRC = os.path.join(MAPS, "Sword-Coast-Map_HighRes.jpg")
CSV = os.path.join(MAPS, "locations.csv")
OUT = os.path.join(MAPS, "data", "road-graph.js")
PREVIEW_DIR = os.path.join(MAPS, "tools", "preview")

F = 8                        # cell size in source pixels
PX_PER_MILE = 3.632          # measured from the map's own 0-500 mile scale bar
CELL_MILES = F / PX_PER_MILE
MARGIN_PX = 190              # decorative border + frame around the map: impassable

ROAD, LAND, FOREST, MOUNTAIN, WATER, BLOCKED, ROAD_EDGE = range(7)
CLASS_NAMES = ["road", "land", "forest", "mountain", "water", "blocked", "road_edge"]
# travel speed in miles/day per terrain (roughly D&D 5e paces: roads at a fast pace,
# difficult terrain at half speed, boats along the coast). ROAD_EDGE is the one-cell
# margin added to join the dashes of a drawn road: slightly slower than the road's
# centre line, so routes ride on the painted road rather than beside it.
SPEED = {ROAD: 30, ROAD_EDGE: 27, LAND: 18, FOREST: 12, MOUNTAIN: 8, WATER: 16}
# "shortest" mode minimises true distance: every passable terrain counts the same, so it
# may climb mountains or cross open sea when that is fewer miles (realistic travel with
# terrain speeds is what "fastest" is for)
DIST_MULT = {ROAD: 1.0, ROAD_EDGE: 1.0, LAND: 1.0, FOREST: 1.0, MOUNTAIN: 1.0, WATER: 1.0}
MODES = {
    "fastest": {c: CELL_MILES / s for c, s in SPEED.items()},   # days per cell
    "shortest": {c: CELL_MILES * m for c, m in DIST_MULT.items()},  # miles per cell
}
HEURISTIC_PER_MILE = {"fastest": 1 / max(SPEED.values()), "shortest": min(DIST_MULT.values())}
LIMIT = {"fastest": 45.0, "shortest": 1100.0}   # search radius per source (days / miles)
NEAR_CELLS = 3               # a path passing this close to a settlement "goes through" it
PRUNE_TOLERANCE = 0.02       # drop a link if a route via another town is at most 2% costlier


def classify():
    im = Image.open(SRC).convert("RGB")
    W, H = im.size
    rows, cols = H // F, W // F
    fracs = {k: np.zeros((rows, cols), np.float32) for k in ("red", "blue", "gray", "ice", "forest")}
    band = 64 * F
    for y0 in range(0, rows * F, band):
        y1 = min(y0 + band, rows * F)
        a = np.asarray(im.crop((0, y0, cols * F, y1)), dtype=np.int16)
        r, g, b = a[..., 0], a[..., 1], a[..., 2]
        mx, mn = a.max(axis=2), a.min(axis=2)
        mean = (r + g + b) / 3
        # thresholds measured from the map itself: sea ~(89,143,164) has blue > green,
        # forest ~(95,157,128) has green > blue, mountains are mid-grey hatching,
        # the High Ice is near-white; roads are red dashes ~(187,47,35)
        masks = {
            "red": (r > 140) & (g < 100) & (b < 90) & (r - g > 70),
            "blue": (b > g + 6) & (b > r + 30),
            "gray": (mx - mn < 26) & (mean > 70) & (mean < 200),
            "ice": (mx - mn < 22) & (mean > 236),
            "forest": (g > b + 12) & (g > r + 30) & (mean < 190),
        }
        for k, m in masks.items():
            h = (y1 - y0) // F
            fracs[k][y0 // F:y0 // F + h] = m.reshape(h, F, cols, F).mean(axis=(1, 3))

    road_core = fracs["red"] > 0.03
    road = ndimage.binary_dilation(road_core, iterations=1)                  # join the dashes
    water = fracs["blue"] > 0.3
    water = ndimage.binary_closing(water, iterations=3)                      # fill sea labels & wave ink
    water = ndimage.binary_opening(water, iterations=1)                      # drop thin rivers (fordable)
    rough = (fracs["gray"] > 0.4) | (fracs["ice"] > 0.6)
    mountain = ndimage.median_filter(rough.astype(np.uint8), size=3) > 0
    forest = ndimage.median_filter((fracs["forest"] > 0.4).astype(np.uint8), size=3) > 0

    cls = np.full((rows, cols), LAND, np.uint8)
    cls[forest] = FOREST
    cls[mountain] = MOUNTAIN
    cls[water] = WATER
    cls[road] = ROAD_EDGE
    cls[road_core] = ROAD
    m = MARGIN_PX // F
    cls[:m, :] = BLOCKED; cls[-m:, :] = BLOCKED; cls[:, :m] = BLOCKED; cls[:, -m:] = BLOCKED
    return cls, (W, H)


# 16-neighbourhood: straight, diagonal and knight moves (with the cells a knight move
# passes over). On an 8-neighbour grid paths can only turn in 45° steps and come out as
# long staircases; knight moves allow 22.5° headings, so routes look like real travel.
MOVES = [
    ((0, 1), []), ((1, 0), []), ((1, 1), []), ((1, -1), []),
    ((1, 2), [(0, 1), (1, 1)]), ((2, 1), [(1, 0), (1, 1)]),
    ((1, -2), [(0, -1), (1, -1)]), ((2, -1), [(1, 0), (1, -1)]),
]


def build_grid_graph(cls, cell_cost):
    rows, cols = cls.shape
    cost = np.full(cls.shape, np.inf)
    for c, v in cell_cost.items():
        cost[cls == c] = v
    P = 2
    pc = np.pad(cost, P, constant_values=np.inf)
    pidx = np.pad(np.arange(rows * cols).reshape(rows, cols), P, constant_values=-1)
    shift = lambda arr, dy, dx: arr[P + dy:P + dy + rows, P + dx:P + dx + cols]
    here, here_idx = shift(pc, 0, 0), shift(pidx, 0, 0)
    src, dst, w = [], [], []
    for (dy, dx), mids in MOVES:
        there = shift(pc, dy, dx)
        cells = [here, there] + [shift(pc, my, mx) for my, mx in mids]
        ok = np.all([np.isfinite(c) for c in cells], axis=0)
        weight = sum(cells) / len(cells) * math.hypot(dx, dy)
        src.append(here_idx[ok]); dst.append(shift(pidx, dy, dx)[ok]); w.append(weight[ok])
    n = rows * cols
    return coo_matrix((np.concatenate(w), (np.concatenate(src), np.concatenate(dst))), shape=(n, n)).tocsr()


def prune_near_redundant(edges, n_nodes, tolerance):
    """Drop a link when going through another settlement costs at most (1 + tolerance) x as
    much — directions then read town to town like a real itinerary instead of one long jump."""
    import heapq
    adj = {i: {} for i in range(n_nodes)}
    for e in edges.values():
        adj[e["a"]][e["b"]] = e["cost"]; adj[e["b"]][e["a"]] = e["cost"]

    def detour_cost(a, b, bound):
        dist, heap = {a: 0.0}, [(0.0, a)]
        while heap:
            d, u = heapq.heappop(heap)
            if u == b:
                return d
            if d > dist.get(u, math.inf) or d > bound:
                continue
            for v, c in adj[u].items():
                if (u, v) in ((a, b), (b, a)):
                    continue  # not allowed to use the link being tested
                nd = d + c
                if nd < dist.get(v, math.inf):
                    dist[v] = nd; heapq.heappush(heap, (nd, v))
        return math.inf

    for key in sorted(edges, key=lambda k: -edges[k]["cost"]):   # longest links first
        a, b = key
        c = edges[key]["cost"]
        if detour_cost(a, b, c * (1 + tolerance)) <= c * (1 + tolerance):
            del edges[key]
            del adj[a][b], adj[b][a]
    return edges


def rdp(points, eps):
    """Douglas-Peucker polyline simplification."""
    if len(points) < 3:
        return points
    (x0, y0), (x1, y1) = points[0], points[-1]
    dx, dy = x1 - x0, y1 - y0
    norm = math.hypot(dx, dy) or 1e-9
    dmax, imax = 0, 0
    for i in range(1, len(points) - 1):
        d = abs(dy * points[i][0] - dx * points[i][1] + x1 * y0 - y1 * x0) / norm
        if d > dmax:
            dmax, imax = d, i
    if dmax <= eps:
        return [points[0], points[-1]]
    return rdp(points[:imax + 1], eps)[:-1] + rdp(points[imax:], eps)


def main():
    preview = "--preview" in sys.argv
    print("classifying map...")
    cls, (W, H) = classify()
    rows, cols = cls.shape
    counts = {name: int((cls == c).sum()) for c, name in enumerate(CLASS_NAMES)}
    print("cells", rows, "x", cols, counts)

    settlements = [r for r in csv.DictReader(open(CSV, encoding="utf-8")) if r["type"] in ("city", "town")]
    names = [s["name"] for s in settlements]
    assert len(set(names)) == len(names), "settlement names must be unique"

    # snap each settlement to the nearest passable, non-water cell (towns on islands sit on land)
    land_ok = (cls != BLOCKED) & (cls != WATER)
    dist_to_land, (iy, ix) = ndimage.distance_transform_edt(~land_ok, return_indices=True)
    nodes, node_cells = [], []
    for s in settlements:
        px, py = float(s["x_percent"]) / 100 * W, float(s["y_percent"]) / 100 * H
        r0, c0 = min(rows - 1, int(py // F)), min(cols - 1, int(px // F))
        r, c = int(iy[r0, c0]), int(ix[r0, c0])
        node_cells.append(r * cols + c)
        # x/y: the settlement's map position; cx/cy: centre of the grid cell it was snapped to,
        # which is where the grid costs are measured from (used for the A* heuristic)
        nodes.append({"name": s["name"], "type": s["type"], "x": round(px, 1), "y": round(py, 1),
                      "cx": c * F + F / 2, "cy": r * F + F / 2})

    # raster of "which settlement is this cell next to", to detect paths passing through a town
    # (each cell belongs to its *closest* settlement, so neighbouring towns never overwrite each other)
    seeds = np.full((rows, cols), -1, np.int32)
    for i, cell in enumerate(node_cells):
        seeds[divmod(cell, cols)] = i
    d_seed, (sy, sx) = ndimage.distance_transform_edt(seeds < 0, return_indices=True)
    near = np.where(d_seed <= NEAR_CELLS, seeds[sy, sx], -1)
    near_flat = near.ravel()
    cls_flat = cls.ravel()
    day_cost = MODES["fastest"]

    out_modes = {}
    for mode, cell_cost in MODES.items():
        print(f"[{mode}] building grid graph...")
        graph = build_grid_graph(cls, cell_cost)
        edges = {}
        for si, s_cell in enumerate(node_cells):
            dist, pred = dijkstra(graph, directed=False, indices=s_cell, return_predecessors=True, limit=LIMIT[mode])
            for ti, t_cell in enumerate(node_cells):
                if ti == si or not np.isfinite(dist[t_cell]):
                    continue
                key = (min(si, ti), max(si, ti))
                if key in edges and edges[key]["cost"] <= dist[t_cell]:
                    continue
                path, cur, direct = [], t_cell, True
                while cur != -9999:
                    n = near_flat[cur]
                    if n >= 0 and n != si and n != ti:
                        direct = False
                        break
                    path.append(cur)
                    cur = pred[cur]
                if not direct:
                    continue
                path.reverse()                              # s -> t
                pts = [((c % cols) * F + F / 2, (c // cols) * F + F / 2) for c in path]
                pts[0] = (nodes[si]["x"], nodes[si]["y"])
                pts[-1] = (nodes[ti]["x"], nodes[ti]["y"])
                miles = road_m = sea_m = days = 0.0
                for k in range(1, len(pts)):
                    seg = math.dist(pts[k - 1], pts[k]) / PX_PER_MILE
                    cc = cls_flat[path[k]]
                    miles += seg
                    days += seg / SPEED[cc]
                    if cc in (ROAD, ROAD_EDGE): road_m += seg
                    if cc == WATER: sea_m += seg
                simple = rdp(pts, eps=F / 2)
                if si > ti:
                    simple.reverse()
                edges[key] = {
                    "a": key[0], "b": key[1], "cost": round(float(dist[t_cell]), 4),
                    "miles": round(miles, 1), "days": round(days, 2),
                    "roadMiles": round(road_m, 1), "seaMiles": round(sea_m, 1),
                    "path": [round(v) for p in simple for v in p],
                }
            if si % 10 == 0:
                print(f"  {si}/{len(node_cells)} sources, {len(edges)} links so far")

        found = len(edges)
        edges = prune_near_redundant(edges, len(nodes), PRUNE_TOLERANCE)
        print(f"[{mode}] {found} direct links -> {len(edges)} after pruning near-redundant ones")

        # make sure every settlement can reach every other one
        parent = list(range(len(nodes)))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]; x = parent[x]
            return x
        for e in edges.values():
            parent[find(e["a"])] = find(e["b"])
        comps = {find(i) for i in range(len(nodes))}
        print(f"[{mode}] {len(edges)} links, {len(comps)} connected component(s)")
        if len(comps) > 1:
            groups = {}
            for i in range(len(nodes)):
                groups.setdefault(find(i), []).append(nodes[i]["name"])
            print("  WARNING disconnected:", [g for g in groups.values() if len(g) < len(nodes) // 2])
        out_modes[mode] = {"heuristicPerMile": HEURISTIC_PER_MILE[mode], "edges": sorted(edges.values(), key=lambda e: (e["a"], e["b"]))}

        if preview:
            os.makedirs(PREVIEW_DIR, exist_ok=True)
            base = Image.open(SRC).convert("RGB").resize((W // 4, H // 4))
            from PIL import ImageDraw
            d = ImageDraw.Draw(base)
            for e in edges.values():
                p = e["path"]
                d.line([(p[i] / 4, p[i + 1] / 4) for i in range(0, len(p), 2)], fill=(20, 90, 255), width=3)
            for n in nodes:
                d.ellipse((n["x"] / 4 - 5, n["y"] / 4 - 5, n["x"] / 4 + 5, n["y"] / 4 + 5), fill=(255, 255, 0), outline=(0, 0, 0))
            base.save(os.path.join(PREVIEW_DIR, f"graph_{mode}.jpg"), quality=85)

    if preview:
        palette = np.array([[200, 30, 30], [225, 215, 170], [40, 120, 70], [130, 130, 130],
                            [70, 130, 200], [0, 0, 0], [235, 120, 110]], np.uint8)
        Image.fromarray(palette[cls]).save(os.path.join(PREVIEW_DIR, "terrain.png"))
        # detected road cells painted over the real map, to compare against the drawn roads
        base = np.asarray(Image.open(SRC).convert("RGB").resize((cols * 2, rows * 2)), dtype=np.uint8).copy()
        road_big = np.kron(np.isin(cls, (ROAD, ROAD_EDGE)), np.ones((2, 2), bool))
        base[road_big] = [255, 0, 255]
        Image.fromarray(base).save(os.path.join(PREVIEW_DIR, "roads_overlay.jpg"), quality=85)

    graph = {
        "pxPerMile": PX_PER_MILE,
        "imageSize": [W, H],
        "speeds": {CLASS_NAMES[c]: s for c, s in SPEED.items()},
        "nodes": nodes,
        "modes": out_modes,
    }
    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write("// Generated by maps/tools/build_road_graph.py — do not edit by hand.\n")
        fh.write("// Settlement road network: nodes are cities/towns (source-image pixel coords),\n")
        fh.write("// edges are direct overland/sea links with their real path geometry.\n")
        fh.write("export const roadGraph = ")
        json.dump(graph, fh, ensure_ascii=False, separators=(",", ":"))
        fh.write(";\n")
    print("wrote", OUT, os.path.getsize(OUT) // 1024, "KB")


if __name__ == "__main__":
    main()
