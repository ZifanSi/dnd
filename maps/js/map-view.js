// 2D map: pan / zoom / search / legend / LOD text labels, plus a "dive into the
// nearest city" hand-off to the Three.js viewer in city3d-viewer.js as you zoom
// in near the screen center.
import { initCity3DViewer } from "./city3d-viewer.js";

const VB_W = 154.56, VB_H = 100;
// MAX_SCALE has headroom past DIVE_HIGH so the "camera has settled" plateau is actually reachable,
// not just an asymptote you approach as you hit the zoom ceiling.
const MIN_SCALE = 0.7, MAX_SCALE = 26;
const LOD_TOWN = 2.0, LOD_MINOR = 5.0;
const SEARCH_ZOOM = 14; // lands comfortably inside the dive range below, past the halfway point

/* "camera dive" tuning — the 2D map's own `scale` drives both the dot<->3D
   crossfade and the Three.js camera's swoop from top-down to street-level. */
const DIVE_LOW = 8;              // below this map scale: pure 2D dot view
const DIVE_HIGH = 20;            // at/above this map scale: the dive-in animation has fully arrived
const CITY3D_CENTER_FRAC = 0.30; // "screen-center 30%" radius, as a fraction of the smaller viewport dimension
const CITY3D_SOFT_MULT = 1.4;    // outer edge of the center-proximity fade, as a multiple of the radius above

const TYPE_COLORS = {
  city: "#e6483c",
  town: "#f0973a",
  forest: "#3fa35a",
  mountain: "#9a9a9a",
  river: "#3d8fe0",
  region: "#a662d6",
  island: "#22b9ad"
};
const TYPE_LABELS_ZH = {
  city: "城市 City",
  town: "城镇 Town",
  forest: "森林 Forest",
  mountain: "山脉 Mountain",
  river: "河流 River",
  region: "地区 Region",
  island: "岛屿 Island"
};

