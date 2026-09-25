/* Wild Camel — Activations: filters, contents, detail drawer, shortlist. Static: no server, no tracking. */
(function () {
  "use strict";
  var DATA = window.CATALOGUE;
  if (!DATA) return;
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var SCALES = ["ARCHITECTURAL", "SITE", "ROOM", "STAND", "TABLETOP", "SCREEN", "POCKET", "PLATFORM"];
  var TAGL = { S: "Signature concept", F: "Proven format", D: "Delivered", P: "In production" }, TAGS = { S: "Signature", F: "Proven", D: "Delivered", P: "In production" };
  var wks = function (s) { return String(s || "").replace(" weeks", " wks").replace(" months", " mos").replace("Included with the app", "with the app"); };
  var MAIL = "rudy@wildcamel.tv";

  // flat list, with family / category references
  var ALL = [], BY = {};
  DATA.families.forEach(function (f) { f.cats.forEach(function (c) { c.entries.forEach(function (e) { e._f = f; e._c = c; ALL.push(e); BY[e.code] = e; }); }); });
  $("cover-count").textContent = ALL.length;

  // ---------- filter state ----------
  var st = { fam: {}, cat: "", scale: {}, lead: {}, tag: {}, q: "" };
  var leadBucket = function (e) { return e.leadMax <= 6 ? "6" : e.leadMax <= 10 ? "10" : "11"; };
  var any = function (o) { for (var k in o) if (o[k]) return true; return false; };
  var words = function (q) { return q.toLowerCase().split(/\s+/).filter(Boolean); };
  function matches(e) {
    if (any(st.fam) && !st.fam[e.family]) return false;
    if (st.cat && e.category !== st.cat) return false;
    if (any(st.scale) && !st.scale[e.scale]) return false;
    if (any(st.lead) && !st.lead[leadBucket(e)]) return false;
    if (any(st.tag) && !(st.tag[e.tag] || (st.tag.D && e.tag === "P"))) return false;
    if (st.q) {
      var hay = e._hay || (e._hay = [e.code, e.name, e.line, e.moment, e.best, e.category, e.scale, e.lead, e.client || "", TAGL[e.tag]].join(" ").toLowerCase());
      var ws = words(st.q);
      for (var i = 0; i < ws.length; i++) if (hay.indexOf(ws[i]) < 0) return false;
    }
    return true;
  }
  var isFiltered = function () { return any(st.fam) || !!st.cat || any(st.scale) || any(st.lead) || any(st.tag) || !!st.q; };

  // ---------- build the page ----------
  var catId = function (name) { return "c-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); };
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  function build() {
    // contents
    var toc = "";
    DATA.families.forEach(function (f) {
      var n = f.cats.reduce(function (a, c) { return a + c.entries.length; }, 0);
      toc += '<div class="col"><h3 class="fam-' + f.letter + '"><span class="sq"></span>' + esc(f.no) + " &nbsp;" + esc(f.key) + "<small>" + n + " ideas</small></h3>";
      f.cats.forEach(function (c) {
        toc += '<a href="#' + catId(c.name) + '" data-cat="' + esc(c.name) + '"><img src="img/cards/' + c.entries[0].code + '.jpg" alt="" loading="lazy" width="640" height="400"><span class="t">' + esc(c.name) + '</span><span class="n">' + c.entries.length + "</span></a>";
      });
      toc += "</div>";
    });
    toc += '<p class="note">Every row is a link to its section</p>';
    $("toc").innerHTML = toc;

    // production tiles
    $("tiles").innerHTML = DATA.tiles.map(function (t) { return '<div class="tile"><img src="' + t.file + '" alt="Frame from our work: ' + esc(t.label.toLowerCase()) + '" loading="lazy" width="1000" height="465"><span class="tilechip">' + esc(t.label) + "</span></div>"; }).join("");

    // category select
    var sel = $("cat");
    DATA.families.forEach(function (f) {
      var g = document.createElement("optgroup"); g.label = f.no + "  " + f.key; g.dataset.fam = f.letter;
      f.cats.forEach(function (c) { var o = document.createElement("option"); o.value = c.name; o.textContent = c.name; g.appendChild(o); });
      sel.appendChild(g);
    });
    // scale chips
    var sg = document.querySelector('[data-group="scale"]');
    SCALES.forEach(function (s) { var b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.dataset.v = s; b.setAttribute("aria-pressed", "false"); b.textContent = s; sg.appendChild(b); });

    // catalogue
    var h = "";
    DATA.families.forEach(function (f) {
      h += '<div class="family" id="f-' + f.letter + '" data-fam="' + f.letter + '"><div class="fhead">';
      h += '<div class="label"><span class="mono fam-' + f.letter + '"><span class="sq"></span>' + esc(f.no) + " &nbsp;&nbsp;" + esc(f.key) + '</span><span class="mono sub2">' + esc(f.sub) + "</span></div>";
      h += '<h2 class="head">' + esc(f.key) + '</h2><p class="intro">' + esc(f.intro) + "</p></div>";
      f.cats.forEach(function (c) {
        h += '<section class="cat" id="' + catId(c.name) + '" data-cat="' + esc(c.name) + '"><div class="chead"><div>';
        h += '<span class="label mono fam-' + f.letter + '"><span class="sq"></span>' + esc(f.no) + " &nbsp;&nbsp;" + esc(f.key) + "</span>";
        h += '<h3 class="head">' + esc(c.name) + '</h3><p class="blurb">' + esc(c.blurb) + '</p></div><span class="cnt" data-n>' + c.entries.length + " ideas</span></div>";
        h += '<div class="grid">';
        c.entries.forEach(function (e) {
          h += '<article class="card fam-' + e.family + '" data-code="' + e.code + '">';
          h += '<div class="pic"><img src="img/cards/' + e.code + '.jpg" alt="Concept visual: ' + esc(e.name) + '" loading="lazy" decoding="async" width="640" height="400"><span class="code">' + e.code + "</span>";
          h += '<button class="save" type="button" data-save="' + e.code + '" aria-label="Add ' + esc(e.name) + ' to shortlist" aria-pressed="false">+</button></div>';
          h += '<div class="body"><h4><button type="button" data-open="' + e.code + '">' + esc(e.name) + "</button></h4><p>" + esc(e.line) + "</p>";
          h += '<div class="meta"><span>' + esc(e.scale) + " · " + esc(wks(e.lead)) + '</span><span class="tg">' + esc(TAGS[e.tag] || e.tag) + "</span></div></div></article>";
        });
        h += "</div></section>";
      });
      h += "</div>";
    });
    $("catalogue").innerHTML = h;
  }
  build();

  // ---------- apply filters ----------
  var CARDS = Array.prototype.slice.call(document.querySelectorAll(".card"));
  var VISIBLE = [];
  function apply() {
    VISIBLE = [];
    CARDS.forEach(function (el) { var e = BY[el.dataset.code], ok = matches(e); el.classList.toggle("hide", !ok); if (ok) VISIBLE.push(e); });
    document.querySelectorAll(".cat").forEach(function (sec) {
      var n = sec.querySelectorAll(".card:not(.hide)").length; sec.hidden = n === 0;
      sec.querySelector("[data-n]").textContent = n + (n === 1 ? " idea" : " ideas");
    });
    document.querySelectorAll(".family").forEach(function (f) { f.hidden = f.querySelectorAll(".cat:not([hidden])").length === 0; });
    $("count").innerHTML = "<b>" + VISIBLE.length + "</b> of " + ALL.length;
    $("empty").hidden = VISIBLE.length > 0;
    $("clear").hidden = !isFiltered(); $("bar").classList.toggle("filtered", isFiltered());
    $("clear-q").hidden = !st.q;
    // chips + select reflect the state
    document.querySelectorAll(".grp[data-group] .chip").forEach(function (b) { var g = b.closest(".grp").dataset.group; b.setAttribute("aria-pressed", st[g][b.dataset.v] ? "true" : "false"); });
    var sel = $("cat"); sel.value = st.cat; sel.classList.toggle("on", !!st.cat);
    Array.prototype.forEach.call(sel.querySelectorAll("optgroup"), function (g) { g.hidden = any(st.fam) && !st.fam[g.dataset.fam]; });
    writeURL();
  }
  function clearAll(keepQ) { st.fam = {}; st.cat = ""; st.scale = {}; st.lead = {}; st.tag = {}; if (!keepQ) { st.q = ""; $("q").value = ""; } apply(); }

  // filters in the address bar, so a filtered view can be sent as a link
  var keys = function (o) { return Object.keys(o).filter(function (k) { return o[k]; }); };
  function writeURL() {
    var p = [];
    if (any(st.fam)) p.push("f=" + keys(st.fam).join(","));
    if (st.cat) p.push("c=" + encodeURIComponent(st.cat));
    if (any(st.scale)) p.push("s=" + keys(st.scale).join(","));
    if (any(st.lead)) p.push("l=" + keys(st.lead).join(","));
    if (any(st.tag)) p.push("t=" + keys(st.tag).join(","));
    if (st.q) p.push("q=" + encodeURIComponent(st.q));
    var url = location.pathname + (p.length ? "?" + p.join("&") : "") + location.hash;
    if (url !== location.pathname + location.search + location.hash) history.replaceState(null, "", url);
  }
  function readURL() {
    var q = new URLSearchParams(location.search), set = function (o, v) { (v || "").split(",").forEach(function (x) { if (x) o[x] = true; }); };
    set(st.fam, q.get("f")); st.cat = q.get("c") || ""; set(st.scale, q.get("s")); set(st.lead, q.get("l")); set(st.tag, q.get("t")); st.q = q.get("q") || ""; $("q").value = st.q;
    return q;
  }

  // ---------- events: filters ----------
  document.querySelectorAll(".grp[data-group]").forEach(function (g) {
    g.addEventListener("click", function (ev) {
      var b = ev.target.closest(".chip"); if (!b) return;
      var o = st[g.dataset.group], v = b.dataset.v; o[v] = !o[v];
      if (g.dataset.group === "fam" && st.cat && any(st.fam)) { var e0 = ALL.filter(function (e) { return e.category === st.cat; })[0]; if (e0 && !st.fam[e0.family]) st.cat = ""; }
      apply();
    });
  });
  $("cat").addEventListener("change", function () { st.cat = this.value; apply(); });
  var qt; $("q").addEventListener("input", function () { clearTimeout(qt); var v = this.value; qt = setTimeout(function () { st.q = v.trim(); apply(); }, 120); });
  $("clear-q").addEventListener("click", function () { st.q = ""; $("q").value = ""; apply(); $("q").focus(); });
  $("clear").addEventListener("click", function () { clearAll(); });
  $("empty-clear").addEventListener("click", function () { clearAll(); });
  $("tog").addEventListener("click", function () { var open = $("bar").classList.toggle("open"); this.setAttribute("aria-expanded", open ? "true" : "false"); barH(); });
  document.addEventListener("keydown", function (ev) { if (ev.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName)) { ev.preventDefault(); $("q").focus(); } });

  // contents rows: clear the filters so the section is there, then go
  $("toc").addEventListener("click", function (ev) {
    var a = ev.target.closest("a[data-cat]"); if (!a) return;
    if (isFiltered()) clearAll();
    $("bar").classList.remove("open");
  });

  // ---------- shortlist ----------
  var KEY = "wc_activations_shortlist", SHORT = [];
  try { SHORT = JSON.parse(localStorage.getItem(KEY) || "[]").filter(function (c) { return BY[c]; }); } catch (e) { SHORT = []; }
  function saveShort() { try { localStorage.setItem(KEY, JSON.stringify(SHORT)); } catch (e) { /* private mode: keep it in memory */ } paintShort(); }
  function inShort(code) { return SHORT.indexOf(code) >= 0; }
  function toggleShort(code) { var i = SHORT.indexOf(code); if (i >= 0) SHORT.splice(i, 1); else SHORT.push(code); saveShort(); toast(i >= 0 ? "Removed from shortlist" : "Added to shortlist"); }
  function shortText() {
    return SHORT.map(function (c) { var e = BY[c]; return e.code + "  " + e.name + "  (" + e.scale.toLowerCase() + ", " + e.lead + ")"; }).join("\n");
  }
  function shareURL() { return location.origin + location.pathname + "?list=" + SHORT.join(","); }
  function paintShort() {
    $("short-n").textContent = SHORT.length;
    $("open-short").classList.toggle("hot", SHORT.length > 0);
    document.querySelectorAll("[data-save]").forEach(function (b) { var on = inShort(b.dataset.save); b.classList.toggle("on", on); b.textContent = on ? "✓" : "+"; b.setAttribute("aria-pressed", on ? "true" : "false"); });
    if (CUR) { var on = inShort(CUR.code); $("d-save").textContent = on ? "✓ In your shortlist" : "Add to shortlist"; $("d-save").classList.toggle("hot", on); }
    $("p-list").innerHTML = SHORT.map(function (c) {
      var e = BY[c];
      return '<li><img src="img/cards/' + e.code + '.jpg" alt="" width="640" height="400"><div><button class="t" type="button" data-open="' + e.code + '">' + esc(e.name) + '</button><div class="m">' + e.code + " &nbsp;·&nbsp; " + esc(e.scale) + " &nbsp;·&nbsp; " + esc(e.lead) + '</div></div><button class="rm" type="button" data-rm="' + e.code + '" aria-label="Remove ' + esc(e.name) + '">×</button></li>';
    }).join("");
    $("p-none").hidden = SHORT.length > 0;
    var body = "Hello Rudy,\n\nWe would like to talk about these activations:\n\n" + shortText() + "\n\nShortlist: " + shareURL() + "\n";
    $("p-mail").href = "mailto:" + MAIL + "?subject=" + encodeURIComponent("Activations shortlist (" + SHORT.length + ")") + "&body=" + encodeURIComponent(body);
    $("p-mail").classList.toggle("hot", SHORT.length > 0);
  }
  document.addEventListener("click", function (ev) {
    var s = ev.target.closest("[data-save]"); if (s) { toggleShort(s.dataset.save); return; }
    var r = ev.target.closest("[data-rm]"); if (r) { toggleShort(r.dataset.rm); return; }
    var o = ev.target.closest("[data-open]"); if (o) { openItem(o.dataset.open, true); }
  });
  function copy(text, msg) {
    var done = function () { toast(msg); }, fail = function () { window.prompt("Copy this:", text); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fail); else fail();
  }
  $("p-copy").addEventListener("click", function () { if (SHORT.length) copy(shortText(), "Copied"); });
  $("p-share").addEventListener("click", function () { if (SHORT.length) copy(shareURL(), "Link copied"); });
  $("p-clear").addEventListener("click", function () { if (SHORT.length && window.confirm("Remove all " + SHORT.length + " from the shortlist?")) { SHORT = []; saveShort(); } });

  // ---------- overlays ----------
  var CUR = null, lastFocus = null;
  function showOverlay(el) { lastFocus = document.activeElement; $("scrim").hidden = false; el.hidden = false; document.body.classList.add("locked"); }
  function closeOverlays() {
    var was = !$("drawer").hidden || !$("panel").hidden;
    $("drawer").hidden = true; $("panel").hidden = true; $("scrim").hidden = true; document.body.classList.remove("locked");
    if (CUR) { CUR = null; if (location.hash) history.replaceState(null, "", location.pathname + location.search); }
    if (was && lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $("scrim").addEventListener("click", closeOverlays);
  $("d-close").addEventListener("click", closeOverlays);
  $("p-close").addEventListener("click", closeOverlays);
  $("open-short").addEventListener("click", function () { $("drawer").hidden = true; CUR = null; showOverlay($("panel")); $("p-close").focus(); });
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape") closeOverlays();
    if (CUR && ev.key === "ArrowRight") step(1);
    if (CUR && ev.key === "ArrowLeft") step(-1);
  });

  // ---------- detail drawer ----------
  function openItem(code, push) {
    var e = BY[code]; if (!e) return;
    CUR = e;
    $("panel").hidden = true;
    var img = $("d-img"); img.src = "img/big/" + e.code + ".jpg"; img.alt = "Concept visual: " + e.name;
    $("d-code").textContent = e.code;
    $("d-crumb").innerHTML = '<span class="fam-' + e.family + '"><span class="sq"></span>' + esc(e._f.no) + " &nbsp;" + esc(e._f.key) + "</span> &nbsp;·&nbsp; " + esc(e.category);
    $("d-name").textContent = e.name; $("d-line").textContent = e.line; $("d-moment").textContent = e.moment;
    $("d-best").innerHTML = (e.best || "").split("·").map(function (b) { return b.trim(); }).filter(Boolean).map(function (b) { return "<span>" + esc(b) + "</span>"; }).join("");
    $("d-scale").textContent = e.scale; $("d-lead").textContent = e.lead; $("d-tag").textContent = TAGL[e.tag] || e.tag;
    var cl = $("d-client"); cl.hidden = !e.client; cl.innerHTML = e.client ? "<span>" + (e.tag === "P" ? "In production for" : "Delivered for") + "</span>" + esc(e.client) : "";
    var list = VISIBLE.length ? VISIBLE : ALL, i = list.indexOf(e);
    var prev = i > 0 ? list[i - 1] : null, next = i >= 0 && i < list.length - 1 ? list[i + 1] : null;
    $("d-prev").disabled = !prev; $("d-prev").textContent = prev ? "← " + prev.code + "  " + prev.name : "← Start";
    $("d-next").disabled = !next; $("d-next").textContent = next ? next.code + "  " + next.name + " →" : "End →";
    $("d-prev").style.visibility = prev ? "" : "hidden"; $("d-next").style.visibility = next ? "" : "hidden";
    paintShort();
    if ($("drawer").hidden) showOverlay($("drawer"));
    $("drawer").scrollTop = 0;
    $("d-close").focus();
    if (push) history.replaceState(null, "", location.pathname + location.search + "#" + e.code);
  }
  function step(d) { var list = VISIBLE.length ? VISIBLE : ALL, i = list.indexOf(CUR) + d; if (i >= 0 && i < list.length) openItem(list[i].code, true); }
  $("d-prev").addEventListener("click", function () { step(-1); });
  $("d-next").addEventListener("click", function () { step(1); });
  $("d-save").addEventListener("click", function () { if (CUR) toggleShort(CUR.code); });
  $("d-link").addEventListener("click", function () { if (CUR) copy(location.origin + location.pathname + "#" + CUR.code, "Link copied"); });

  // ---------- toast ----------
  var tt; function toast(msg) { var t = $("toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove("show"); }, 1600); }

  // the sticky bar's height, so anchors land below it
  function barH() { document.documentElement.style.setProperty("--bar-top", $("bar").offsetHeight + "px"); }
  barH(); window.addEventListener("resize", barH); if (document.fonts && document.fonts.ready) document.fonts.ready.then(barH);

  // ---------- start ----------
  var params = readURL();
  apply();
  paintShort();
  var shared = (params.get("list") || "").split(",").filter(function (c) { return BY[c]; });
  if (shared.length) {
    shared.forEach(function (c) { if (!inShort(c)) SHORT.push(c); }); saveShort();
    history.replaceState(null, "", location.pathname + location.hash); writeURL();
    showOverlay($("panel"));
  }
  var h = location.hash.replace("#", "");
  if (BY[h]) { openItem(h, false); }
  else if (h && document.getElementById(h)) { /* section anchors scroll on their own */ }
  window.addEventListener("hashchange", function () { var c = location.hash.replace("#", ""); if (BY[c]) openItem(c, false); });
})();
