/* Workchop · interactions */
(function () {
  "use strict";

  /* -----------------------------------------------------------
     CONFIG: make the contact form send for real.
     1. Go to https://web3forms.com, enter hello@workchop.io,
        and confirm via the verification email.
     2. Paste the access key they give you below.
     Until then, the form falls back to opening the visitor's
     email client (mailto), so it still works.
  ----------------------------------------------------------- */
  var WEB3FORMS_KEY = "84f1ca50-5f77-4a9b-b987-9f5acad16dc9"; // Web3Forms access key (routes to hello@workchop.io)
  var CONTACT_EMAIL = "hello@workchop.io";
  var LOOPS_FORM_ENDPOINT = "https://app.loops.so/api/newsletter-form/cmqm9t27l04mt0j137xvobd6c"; // newsletter signups

  /* Mobile nav toggle */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.classList.remove("open");
      });
    });
  }

  /* Nav shadow on scroll */
  var nav = document.querySelector(".nav");
  if (nav) {
    var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 10); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Scroll reveal */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 80 + "ms";
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* App filtering (Apps page) */
  var filters = document.querySelectorAll(".filters .chip");
  var apps = document.querySelectorAll("[data-platform]");
  if (filters.length && apps.length) {
    filters.forEach(function (chip) {
      chip.addEventListener("click", function () {
        filters.forEach(function (c) { c.classList.remove("selected"); });
        chip.classList.add("selected");
        var f = chip.getAttribute("data-filter");
        apps.forEach(function (app) {
          var match = f === "all" || app.getAttribute("data-platform").indexOf(f) !== -1;
          app.hidden = !match;
        });
      });
    });
  }

  /* Selectable chips (non-filter) */
  document.querySelectorAll(".chip[data-select]").forEach(function (chip) {
    chip.addEventListener("click", function () { chip.classList.toggle("selected"); });
  });

  /* Contact form (Web3Forms) */
  var form = document.querySelector(".form");
  if (form) {
    var btn = form.querySelector("button[type=submit]");
    var btnLabel = btn ? btn.innerHTML : "";
    var status = form.querySelector(".form-status");

    var setStatus = function (msg, kind) {
      if (!status) return;
      status.textContent = msg;
      status.className = "form-status" + (kind ? " " + kind : "");
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // honeypot: bots tick this hidden box
      var hp = form.querySelector("[name=botcheck]");
      if (hp && hp.checked) return;

      var data = new FormData(form);

      // No key yet → fall back to the visitor's email app so the form still works
      if (!WEB3FORMS_KEY || WEB3FORMS_KEY === "YOUR_ACCESS_KEY") {
        var subject = encodeURIComponent("Workchop enquiry from " + (data.get("name") || "the website"));
        var body = encodeURIComponent(
          "Name: " + (data.get("name") || "") + "\n" +
          "Email: " + (data.get("email") || "") + "\n" +
          "Topic: " + (data.get("topic") || "") + "\n\n" +
          (data.get("msg") || "")
        );
        window.location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + subject + "&body=" + body;
        setStatus("Opening your email app…");
        return;
      }

      var payload = { access_key: WEB3FORMS_KEY };
      data.forEach(function (v, k) { payload[k] = v; });

      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      setStatus("");

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (res && res.success) {
            form.reset();
            if (btn) btn.innerHTML = "Sent ✦";
            setStatus("Thanks! Your message is on its way. We'll reply within a business day. ✦", "ok");
          } else {
            if (btn) { btn.disabled = false; btn.innerHTML = btnLabel; }
            setStatus("Something went wrong. Please email " + CONTACT_EMAIL + " directly.", "err");
          }
        })
        .catch(function () {
          if (btn) { btn.disabled = false; btn.innerHTML = btnLabel; }
          setStatus("Network error. Please email " + CONTACT_EMAIL + " directly.", "err");
        });
    });
  }

  /* Newsletter (Loops) */
  document.querySelectorAll(".subscribe").forEach(function (sub) {
    var btn = sub.querySelector(".btn");
    var input = sub.querySelector("input[type=email]");
    var btnLabel = btn ? btn.innerHTML : "Subscribe";
    var status = sub.parentElement ? sub.parentElement.querySelector(".subscribe-status") : null;
    var setStatus = function (m, k) {
      if (status) { status.textContent = m; status.className = "subscribe-status" + (k ? " " + k : ""); }
    };

    sub.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = input ? input.value.trim() : "";
      if (!email) return;

      if (!LOOPS_FORM_ENDPOINT) {
        if (input) input.value = "";
        if (btn) { btn.textContent = "Subscribed ✦"; btn.disabled = true; }
        return;
      }

      if (btn) { btn.disabled = true; btn.textContent = "Subscribing…"; }
      setStatus("");

      fetch(LOOPS_FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "email=" + encodeURIComponent(email)
      })
        .then(function (r) { return r.json().catch(function () { return {}; }); })
        .then(function (res) {
          if (res && res.success) {
            if (input) input.value = "";
            if (btn) btn.textContent = "Subscribed ✦";
            setStatus("You're on the list. Thanks! ✦", "ok");
          } else {
            if (btn) { btn.disabled = false; btn.innerHTML = btnLabel; }
            setStatus((res && res.message) ? res.message : "That didn't work. Try again?", "err");
          }
        })
        .catch(function () {
          if (btn) { btn.disabled = false; btn.innerHTML = btnLabel; }
          setStatus("Network error. Try again in a moment.", "err");
        });
    });
  });

  /* Featured spotlight: pick a random app on load */
  var slEl = document.getElementById("spotlight");
  if (slEl) {
    var SPOTLIGHT_APPS = [
      { name: "Reshuffy", tag: "Music", status: "Live", statusClass: "live", href: "https://reshuffy.com", external: true, cta: "Visit site", grad: "linear-gradient(135deg,#1a2e2a,#0c1210)", initial: "R", blurb: "Clean up your Spotify playlists without the fear. Fix broken tracks, kill duplicates, and reorganise by mood and genre, always with a preview first." },
      { name: "Dailygrasp", tag: "Learning", status: "In build", statusClass: "beta", href: "https://dailygrasp.app/", external: true, cta: "Visit site", grad: "linear-gradient(135deg,#1d2b1a,#0d0f0c)", initial: "D", blurb: "A 60-second AI summary of a Wikipedia article, every day. Dial it from everyday facts to deep, nerdy rabbit holes." },
      { name: "Journally", tag: "Journal", status: "In build", statusClass: "soon", href: "/apps", external: false, cta: "Explore apps", grad: "linear-gradient(135deg,#1a2330,#0c0e12)", initial: "J", blurb: "Just talk, and it quietly sorts out your day. Private by design, with everything kept on your phone." },
      { name: "Radr", tag: "Events", status: "In build", statusClass: "soon", href: "/apps", external: false, cta: "Explore apps", grad: "linear-gradient(135deg,#261a2e,#0e0c12)", initial: "R", blurb: "Like Skyscanner, but for nights out. Every local event in one tidy calendar." },
      { name: "Mutual", tag: "Dating", status: "In build", statusClass: "soon", href: "/apps", external: false, cta: "Explore apps", grad: "linear-gradient(135deg,#2e261a,#120f0c)", initial: "M", blurb: "Dating that actually looks at who you click with, not just photos. Less swiping, more connecting." }
    ];
    var app = SPOTLIGHT_APPS[Math.floor(Math.random() * SPOTLIGHT_APPS.length)];
    slEl.setAttribute("href", app.href);
    if (app.external) { slEl.setAttribute("target", "_blank"); slEl.setAttribute("rel", "noopener"); }
    else { slEl.removeAttribute("target"); slEl.removeAttribute("rel"); }
    slEl.style.setProperty("--sl-grad", app.grad);
    var slSet = function (sel, txt) { var n = slEl.querySelector(sel); if (n) n.textContent = txt; };
    slSet("[data-sl=tag]", app.tag);
    var stEl = slEl.querySelector("[data-sl=status]");
    if (stEl) { stEl.textContent = app.status; stEl.className = "status " + app.statusClass; }
    slSet("[data-sl=name]", app.name);
    slSet("[data-sl=blurb]", app.blurb);
    slSet("[data-sl=initial]", app.initial);
    var ctaEl = slEl.querySelector("[data-sl=cta]");
    if (ctaEl) ctaEl.innerHTML = app.cta + ' <span class="arrow">↗</span>';
  }

  /* Footer year */
  var yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();
})();