export function initMapView(locations) {
  const appEl = document.getElementById("app");
  const svgRoot = document.getElementById("svgRoot");
  const viewport = document.getElementById("viewport");
  const pointsGroup = document.getElementById("points");
  const legendRows = document.getElementById("legendRows");
  const city3dCanvas = document.getElementById("city3dCanvas");
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");

  /* ---------- legend ---------- */
  Object.keys(TYPE_COLORS).forEach(t => {
    const row = document.createElement("div");
    row.className = "row";
    const dot = document.createElement("span");
    dot.className = "dot";
    dot.style.background = TYPE_COLORS[t];
    row.appendChild(dot);
    row.appendChild(document.createTextNode(TYPE_LABELS_ZH[t]));
    legendRows.appendChild(row);
  });

  /* ---------- map points (dots + text labels) ---------- */
  const SVGNS = "http://www.w3.org/2000/svg";
  const cityTownEntries = [];

  locations.forEach(loc => {
    const svgX = (loc.x / 100) * VB_W;
    const svgY = (loc.y / 100) * VB_H;
    const color = TYPE_COLORS[loc.type] || "#ccc";
    const isCity = loc.type === "city";
    const isTown = loc.type === "town";
    const r = isCity ? 0.62 : (isTown ? 0.42 : 0.26);
    const fontSize = isCity ? 1.85 : (isTown ? 1.35 : 1.05);

    const circle = document.createElementNS(SVGNS, "circle");
    circle.setAttribute("cx", svgX.toFixed(4));
    circle.setAttribute("cy", svgY.toFixed(4));
    circle.setAttribute("r", r);
    circle.setAttribute("fill", color);
    circle.setAttribute("stroke-width", isCity ? 0.14 : 0.09);
    circle.setAttribute("class", "loc-dot type-" + loc.type);
    circle.style.pointerEvents = "none";
    pointsGroup.appendChild(circle);

    const text = document.createElementNS(SVGNS, "text");
    text.setAttribute("x", (svgX + r + 0.3).toFixed(4));
    text.setAttribute("y", (svgY + fontSize * 0.35).toFixed(4));
    text.setAttribute("font-size", fontSize);
    text.setAttribute("class", "loc-label type-" + loc.type);
    text.textContent = loc.name;
    pointsGroup.appendChild(text);

    if (isCity || isTown) {
      cityTownEntries.push({ loc, svgX, svgY, dot: circle, label: text });
    }
  });

  document.getElementById("countDisplay").textContent = locations.length;

  /* ---------- pan & zoom state ---------- */
  let panX = 0, panY = 0, scale = 1;
  let isDragging = false;
  let lastClientX = 0, lastClientY = 0;

  function clampScale(s) { return Math.min(Math.max(s, MIN_SCALE), MAX_SCALE); }
  function clamp01(v) { return Math.min(Math.max(v, 0), 1); }
  function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function smoothstep(edge0, edge1, x) {
    if (edge0 === edge1) return x < edge0 ? 0 : 1;
    const t = clamp01((x - edge0) / (edge1 - edge0));
    return t * t * (3 - 2 * t);
  }

  function applyTransform() {
    viewport.setAttribute("transform", `translate(${panX},${panY}) scale(${scale})`);
    updateLOD();
    updateCity3D();
  }

  function updateLOD() {
    appEl.classList.toggle("show-town", scale >= LOD_TOWN);
    appEl.classList.toggle("show-minor", scale >= LOD_MINOR);
  }

  /* precise viewBox <-> client-pixel mapping, accounting for preserveAspectRatio letterboxing */
  function getFit() {
    const rect = svgRoot.getBoundingClientRect();
    const fitScale = Math.min(rect.width / VB_W, rect.height / VB_H);
    const offsetX = (rect.width - VB_W * fitScale) / 2;
    const offsetY = (rect.height - VB_H * fitScale) / 2;
    return { rect, fitScale, offsetX, offsetY };
  }
  function clientToSvgPoint(clientX, clientY) {
    const f = getFit();
    return {
      x: (clientX - f.rect.left - f.offsetX) / f.fitScale,
      y: (clientY - f.rect.top - f.offsetY) / f.fitScale
    };
  }
  /* inverse of the above: a point in svg viewBox space -> actual page pixel coords */
  function svgSpaceToClient(x, y) {
    const f = getFit();
    return {
      x: f.rect.left + f.offsetX + x * f.fitScale,
      y: f.rect.top + f.offsetY + y * f.fitScale
    };
  }

  function zoomAt(svgPoint, newScaleRaw) {
    const newScale = clampScale(newScaleRaw);
    const localX = (svgPoint.x - panX) / scale;
    const localY = (svgPoint.y - panY) / scale;
    panX = svgPoint.x - localX * newScale;
    panY = svgPoint.y - localY * newScale;
    scale = newScale;
    applyTransform();
  }

  /* mouse drag pans the 2D map. Once a city's 3D view is fully engaged, the
     Three.js canvas sits on top with pointer-events:auto and OrbitControls
     (attached directly to the canvas) takes over drag/wheel input instead —
     see city3d-viewer.js — so there's no conflict between the two. */
  svgRoot.addEventListener("mousedown", e => {
    if (e.button !== 0) return;
    isDragging = true;
    svgRoot.classList.add("dragging");
    lastClientX = e.clientX;
    lastClientY = e.clientY;
  });
  window.addEventListener("mousemove", e => {
    if (!isDragging) return;
    const fitScale = getFit().fitScale;
    const dx = (e.clientX - lastClientX) / fitScale;
    const dy = (e.clientY - lastClientY) / fitScale;
    panX += dx; panY += dy;
    lastClientX = e.clientX; lastClientY = e.clientY;
    applyTransform();
  });
  window.addEventListener("mouseup", () => {
    isDragging = false;
    svgRoot.classList.remove("dragging");
  });

  /* wheel zoom, centered on cursor */
  svgRoot.addEventListener("wheel", e => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : (1 / 1.15);
    const p = clientToSvgPoint(e.clientX, e.clientY);
    zoomAt(p, scale * factor);
  }, { passive: false });

  /* touch: 1-finger pan, 2-finger pinch zoom */
  let touchMode = null; // 'pan' | 'pinch'
  let touchLast = null;
  let pinchStartDist = 0, pinchStartScale = 1, pinchStartMid = null;

  function touchDist(t0, t1) {
    return Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
  }
  function touchMid(t0, t1) {
    return { clientX: (t0.clientX + t1.clientX) / 2, clientY: (t0.clientY + t1.clientY) / 2 };
  }

  svgRoot.addEventListener("touchstart", e => {
    if (e.touches.length === 1) {
      touchMode = "pan";
      touchLast = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length >= 2) {
      touchMode = "pinch";
      pinchStartDist = touchDist(e.touches[0], e.touches[1]);
      pinchStartScale = scale;
      const mid = touchMid(e.touches[0], e.touches[1]);
      pinchStartMid = clientToSvgPoint(mid.clientX, mid.clientY);
    }
  }, { passive: true });

  svgRoot.addEventListener("touchmove", e => {
    e.preventDefault();
    if (touchMode === "pan" && e.touches.length === 1) {
      const fitScale = getFit().fitScale;
      const cx = e.touches[0].clientX, cy = e.touches[0].clientY;
      const dx = (cx - touchLast.x) / fitScale;
      const dy = (cy - touchLast.y) / fitScale;
      panX += dx; panY += dy;
      touchLast = { x: cx, y: cy };
      applyTransform();
    } else if (touchMode === "pinch" && e.touches.length >= 2) {
      const dist = touchDist(e.touches[0], e.touches[1]);
      const ratio = dist / (pinchStartDist || dist);
      zoomAt(pinchStartMid, pinchStartScale * ratio);
    }
  }, { passive: false });

  svgRoot.addEventListener("touchend", e => {
    if (e.touches.length === 0) { touchMode = null; }
    else if (e.touches.length === 1) {
      touchMode = "pan";
      touchLast = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  });

  /* on-screen zoom buttons (also used on mobile in place of pinch) */
  document.getElementById("zoomInBtn").addEventListener("click", () => {
    zoomAt({ x: VB_W / 2, y: VB_H / 2 }, scale * 1.4);
  });
  document.getElementById("zoomOutBtn").addEventListener("click", () => {
    zoomAt({ x: VB_W / 2, y: VB_H / 2 }, scale / 1.4);
  });

  /* ---------- animated fly-to (search) ---------- */
  function flyTo(loc, targetScale) {
    const svgX = (loc.x / 100) * VB_W;
    const svgY = (loc.y / 100) * VB_H;
    const endScale = clampScale(targetScale);
    const endPanX = VB_W / 2 - endScale * svgX;
    const endPanY = VB_H / 2 - endScale * svgY;

    const startPanX = panX, startPanY = panY, startScale = scale;
    const duration = 600;
    const t0 = performance.now();

    function easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

    function step(now) {
      const t = Math.min(1, (now - t0) / duration);
      const e = easeInOutQuad(t);
      panX = startPanX + (endPanX - startPanX) * e;
      panY = startPanY + (endPanY - startPanY) * e;
      scale = startScale + (endScale - startScale) * e;
      applyTransform();
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- search ---------- */
  function renderSearchResults(query) {
    searchResults.innerHTML = "";
    if (!query) return;
    const q = query.toLowerCase();
    const matches = locations.filter(l => l.name.toLowerCase().includes(q)).slice(0, 8);
    if (matches.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "无匹配结果";
      searchResults.appendChild(empty);
      return;
    }
    matches.forEach(loc => {
      const item = document.createElement("div");
      item.className = "item";
      const n = document.createElement("span");
      n.className = "n";
      n.textContent = loc.name;
      const t = document.createElement("span");
      t.className = "t";
      t.textContent = TYPE_LABELS_ZH[loc.type] || loc.type;
      item.appendChild(n);
      item.appendChild(t);
      item.addEventListener("click", () => {
        flyTo(loc, SEARCH_ZOOM);
        searchResults.innerHTML = "";
        searchInput.value = loc.name;
        searchInput.blur();
      });
      searchResults.appendChild(item);
    });
  }
  searchInput.addEventListener("input", () => renderSearchResults(searchInput.value.trim()));

  /* ---------- hand-off to the Three.js city viewer ---------- */
  const city3dViewer = initCity3DViewer(city3dCanvas, {
    // Fired when the user dollies all the way back out inside a city's 3D view —
    // drop the 2D scale back below DIVE_LOW so we don't immediately re-trigger
    // the dive-in, and let the flat map take input again.
    onExitRequest: () => {
      scale = clampScale(DIVE_LOW * 0.85);
      applyTransform();
    }
  });

  function setDotVisible(entry, alpha) {
    if (alpha >= 0.999) {
      if (entry.dot.style.opacity !== "") entry.dot.style.opacity = "";
      if (entry.label.style.opacity !== "") entry.label.style.opacity = "";
    } else {
      entry.dot.style.opacity = String(alpha);
      entry.label.style.opacity = String(alpha);
    }
  }

  /* main per-frame sync: called from applyTransform() on every pan/zoom/animation tick.
     Only the single nearest-to-center city/town (if any) gets handed to the 3D viewer —
     OrbitControls needs one camera to drive, so unlike dots/labels (which can all fade
     independently) the 3D view can only ever focus on one place at a time. */
  function updateCity3D() {
    const diveT = clamp01((scale - DIVE_LOW) / (DIVE_HIGH - DIVE_LOW));
    const easedT = easeInOutCubic(diveT); // eased, not linear — a gentle "camera settling" feel

    if (easedT <= 0.004) {
      cityTownEntries.forEach(entry => setDotVisible(entry, 1));
      city3dViewer.sync({ candidate: null, easedT: 0 });
      return;
    }

    const vw = window.innerWidth, vh = window.innerHeight;
    const cx = vw / 2, cy = vh / 2;
    const radius = CITY3D_CENTER_FRAC * Math.min(vw, vh);
    const softRadius = radius * CITY3D_SOFT_MULT;

    let best = null, bestFactor = 0;
    cityTownEntries.forEach(entry => {
      const renderedX = panX + scale * entry.svgX;
      const renderedY = panY + scale * entry.svgY;
      const client = svgSpaceToClient(renderedX, renderedY);
      const dist = Math.hypot(client.x - cx, client.y - cy);
      const proximity = 1 - smoothstep(radius, softRadius, dist);
      const factor = easedT * proximity;
      if (factor > bestFactor) { bestFactor = factor; best = entry; }
    });

    cityTownEntries.forEach(entry => {
      setDotVisible(entry, entry === best ? 1 - bestFactor : 1);
    });

    city3dViewer.sync({
      candidate: best ? { entry: best, factor: bestFactor } : null,
      easedT
    });
  }

  window.addEventListener("resize", () => applyTransform());

  applyTransform();
}
