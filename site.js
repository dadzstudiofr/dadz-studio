(function () {
  "use strict";

  /* Les titres .chaos changent de casse à chaque clic */
  document.querySelectorAll(".chaos").forEach(function (el) {
    var base = el.getAttribute("data-text") || el.textContent;
    function shuffle() {
      var out = "", prev = null;
      for (var i = 0; i < base.length; i++) {
        var ch = base[i];
        if (ch === " ") { out += ch; prev = null; continue; }
        var up = Math.random() < 0.5;
        if (prev !== null && Math.random() < 0.35) up = !prev;
        prev = up;
        out += up ? ch.toUpperCase() : ch.toLowerCase();
      }
      if (out === base || out === base.toLowerCase() || out === base.toUpperCase()) return shuffle();
      el.textContent = out;
    }
    el.addEventListener("click", shuffle);
  });

  /* Le sourire a des humeurs */
  var mood = document.getElementById("mood");
  if (mood) {
    var use = document.getElementById("mood-use");
    var cap = document.getElementById("mood-cap");
    var moods = [
      { id: "smile", say: "Aujourd’hui, je souris." },
      { id: "wink",  say: "Clin d’œil. Tu n’as rien vu." },
      { id: "flat",  say: "Pas envie aujourd’hui. Le sourire est parti en vacances." },
      { id: "smile", say: "Bon, c’est revenu. Il boudait." }
    ];
    var n = 0;
    mood.addEventListener("click", function () {
      n = (n + 1) % moods.length;
      use.setAttribute("href", "#" + moods[n].id);
      cap.textContent = moods[n].say;
    });
  }

  /* Règle n°4 */
  var r4 = document.getElementById("r4");
  if (r4) {
    var r4t = document.getElementById("r4-text");
    r4.addEventListener("click", function () {
      var open = r4t.hidden;
      r4t.hidden = !open;
      r4.setAttribute("aria-expanded", String(open));
    });
  }

  /* Ton orange, ton choix */
  var pick = document.getElementById("orange");
  if (pick) {
    var reset = document.getElementById("orange-reset");
    var root = document.documentElement;
    pick.addEventListener("input", function () { root.style.setProperty("--orange", pick.value); });
    reset.addEventListener("click", function () {
      root.style.removeProperty("--orange");
      pick.value = "#ea9d57";
    });
  }

  /* Boutons « Copier » */
  var status = document.getElementById("status");
  var cheers = [
    "Copié ! Tu peux coller.",
    "Copié. Colle avec amour.",
    "C’est dans ton presse-papier. Ne le perds pas.",
    "Copié. Aucune règle ne dit que tu dois m’écrire. Mais écris-moi."
  ];
  function say(msg) {
    if (!status) return;
    status.textContent = msg;
    setTimeout(function () { if (status.textContent === msg) status.textContent = ""; }, 3200);
  }
  function fallbackSelect(btn, text) {
    var val = btn.parentNode.querySelector(".val");
    if (val) {
      var r = document.createRange(); r.selectNodeContents(val);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
    }
    say("Sélectionné, il ne reste qu’à copier : " + text);
  }
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var cheer = cheers[Math.floor(Math.random() * cheers.length)];
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          function () { say(cheer); },
          function () { fallbackSelect(btn, text); }
        );
      } else { fallbackSelect(btn, text); }
    });
  });


  /* Le logo change de déclinaison, ou la personne choisit */
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var cycles = Array.prototype.map.call(document.querySelectorAll(".logo-cycle"), function (el, k) {
    return { vs: el.querySelectorAll(".lc-v"), i: 0, offset: 0, auto: el.classList.contains("auto-cycle") };
  });
  var names = [
    "dadz studio avec le sourire", "dadz studio empilé", "dadz seul", "dadz studio sur fond bleu",
    "le sourire seul", "dadz studio sur fond crème", "dadz studio penché", "dadz sur fond bleu",
    "dadz studio foncé sur bleu", "le sourire sur fond bleu", "dadz bleu sur fond crème", "le sourire sur fond crème"
  ];
  var choice = null; /* null = ça tourne tout seul */
  try { var saved = localStorage.getItem("dadz-logo"); if (saved !== null && saved !== "auto") choice = parseInt(saved, 10); } catch (e) {}
  if (choice !== null && (isNaN(choice) || choice < 0 || choice > 11)) choice = null;

  function showAt(c, n) {
    if (!c.vs.length) return;
    c.vs[c.i].classList.remove("on");
    c.i = ((n % c.vs.length) + c.vs.length) % c.vs.length;
    c.vs[c.i].classList.add("on");
  }
  function applyChoice() {
    cycles.forEach(function (c) { showAt(c, choice === null ? c.offset : choice); });
    var btns = document.querySelectorAll("#lc-pick-row button");
    Array.prototype.forEach.call(btns, function (b) {
      var v = b.getAttribute("data-i");
      b.setAttribute("aria-pressed", String(v === "auto" ? choice === null : parseInt(v, 10) === choice));
    });
  }
  applyChoice();

  if (!reduce) {
    setInterval(function () {
      if (choice !== null || document.hidden) return;
      cycles.forEach(function (c) { if (c.auto) showAt(c, c.i + 1); });
    }, 2800);
  }

  var pickerBox = document.getElementById("lc-picker");
  var row = document.getElementById("lc-pick-row");
  if (pickerBox && row && cycles.length && cycles[0].vs.length === 12) {
    cycles[0].vs.forEach(function (v, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "lc-pick";
      b.setAttribute("data-i", String(i));
      b.setAttribute("aria-label", names[i]);
      var clone = v.cloneNode(true);
      clone.classList.remove("on");
      clone.setAttribute("aria-hidden", "true");
      b.appendChild(clone);
      row.appendChild(b);
    });
    var auto = document.createElement("button");
    auto.type = "button";
    auto.className = "lc-auto";
    auto.setAttribute("data-i", "auto");
    auto.textContent = "Laisse-le tourner";
    row.appendChild(auto);

    row.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      var v = b.getAttribute("data-i");
      choice = v === "auto" ? null : parseInt(v, 10);
      try { localStorage.setItem("dadz-logo", v); } catch (err) {}
      applyChoice();
    });
    pickerBox.hidden = false;
    applyChoice();
  }

  /* Le titre de l'onglet s'ennuie quand tu pars */
  var title = document.title;
  document.addEventListener("visibilitychange", function () {
    document.title = document.hidden ? "Reviens, on s’amuse… :)" : title;
  });
})();
