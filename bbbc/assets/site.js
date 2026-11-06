/* Booty Bay Banana Company — shared site script
 * - Injects header/footer/ticker so every page shares one nav.
 * - Fakes a live commodities market (random walk, seeded per page load).
 * - Renders the SVG charts used on the forecast page.
 */
(function () {
  "use strict";

  // ---------- Shared chrome ----------
  var NAV = [
    ["index.html", "Home"],
    ["mission.html", "Mission"],
    ["forecast-2027.html", "FY2027 Outlook"],
    ["roster.html", "Leadership"],
    ["careers.html", "Careers"]
  ];

  var LOGO_SVG =
    '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 20c3 7 13 9 20 3-5 3-13 1-16-5-1-3-1-6 0-9-2 2-5 6-4 11z" fill="#f5c542"/><path d="M10 9c2 2 3 4 4 8" stroke="#0b0b0b" stroke-width="1.5" fill="none" stroke-linecap="round" opacity=".35"/><circle cx="25" cy="7" r="2" fill="#f5c542"/></svg>';

  function currentPage() {
    var p = location.pathname.split("/").pop();
    return p === "" ? "index.html" : p;
  }

  function renderHeader() {
    var mount = document.getElementById("site-header");
    if (!mount) return;
    var cur = currentPage();
    var links = NAV.map(function (n) {
      var aria = n[0] === cur ? ' aria-current="page"' : "";
      return '<a href="' + n[0] + '"' + aria + ">" + n[1] + "</a>";
    }).join("");
    mount.innerHTML =
      '<div class="tape" aria-label="Market ticker"><div class="tape-track" id="tape-track"></div></div>' +
      '<header class="site-header"><div class="wrap">' +
      '<a class="logo" href="index.html">' + LOGO_SVG + '<span>Booty Bay Banana Co.<small>SCX: BNNA · Stranglethorn Vale</small></span></a>' +
      '<button class="nav-toggle" aria-expanded="false" aria-controls="main-nav">Menu</button>' +
      '<nav class="main" id="main-nav" aria-label="Primary">' + links + "</nav>" +
      "</div></header>";
    var btn = mount.querySelector(".nav-toggle");
    var nav = mount.querySelector("nav.main");
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
    });
  }

  function renderFooter() {
    var mount = document.getElementById("site-footer");
    if (!mount) return;
    var year = new Date().getFullYear();
    mount.innerHTML =
      '<footer class="site-footer"><div class="wrap">' +
      "<div><h4>Booty Bay Banana Company</h4>" +
      "<p>Registered office: The Salty Sailor Tavern, Upper Deck, Booty Bay, Stranglethorn Vale. " +
      "A Steamwheedle Cartel affiliated enterprise. Listed on the Steamwheedle Commodities Exchange (SCX: BNNA).</p>" +
      "<p>&copy; " + year + " Booty Bay Banana Company. This is a World of Warcraft guild website and a parody. " +
      "No bananas were securitized in the making of this site. World of Warcraft is a trademark of Blizzard Entertainment, Inc.</p></div>" +
      "<div><h4>Investor relations</h4>" +
      '<a href="forecast-2027.html">FY2027 Annual Outlook</a><a href="mission.html">Mission &amp; values</a><a href="roster.html">Leadership</a></div>' +
      "<div><h4>Company</h4>" +
      '<a href="careers.html">Careers</a><a href="index.html#market">Market data</a><a href="forecast-2027.html#risks">Risk factors</a></div>' +
      "</div></footer>";
  }

  // ---------- Fake market ----------
  // Every price is a random walk from a base. "chg" is percent change on the day.
  var MARKET = [
    { sym: "BNNA", name: "Banana, Stranglethorn Standard (bushel)", base: 3.47, vol: 0.012, unit: "g" },
    { sym: "TELA", name: "Tel'Abim Banana, Grade A (bushel)", base: 11.2, vol: 0.02, unit: "g" },
    { sym: "GRN", name: "Green Banana, unripe (bushel)", base: 1.9, vol: 0.03, unit: "g" },
    { sym: "RUM", name: "Booty Bay Rum (cask)", base: 42.5, vol: 0.015, unit: "g" },
    { sym: "SILK", name: "Mageweave Cloth (stack)", base: 18.3, vol: 0.02, unit: "g" },
    { sym: "KELP", name: "Stranglekelp (stack)", base: 6.1, vol: 0.025, unit: "g" },
    { sym: "THOR", name: "Thorium Bar (stack)", base: 95.0, vol: 0.01, unit: "g" },
    { sym: "FISH", name: "Winter Squid, fresh (stack)", base: 7.75, vol: 0.035, unit: "g" },
    { sym: "FLSK", name: "Flask futures, next tier (unit)", base: 210.0, vol: 0.018, unit: "g" },
    { sym: "GOLD/SLV", name: "Gold–Silver cross", base: 100.0, vol: 0.0, unit: "" }
  ];

  var market = MARKET.map(function (m) {
    var open = m.base * (1 + (Math.random() - 0.5) * 0.04);
    return { sym: m.sym, name: m.name, unit: m.unit, open: open, last: open, prev: open, vol: m.vol, hist: [open] };
  });

  function fmt(n, unit) {
    var s = n >= 100 ? n.toFixed(1) : n.toFixed(2);
    return s + (unit ? unit : "");
  }
  function pct(m) {
    return ((m.last - m.open) / m.open) * 100;
  }
  function signed(n, digits) {
    return (n >= 0 ? "+" : "") + n.toFixed(digits);
  }

  function tick() {
    market.forEach(function (m) {
      m.prev = m.last;
      var drift = (m.open - m.last) * 0.02; // mean-revert gently
      m.last = Math.max(0.01, m.last * (1 + (Math.random() - 0.5) * 2 * m.vol) + drift);
      m.hist.push(m.last);
      if (m.hist.length > 40) m.hist.shift();
    });
  }

  function renderTape() {
    var track = document.getElementById("tape-track");
    if (!track) return;
    var items = market.map(function (m) {
      var p = pct(m);
      var cls = p >= 0 ? "up" : "down";
      var arrow = p >= 0 ? "▲" : "▼";
      return '<span><span class="sym">' + m.sym + "</span> " + fmt(m.last, m.unit) +
        ' <span class="' + cls + '">' + arrow + " " + signed(p, 2) + "%</span></span>";
    });
    // Duplicate so the tape never shows a gap.
    track.innerHTML = items.join("") + items.join("");
  }

  function renderQuotes() {
    var tbody = document.getElementById("quote-rows");
    if (!tbody) return;
    tbody.innerHTML = market.map(function (m) {
      var p = pct(m);
      var cls = p >= 0 ? "up" : "down";
      var moved = Math.abs(m.last - m.prev) > 1e-9;
      var hi = Math.max.apply(null, m.hist), lo = Math.min.apply(null, m.hist);
      return "<tr" + (moved ? ' class="flash"' : "") + '><td class="sym">' + m.sym + '</td><td class="name">' + m.name + "</td>" +
        "<td>" + fmt(m.last, m.unit) + '</td><td class="' + cls + '">' + signed(m.last - m.open, 2) + '</td><td class="' + cls + '">' + signed(p, 2) + "%</td>" +
        "<td>" + fmt(lo, m.unit) + "</td><td>" + fmt(hi, m.unit) + "</td></tr>";
    }).join("");
    var stamp = document.getElementById("quote-stamp");
    if (stamp) stamp.textContent = "Last update " + new Date().toLocaleTimeString() + " · delayed by approximately one goblin";
  }

  function renderHeroPrice() {
    var el = document.getElementById("hero-price");
    if (!el) return;
    var b = market[0];
    var p = pct(b);
    el.querySelector(".value").textContent = fmt(b.last, "") + " g";
    var d = el.querySelector(".delta");
    d.className = "delta " + (p >= 0 ? "up" : "down");
    d.innerHTML = (p >= 0 ? "▲" : "▼") + " " + signed(p, 2) + '% <span class="vs">today</span>';
    var spark = el.querySelector(".spark");
    if (spark) spark.innerHTML = sparkline(b.hist, 220, 28);
  }

  function sparkline(data, w, h) {
    if (data.length < 2) return "";
    var min = Math.min.apply(null, data), max = Math.max.apply(null, data);
    var span = max - min || 1;
    var pts = data.map(function (v, i) {
      var x = (i / (data.length - 1)) * (w - 4) + 2;
      var y = h - 2 - ((v - min) / span) * (h - 4);
      return x.toFixed(1) + "," + y.toFixed(1);
    });
    var last = pts[pts.length - 1].split(",");
    return '<svg viewBox="0 0 ' + w + " " + h + '" preserveAspectRatio="none" aria-hidden="true">' +
      '<polyline fill="none" stroke="var(--series-1)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" points="' + pts.join(" ") + '"/>' +
      '<circle cx="' + last[0] + '" cy="' + last[1] + '" r="3" fill="var(--series-1)" stroke="var(--surface-2)" stroke-width="2"/></svg>';
  }

  // ---------- Charts ----------
  function el(tag, attrs, children) {
    var e = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    (children || []).forEach(function (c) { e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return e;
  }
  function niceTicks(min, max, count) {
    var span = max - min, step = Math.pow(10, Math.floor(Math.log10(span / count)));
    var err = (span / count) / step;
    if (err >= 7.5) step *= 10; else if (err >= 3.5) step *= 5; else if (err >= 1.5) step *= 2;
    var ticks = [], v = Math.floor(min / step) * step;
    for (; v <= max + 1e-9; v += step) ticks.push(+v.toFixed(10));
    return ticks;
  }
  function makeTooltip(body) {
    var t = document.createElement("div");
    t.className = "tooltip";
    body.appendChild(t);
    return t;
  }
  function wireTableToggle(card, body, tableWrap) {
    var btns = card.querySelectorAll(".chart-tools button");
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        var table = b.dataset.view === "table";
        btns.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        body.classList.toggle("hidden", table);
        tableWrap.classList.toggle("show", table);
      });
    });
  }

  // Line chart: actuals (solid) + forecast (dashed, with a band)
  function lineChart(cfg) {
    var card = document.getElementById(cfg.id);
    if (!card) return;
    var body = card.querySelector(".chart-body");
    var tableWrap = card.querySelector(".chart-table");
    var W = 400, H = 240, padL = 44, padR = 46, padT = 16, padB = 32;
    var labels = cfg.labels, act = cfg.actual, fc = cfg.forecast, lo = cfg.low, hi = cfg.high;
    var all = act.concat(fc, lo, hi).filter(function (v) { return v != null; });
    var yMin = Math.min.apply(null, all), yMax = Math.max.apply(null, all);
    var ticks = niceTicks(yMin - (yMax - yMin) * 0.1, yMax + (yMax - yMin) * 0.1, 4);
    yMin = ticks[0]; yMax = ticks[ticks.length - 1];
    var n = labels.length;
    var x = function (i) { return padL + (i / (n - 1)) * (W - padL - padR); };
    var y = function (v) { return padT + (1 - (v - yMin) / (yMax - yMin)) * (H - padT - padB); };

    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": cfg.aria });
    var grid = el("g", { class: "grid" });
    ticks.forEach(function (t) {
      grid.appendChild(el("line", { x1: padL, x2: W - padR, y1: y(t), y2: y(t) }));
      svg.appendChild(el("text", { x: padL - 8, y: y(t) + 4, "text-anchor": "end" }, [cfg.yFmt(t)]));
    });
    svg.appendChild(grid);
    svg.appendChild(el("g", { class: "axis" }, [el("line", { x1: padL, x2: W - padR, y1: H - padB, y2: H - padB })]));
    labels.forEach(function (l, i) {
      if (i % cfg.xEvery === 0) svg.appendChild(el("text", { x: x(i), y: H - padB + 16, "text-anchor": "middle" }, [l]));
    });

    // Forecast band
    var bandPts = [];
    hi.forEach(function (v, i) { if (v != null) bandPts.push(x(i) + "," + y(v)); });
    for (var i = lo.length - 1; i >= 0; i--) if (lo[i] != null) bandPts.push(x(i) + "," + y(lo[i]));
    svg.appendChild(el("polygon", { points: bandPts.join(" "), fill: "var(--series-1)", opacity: 0.12 }));

    function path(arr, dashed) {
      var d = "", started = false;
      arr.forEach(function (v, i) {
        if (v == null) return;
        d += (started ? " L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1);
        started = true;
      });
      return el("path", { d: d, fill: "none", stroke: "var(--series-1)", "stroke-width": 2, "stroke-linejoin": "round", "stroke-linecap": "round", "stroke-dasharray": dashed ? "5 5" : "none" });
    }
    svg.appendChild(path(act, false));
    svg.appendChild(path(fc, true));

    // End-point labels (selective: last actual, last forecast)
    var lastA = -1, lastF = -1;
    act.forEach(function (v, i) { if (v != null) lastA = i; });
    fc.forEach(function (v, i) { if (v != null) lastF = i; });
    [lastA, lastF].forEach(function (i, k) {
      var v = k === 0 ? act[i] : fc[i];
      svg.appendChild(el("circle", { cx: x(i), cy: y(v), r: 4, fill: "var(--series-1)", stroke: "var(--surface-2)", "stroke-width": 2 }));
      svg.appendChild(el("text", { class: "lbl", x: x(i) + (k === 1 ? 8 : 0), y: y(v) + (k === 1 ? 4 : -10), "text-anchor": k === 1 ? "start" : "middle" }, [cfg.yFmt(v)]));
    });

    // Hover layer
    var cross = el("line", { x1: 0, x2: 0, y1: padT, y2: H - padB, stroke: "var(--text-muted)", "stroke-width": 1, opacity: 0 });
    var dot = el("circle", { r: 4, fill: "var(--series-1)", stroke: "var(--surface-2)", "stroke-width": 2, opacity: 0 });
    svg.appendChild(cross); svg.appendChild(dot);
    var hit = el("rect", { x: padL, y: padT, width: W - padL - padR, height: H - padT - padB, fill: "transparent" });
    svg.appendChild(hit);
    body.appendChild(svg);
    var tip = makeTooltip(body);
    function show(i) {
      var v = act[i] != null ? act[i] : fc[i];
      cross.setAttribute("x1", x(i)); cross.setAttribute("x2", x(i)); cross.setAttribute("opacity", 1);
      dot.setAttribute("cx", x(i)); dot.setAttribute("cy", y(v)); dot.setAttribute("opacity", 1);
      var r = body.getBoundingClientRect(), sr = svg.getBoundingClientRect();
      tip.style.left = (sr.left - r.left + (x(i) / W) * sr.width) + "px";
      tip.style.top = (sr.top - r.top + (y(v) / H) * sr.height) + "px";
      tip.innerHTML = "<strong>" + labels[i] + "</strong> · " + (act[i] != null ? "Actual " : "Forecast ") + cfg.yFmt(v) +
        (fc[i] != null && lo[i] != null ? "<br>Range " + cfg.yFmt(lo[i]) + " – " + cfg.yFmt(hi[i]) : "");
      tip.classList.add("show");
    }
    function hide() { cross.setAttribute("opacity", 0); dot.setAttribute("opacity", 0); tip.classList.remove("show"); }
    hit.addEventListener("mousemove", function (ev) {
      var sr = svg.getBoundingClientRect();
      var px = ((ev.clientX - sr.left) / sr.width) * W;
      var i = Math.round(((px - padL) / (W - padL - padR)) * (n - 1));
      show(Math.max(0, Math.min(n - 1, i)));
    });
    hit.addEventListener("mouseleave", hide);

    // Table twin
    var rows = labels.map(function (l, i) {
      return "<tr><td>" + l + "</td><td>" + (act[i] != null ? cfg.yFmt(act[i]) : "—") + "</td><td>" + (fc[i] != null ? cfg.yFmt(fc[i]) : "—") +
        "</td><td>" + (lo[i] != null ? cfg.yFmt(lo[i]) + " – " + cfg.yFmt(hi[i]) : "—") + "</td></tr>";
    }).join("");
    tableWrap.innerHTML = "<table><thead><tr><th>Period</th><th>Actual</th><th>Forecast</th><th>Range</th></tr></thead><tbody>" + rows + "</tbody></table>";
    wireTableToggle(card, body, tableWrap);
  }

  // Grouped bar chart: two series per category
  function barChart(cfg) {
    var card = document.getElementById(cfg.id);
    if (!card) return;
    var body = card.querySelector(".chart-body");
    var tableWrap = card.querySelector(".chart-table");
    var W = 400, H = 240, padL = 44, padR = 12, padT = 28, padB = 32;
    var cats = cfg.categories, series = cfg.series; // series: [{name, color, values}]
    var all = [];
    series.forEach(function (s) { all = all.concat(s.values); });
    var ticks = niceTicks(0, Math.max.apply(null, all) * 1.2, 4);
    var yMax = ticks[ticks.length - 1];
    var plotW = W - padL - padR, plotH = H - padT - padB;
    var band = plotW / cats.length;
    var barW = Math.min(24, (band * 0.6) / series.length - 2);
    var y = function (v) { return padT + (1 - v / yMax) * plotH; };

    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": cfg.aria });
    var grid = el("g", { class: "grid" });
    ticks.forEach(function (t) {
      if (t === 0) return;
      grid.appendChild(el("line", { x1: padL, x2: W - padR, y1: y(t), y2: y(t) }));
      svg.appendChild(el("text", { x: padL - 8, y: y(t) + 4, "text-anchor": "end" }, [cfg.yFmt(t)]));
    });
    svg.appendChild(grid);
    body.appendChild(svg);
    var tip = makeTooltip(body);

    cats.forEach(function (c, ci) {
      var groupW = series.length * barW + (series.length - 1) * 2;
      var x0 = padL + ci * band + (band - groupW) / 2;
      series.forEach(function (s, si) {
        var v = s.values[ci];
        var bx = x0 + si * (barW + 2), by = y(v), bh = H - padB - by;
        var r = Math.min(4, bh);
        var d = "M" + bx + " " + (H - padB) + " V" + (by + r) + " a" + r + " " + r + " 0 0 1 " + r + " -" + r +
          " H" + (bx + barW - r) + " a" + r + " " + r + " 0 0 1 " + r + " " + r + " V" + (H - padB) + " Z";
        var bar = el("path", { d: d, fill: s.color });
        svg.appendChild(bar);
        var hit = el("rect", { x: bx - 2, y: padT, width: barW + 4, height: plotH, fill: "transparent" });
        hit.addEventListener("mousemove", function () {
          var rr = body.getBoundingClientRect(), sr = svg.getBoundingClientRect();
          tip.style.left = (sr.left - rr.left + ((bx + barW / 2) / W) * sr.width) + "px";
          tip.style.top = (sr.top - rr.top + (by / H) * sr.height) + "px";
          tip.innerHTML = "<strong>" + c + "</strong> · " + s.name + " " + cfg.yFmt(v);
          tip.classList.add("show");
        });
        hit.addEventListener("mouseleave", function () { tip.classList.remove("show"); });
        svg.appendChild(hit);
        if (s.label) {
          svg.appendChild(el("text", { class: "lbl", x: bx + barW / 2, y: by - 6, "text-anchor": "middle" }, [cfg.yFmt(v)]));
        }
      });
      svg.appendChild(el("text", { x: padL + ci * band + band / 2, y: H - padB + 16, "text-anchor": "middle" }, [c]));
    });
    svg.appendChild(el("g", { class: "axis" }, [el("line", { x1: padL, x2: W - padR, y1: H - padB, y2: H - padB })]));

    var head = "<tr><th>Period</th>" + series.map(function (s) { return "<th>" + s.name + "</th>"; }).join("") + "</tr>";
    var rows = cats.map(function (c, ci) {
      return "<tr><td>" + c + "</td>" + series.map(function (s) { return "<td>" + cfg.yFmt(s.values[ci]) + "</td>"; }).join("") + "</tr>";
    }).join("");
    tableWrap.innerHTML = "<table><thead>" + head + "</thead><tbody>" + rows + "</tbody></table>";
    wireTableToggle(card, body, tableWrap);
  }

  // ---------- Boot ----------
  document.addEventListener("DOMContentLoaded", function () {
    renderHeader();
    renderFooter();
    for (var i = 0; i < 12; i++) tick(); // warm the history so sparklines have shape
    renderTape(); renderQuotes(); renderHeroPrice();
    var tapeEvery = 20;
    var n = 0;
    setInterval(function () {
      tick();
      renderQuotes(); renderHeroPrice();
      if (++n % tapeEvery === 0) renderTape(); // re-rendering restarts the scroll, so do it rarely
    }, 1500);
    if (window.BBBC_CHARTS) window.BBBC_CHARTS({ lineChart: lineChart, barChart: barChart });
  });
})();
