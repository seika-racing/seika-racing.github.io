(function () {
  // ---- Mobile nav ----
  var toggle = document.querySelector("[data-nav-toggle]");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      document.body.classList.toggle("nav-open", !open);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("nav-open")) toggle.click();
    });
  }

  // ---- Header shade on scroll (home page only) ----
  var header = document.querySelector(".site-header--home");
  if (header) {
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 40); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // ---- Hero video: only fetch it when it's worth it ----
  var video = document.querySelector("[data-hero] video");
  if (video) {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var conn = navigator.connection || {};
    var saveData = conn.saveData === true || /(^|-)2g$/.test(conn.effectiveType || "");
    if (!reduce && !saveData) {
      var mobile = window.matchMedia("(max-width: 640px)").matches;
      var add = function (src, type) {
        if (!src) return;
        var s = document.createElement("source");
        s.src = src; s.type = type; video.appendChild(s);
      };
      if (mobile) {
        add(video.dataset.srcMobileMp4, "video/mp4");
      } else {
        add(video.dataset.srcDesktopWebm, "video/webm");
        add(video.dataset.srcDesktopMp4, "video/mp4");
      }
      video.preload = "auto";
      video.load();
      var p = video.play();
      if (p && p.catch) p.catch(function () { /* poster stays; fine */ });
      video.addEventListener("playing", function () { video.classList.add("is-playing"); }, { once: true });
    }
  }

  // ---- Click-to-load YouTube embeds ----
  document.querySelectorAll("[data-yt]").forEach(function (box) {
    var btn = box.querySelector(".yt__play");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var id = box.getAttribute("data-yt");
      var iframe = document.createElement("iframe");
      iframe.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0&modestbranding=1&playsinline=1";
      iframe.title = btn.getAttribute("aria-label") || "YouTube video";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.setAttribute("allowfullscreen", "");
      box.classList.add("is-loaded");
      box.replaceChildren(iframe);
    });
  });
})();
