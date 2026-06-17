/* Workchop · interactions */
(function () {
  "use strict";

  /* -----------------------------------------------------------
     CONFIG: set this to make the contact form send for real.
     1. Create a free form at https://formspree.io
     2. Paste your endpoint below, e.g.
        "https://formspree.io/f/abcdwxyz"
     Until then, the form falls back to opening the visitor's
     email client (mailto), so it still works.
  ----------------------------------------------------------- */
  var FORM_ENDPOINT = ""; // <-- paste Formspree URL here
  var CONTACT_EMAIL = "hello@workchop.io";

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

  /* Contact form */
  var form = document.querySelector(".form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector("button[type=submit]");
      var data = new FormData(form);

      var done = function (msg) {
        if (btn) { btn.innerHTML = msg; btn.disabled = true; btn.style.opacity = "0.85"; }
      };

      if (FORM_ENDPOINT) {
        if (btn) { btn.textContent = "Sending…"; btn.disabled = true; }
        fetch(FORM_ENDPOINT, { method: "POST", body: data, headers: { Accept: "application/json" } })
          .then(function (r) {
            if (r.ok) { form.reset(); done("Sent. We'll be in touch ✦"); }
            else { done("Hmm, that failed. Email us instead ✦"); btn.disabled = false; }
          })
          .catch(function () { done("Network error. Email us instead ✦"); if (btn) btn.disabled = false; });
      } else {
        // mailto fallback so the form works with no backend
        var subject = encodeURIComponent("Workchop enquiry from " + (data.get("name") || "the website"));
        var body = encodeURIComponent(
          "Name: " + (data.get("name") || "") + "\n" +
          "Email: " + (data.get("email") || "") + "\n" +
          "Topic: " + (data.get("topic") || "") + "\n\n" +
          (data.get("msg") || "")
        );
        window.location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + subject + "&body=" + body;
        done("Opening your email app ✦");
      }
    });
  }

  /* Newsletter */
  var sub = document.querySelector(".subscribe");
  if (sub) {
    sub.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = sub.querySelector(".btn");
      if (btn) { btn.textContent = "Subscribed ✦"; btn.disabled = true; }
      sub.querySelector("input") && (sub.querySelector("input").value = "");
    });
  }

  /* Footer year */
  var yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();
})();
