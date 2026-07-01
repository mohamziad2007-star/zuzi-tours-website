window.ZUZI_CONFIG = {
  brand: "Zuzi Tours",
  tagline: "Experience Egypt, not just a destination.",

  whatsapp: "201022747727", 
  whatsappDisplay: "+20 10 22747727",

  phone: "+20 10 22747727",
  email: "zuzitours@gmail.com",

  location: "Hurghada & Marsa Alam, Red Sea — Egypt",
  areasServed: [
    "Luxor",
    "Aswan",
    "Abu Simbel",
    "Giza Pyramids",
    "Marsa Alam",
    "Hurghada",
  ],

  hours: "Every day · 8:00 AM – 10:00 PM (EET)",

  social: {
    instagram: "https://www.instagram.com/zuzi.tours?igsh=Y3ZkbXhzMGU4aDlz&utm_source=qr",
    facebook: "https://www.facebook.com/share/1BD9FhaKqy/?mibextid=wwXIfr",
  },

  currency: "EGP",
  locale: "en-US",
};

window.zuziWhatsApp = function (message) {
  const number = String(window.ZUZI_CONFIG.whatsapp || "").replace(/\D/g, "");
  const text = encodeURIComponent(
    message ||
      "Hello Zuzi Tours! I would like to know more about your tours in Egypt."
  );
  return `https://wa.me/${number}?text=${text}`;
};

window.zuziMoney = function (amount) {
  const formatted = new Intl.NumberFormat(window.ZUZI_CONFIG.locale).format(
    Number(amount) || 0
  );
  return `${formatted} ${window.ZUZI_CONFIG.currency}`;
};
