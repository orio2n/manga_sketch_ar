/* Picks the language before the first paint: ?lang=, then the visitor's last choice, otherwise English. */
(function () {
  var root = document.documentElement;
  root.classList.remove("no-js");
  var param = null;
  var saved = null;
  try {
    param = new URLSearchParams(location.search).get("lang");
    saved = localStorage.getItem("sketchai-lang");
  } catch (e) { /* private mode */ }
  root.lang = param === "fr" || param === "en" ? param : saved === "fr" || saved === "en" ? saved : "en";
})();
