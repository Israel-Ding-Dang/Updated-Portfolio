/* ISRAEL — portfolio interactions */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (!reducedMotion && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ---------- mobile menu ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.getElementById("nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- project data ---------- */
  var projects = {
    "little-yogi": {
      title: "Little Yogi",
      role: "Front-end & Backend Developer",
      desc: "A booking system where parents log in to their accounts and book yoga classes for their children. Payments are handled with Stripe, and every successful booking updates the studio's Outlook calendar with the child's details. Inside their account, parents can also see photos of their children taken during sessions, uploaded from the admin side.",
      tags: [["Webflow", "chip-turquoise"], ["Wized", "chip-lilac"], ["Xano", "chip-peach"], ["Stripe", "chip-yellow"]],
      video: "assets/video/little-yogi.mp4",
      poster: "assets/img/poster-little-yogi.jpg"
    },
    "jobs-board": {
      title: "Assisting Work — Jobs Board",
      role: "Fullstack Developer",
      desc: "A jobs board where employers sign up and post openings for their company. After payment, each job is reviewed and listed among the approved openings. Any user can apply, and their application is routed straight back to the person who posted the job.",
      tags: [["Webflow", "chip-turquoise"], ["Wized", "chip-lilac"], ["Xano", "chip-peach"], ["Payments", "chip-pink"]],
      video: "assets/video/jobs-board.mp4",
      poster: "assets/img/poster-jobs-board.jpg"
    },
    "bartending": {
      title: "About Town Bartending",
      role: "Fullstack Webflow Developer",
      desc: "A pricing calculator for a bartending website, built with Webflow, Wized and Airtable. Package prices were mapped first, the UI designed to the client's preference, then connected to Wized functions. User data is stored in Airtable so the client can measure how the calculator performs over time — with automated emails sent to users who book a date through the final step.",
      tags: [["Webflow", "chip-turquoise"], ["Wized", "chip-lilac"], ["Airtable", "chip-yellow"], ["Automation", "chip-peach"]],
      video: "assets/video/bartending.mp4",
      poster: "assets/img/poster-bartending.jpg"
    },
    "questworks": {
      title: "QuestWorks",
      role: "Backend Specialist",
      desc: "A gaming application where players log in to a dashboard to track their progress — and their competitors' — across allocated teams. Airtable stores all user metric data, Wized acts as the server layer sending requests to retrieve and manipulate it, and Webflow delivers the front end players interact with.",
      tags: [["Webflow", "chip-turquoise"], ["Wized", "chip-lilac"], ["Airtable", "chip-yellow"]],
      video: "assets/video/questworks.mp4",
      poster: "assets/img/poster-questworks.jpg"
    }
  };

  /* ---------- lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lbTitle = document.getElementById("lb-title");
  var lbRole = document.getElementById("lb-role");
  var lbDesc = document.getElementById("lb-desc");
  var lbChips = document.getElementById("lb-chips");
  var lbVideo = document.getElementById("lb-video");
  var closeBtn = lightbox.querySelector(".lightbox-close");
  var lastFocused = null;

  function openLightbox(id) {
    var p = projects[id];
    if (!p) return;
    lastFocused = document.activeElement;

    lbTitle.textContent = p.title;
    lbRole.textContent = p.role;
    lbDesc.textContent = p.desc;
    lbChips.innerHTML = "";
    p.tags.forEach(function (t) {
      var li = document.createElement("li");
      li.className = "chip " + t[1];
      li.textContent = t[0];
      lbChips.appendChild(li);
    });
    lbVideo.setAttribute("poster", p.poster);
    lbVideo.src = p.video;

    lightbox.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
    closeBtn.focus();

    var playAttempt = lbVideo.play();
    if (playAttempt && playAttempt.catch) playAttempt.catch(function () { /* autoplay blocked — user presses play */ });
  }

  function closeLightbox() {
    lbVideo.pause();
    lbVideo.removeAttribute("src");
    lbVideo.load();
    lightbox.setAttribute("hidden", "");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll(".work-card").forEach(function (card) {
    card.addEventListener("click", function (e) {
      e.preventDefault();
      openLightbox(card.getAttribute("data-project"));
    });
  });

  closeBtn.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", function (e) {
    if (lightbox.hasAttribute("hidden")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "Tab") {
      /* keep focus inside the dialog */
      var focusables = lightbox.querySelectorAll("button, video, [href], [tabindex]:not([tabindex='-1'])");
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  });
})();
