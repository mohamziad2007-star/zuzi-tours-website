window.ZUZI_CONFIG = {
  brand: "Zuzi Tours",
  tagline: "Experience Egypt, not just a destination.",

  whatsapp: "201022747727",
  whatsappDisplay: "+20 10 22747727",

  phone: "+20 10 22747727",
  email: "hello@zuzitours.com",

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
