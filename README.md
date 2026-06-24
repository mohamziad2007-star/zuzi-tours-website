# Zuzi Tours — Website

A professional, responsive, **multilingual** travel website for **Zuzi Tours**.

## ✨ Features

- **4 languages** — English, Czech (Čeština), Polish (Polski), Arabic (العربية)
  - Full UI + tour content translated for every language
  - Arabic automatically switches to **RTL** layout
  - Language choice is remembered (saved in the browser)
  - Language switcher in the header (top-right)
- **Data-driven tours** — add/edit tours in one file (`js/tours-data.js`)
- **Past Trips Gallery** — collapsible photo grid + lightbox on every tour page
- **Book Now → WhatsApp** with a pre-filled, translated message
- **No pricing on the site** — bookings happen via WhatsApp chat
- Light / dark theme toggle (remembers your choice)
- Fully responsive (desktop, tablet, mobile with slide-down menu)

## 📁 Files

| File | Purpose |
|------|---------|
| `index.html` | Landing page — hero, about, destinations grid, CTA, footer |
| `tour.html` | Dynamic tour detail page (reads `?id=` from the URL) |
| `css/style.css` | All styling (light + dark + RTL, fully responsive) |
| `js/config.js` | Contact details, WhatsApp number, social links |
| `js/i18n.js` | Translations + i18n engine (4 languages) |
| `js/tours-data.js` | Tour catalogue (destinations, itineraries, galleries) |
| `js/control.js` | Rendering, theme, mobile nav, gallery, language switching |
| `assets/images/` | Hero + photos per destination + gallery folders |

## 🔧 Before you go live

### 1. WhatsApp number
Open **`js/config.js`** and replace the placeholder:
```js
whatsapp: "201000000000",   // digits only, with country code
phone: "+20 100 000 0000",
email: "hello@zuzitours.com",
```

### 2. Social links
Still in **`js/config.js`**, under `social:` — replace the placeholder URLs.

## 🌍 Translations

All text lives in **`js/i18n.js`**. English UI strings are there, and English
tour content comes from `js/tours-data.js`. Czech, Polish and Arabic include
both UI strings and full tour content (under `tourData`).

To edit a translation, find the language block (`cs`, `pl`, or `ar`) and update
the string. To add a new language, add a block to `ZUZI_I18N` and an entry to
`ZUZI_LANGS`.

## ➕ Add a new tour
1. Add an object to `js/tours-data.js` with a unique `id`.
2. Add translations for it under each language's `tourData` in `js/i18n.js`.
3. Add photos to `assets/images/gallery/<id>/`.
4. Done — it appears on the home grid and gets its own page.

## 🚀 Preview
```bash
python3 -m http.server 8000
# visit http://localhost:8000
```
