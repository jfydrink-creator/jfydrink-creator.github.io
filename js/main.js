/* ============================================================
   Just For You Drink · Interacciones
   ============================================================ */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- LOADER (breve: máx. ~0,6 s, y solo la primera visita) ---------- */
  var loader = document.getElementById("loader");
  if (loader) {
    var seen = false;
    try { seen = sessionStorage.getItem("jfy_seen") === "1"; sessionStorage.setItem("jfy_seen", "1"); } catch (e) {}
    var loaderFill = loader.querySelector(".loader-bar-fill");
    if (seen || prefersReduced) {
      loader.classList.add("done");
    } else {
      requestAnimationFrame(function () { if (loaderFill) loaderFill.style.width = "100%"; });
      setTimeout(function () { loader.classList.add("done"); }, 550);
    }
  }

  /* ---------- CURSOR ---------- */
  var cursor = document.getElementById("cursor") || document.createElement("div");
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
    var heroBgLayers = hero.querySelectorAll(".hero-bg-img, .hero-bg-video");
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
        heroBgLayers.forEach(function (el) {
          el.style.translate = (x * -10) + "px " + (y * -10) + "px";
        });
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
      max = Math.max(0, track.scrollWidth - viewport.clientWidth);
      /* si todas las tarjetas caben, no hay nada que desplazar: se oculta la barra de progreso */
      if (bar && bar.parentNode) bar.parentNode.hidden = max <= 0;
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

  /* ---------- NAV MÓVIL: cerrar al pulsar enlace + accesible por teclado ---------- */
  var navToggle = document.getElementById("nav-toggle");
  if (navToggle) {
    var navLabel = document.querySelector("label.nav-toggle");
    var syncNav = function () { if (navLabel) navLabel.setAttribute("aria-expanded", navToggle.checked ? "true" : "false"); };
    document.querySelectorAll(".nav a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.innerWidth <= 960) { navToggle.checked = false; syncNav(); }
      });
    });
    if (navLabel) {
      navLabel.setAttribute("role", "button");
      navLabel.setAttribute("tabindex", "0");
      syncNav();
      navToggle.addEventListener("change", syncNav);
      navLabel.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navToggle.checked = !navToggle.checked; syncNav(); }
      });
    }
  }

  /* ---------- TEXTOS (ES / CA) ---------- */
  var LANG = (document.documentElement.lang || "es").slice(0, 2);
  var T = {
    es: {
      past: "Esa fecha ya ha pasado. Revisa el día, por favor.",
      soon: "Faltan muy pocos días: escríbenos por WhatsApp y lo miramos al momento.",
      busy: "Esa fecha ya está reservada en nuestro calendario. Escríbenos igualmente y vemos cómo ayudarte.",
      free: "¡Buenas noticias! Esa fecha aparece libre en nuestro calendario. Te recomendamos reservar pronto.",
      unknown: "Te confirmamos la disponibilidad al responderte.",
      required: "Por favor, completa los campos obligatorios (*) y acepta la política de privacidad.",
      minGuests: "El servicio es a partir de 50 invitados. Si sois menos, escríbenos y lo valoramos.",
      subject: "Solicitud de presupuesto",
      L: { nombre: "Nombre", telefono: "Teléfono", tipo: "Tipo de evento", fecha: "Fecha", lugar: "Lugar", invitados: "Invitados", horas: "Horas", pack: "Pack", mensaje: "Comentarios", estimado: "Precio orientativo (web)" },
      intro: "Hola! Os escribo desde la web para pedir presupuesto:",
      dateFmt: "es-ES",
      ui: { soundOn: "Activar sonido", soundOff: "Silenciar", lbLabel: "Galería de fotos ampliada", lbClose: "Cerrar", lbPrev: "Foto anterior", lbNext: "Foto siguiente" }
    },
    ca: {
      past: "Aquesta data ja ha passat. Revisa el dia, si us plau.",
      soon: "Falten molt pocs dies: escriu-nos per WhatsApp i ho mirem de seguida.",
      busy: "Aquesta data ja està reservada al nostre calendari. Escriu-nos igualment i veiem com ajudar-te.",
      free: "Bones notícies! Aquesta data apareix lliure al nostre calendari. Et recomanem reservar aviat.",
      unknown: "Et confirmarem la disponibilitat quan et responguem.",
      required: "Si us plau, completa els camps obligatoris (*) i accepta la política de privacitat.",
      minGuests: "El servei és a partir de 50 convidats. Si sou menys, escriu-nos i ho valorem.",
      subject: "Sol·licitud de pressupost",
      L: { nombre: "Nom", telefono: "Telèfon", tipo: "Tipus d'esdeveniment", fecha: "Data", lugar: "Lloc", invitados: "Convidats", horas: "Hores", pack: "Pack", mensaje: "Comentaris", estimado: "Preu orientatiu (web)" },
      intro: "Hola! Us escric des del web per demanar pressupost:",
      dateFmt: "ca-ES",
      ui: { soundOn: "Activar el so", soundOff: "Silenciar", lbLabel: "Galeria de fotos ampliada", lbClose: "Tancar", lbPrev: "Foto anterior", lbNext: "Foto següent" }
    }
  }[LANG === "ca" ? "ca" : "es"];
  var WA = "https://wa.me/34640326623?text=";

  /* ---------- DISPONIBILIDAD DE FECHA ---------- */
  var booked = null;
  var dataUrl = (document.documentElement.getAttribute("data-root") || "") + "data/fechas-ocupadas.json";
  function loadBooked() {
    if (booked) return Promise.resolve(booked);
    return fetch(dataUrl, { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : { ocupadas: null }; })
      .then(function (j) { booked = j.ocupadas; return booked; })
      .catch(function () { booked = null; return null; });
  }
  var dateIn = document.getElementById("qf-date"), avail = document.getElementById("qf-avail");
  if (dateIn && avail) {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var pad2 = function (n) { return (n < 10 ? "0" : "") + n; };
    dateIn.min = today.getFullYear() + "-" + pad2(today.getMonth() + 1) + "-" + pad2(today.getDate());
    dateIn.addEventListener("change", function () {
      var v = dateIn.value;
      avail.className = "qf-avail";
      if (!v) { avail.textContent = ""; return; }
      var d = new Date(v + "T00:00:00");
      var days = Math.round((d - today) / 86400000);
      if (days < 0) { avail.textContent = T.past; avail.classList.add("is-bad"); return; }
      loadBooked().then(function (list) {
        if (!Array.isArray(list)) { avail.textContent = T.unknown; return; }
        if (list.indexOf(v) !== -1) { avail.textContent = T.busy; avail.classList.add("is-bad"); }
        else if (days < 7) { avail.textContent = T.soon; avail.classList.add("is-warn"); }
        else { avail.textContent = T.free; avail.classList.add("is-good"); }
      });
    });
  }

  /* ---------- FORMULARIO DE PRESUPUESTO ---------- */
  var qf = document.getElementById("presupuesto");
  if (qf) {
    var params = new URLSearchParams(location.search);
    if (params.get("tipo")) { var tSel = qf.querySelector("#qf-type"); for (var k = 0; k < tSel.options.length; k++) if (tSel.options[k].value === params.get("tipo")) tSel.selectedIndex = k; }
    var errBox = document.getElementById("qf-error");
    var sendMode = "wa";
    [].forEach.call(qf.querySelectorAll("[data-send]"), function (b) {
      b.addEventListener("click", function () { sendMode = b.getAttribute("data-send"); });
    });
    qf.addEventListener("submit", function (e) {
      e.preventDefault();
      var req = qf.querySelectorAll("[required]"), ok = true;
      [].forEach.call(req, function (el) {
        var bad = el.type === "checkbox" ? !el.checked : !String(el.value).trim();
        el.classList.toggle("is-invalid", bad);
        el.setAttribute("aria-invalid", bad ? "true" : "false");
        if (bad) ok = false;
      });
      if (!ok) { errBox.textContent = T.required; errBox.hidden = false; var first = qf.querySelector(".is-invalid"); if (first) first.focus(); return; }
      var guests = +qf.querySelector("#qf-guests").value;
      if (guests < 50) { errBox.textContent = T.minGuests; errBox.hidden = false; qf.querySelector("#qf-guests").focus(); return; }
      errBox.hidden = true;
      var L = T.L, val = function (id) { return qf.querySelector(id).value.trim(); };
      var fecha = val("#qf-date");
      var fechaTxt = fecha ? new Date(fecha + "T00:00:00").toLocaleDateString(T.dateFmt, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "";
      var lines = [
        T.intro, "",
        L.nombre + ": " + val("#qf-name"),
        L.telefono + ": " + val("#qf-phone"),
        L.tipo + ": " + val("#qf-type"),
        L.fecha + ": " + fechaTxt,
        L.lugar + ": " + val("#qf-place"),
        L.invitados + ": " + guests,
        L.horas + ": " + val("#qf-hours"),
        L.pack + ": " + val("#qf-pack")
      ];
      if (qf.dataset.estimate) lines.push(L.estimado + ": " + qf.dataset.estimate + " €");
      if (val("#qf-msg")) lines.push(L.mensaje + ": " + val("#qf-msg"));
      var text = lines.join("\n");
      if (sendMode === "mail") {
        location.href = "mailto:jfy.drink@gmail.com?subject=" + encodeURIComponent(T.subject + " · " + val("#qf-type") + " · " + fecha) + "&body=" + encodeURIComponent(text);
      } else {
        window.open(WA + encodeURIComponent(text), "_blank", "noopener");
      }
    });
    qf.addEventListener("input", function (e) { if (e.target.classList.contains("is-invalid")) { e.target.classList.remove("is-invalid"); e.target.removeAttribute("aria-invalid"); } });
  }

  /* ---------- HERO: vídeo vertical solo en móvil (en escritorio, foto) ---------- */
  var heroVid = hero && hero.querySelector(".hero-bg-video");
  if (heroVid && !prefersReduced && window.matchMedia("(max-width: 768px)").matches &&
      !(navigator.connection && navigator.connection.saveData)) {
    heroVid.src = heroVid.getAttribute("data-src");
    heroVid.addEventListener("playing", function () { heroVid.classList.add("is-playing"); });
    var playHero = function () { var p = heroVid.play(); if (p && p.catch) p.catch(function () {}); };
    playHero();
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) playHero(); else heroVid.pause();
      }, { threshold: 0.1 }).observe(hero);
    }
  }

  /* ---------- VÍDEOS VERTICALES: se reproducen al verse, sonido opcional ---------- */
  var reels = [].slice.call(document.querySelectorAll("[data-reel]"));
  reels.forEach(function (card) {
    var v = card.querySelector("video"), snd = card.querySelector(".reel-sound"), tog = card.querySelector(".reel-toggle");
    var userPaused = false;
    v.muted = true;
    function play() { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    function setSound(on) {
      v.muted = !on;
      card.classList.toggle("sound-on", on);
      snd.setAttribute("aria-pressed", on ? "true" : "false");
      snd.setAttribute("aria-label", on ? T.ui.soundOff : T.ui.soundOn);
    }
    card._setSound = setSound;
    snd.addEventListener("click", function () {
      var on = v.muted;
      reels.forEach(function (o) { if (o !== card && o._setSound) o._setSound(false); });
      setSound(on);
      if (on) { userPaused = false; card.classList.remove("is-paused"); play(); }
    });
    tog.addEventListener("click", function () {
      if (v.paused) { userPaused = false; card.classList.remove("is-paused"); play(); }
      else { userPaused = true; v.pause(); card.classList.add("is-paused"); }
    });
    if (prefersReduced || !("IntersectionObserver" in window)) { userPaused = true; card.classList.add("is-paused"); return; }
    new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (e.isIntersecting) { if (!userPaused) play(); } else { v.pause(); }
      });
    }, { threshold: 0.55 }).observe(card);
  });

  /* ---------- GALERÍA: ampliar fotos (teclado, gestos, flechas) ---------- */
  var gal = document.querySelector("[data-lightbox]");
  var testDlg = document.createElement("dialog");
  if (gal && typeof testDlg.showModal === "function") {
    var links = [].slice.call(gal.querySelectorAll("a"));
    var dlg = document.createElement("dialog");
    dlg.className = "lightbox";
    dlg.setAttribute("aria-label", T.ui.lbLabel);
    dlg.innerHTML =
      '<button type="button" class="lb-btn lb-close" aria-label="' + T.ui.lbClose + '">×</button>' +
      '<button type="button" class="lb-btn lb-prev" aria-label="' + T.ui.lbPrev + '">‹</button>' +
      '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button type="button" class="lb-btn lb-next" aria-label="' + T.ui.lbNext + '">›</button>';
    document.body.appendChild(dlg);
    var lbImg = dlg.querySelector("img"), lbCap = dlg.querySelector("figcaption"), cur = 0;
    var show = function (i) {
      cur = (i + links.length) % links.length;
      var a = links[cur], th = a.querySelector("img");
      lbImg.src = a.getAttribute("href");
      lbImg.alt = th ? th.alt : "";
      lbCap.textContent = th ? th.alt : "";
      [1, -1].forEach(function (d) { (new Image()).src = links[(cur + d + links.length) % links.length].getAttribute("href"); });
    };
    links.forEach(function (a, i) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        show(i);
        dlg.showModal();
        document.documentElement.classList.add("lb-open");
      });
    });
    dlg.querySelector(".lb-close").addEventListener("click", function () { dlg.close(); });
    dlg.querySelector(".lb-prev").addEventListener("click", function () { show(cur - 1); });
    dlg.querySelector(".lb-next").addEventListener("click", function () { show(cur + 1); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("close", function () { document.documentElement.classList.remove("lb-open"); });
    dlg.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") show(cur + 1);
      else if (e.key === "ArrowLeft") show(cur - 1);
    });
    var tx = null;
    dlg.addEventListener("touchstart", function (e) { tx = e.changedTouches[0].clientX; }, { passive: true });
    dlg.addEventListener("touchend", function (e) {
      if (tx === null) return;
      var dx = e.changedTouches[0].clientX - tx; tx = null;
      if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  /* ---------- BARRA FIJA MÓVIL: aparece tras el hero ---------- */
  var mcta = document.querySelector(".mobile-cta");
  if (mcta) {
    if (hero && "IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        mcta.classList.toggle("show", !entries[0].isIntersecting);
      }, { threshold: 0.15 }).observe(hero);
    } else {
      mcta.classList.add("show");
    }
  }

  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
