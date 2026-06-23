/* ============================================================
   ZUZI TOURS — Front-end controller
   Handles: theming, header behaviour, mobile menu, data-driven
   rendering of tour cards + the dynamic tour detail page, and
   wiring all WhatsApp / contact links from config.js.
   ============================================================ */

(function () {
  "use strict";

  const CFG = window.ZUZI_CONFIG || {};
  const TOURS = window.ZUZI_TOURS || [];

  /* ---------- small helpers ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const escapeHTML = (str) =>
    String(str ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));

  const money = window.zuziMoney || ((n) => n);
  const wa = window.zuziWhatsApp || ((m) => "#");

  const getTour = (id) => TOURS.find((t) => t.id === id);

  /* =====================================================
     THEME
     ===================================================== */
  function initTheme() {
    const root = document.documentElement;
    const saved = localStorage.getItem("zuzi-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = saved || (prefersDark ? "dark" : "light");
    root.setAttribute("data-theme", theme);
    updateThemeIcon(theme);

    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".theme-toggle");
      if (!btn) return;
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      localStorage.setItem("zuzi-theme", next);
      updateThemeIcon(next);
    });
  }

  function updateThemeIcon(theme) {
    $$(".theme-toggle").forEach((btn) => {
      btn.innerHTML = theme === "dark"
        ? '<i class="ri-sun-line"></i>'
        : '<i class="ri-moon-line"></i>';
      btn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    });
  }

  /* =====================================================
     HEADER (scroll state + mobile menu)
     ===================================================== */
  function initHeader() {
    const header = $(".header-layout");
    if (header) {
      const onScroll = () => header.classList.toggle("active", window.scrollY > 60);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    const menuBtn = $(".menu-btn");
    const mobileMenu = $(".mobile-menu");
    if (menuBtn && mobileMenu) {
      const toggle = (open) => {
        const willOpen = open ?? !mobileMenu.classList.contains("open");
        mobileMenu.classList.toggle("open", willOpen);
        menuBtn.innerHTML = willOpen
          ? '<i class="ri-close-line"></i>'
          : '<i class="ri-menu-line"></i>';
        menuBtn.setAttribute("aria-expanded", String(willOpen));
      };
      menuBtn.addEventListener("click", () => toggle());
      $$(".mobile-nav a", mobileMenu).forEach((a) =>
        a.addEventListener("click", () => toggle(false))
      );
      document.addEventListener("click", (e) => {
        if (!mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) toggle(false);
      });
    }
  }

  /* =====================================================
     BACK TO TOP
     ===================================================== */
  function initBackToTop() {
    const btn = $(".to-top");
    if (!btn) return;
    const onScroll = () => btn.classList.toggle("show", window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    btn.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    );
  }

  /* =====================================================
     CONFIG-DRIVEN LINK WIRING (single source of truth)
     Sets hrefs/text for every contact + WhatsApp element.
     ===================================================== */
  function wireConfig() {
    $$("[data-whatsapp-display]").forEach(
      (el) => (el.textContent = CFG.whatsappDisplay || "")
    );
    $$("[data-phone]").forEach((el) => (el.href = "tel:" + String(CFG.phone).replace(/\s/g, "")));
    $$("[data-phone-display]").forEach((el) => (el.textContent = CFG.phone || ""));
    $$("[data-email]").forEach((el) => (el.href = "mailto:" + CFG.email));
    $$("[data-email-display]").forEach((el) => (el.textContent = CFG.email || ""));
    $$("[data-location-display]").forEach((el) => (el.textContent = CFG.location || ""));

    if (CFG.social) {
      $$("[data-social-instagram]").forEach((el) => (el.href = CFG.social.instagram || "#"));
      $$("[data-social-facebook]").forEach((el) => (el.href = CFG.social.facebook || "#"));
      $$("[data-social-tiktok]").forEach((el) => (el.href = CFG.social.tiktok || "#"));
      $$("[data-social-tripadvisor]").forEach((el) => (el.href = CFG.social.tripadvisor || "#"));
    }

    // WhatsApp links: <a data-wa> uses href, <button data-wa> opens window
    $$("[data-wa]").forEach((el) => {
      const msg = el.getAttribute("data-wa-msg") || "";
      const url = wa(msg);
      if (el.tagName === "A") {
        el.href = url;
        el.target = "_blank";
        el.rel = "noopener";
      } else {
        el.addEventListener("click", () => window.open(url, "_blank", "noopener"));
      }
    });
  }

  /* =====================================================
     BUILD A TOUR CARD (used on home + related)
     ===================================================== */
  function tourCardHTML(t) {
    return `
      <a class="tour-card" href="tour.html?id=${encodeURIComponent(t.id)}">
        <div class="media">
          <img src="${escapeHTML(t.image)}" alt="${escapeHTML(t.name)}" loading="lazy">
          <span class="region-tag"><i class="ri-map-pin-2-line"></i> ${escapeHTML(t.region)}</span>
          <span class="price-tag">${money(t.price)}</span>
        </div>
        <div class="body">
          <div class="rating">
            <i class="ri-star-fill"></i> <b>${t.rating ?? "5.0"}</b>
            <span>(${(t.reviews ?? 0).toLocaleString()} reviews)</span>
          </div>
          <h3>${escapeHTML(t.name)}</h3>
          <p class="desc">${escapeHTML(t.cardDesc)}</p>
          <div class="card-foot">
            <span class="duration"><i class="ri-time-line"></i> ${escapeHTML(t.durationShort)}</span>
            <span class="view-link">View tour <i class="ri-arrow-right-line"></i></span>
          </div>
        </div>
      </a>`;
  }

  function renderHomeCards() {
    const grid = $("#tour-grid");
    if (!grid) return;
    grid.innerHTML = TOURS.map(tourCardHTML).join("");
  }

  /* =====================================================
     RENDER TOUR DETAIL PAGE (tour.html?id=…)
     ===================================================== */
  function renderDetail() {
    const root = $("#tour-detail");
    if (!root) return;

    const params = new URLSearchParams(window.location.search);
    const tour = getTour(params.get("id"));

    if (!tour) {
      renderNotFound(root);
      return;
    }

    document.title = `${tour.name} — Zuzi Tours`;

    const bookingMsg =
      `Hello Zuzi Tours! 👋 I'd like to book the *${tour.name}* tour ` +
      `(${tour.duration}). Listed price: ${money(tour.price)} ${tour.priceUnit || "per person"}. ` +
      `Could you share availability & next departure dates? Thank you!`;

    const highlights = (tour.highlights || [])
      .map(
        (h) => `
        <div class="highlight">
          <i class="${escapeHTML(h.icon)}"></i>
          <span>${escapeHTML(h.title)}</span>
        </div>`
      )
      .join("");

    const galleryItems = (tour.gallery || [])
      .map(
        (g) => `
        <figure class="gallery-item">
          <img src="${escapeHTML(g.src)}" alt="${escapeHTML(g.caption || tour.name)}" loading="lazy">
          <figcaption><i class="ri-camera-line"></i> ${escapeHTML(g.caption || "")}</figcaption>
        </figure>`
      )
      .join("");

    const galleryCount = (tour.gallery || []).length;

    const itinerary = (tour.itinerary || [])
      .map(
        (s) => `
        <div class="timeline-item">
          <div class="t-time">${escapeHTML(s.time)}</div>
          <div class="t-title">${escapeHTML(s.title)}</div>
          <div class="t-text">${escapeHTML(s.text)}</div>
        </div>`
      )
      .join("");

    const included = (tour.included || [])
      .map((i) => `<li><i class="ri-checkbox-circle-line"></i> <span>${escapeHTML(i)}</span></li>`)
      .join("");
    const excluded = (tour.excluded || [])
      .map((i) => `<li><i class="ri-close-circle-line"></i> <span>${escapeHTML(i)}</span></li>`)
      .join("");

    root.innerHTML = `
      <section class="tour-hero">
        <img class="bg" src="${escapeHTML(tour.image)}" alt="${escapeHTML(tour.name)}">
        <div class="scrim"></div>
        <div class="inner">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="index.html">Home</a>
            <i class="ri-arrow-right-s-line"></i>
            <span>Tours</span>
            <i class="ri-arrow-right-s-line"></i>
            <span>${escapeHTML(tour.name)}</span>
          </nav>
          <h1>${escapeHTML(tour.name)}</h1>
          <p class="tagline">${escapeHTML(tour.tagline || "")}</p>
          <div class="quick-facts">
            <span class="fact-chip"><i class="ri-time-line"></i> ${escapeHTML(tour.duration)}</span>
            <span class="fact-chip"><i class="ri-map-pin-2-line"></i> ${escapeHTML(tour.region)}</span>
            <span class="fact-chip"><i class="ri-star-fill"></i> ${tour.rating ?? "5.0"} (${(tour.reviews ?? 0).toLocaleString()})</span>
            <span class="fact-chip"><i class="ri-user-smile-line"></i> ${escapeHTML(tour.bestFor || "All travellers")}</span>
          </div>
        </div>
      </section>

      <div class="tour-body">
        <article class="tour-main">
          <h2><i class="ri-information-line"></i> About this experience</h2>
          <p class="lead">${escapeHTML(tour.longDesc)}</p>

          ${highlights ? `<h2><i class="ri-star-smile-line"></i> Highlights</h2><div class="highlights-grid">${highlights}</div>` : ""}

          ${galleryItems ? `
          <h2><i class="ri-gallery-line"></i> Past Trips Gallery</h2>
          <p class="mini-sub">Real moments captured by our travellers in ${escapeHTML(tour.name)}.</p>
          <button class="btn btn-primary gallery-toggle" data-count="${galleryCount}" aria-expanded="false" aria-controls="gallery-grid">
            <i class="ri-image-2-line"></i>
            <span class="gt-label">View ${galleryCount} photos</span>
            <i class="ri-arrow-down-s-line gt-icon"></i>
          </button>
          <div class="gallery-collapse" id="gallery-grid">
            <div class="gallery-collapse-inner">
              <div class="gallery-grid">${galleryItems}</div>
            </div>
          </div>` : ""}

          ${itinerary ? `<h2><i class="ri-route-line"></i> Itinerary</h2><div class="timeline">${itinerary}</div>` : ""}

          ${(included || excluded) ? `
          <h2><i class="ri-list-check-2"></i> Good to know</h2>
          <div class="incl-excl">
            <div class="box incl">
              <h4><i class="ri-checkbox-circle-line"></i> What's included</h4>
              <ul>${included}</ul>
            </div>
            <div class="box excl">
              <h4><i class="ri-close-circle-line"></i> Not included</h4>
              <ul>${excluded}</ul>
            </div>
          </div>` : ""}
        </article>

        <aside class="tour-aside">
          <div class="booking-card">
            <div class="bc-top">
              <div class="price">
                <span class="amount">${money(tour.price)}</span>
                <span class="unit">${escapeHTML(tour.priceUnit || "per person")}</span>
              </div>
            </div>
            <div class="bc-list">
              <div class="bc-row"><i class="ri-time-line"></i><span><b>Duration</b>${escapeHTML(tour.duration)}</span></div>
              <div class="bc-row"><i class="ri-group-line"></i><span><b>Group</b>Small groups · private option</span></div>
              <div class="bc-row"><i class="ri-car-line"></i><span><b>Pickup</b>Hotel pick-up & drop-off</span></div>
              <div class="bc-row"><i class="ri-user-voice-line"></i><span><b>Guide</b>Licensed Egyptologist</span></div>
              <div class="bc-row"><i class="ri-shield-check-line"></i><span><b>Booking</b>Free reservation · pay later</span></div>
            </div>
            <div class="bc-actions">
              <a class="btn btn-whatsapp" data-wa data-wa-msg="${escapeHTML(bookingMsg)}">
                <i class="ri-whatsapp-line"></i> Book Now on WhatsApp
              </a>
              <a class="btn btn-primary" data-wa data-wa-msg="Hi Zuzi Tours! I have a question about the ${tour.name} tour.">
                <i class="ri-chat-3-line"></i> Ask a question
              </a>
              <p class="trust"><i class="ri-shield-check-line"></i> No payment now · Confirm dates in chat</p>
            </div>
          </div>
        </aside>
      </div>`;

    renderRelated(tour.id);
  }

  function renderRelated(currentId) {
    const wrap = $("#related-tours");
    if (!wrap) return;
    const related = TOURS.filter((t) => t.id !== currentId).slice(0, 3);
    if (!related.length) return;
    const grid = document.createElement("div");
    grid.className = "card-grid";
    grid.innerHTML = related.map(tourCardHTML).join("");
    wrap.appendChild(grid);
  }

  function renderNotFound(root) {
    document.title = "Tour not found — Zuzi Tours";
    root.innerHTML = `
      <section style="min-height:70vh;display:grid;place-items:center;text-align:center;padding:120px 24px;">
        <div>
          <div style="font-size:3rem;color:var(--color-brand-accent)"><i class="ri-compass-discover-line"></i></div>
          <h1 style="font-family:var(--font-display);font-size:2.2rem;margin:12px 0;">We couldn't find that tour</h1>
          <p style="color:var(--color-text-secondary);max-width:46ch;margin:0 auto 26px;">
            The trip you're looking for may have moved. Browse all our Egyptian adventures instead.
          </p>
          <a class="btn btn-primary" href="index.html#tours"><i class="ri-arrow-left-line"></i> Back to all tours</a>
        </div>
      </section>`;
  }

  /* =====================================================
     GALLERY — toggle reveal + lightbox (event delegation
     so it works on the dynamically rendered detail page)
     ===================================================== */
  function initGallery() {
    let lightbox = null;
    let lbImages = [];
    let lbIndex = 0;

    function ensureLightbox() {
      if (lightbox) return lightbox;
      lightbox = document.createElement("div");
      lightbox.className = "lightbox";
      lightbox.setAttribute("role", "dialog");
      lightbox.setAttribute("aria-modal", "true");
      lightbox.innerHTML = `
        <button class="lb-close" aria-label="Close gallery"><i class="ri-close-line"></i></button>
        <button class="lb-nav lb-prev" aria-label="Previous photo"><i class="ri-arrow-left-s-line"></i></button>
        <figure class="lb-figure">
          <img class="lb-img" src="" alt="">
          <figcaption class="lb-caption"></figcaption>
        </figure>
        <button class="lb-nav lb-next" aria-label="Next photo"><i class="ri-arrow-right-s-line"></i></button>
        <span class="lb-count"></span>`;
      document.body.appendChild(lightbox);

      lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox || e.target.closest(".lb-close")) closeLightbox();
        else if (e.target.closest(".lb-prev")) showImg(lbIndex - 1);
        else if (e.target.closest(".lb-next")) showImg(lbIndex + 1);
      });
      document.addEventListener("keydown", (e) => {
        if (!lightbox.classList.contains("open")) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") showImg(lbIndex - 1);
        if (e.key === "ArrowRight") showImg(lbIndex + 1);
      });
      return lightbox;
    }

    function openLightbox(items, startIndex) {
      lbImages = items;
      lbIndex = startIndex;
      ensureLightbox();
      showImg(lbIndex);
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
    }

    function showImg(i) {
      if (!lbImages.length) return;
      lbIndex = (i + lbImages.length) % lbImages.length;
      const item = lbImages[lbIndex];
      const img = lightbox.querySelector(".lb-img");
      const cap = lightbox.querySelector(".lb-caption");
      const cnt = lightbox.querySelector(".lb-count");
      img.src = item.src;
      img.alt = item.caption || "";
      cap.textContent = item.caption || "";
      cnt.textContent = `${lbIndex + 1} / ${lbImages.length}`;
    }

    function closeLightbox() {
      if (!lightbox) return;
      lightbox.classList.remove("open");
      document.body.style.overflow = "";
    }

    document.addEventListener("click", (e) => {
      // Toggle button: reveal / hide the grid
      const toggle = e.target.closest(".gallery-toggle");
      if (toggle) {
        const collapse = toggle.nextElementSibling;
        if (!collapse) return;
        const isOpen = collapse.classList.toggle("open");
        toggle.classList.toggle("open", isOpen);
        toggle.setAttribute("aria-expanded", String(isOpen));
        const count = toggle.getAttribute("data-count") || "";
        const label = toggle.querySelector(".gt-label");
        if (label) label.textContent = isOpen ? "Hide photos" : `View ${count} photos`;
        if (isOpen) {
          setTimeout(
            () => collapse.scrollIntoView({ behavior: "smooth", block: "nearest" }),
            120
          );
        }
        return;
      }

      // Click a gallery photo: open the lightbox
      const item = e.target.closest(".gallery-item img");
      if (item) {
        const grid = item.closest(".gallery-grid");
        const imgs = Array.from(grid.querySelectorAll(".gallery-item img"));
        const items = imgs.map((im) => ({
          src: im.src,
          caption: im.alt,
        }));
        openLightbox(items, imgs.indexOf(item));
      }
    });
  }

  /* =====================================================
     BOOT
     ===================================================== */
  function init() {
    initTheme();
    initHeader();
    initBackToTop();
    initGallery();
    renderHomeCards();
    renderDetail();
    wireConfig(); // runs after render so dynamically-added links are wired too
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
