// Screen UI around the 3D map: search box, place card, legend + layer toggle,
// zoom / compass / 2D-3D buttons, and the loading bar. Pure DOM, no Three.js.
import { TYPE_COLORS, TYPE_LABELS_ZH } from "./geo.js";

export function createUI({ entries, viewer, onPick, onToggleImagery }) {
  const $ = id => document.getElementById(id);

  /* ---------- legend ---------- */
  const legendRows = $("legendRows");
  Object.keys(TYPE_COLORS).forEach(t => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<span class="swatch"></span><span></span>`;
    row.firstChild.style.background = TYPE_COLORS[t];
    row.lastChild.textContent = TYPE_LABELS_ZH[t];
    legendRows.appendChild(row);
  });
  $("legendToggle").addEventListener("click", () => $("legend").classList.toggle("collapsed"));

  const imageryBtn = $("imageryBtn");
  imageryBtn.addEventListener("click", () => {
    const on = !imageryBtn.classList.contains("active");
    imageryBtn.classList.toggle("active", on);
    imageryBtn.textContent = on ? "底图：地图" : "底图：纯色";
    onToggleImagery(on);
  });

  /* ---------- search ---------- */
  const input = $("searchInput");
  const results = $("searchResults");
  let matches = [];
  let active = -1;

  function renderResults() {
    results.innerHTML = "";
    const q = input.value.trim().toLowerCase();
    matches = q ? entries.filter(e => e.loc.name.toLowerCase().includes(q)).slice(0, 8) : [];
    active = matches.length ? 0 : -1;
    if (q && !matches.length) {
      results.innerHTML = `<div class="empty">无匹配结果</div>`;
      return;
    }
    matches.forEach((entry, i) => {
      const item = document.createElement("div");
      item.className = "item" + (i === active ? " active" : "");
      item.innerHTML = `<span class="swatch"></span><span class="n"></span><span class="t"></span>`;
      item.children[0].style.background = TYPE_COLORS[entry.loc.type];
      item.children[1].textContent = entry.loc.name;
      item.children[2].textContent = TYPE_LABELS_ZH[entry.loc.type];
      item.addEventListener("mousedown", e => { e.preventDefault(); choose(entry); });
      results.appendChild(item);
    });
  }
  function choose(entry) {
    input.value = entry.loc.name;
    results.innerHTML = "";
    input.blur();
    onPick(entry);
  }
  input.addEventListener("input", renderResults);
  input.addEventListener("focus", renderResults);
  input.addEventListener("blur", () => setTimeout(() => { results.innerHTML = ""; }, 100));
  input.addEventListener("keydown", e => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!matches.length) return;
      e.preventDefault();
      active = (active + (e.key === "ArrowDown" ? 1 : -1) + matches.length) % matches.length;
      [...results.children].forEach((c, i) => c.classList.toggle("active", i === active));
    } else if (e.key === "Enter" && active >= 0) {
      choose(matches[active]);
    } else if (e.key === "Escape") {
      input.value = ""; results.innerHTML = ""; input.blur();
    }
  });
  $("searchClear").addEventListener("click", () => { input.value = ""; results.innerHTML = ""; hidePlace(); });

  /* ---------- place card ---------- */
  const card = $("placeCard");
  function showPlace(entry) {
    $("placeName").textContent = entry.loc.name;
    $("placeType").textContent = TYPE_LABELS_ZH[entry.loc.type];
    $("placeType").style.color = TYPE_COLORS[entry.loc.type];
    $("placeCoords").textContent = `x ${entry.loc.x.toFixed(2)}%  ·  y ${entry.loc.y.toFixed(2)}%`;
    card.classList.add("show");
  }
  function hidePlace() { card.classList.remove("show"); }
  $("placeClose").addEventListener("click", hidePlace);

  /* ---------- map controls ---------- */
  $("zoomInBtn").addEventListener("click", () => viewer.zoomBy(1 / 2));
  $("zoomOutBtn").addEventListener("click", () => viewer.zoomBy(2));
  $("compassBtn").addEventListener("click", () => viewer.resetNorth());
  const tiltBtn = $("tiltBtn");
  tiltBtn.addEventListener("click", () => viewer.setTiltMode(viewer.tiltMode === "flat" ? "auto" : "flat"));

  const needle = $("compassNeedle");
  let lastHeading = null, lastTilt = null;
  function updateControls(view, tiltMode) {
    const heading = Math.round(view.theta * 180 / Math.PI * 10) / 10;
    if (heading !== lastHeading) {
      lastHeading = heading;
      needle.style.transform = `rotate(${heading}deg)`;
    }
    const label = tiltMode === "flat" ? "3D" : "2D";
    if (label !== lastTilt) {
      lastTilt = label;
      tiltBtn.textContent = label;
      tiltBtn.title = label === "2D" ? "切换到平面俯视" : "切换到 3D 倾斜视角";
    }
  }

  /* ---------- loading ---------- */
  function setLoading(done, total) {
    const bar = $("loadingBar");
    bar.style.width = `${Math.round((done / total) * 100)}%`;
    $("loadingText").textContent = `加载地图影像 ${done}/${total}`;
    if (done >= total) setTimeout(() => $("loading").classList.add("done"), 300);
  }

  $("countDisplay").textContent = entries.length;

  return { showPlace, updateControls, setLoading };
}
