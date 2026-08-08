/* ============================================================
   Just For You Drink · Interacciones
   ============================================================ */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- LOADER ---------- */
  var loader = document.getElementById("loader");
  var loaderFill = loader.querySelector(".loader-bar-fill");
  var progress = 0;
  var loadTimer = setInterval(function () {
    progress = Math.min(progress + Math.random() * 30, 100);
    if (loaderFill) loaderFill.style.width = progress + "%";
    if (progress >= 100) {
      clearInterval(loadTimer);
      setTimeout(function () { loader.classList.add("done"); }, 350);
    }
  }, 150);

  /* ---------- CURSOR ---------- */
  var cursor = document.getElementById("cursor");
  var mx = 0, my = 0, cx = 0, cy = 0;
  if (!prefersReduced && window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("mousemove", function (e) {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.opacity = 1;
    });
    document.addEventListener("mouseover", function (e) {
      var t = e.target.closest("a, button, .tilt-card, [data-hscroll]");
      if (t) cursor.classList.add("hovering");
    });
    document.addEventListener("mouseout", function (e) {
      var t = e.target.closest("a, button, .tilt-card, [data-hscroll]");
      if (t) cursor.classList.remove("hovering");
    });
    (function loop() {
      cx += (mx - cx) * 0.2;
      cy += (my - cy) * 0.2;
      cursor.style.transform = "translate(" + cx + "px, " + cy + "px) translate(-50%, -50%)";
      requestAnimationFrame(loop);
    })();
  } else {
    cursor.style.display = "none";
  }

  /* ---------- REVEAL ON SCROLL ---------- */
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".reveal").forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- CONTADORES (stats) ---------- */
  if (!prefersReduced && "IntersectionObserver" in window) {
    var statsObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        statsObs.unobserve(entry.target);
        var num = entry.target;
        var target = parseInt(num.getAttribute("data-count"), 10);
        if (isNaN(target)) { num.textContent = num.textContent; return; }
        var start = 0;
        var dur = 1200;
        var t0 = performance.now();
        function tick(now) {
          var p = Math.min((now - t0) / dur, 1);
          num.textContent = Math.round(start + (target - start) * p);
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll(".stat-num[data-count]").forEach(function (el) { statsObs.observe(el); });
  }

  /* ---------- TILT 3D CARDS ---------- */
  if (!prefersReduced && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".tilt-card").forEach(function (card) {
      var strength = 10;
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          "rotateY(" + (px * strength) + "deg) rotateX(" + (-py * strength) + "deg) " +
          "translateZ(10px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  /* ---------- HERO PARALLAX 3D ---------- */
  var hero = document.getElementById("inicio");
  var sceneEl = document.getElementById("heroScene");
  if (hero) {
    var heroBgVideo = hero.querySelector(".hero-bg-video");
    var heroMove = function (e) {
      if (window.innerWidth < 768) return;
      var x = (e.clientX / window.innerWidth - 0.5) * 2;
      var y = (e.clientY / window.innerHeight - 0.5) * 2;
      if (e.type === "mousemove") {
        if (sceneEl) {
          sceneEl.style.transform =
            "rotateY(" + (x * 8) + "deg) rotateX(" + (-y * 8) + "deg) translateZ(0)";
          document.querySelectorAll(".hero-scene > *").forEach(function (el) {
            var depth = parseFloat(el.dataset.depth || "1");
            el.style.translate = (x * 18 * depth) + "px " + (y * 18 * depth) + "px";
          });
        }
        if (heroBgVideo) {
          heroBgVideo.style.transform =
            "translateX(" + (x * -10) + "px) translateY(" + (y * -10) + "px) scale(1.06)";
        }
      }
    };
    hero.addEventListener("mousemove", heroMove);

    /* Parallax sutil en las capas FX de las tarjetas de vídeo */
    document.querySelectorAll(".video-card").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.querySelectorAll(".fx-slice, .fx-bubble").forEach(function (el) {
          el.style.translate = (px * 22) + "px " + (py * 22) + "px";
        });
      });
      card.addEventListener("mouseleave", function () {
        card.querySelectorAll(".fx-slice, .fx-bubble").forEach(function (el) {
          el.style.translate = "";
        });
      });
    });
  }

  /* ---------- SCROLL HORIZONTAL PACKS (sticky-style, scroll vertical) ---------- */
  var viewport = document.querySelector("[data-hscroll]");
  if (viewport) {
    var track = viewport.querySelector(".packs-track");
    var bar = viewport.querySelector(".packs-progress span");
    var max = 0;

    var resizePacks = function () {
      var fallback = viewport.clientWidth || (typeof window.innerWidth === "number" ? window.innerWidth : 1200);
      max = Math.max(0, track.scrollWidth - viewport.clientWidth);
    };
    resizePacks();
    window.addEventListener("resize", resizePacks);

    /* Si hay muy poco desborde, no aplicamos desplazamiento y mostramos todo */
    var updatePacks = function () {
      var rect = viewport.getBoundingClientRect();
      var vh = window.innerHeight || 800;
      var sy = window.scrollY;
      var start = rect.top + sy - vh * 0.95;
      var end = rect.bottom + sy - vh * 0.5;
      var p = (end - start > 0) ? (sy - start) / (end - start) : 0;
      p = Math.max(0, Math.min(1, p));
      track.style.transform = "translateX(" + (-max * p) + "px)";
      if (bar) bar.style.width = (p * 100) + "%";
    };

    window.addEventListener("scroll", function () { updatePacks(); }, { passive: true });
    updatePacks();
    window.addEventListener("load", function () { setTimeout(updatePacks, 80); });
    /* Recalcula tras cargar imágenes para tamaño fiable */
    if (window.requestAnimationFrame) {
      var rOnce = true;
      var afterPaint = function () { updatePacks(); if (rOnce) { rOnce = false; window.removeEventListener("resize", afterPaint); } };
      window.addEventListener("resize", afterPaint);
    }
  }

  /* ---------- TESTIMONIOS CARRUSEL ---------- */
  var carousel = document.querySelector("[data-carousel]");
  if (carousel) {
    var slides = carousel.querySelectorAll(".testi-slide");
    var dotsWrap = carousel.querySelector(".testi-dots");
    var current = 0;
    var timer = null;

    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.className = "testi-dot" + (i === 0 ? " active" : "");
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "Opinión " + (i + 1));
      dot.addEventListener("click", function () {
        go(i);
        restart();
      });
      dotsWrap.appendChild(dot);
    });

    function go(i) {
      current = i;
      slides.forEach(function (s, j) {
        s.style.opacity = j === i ? 1 : 0;
        s.style.transform = j === i ? "translateX(0)" : (j < i ? "translateX(-40px)" : "translateX(40px)");
        s.style.display = j === i ? "block" : "none";
      });
      carousel.querySelectorAll(".testi-dot").forEach(function (d, j) {
        d.classList.toggle("active", j === i);
      });
    }
    function next() { go((current + 1) % slides.length); }
    function prev() { go((current - 1 + slides.length) % slides.length); }
    function restart() {
      if (timer) clearInterval(timer);
      if (!prefersReduced) timer = setInterval(next, 6000);
    }

    var prevBtn = carousel.querySelector("[data-prev]");
    var nextBtn = carousel.querySelector("[data-next]");
    prevBtn.addEventListener("click", function () { prev(); restart(); });
    nextBtn.addEventListener("click", function () { next(); restart(); });
    go(0);
    restart();
  }

  /* ---------- NAV MÓVIL: cerrar al pulsar enlace ---------- */
  var navToggle = document.getElementById("nav-toggle");
  if (navToggle) {
    document.querySelectorAll(".nav a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.innerWidth <= 960) navToggle.checked = false;
      });
    });
  }
})();