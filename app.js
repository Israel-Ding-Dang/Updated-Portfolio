/* ISRAEL 2.0 - shared engine: nav, transitions, motion, lightbox */
(function () {
  "use strict";

  var html = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var desktop = window.matchMedia("(min-width: 769px)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  var page = document.body.getAttribute("data-page") || "";

  if (reduced) html.classList.add("no-motion");
  if (!hasGsap) html.classList.add("no-gsap");
  var motionOn = hasGsap && !reduced;
  if (motionOn) {
    gsap.registerPlugin(ScrollTrigger);
    /* re-measure after full load (late fonts/images/viewport settle) */
    window.addEventListener("load", function () {
      ScrollTrigger.refresh();
      setTimeout(function () { ScrollTrigger.refresh(); }, 600);
    });
  }

  /* ================= NAV ================= */
  var nav = document.querySelector(".nav");
  function onScroll() {
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var toggle = document.querySelector(".nav-toggle");
  var overlay = document.querySelector(".menu-overlay");
  if (toggle && overlay) {
    toggle.addEventListener("click", function () {
      var open = overlay.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "Close" : "Menu";
      document.body.style.overflow = open ? "hidden" : "";
    });
    overlay.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        overlay.classList.remove("open");
        document.body.style.overflow = "";
      }
    });
  }

  /* ============ PAGE TRANSITION FALLBACK ============ */
  var hasVT = "startViewTransition" in document;
  if (!hasVT && !reduced) {
    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest("a") : null;
      if (!a) return;
      var href = a.getAttribute("href") || "";
      if (a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey) return;
      if (!/\.html($|#)/.test(href) && href !== "index.html") return;
      if (href.indexOf("http") === 0 || href.indexOf("#") === 0 || href.indexOf("mailto:") === 0) return;
      e.preventDefault();
      document.body.classList.add("page-exit");
      setTimeout(function () { window.location.href = href; }, 180);
    });
    window.addEventListener("pageshow", function (e) {
      if (e.persisted) document.body.classList.remove("page-exit");
    });
  }

  /* ============ GENERIC REVEALS [data-rv] ============ */
  if (motionOn) {
    gsap.utils.toArray("[data-rv]").forEach(function (el) {
      var delay = parseFloat(el.getAttribute("data-rv")) || 0;
      /* entrance beat: elements already in the first viewport play on load,
         everything else reveals on scroll */
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) {
        gsap.from(el, { y: 36, opacity: 0, duration: .7, ease: "power3.out", delay: .05 + delay });
      } else {
        gsap.from(el, {
          y: 36, opacity: 0, duration: .85, ease: "power3.out", delay: delay,
          scrollTrigger: { trigger: el, start: "top 88%", once: true }
        });
      }
    });
  }

  /* ============ PROJECT REGISTRY + LIGHTBOX ============ */
  var projects = {
    "little-yogi": {
      no: "01",
      title: "Little Yogi",
      role: "Front-end & Backend Developer",
      desc: "A booking system where parents log in to their accounts and book yoga classes for their children. Payments are handled with Stripe, and every successful booking updates the studio's Outlook calendar with the child's details. Inside their account, parents can also see photos of their children taken during sessions, uploaded from the admin side.",
      tags: ["Webflow", "Wized", "Xano", "Stripe"],
      video: "assets/video/little-yogi.mp4",
      poster: "assets/img/poster-little-yogi.jpg"
    },
    "jobs-board": {
      no: "02",
      title: "Assisting Work · Jobs Board",
      role: "Fullstack Developer",
      desc: "A jobs board where employers sign up and post openings for their company. After payment, each job is reviewed and listed among the approved openings. Any user can apply, and their application is routed straight back to the person who posted the job.",
      tags: ["Webflow", "Wized", "Xano", "Payments"],
      video: "assets/video/jobs-board.mp4",
      poster: "assets/img/poster-jobs-board.jpg"
    },
    "bartending": {
      no: "03",
      title: "About Town Bartending",
      role: "Fullstack Webflow Developer",
      desc: "A pricing calculator for a bartending website, built with Webflow, Wized and Airtable. Package prices were mapped first, the UI designed to the client's preference, then connected to Wized functions. User data is stored in Airtable so the client can measure how the calculator performs over time, with automated emails sent to users who book a date through the final step.",
      tags: ["Webflow", "Wized", "Airtable", "Automation"],
      video: "assets/video/bartending.mp4",
      poster: "assets/img/poster-bartending.jpg"
    },
    "questworks": {
      no: "04",
      title: "QuestWorks",
      role: "Backend Specialist",
      desc: "A gaming application where players log in to a dashboard to track their progress, and their competitors', across allocated teams. Airtable stores all user metric data, Wized acts as the server layer sending requests to retrieve and manipulate it, and Webflow delivers the front end players interact with.",
      tags: ["Webflow", "Wized", "Airtable"],
      video: "assets/video/questworks.mp4",
      poster: "assets/img/poster-questworks.jpg"
    }
  };

  var lightbox = document.getElementById("lightbox");
  var lastFocused = null;

  function openLightbox(id) {
    var p = projects[id];
    if (!p || !lightbox) return;
    lastFocused = document.activeElement;
    document.getElementById("lb-no").textContent = "Case no. " + p.no;
    document.getElementById("lb-title").textContent = p.title;
    document.getElementById("lb-role").innerHTML = "Role · <b>" + p.role + "</b>";
    document.getElementById("lb-desc").textContent = p.desc;
    var tags = document.getElementById("lb-tags");
    tags.innerHTML = "";
    p.tags.forEach(function (t) {
      var li = document.createElement("li");
      li.textContent = t;
      tags.appendChild(li);
    });
    var v = document.getElementById("lb-video");
    v.setAttribute("poster", p.poster);
    v.src = p.video;
    lightbox.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
    lightbox.querySelector(".lightbox-close").focus();
    var attempt = v.play();
    if (attempt && attempt.catch) attempt.catch(function () {});
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hasAttribute("hidden")) return;
    var v = document.getElementById("lb-video");
    v.pause();
    v.removeAttribute("src");
    v.load();
    lightbox.setAttribute("hidden", "");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  if (lightbox) {
    lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (lightbox.hasAttribute("hidden")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "Tab") {
        var f = lightbox.querySelectorAll("button, video, [href]");
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    document.querySelectorAll("[data-open]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        openLightbox(el.getAttribute("data-open"));
      });
    });
  }

  /* pointer-fine 3D tilt helper */
  function attachTilt(wrap, target, maxX, maxY) {
    if (!finePointer || reduced) return;
    wrap.addEventListener("mousemove", function (e) {
      var r = wrap.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width;
      var y = (e.clientY - r.top) / r.height;
      target.style.transform =
        "rotateX(" + ((0.5 - y) * maxX).toFixed(2) + "deg) rotateY(" + ((x - 0.5) * maxY).toFixed(2) + "deg)";
    });
    wrap.addEventListener("mouseleave", function () {
      target.style.transform = "";
    });
  }

  /* ================= HOME ================= */
  if (page === "home") {

    /* headline letters */
    var title = document.querySelector(".hero-title");
    if (title && motionOn) {
      var lineEls = title.querySelectorAll(".hl-line");
      var targets = lineEls.length ? Array.prototype.slice.call(lineEls) : [title];
      targets.forEach(function (line) {
        var words = line.textContent.trim().split(/\s+/);
        line.textContent = "";
        words.forEach(function (w, wi) {
          var span = document.createElement("span");
          span.className = "word";
          for (var i = 0; i < w.length; i++) {
            var c = document.createElement("span");
            c.className = "ch";
            c.textContent = w[i];
            span.appendChild(c);
          }
          line.appendChild(span);
          if (wi < words.length - 1) line.appendChild(document.createTextNode(" "));
        });
      });
      gsap.from(".hero-title .ch", {
        yPercent: 115, opacity: 0,
        duration: .9, ease: "power3.out",
        stagger: .028, delay: .25
      });
      gsap.from(".hero-cta, .hero-mono", {
        y: 24, opacity: 0, duration: .8, ease: "power3.out", delay: 1.05, stagger: .12
      });
    }

    /* mono typer */
    var typer = document.querySelector("[data-typer]");
    if (typer) {
      var full = typer.getAttribute("data-typer");
      var out = typer.querySelector(".t-out");
      if (!motionOn) {
        out.textContent = full;
      } else {
        var idx = 0;
        setTimeout(function tick() {
          out.textContent = full.slice(0, ++idx);
          if (idx < full.length) setTimeout(tick, 26);
        }, 1400);
      }
    }

    /* totem scrub */
    if (motionOn && desktop) {
      var tl = gsap.timeline({
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom bottom", scrub: 0.8 },
        defaults: { ease: "none" }
      });
      tl.to(".totem", { rotateY: 342, rotateX: 8, scale: 1.05 }, 0)
        .to(".slab-1", { y: -88 }, 0)
        .to(".slab-3", { y: 88 }, 0)
        .to(".hero-bg", { yPercent: 6 }, 0);
    } else {
      /* settled state without scrub */
      var s1 = document.querySelector(".slab-1");
      var s3 = document.querySelector(".slab-3");
      if (s1) s1.style.transform = "translateY(-88px)";
      if (s3) s3.style.transform = "translateY(88px)";
      if (motionOn && !desktop) {
        gsap.to(".totem", { rotateY: 342, duration: 34, ease: "none", repeat: -1 });
      }
    }

    /* data counters */
    var strip = document.querySelector(".data-strip");
    if (strip && "IntersectionObserver" in window) {
      var counted = false;
      new IntersectionObserver(function (entries, io) {
        if (!entries[0].isIntersecting || counted) return;
        counted = true;
        io.disconnect();
        strip.querySelectorAll("[data-count]").forEach(function (el) {
          var target = parseInt(el.getAttribute("data-count"), 10);
          var suffix = el.getAttribute("data-suffix") || "";
          if (reduced) { el.textContent = target + suffix; return; }
          var t0 = performance.now();
          (function step(t) {
            var k = Math.min((t - t0) / 1200, 1);
            el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))) + suffix;
            if (k < 1) requestAnimationFrame(step);
          })(t0);
        });
      }, { threshold: .4 }).observe(strip);
    }

    /* services beats */
    var svcPanels = document.querySelectorAll(".svc-panel");
    var svcBgs = document.querySelectorAll(".svc-bg");
    var svcDots = document.querySelectorAll(".svc-progress i");
    function svcActivate(i) {
      svcPanels.forEach(function (p, n) { p.classList.toggle("is-active", n === i); });
      svcBgs.forEach(function (b, n) { b.classList.toggle("is-active", n === i); });
      svcDots.forEach(function (d, n) { d.classList.toggle("is-active", n <= i); });
    }
    if (motionOn && desktop && svcPanels.length) {
      svcActivate(0);
      ScrollTrigger.create({
        trigger: ".svc", start: "top top", end: "bottom bottom", scrub: true,
        onUpdate: function (self) {
          svcActivate(Math.min(2, Math.floor(self.progress * 3)));
        }
      });
      gsap.to(".svc-bgs", {
        yPercent: 4, ease: "none",
        scrollTrigger: { trigger: ".svc", start: "top top", end: "bottom bottom", scrub: true }
      });
    } else {
      svcActivate(0);
    }

    /* screening room */
    var ex1 = document.querySelector("[data-exhibit='1']");
    var ex2 = document.querySelector("[data-exhibit='2']");
    if (motionOn && desktop && ex1 && ex2) {
      gsap.set(ex2, { opacity: 0, visibility: "hidden" });
      var stl = gsap.timeline({
        scrollTrigger: { trigger: ".screening", start: "top top", end: "bottom bottom", scrub: 0.8 },
        defaults: { ease: "none" }
      });
      stl.fromTo(ex1,
          { opacity: 0, y: 110, z: -420, rotateX: 9, visibility: "visible" },
          { opacity: 1, y: 0, z: 0, rotateX: 0, duration: .16 }, 0)
        .to(ex1, { opacity: 1, duration: .26 })
        .to(ex1, { opacity: 0, y: -130, rotateX: -7, duration: .14 })
        .set(ex1, { visibility: "hidden" })
        .set(ex2, { visibility: "visible" })
        .fromTo(ex2,
          { opacity: 0, y: 110, z: -420, rotateX: 9 },
          { opacity: 1, y: 0, z: 0, rotateX: 0, duration: .16 }, ">-.02")
        .to(ex2, { opacity: 1, duration: .28 });
    }
    document.querySelectorAll(".exhibit").forEach(function (ex) {
      var tiltTarget = ex.querySelector(".exhibit-tilt");
      attachTilt(ex, tiltTarget, 6, 9);
      var vid = ex.querySelector("video");
      if (vid && finePointer && !reduced) {
        ex.addEventListener("mouseenter", function () {
          if (!vid.getAttribute("src")) vid.src = vid.getAttribute("data-src");
          ex.classList.add("is-live");
          var a = vid.play(); if (a && a.catch) a.catch(function () {});
        });
        ex.addEventListener("mouseleave", function () {
          ex.classList.remove("is-live");
          vid.pause();
          try { vid.currentTime = 0; } catch (err) {}
        });
      }
    });
  }

  /* ================= WORK ================= */
  if (page === "work") {
    if (motionOn) {
      gsap.utils.toArray(".panel").forEach(function (panel) {
        gsap.from(panel, {
          y: 70, opacity: 0, rotateX: 5, transformOrigin: "center bottom",
          duration: .95, ease: "power3.out",
          scrollTrigger: { trigger: panel, start: "top 84%", once: true }
        });
      });
    }
    document.querySelectorAll(".panel-frame").forEach(function (frame) {
      var media = frame.querySelector(".pf-media");
      attachTilt(frame, media, 4, 6);
    });
    /* deep link: work.html#questworks opens the case */
    var hash = window.location.hash.replace("#", "");
    if (hash && projects[hash]) {
      setTimeout(function () { openLightbox(hash); }, 450);
    }
  }

  /* ================= ABOUT ================= */
  if (page === "about") {
    var steps = document.querySelectorAll(".p-step");
    var stepVis = document.querySelectorAll(".p-vis");
    function stepActivate(i) {
      steps.forEach(function (s, n) { s.classList.toggle("is-active", n === i); });
      stepVis.forEach(function (v, n) { v.classList.toggle("is-active", n === i); });
    }
    if (motionOn && desktop && steps.length) {
      stepActivate(0);
      ScrollTrigger.create({
        trigger: ".process", start: "top top", end: "bottom bottom", scrub: true,
        onUpdate: function (self) {
          stepActivate(Math.min(steps.length - 1, Math.floor(self.progress * steps.length)));
        }
      });
    } else {
      stepActivate(0);
    }
  }

})();
