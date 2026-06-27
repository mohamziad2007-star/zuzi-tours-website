(function () {
  "use strict";

  const CFG = window.ZUZI_CONFIG || {};
  const TOURS = window.ZUZI_TOURS || [];
  const t = window.t || ((k) => k);
  const zuziTour = window.zuziTour || ((tour) => tour);

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

  const wa = window.zuziWhatsApp || ((m) => "#");

  const getTour = (id) => TOURS.find((t) => t.id === id);

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
//Header controls
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

    $$("[data-wa]").forEach((el) => {
      let msg = el.getAttribute("data-wa-msg") || "";
      const key = el.getAttribute("data-wa-key");
      if (key) msg = t(key);
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

  function tourCardHTML(rawTour) {
    const tour = zuziTour(rawTour);
    return `
      <a class="tour-card" href="tour.html?id=${encodeURIComponent(tour.id)}">
        <div class="media">
          <img src="${escapeHTML(tour.image)}" alt="${escapeHTML(tour.name)}" loading="lazy">
          <span class="region-tag"><i class="ri-map-pin-2-line"></i> ${escapeHTML(tour.region)}</span>
        </div>
        <div class="body">
          <div class="rating">
            <i class="ri-star-fill"></i> <b>${tour.rating ?? "5.0"}</b>
            <span>(${(tour.reviews ?? 0).toLocaleString()} ${escapeHTML(t("tours.reviews"))})</span>
          </div>
          <h3>${escapeHTML(tour.name)}</h3>
          <p class="desc">${escapeHTML(tour.cardDesc)}</p>
          <div class="card-foot">
            <span class="duration"><i class="ri-time-line"></i> ${escapeHTML(tour.durationShort)}</span>
            <span class="view-link">${escapeHTML(t("tours.viewTour"))} <i class="ri-arrow-right-line"></i></span>
          </div>
        </div>
      </a>`;
  }

  function renderHomeCards() {
    const grid = $("#tour-grid");
    if (!grid) return;
    grid.innerHTML = TOURS.map(tourCardHTML).join("");
  }

  function renderDetail() {
    const root = $("#tour-detail");
    if (!root) return;

    const params = new URLSearchParams(window.location.search);
    const rawTour = getTour(params.get("id"));

    if (!rawTour) {
      renderNotFound(root);
      return;
    }

    const tour = zuziTour(rawTour);
    document.title = `${tour.name} — Zuzi Tours`;

    const bookingMsg = t("wa.bookTour")
      .replace("{tour}", tour.name)
      .replace("{duration}", tour.duration);

    const askMsg = t("wa.askTour").replace("{tour}", tour.name);

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
    const viewPhotosLabel = t("detail.viewPhotos").replace("{n}", galleryCount);

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
            <a href="index.html">${escapeHTML(t("detail.home"))}</a>
            <i class="ri-arrow-right-s-line"></i>
            <span>${escapeHTML(t("detail.tours"))}</span>
            <i class="ri-arrow-right-s-line"></i>
            <span>${escapeHTML(tour.name)}</span>
          </nav>
          <h1>${escapeHTML(tour.name)}</h1>
          <p class="tagline">${escapeHTML(tour.tagline || "")}</p>
          <div class="quick-facts">
            <span class="fact-chip"><i class="ri-time-line"></i> ${escapeHTML(tour.duration)}</span>
            <span class="fact-chip"><i class="ri-map-pin-2-line"></i> ${escapeHTML(tour.region)}</span>
            <span class="fact-chip"><i class="ri-star-fill"></i> ${tour.rating ?? "5.0"} (${(tour.reviews ?? 0).toLocaleString()})</span>
            <span class="fact-chip"><i class="ri-user-smile-line"></i> ${escapeHTML(tour.bestFor || "")}</span>
          </div>
        </div>
      </section>

      <div class="tour-body">
        <article class="tour-main">
          <h2><i class="ri-information-line"></i> ${escapeHTML(t("detail.aboutExp"))}</h2>
          <div class="lead">${escapeHTML(tour.longDesc).replace(/\n/g, "<br>")}</div>

          ${highlights ? `<h2><i class="ri-star-smile-line"></i> ${escapeHTML(t("detail.highlights"))}</h2><div class="highlights-grid">${highlights}</div>` : ""}

          ${galleryItems ? `
          <h2><i class="ri-gallery-line"></i> ${escapeHTML(t("detail.gallery"))}</h2>
          <p class="mini-sub">${escapeHTML(t("detail.gallerySub").replace("{place}", tour.name))}</p>
          <button class="btn btn-primary gallery-toggle" data-count="${galleryCount}" aria-expanded="false" aria-controls="gallery-grid">
            <i class="ri-image-2-line"></i>
            <span class="gt-label">${escapeHTML(viewPhotosLabel)}</span>
            <i class="ri-arrow-down-s-line gt-icon"></i>
          </button>
          <div class="gallery-collapse" id="gallery-grid">
            <div class="gallery-collapse-inner">
              <div class="gallery-grid">${galleryItems}</div>
            </div>
          </div>` : ""}

          ${itinerary ? `<h2><i class="ri-route-line"></i> ${escapeHTML(t("detail.itinerary"))}</h2><div class="timeline">${itinerary}</div>` : ""}

          ${(included || excluded) ? `
          <h2><i class="ri-list-check-2"></i> ${escapeHTML(t("detail.goodToKnow"))}</h2>
          <div class="incl-excl">
            <div class="box incl">
              <h4><i class="ri-checkbox-circle-line"></i> ${escapeHTML(t("detail.included"))}</h4>
              <ul>${included}</ul>
            </div>
            <div class="box excl">
              <h4><i class="ri-close-circle-line"></i> ${escapeHTML(t("detail.notIncluded"))}</h4>
              <ul>${excluded}</ul>
            </div>
          </div>` : ""}
        </article>

        <aside class="tour-aside">
          <div class="booking-card">
            <div class="bc-top">
              <div class="bc-heading">
                <span class="bc-title">${escapeHTML(t("detail.bookThis"))}</span>
                <span class="bc-subtitle">${escapeHTML(t("detail.bookThisSub"))}</span>
              </div>
            </div>
            <div class="bc-list">
              <div class="bc-row"><i class="ri-time-line"></i><span><b>${escapeHTML(t("detail.duration"))}</b>${escapeHTML(tour.duration)}</span></div>
              <div class="bc-row"><i class="ri-group-line"></i><span><b>${escapeHTML(t("detail.group"))}</b>${escapeHTML(t("detail.groupVal"))}</span></div>
              <div class="bc-row"><i class="ri-car-line"></i><span><b>${escapeHTML(t("detail.pickup"))}</b>${escapeHTML(t("detail.pickupVal"))}</span></div>
              <div class="bc-row"><i class="ri-user-voice-line"></i><span><b>${escapeHTML(t("detail.guide"))}</b>${escapeHTML(t("detail.guideVal"))}</span></div>
              <div class="bc-row"><i class="ri-shield-check-line"></i><span><b>${escapeHTML(t("detail.booking"))}</b>${escapeHTML(t("detail.bookingVal"))}</span></div>
            </div>
            <div class="bc-actions">
              <a class="btn btn-whatsapp" data-wa data-wa-msg="${escapeHTML(bookingMsg)}">
                <i class="ri-whatsapp-line"></i> ${escapeHTML(t("detail.bookNow"))}
              </a>
              <a class="btn btn-primary" data-wa data-wa-msg="${escapeHTML(askMsg)}">
                <i class="ri-chat-3-line"></i> ${escapeHTML(t("detail.askQuestion"))}
              </a>
              <p class="trust"><i class="ri-shield-check-line"></i> ${escapeHTML(t("detail.trust"))}</p>
            </div>
          </div>
        </aside>
      </div>`;

    renderRelated(tour.id);
  }

  function renderRelated(currentId) {
    const wrap = $("#related-tours");
    if (!wrap) return;
    const related = TOURS.filter((tt) => tt.id !== currentId).slice(0, 3);
    if (!related.length) return;
    const grid = document.createElement("div");
    grid.className = "card-grid";
    grid.innerHTML = related.map(tourCardHTML).join("");
    wrap.appendChild(grid);
  }

  function renderNotFound(root) {
    document.title = t("notFound.title") + " — Zuzi Tours";
    root.innerHTML = `
      <section style="min-height:70vh;display:grid;place-items:center;text-align:center;padding:120px 24px;">
        <div>
          <div style="font-size:3rem;color:var(--color-brand-accent)"><i class="ri-compass-discover-line"></i></div>
          <h1 style="font-family:var(--font-display);font-size:2.2rem;margin:12px 0;">${escapeHTML(t("notFound.title"))}</h1>
          <p style="color:var(--color-text-secondary);max-width:46ch;margin:0 auto 26px;">
            ${escapeHTML(t("notFound.text"))}
          </p>
          <a class="btn btn-primary" href="index.html#tours"><i class="ri-arrow-left-line"></i> ${escapeHTML(t("notFound.btn"))}</a>
        </div>
      </section>`;
  }

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
      const toggle = e.target.closest(".gallery-toggle");
      if (toggle) {
        const collapse = toggle.nextElementSibling;
        if (!collapse) return;
        const isOpen = collapse.classList.toggle("open");
        toggle.classList.toggle("open", isOpen);
        toggle.setAttribute("aria-expanded", String(isOpen));
        const count = toggle.getAttribute("data-count") || "";
        const label = toggle.querySelector(".gt-label");
        if (label)
          label.textContent = isOpen
            ? t("detail.hidePhotos")
            : t("detail.viewPhotos").replace("{n}", count);
        if (isOpen) {
          setTimeout(
            () => collapse.scrollIntoView({ behavior: "smooth", block: "nearest" }),
            120
          );
        }
        return;
      }

      const item = e.target.closest(".gallery-item img");
      if (item) {
        const grid = item.closest(".gallery-grid");
        const imgs = Array.from(grid.querySelectorAll(".gallery-item img"));
        const items = imgs.map((im) => ({ src: im.src, caption: im.alt }));
        openLightbox(items, imgs.indexOf(item));
      }
    });
  }

  function renderAll() {
    renderHomeCards();
    renderDetail();
    wireConfig();
    if (window.zuziApplyTranslations) window.zuziApplyTranslations();
  }
  window.zuziRender = renderAll;

  function init() {
    initTheme();
    initHeader();
    initBackToTop();
    initGallery();
    if (window.zuziInitLangSwitch) window.zuziInitLangSwitch();
    renderAll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
