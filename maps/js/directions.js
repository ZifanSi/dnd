// Directions panel: choose a start and destination city/town, pick "fastest" or
// "shortest", and get the optimal route from routing.js drawn on the map by
// route-layer.js, with a summary and a clickable leg-by-leg itinerary.
// The road network (data/road-graph.js) is only downloaded the first time it's needed.
import { createRouter, ROUTE_MODES } from "./routing.js";
import { TYPE_COLORS, TYPE_LABELS_ZH } from "./geo.js";

const fmtMiles = m => `${Math.round(m).toLocaleString()} 英里`;
function fmtDays(d) {
  if (d < 1) return `约 ${Math.max(1, Math.round(d * 8))} 小时`;  // ~8 travel hours a day
  return `约 ${d < 10 ? d.toFixed(1) : Math.round(d)} 天`;
}

export function createDirections({ entries, routeLayer, onChange }) {
  const $ = id => document.getElementById(id);
  const panel = $("directions");
  const fromInput = $("dirFrom"), toInput = $("dirTo");
  const suggest = $("dirSuggest");
  const result = $("dirResult");

  const settlements = entries
    .filter(e => e.loc.type === "city" || e.loc.type === "town")
    .sort((a, b) => (a.loc.type === b.loc.type ? a.loc.name.localeCompare(b.loc.name) : a.loc.type === "city" ? -1 : 1));
  const byName = new Map(settlements.map(e => [e.loc.name.toLowerCase(), e]));

  let router = null;
  let loading = null;
  let mode = "fastest";
  let route = null;
  const chosen = { from: null, to: null };

  function getRouter() {
    if (router) return Promise.resolve(router);
    if (!loading) {
      loading = import("../data/road-graph.js").then(m => (router = createRouter(m.roadGraph)));
    }
    return loading;
  }

  /* ---------- open / close ---------- */
  function open() {
    panel.classList.add("show");
    document.body.classList.add("directions-open");
    getRouter();
    if (!chosen.from) fromInput.focus();
    else if (!chosen.to) toInput.focus();
  }
  function close() {
    panel.classList.remove("show");
    document.body.classList.remove("directions-open");
    suggest.innerHTML = "";
    clearRoute();
  }
  $("dirBtn").addEventListener("click", () => (panel.classList.contains("show") ? close() : open()));
  $("dirClose").addEventListener("click", close);

  /* ---------- stop inputs + suggestions ---------- */
  let activeInput = null, matches = [], activeIdx = -1;

  function renderSuggest() {
    suggest.innerHTML = "";
    if (!activeInput) return;
    const q = activeInput.value.trim().toLowerCase();
    matches = settlements.filter(e => !q || e.loc.name.toLowerCase().includes(q)).slice(0, 8);
    activeIdx = matches.length ? 0 : -1;
    if (!matches.length) { suggest.innerHTML = `<div class="empty">没有这个城镇</div>`; return; }
    const top = activeInput.getBoundingClientRect(), box = panel.getBoundingClientRect();
    suggest.style.top = `${top.bottom - box.top + 4}px`;
    matches.forEach((entry, i) => {
      const item = document.createElement("div");
      item.className = "item" + (i === activeIdx ? " active" : "");
      item.innerHTML = `<span class="swatch"></span><span class="n"></span><span class="t"></span>`;
      item.children[0].style.background = TYPE_COLORS[entry.loc.type];
      item.children[1].textContent = entry.loc.name;
      item.children[2].textContent = TYPE_LABELS_ZH[entry.loc.type];
      item.addEventListener("mousedown", e => { e.preventDefault(); pick(activeInput, entry); });
      suggest.appendChild(item);
    });
  }

  function pick(input, entry) {
    const key = input === fromInput ? "from" : "to";
    chosen[key] = entry;
    input.value = entry.loc.name;
    input.classList.remove("invalid");
    suggest.innerHTML = "";
    if (key === "from" && !chosen.to) toInput.focus();
    else input.blur();
    compute();
  }

  [fromInput, toInput].forEach(input => {
    const key = input === fromInput ? "from" : "to";
    input.addEventListener("focus", () => { activeInput = input; input.select(); renderSuggest(); });
    input.addEventListener("input", () => { chosen[key] = null; renderSuggest(); });
    input.addEventListener("blur", () => setTimeout(() => {
      if (activeInput === input) { activeInput = null; suggest.innerHTML = ""; }
      // typed an exact name without picking from the list
      const exact = byName.get(input.value.trim().toLowerCase());
      if (!chosen[key] && exact) pick(input, exact);
      else input.classList.toggle("invalid", !!input.value.trim() && !chosen[key]);
    }, 120));
    input.addEventListener("keydown", e => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        if (!matches.length) return;
        e.preventDefault();
        activeIdx = (activeIdx + (e.key === "ArrowDown" ? 1 : -1) + matches.length) % matches.length;
        [...suggest.children].forEach((c, i) => c.classList.toggle("active", i === activeIdx));
      } else if (e.key === "Enter" && activeIdx >= 0) {
        pick(input, matches[activeIdx]);
      } else if (e.key === "Escape") {
        input.blur();
      }
    });
  });

  $("dirSwap").addEventListener("click", () => {
    [chosen.from, chosen.to] = [chosen.to, chosen.from];
    fromInput.value = chosen.from ? chosen.from.loc.name : "";
    toInput.value = chosen.to ? chosen.to.loc.name : "";
    compute();
  });

  panel.querySelectorAll(".modes button").forEach(btn => {
    btn.title = ROUTE_MODES[btn.dataset.mode].hint;
    btn.addEventListener("click", () => {
      mode = btn.dataset.mode;
      panel.querySelectorAll(".modes button").forEach(b => b.classList.toggle("active", b === btn));
      compute();
    });
  });

  /* ---------- computing + showing a route ---------- */
  function clearRoute() {
    route = null;
    routeLayer.clear();
    result.innerHTML = "";
    onChange && onChange(null);
  }

  async function compute() {
    if (!chosen.from || !chosen.to) { clearRoute(); return; }
    if (chosen.from === chosen.to) {
      clearRoute();
      result.innerHTML = `<div class="note">起点和终点是同一个地方。</div>`;
      return;
    }
    result.innerHTML = `<div class="note">正在加载道路网络…</div>`;
    const r = await getRouter();
    const t0 = performance.now();
    route = r.shortestPath(chosen.from.loc.name, chosen.to.loc.name, mode);
    const ms = performance.now() - t0;
    if (!route) { clearRoute(); result.innerHTML = `<div class="note">找不到可通行的路线。</div>`; return; }

    routeLayer.show(route, name => byName.get(name.toLowerCase()));
    routeLayer.frame();
    renderResult(ms);
    onChange && onChange({ from: chosen.from.loc.name, to: chosen.to.loc.name, mode });
  }

  function legKind(leg) {
    if (leg.seaMiles > leg.miles * 0.5) return ["sea", "海路"];
    if (leg.roadMiles > leg.miles * 0.5) return ["road", "道路"];
    return ["land", "野外"];
  }

  function renderResult(ms) {
    const primary = mode === "fastest" ? fmtDays(route.days) : fmtMiles(route.miles);
    const secondary = mode === "fastest" ? fmtMiles(route.miles) : fmtDays(route.days);
    const pct = v => Math.round((v / route.miles) * 100);
    const via = route.stops.length - 2;
    result.innerHTML = `
      <div class="summary">
        <div class="primary">${primary}</div>
        <div class="secondary">${secondary}${via > 0 ? ` · 途经 ${via} 个城镇` : " · 直达"}</div>
        <div class="mix">
          <span class="bar"><i class="road" style="width:${pct(route.roadMiles)}%"></i><i class="sea" style="width:${pct(route.seaMiles)}%"></i></span>
          道路 ${pct(route.roadMiles)}% · 海路 ${pct(route.seaMiles)}% · 野外 ${Math.max(0, 100 - pct(route.roadMiles) - pct(route.seaMiles))}%
        </div>
        <div class="algo">A* 最短路径 · 展开 ${route.expanded} 个节点 · ${ms.toFixed(2)} ms · 直线距离 ${fmtMiles(route.straightMiles)}</div>
      </div>
      <div class="actions">
        <button id="dirTour" class="primary-btn">▶ 沿路线飞行</button>
        <button id="dirFit">全览路线</button>
      </div>
      <ol class="legs"></ol>`;
    const list = result.querySelector(".legs");
    route.legs.forEach((leg, i) => {
      const [kind, kindLabel] = legKind(leg);
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="leg-title"><span class="n"></span> → <span class="n"></span></div>
        <div class="leg-meta">${fmtMiles(leg.miles)} · ${fmtDays(leg.days)} <span class="kind ${kind}">${kindLabel}</span></div>`;
      const names = li.querySelectorAll(".n");
      names[0].textContent = leg.fromName;
      names[1].textContent = leg.toName;
      li.title = "在地图上查看这一段";
      li.addEventListener("click", () => { routeLayer.stopTour(); routeLayer.frame(i); });
      list.appendChild(li);
    });

    const tourBtn = $("dirTour");
    tourBtn.addEventListener("click", () => {
      if (routeLayer.touring) routeLayer.stopTour();
      else { routeLayer.startTour(); tourBtn.textContent = "■ 停止飞行"; tourBtn.classList.add("on"); }
    });
    $("dirFit").addEventListener("click", () => { routeLayer.stopTour(); routeLayer.frame(); });
  }

  routeLayer.onTourProgress(legIndex => {
    result.querySelectorAll(".legs li").forEach((li, i) => li.classList.toggle("current", i === legIndex));
  });
  routeLayer.onTourEnd(() => {
    const btn = $("dirTour");
    if (btn) { btn.textContent = "▶ 沿路线飞行"; btn.classList.remove("on"); }
    result.querySelectorAll(".legs li.current").forEach(li => li.classList.remove("current"));
  });

  /* ---------- public API ---------- */
  function set(which, entry) {
    if (!byName.has(entry.loc.name.toLowerCase())) return false;
    open();
    pick(which === "from" ? fromInput : toInput, entry);
    return true;
  }

  return {
    open, close,
    setFrom: entry => set("from", entry),
    setTo: entry => set("to", entry),
    /** When the panel is open and a stop is still empty, clicking a town on the map fills it. */
    offerPlace(entry) {
      if (!panel.classList.contains("show") || !byName.has(entry.loc.name.toLowerCase())) return false;
      if (!chosen.from) return set("from", entry);
      if (!chosen.to) return set("to", entry);
      return false;
    },
    async restore({ from, to, mode: m }) {
      const a = byName.get(String(from).toLowerCase()), b = byName.get(String(to).toLowerCase());
      if (!a || !b) return false;
      if (ROUTE_MODES[m]) {
        mode = m;
        panel.querySelectorAll(".modes button").forEach(btn => btn.classList.toggle("active", btn.dataset.mode === m));
      }
      open();
      chosen.from = a; chosen.to = b;
      fromInput.value = a.loc.name; toInput.value = b.loc.name;
      fromInput.blur(); toInput.blur();
      await compute();
      return true;
    },
    isSettlement: entry => byName.has(entry.loc.name.toLowerCase()),
    get active() { return !!route; }
  };
}
