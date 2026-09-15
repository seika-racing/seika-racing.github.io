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

  // ---- Waiting list: submit to Kit in the background, stay on the page ----
  var form = document.querySelector("[data-waitlist]");
  if (form && window.fetch) {
    var msg = form.querySelector("[data-waitlist-msg]");
    var button = form.querySelector("button[type=submit]");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      form.classList.remove("is-error");
      button.disabled = true;
      msg.textContent = "One moment…";
      fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email_address: form.email_address.value })
      })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
        .then(function (res) {
          if (!res.ok || res.data.status === "failed" || res.data.errors) {
            var errs = res.data.errors || {};
            throw new Error((errs.messages && errs.messages[0]) || "Subscription failed");
          }
          form.classList.add("is-done");
          msg.textContent = "You're on the list. Check your inbox for a confirmation email.";
        })
        .catch(function (err) {
          form.classList.add("is-error");
          button.disabled = false;
          var detail = err && err.message && err.message !== "Subscription failed" ? err.message + ". " : "";
          msg.textContent = detail + "That didn't go through. Please try again, or email " + (document.querySelector('a[href^="mailto:"]') || {}).textContent + ".";
        });
    });
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
