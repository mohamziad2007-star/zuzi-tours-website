# Zuzi Tours — Website

A professional, responsive travel website for **Zuzi Tours**, built on the
original foundation design (brand teal palette, Playfair / Cormorant / DM Sans
typography, soft hero overlay and elevated cards).

## ✨ What's included

| File | Purpose |
|------|---------|
| `index.html` | Landing page — hero, about, destinations grid, CTA, footer |
| `tour.html` | Dynamic tour detail page (reads `?id=` from the URL) |
| `css/style.css` | All styling (light + dark themes, fully responsive) |
| `js/config.js` | **Single source of truth** — WhatsApp number, contact, social |
| `js/tours-data.js` | Tour catalogue (destinations, prices, itineraries) |
| `js/control.js` | Renders cards, detail pages, theme toggle, mobile nav |
| `assets/images/` | Hero + one photo per destination |

## 🔧 Before you go live — 3 quick edits

### 1. WhatsApp number (most important)
Open **`js/config.js`** and replace the placeholder:

```js
whatsapp: "201000000000",          // digits only, with country code
whatsappDisplay: "+20 100 000 0000",
phone: "+20 100 000 0000",
email: "hello@zuzitours.com",
```

> Format: country code + number, **digits only** — e.g. `201234567890`.
> Every "Book Now" / contact button updates automatically.

### 2. Prices, durations & descriptions
Open **`js/tours-data.js`**. Each tour is one object you can edit:

```js
{
  id: "luxor",            // used in the URL: tour.html?id=luxor
  name: "Luxor",
  price: 1800,            // EGP — change freely
  duration: "Full day · ~12 hrs",
  // ...highlights, itinerary, included/excluded, etc.
}
```

### 3. Social links
Still in **`js/config.js`**, under `social:` — replace the `#`/placeholder URLs.

## ➕ Add a new tour (no HTML needed)
1. Copy any object in `js/tours-data.js`.
2. Give it a unique `id` and a new `image` in `assets/images/`.
3. Save. It appears on the home grid and gets its own page at
   `tour.html?id=<your-id>` automatically.

## 🎨 Features
- ✅ Data-driven: add/edit tours in one file
- ✅ **Book Now → WhatsApp** with a pre-filled message (tour name + price)
- ✅ Light / dark theme toggle (remembers your choice)
- ✅ Fully responsive (desktop, tablet, mobile with slide-down menu)
- ✅ Floating WhatsApp button + back-to-top
- ✅ SEO meta tags + Open Graph

## 🚀 Preview
Just open `index.html` in a browser. (No build step needed.)
For best results with the fonts, serve over a local server, e.g.:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```
