/*
 * The site's behavior: French/English, the header over the hero, the store gallery and the reveal
 * on scroll. No dependency, no tracking.
 */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Language ----------

  var EN = window.SKETCHAI_EN || {};
  var FR = {};

  function eachAttr(el, fn) {
    el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
      var parts = pair.split(":");
      if (parts.length === 2) fn(parts[0].trim(), parts[1].trim());
    });
  }

  // The pages are written in French: their texts are the French dictionary.
  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    var key = el.getAttribute("data-i18n");
    if (!(key in FR)) FR[key] = el.innerHTML;
  });
  document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
    eachAttr(el, function (attr, key) {
      if (!(key in FR)) FR[key] = el.getAttribute(attr);
    });
  });

  function setLang(lang, save) {
    var dict = lang === "en" ? EN : FR;
    root.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var value = key in dict ? dict[key] : FR[key];
      if (value != null && el.innerHTML !== value) el.innerHTML = value;
    });
    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      eachAttr(el, function (attr, key) {
        var value = key in dict ? dict[key] : FR[key];
        if (value != null) el.setAttribute(attr, value);
      });
    });
    document.querySelectorAll("[data-lang-src]").forEach(function (img) {
      var src = img.getAttribute("data-lang-src").replace("{lang}", lang);
      if (img.getAttribute("src") !== src) img.setAttribute("src", src);
    });
    var og = document.querySelector('meta[property="og:image"]');
    if (og) og.setAttribute("content", "assets/img/og-" + lang + ".jpg");
    document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-set-lang") === lang));
    });
    if (save) {
      try { localStorage.setItem("sketchai-lang", lang); } catch (e) { /* private mode */ }
    }
    document.dispatchEvent(new CustomEvent("sketchai:lang", { detail: lang }));
  }

  document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
    btn.addEventListener("click", function () { setLang(btn.getAttribute("data-set-lang"), true); });
  });

  // The language was picked in <head>, before the first paint of the legal pages.
  setLang(root.lang === "en" ? "en" : "fr", false);

  // ---------- Header over the hero ----------

  var header = document.getElementById("header");
  if (header) {
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 24); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // ---------- Reveal on scroll ----------

  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { revealer.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  // ---------- Store gallery ----------

  var gallery = document.getElementById("gallery");
  if (gallery) {
    document.querySelectorAll("[data-gallery]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var card = gallery.querySelector("img");
        var step = card ? card.getBoundingClientRect().width + 18 : 300;
        gallery.scrollBy({ left: Number(btn.getAttribute("data-gallery")) * step, behavior: reduceMotion ? "auto" : "smooth" });
      });
    });
  }
})();
