/* ============================================================
   ZUZI TOURS — Global configuration
   ------------------------------------------------------------
   This is the SINGLE source of truth for contact details and
   booking. Update the WhatsApp number / details here once and
   every page + button across the site is updated automatically.
   ============================================================ */

window.ZUZI_CONFIG = {
  brand: "Zuzi Tours",
  tagline: "Experience Egypt, not just a destination.",

  /* ---- WhatsApp / Booking -----------------------------------
     International format, DIGITS ONLY (no "+", spaces or dashes).
     Replace the placeholder below with the real number.       */
  whatsapp: "201000000000",
  whatsappDisplay: "+20 100 000 0000",

  phone: "+20 100 000 0000",
  email: "hello@zuzitours.com",

  /* Location shown in the footer */
  location: "Hurghada & Marsa Alam, Red Sea — Egypt",
  areasServed: [
    "Luxor",
    "Aswan",
    "Abu Simbel",
    "Giza Pyramids",
    "Marsa Alam",
    "Hurghada",
  ],

  /* Operating hours */
  hours: "Every day · 8:00 AM – 10:00 PM (EET)",

  /* Social links (replace # with real URLs) */
  social: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    tiktok: "https://tiktok.com/",
    tripadvisor: "https://tripadvisor.com/",
  },

  /* Currency formatting */
  currency: "EGP",
  locale: "en-US",
};

/* ------------------------------------------------------------
   Helper: build a pre-filled WhatsApp chat link.
   wa.me requires a digits-only number + url-encoded message.
   ------------------------------------------------------------ */
window.zuziWhatsApp = function (message) {
  const number = String(window.ZUZI_CONFIG.whatsapp || "").replace(/\D/g, "");
  const text = encodeURIComponent(
    message ||
      "Hello Zuzi Tours! I would like to know more about your tours in Egypt."
  );
  return `https://wa.me/${number}?text=${text}`;
};

/* Helper: format a number as currency (e.g. 1800 -> "1,800 EGP") */
window.zuziMoney = function (amount) {
  const formatted = new Intl.NumberFormat(window.ZUZI_CONFIG.locale).format(
    Number(amount) || 0
  );
  return `${formatted} ${window.ZUZI_CONFIG.currency}`;
};
