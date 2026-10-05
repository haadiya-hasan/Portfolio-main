# Haadiya Faruqi — AI / ML Portfolio

An interactive, dark-themed developer portfolio built with **plain HTML, CSS and JavaScript** — no frameworks, no build step, no dependencies to install. Open `index.html` and it runs.

Design direction: **Mauve Serenity × Monochrome Chic** — near-black paper, ink-white type, dusty mauve accents, editorial serif italics, monospace metadata, and motion that is tied to scroll rather than popping in and out.

> **Live site:** `https://haadiya-hasan.github.io/`

---

## Features

**Intro & navigation**
- Preloader with a typing name, progress counter, and a choice to enter with sound or silently
- Sticky nav that hides on scroll-down and returns on scroll-up, scroll-progress bar, mobile menu
- Smooth anchor scrolling

**Hero**
- Rotating 3D network planet drawn on canvas, reacting to the cursor
- Skill chips orbiting the planet
- Robot mascot whose eyes follow the cursor and who talks when clicked
- Scrolling skills marquee that skews with scroll speed

**Motion**
- Custom sparkle cursor with a trailing ring and click bursts
- Drifting gradient blobs and a particle-network background that reacts to the mouse
- Scroll-scrubbed section transitions: each section scales, tilts, fades and rounds its corners continuously as you scroll (fully reversible)
- Floating shapes with parallax, shimmering headline accents, text-scramble on hover

**Toolkit**
- Click-to-expand rows with notes on how each tool is used
- Skill radar chart that draws itself
- Interactive terminal (`help`, `whoami`, `skills`, `projects`, `contact`, `ls`, `clear`)
- Logo tiles that tilt in 3D toward the cursor
- Draggable tag pit where logos fall, collide and can be thrown

**Work**
- Project filters (All / ML & AI / Data / Web) with animated reflow
- Click a card for a detail popup; `Esc`, ✕ or clicking outside closes it

**Journey**
- Timeline whose line draws itself as you scroll

**Photos**
- Framed portrait in About, polaroids in Journey, avatars in the hero and contact sections
- Mauve duotone that turns to full colour on hover, with a curtain reveal and subtle parallax

**Contact**
- Form that opens the visitor's mail app pre-filled, live Noida clock, availability badge, copy-email button

**Sound (optional, off by default)**
- Synthesised with the Web Audio API, so there are no audio files. Toggle with the ♪ button in the nav; the choice is remembered.

**Accessibility**
- Respects `prefers-reduced-motion`
- Custom cursor and tilt effects only run on devices with a mouse
- Responsive from phones to wide desktops

---

## Project structure

```text
.
├── index.html     # page structure and content
├── style.css      # base design system and layout
├── script.js      # original interactions
├── fx.css         # animation layer, dark theme, newer sections
├── fx.js          # cursor, background, planet, filters, popups, toolkit, contact, sound, photos
├── Resume.pdf     # your resume (the "Download CV" button points here)
└── README.md
```

Load order matters: `style.css` then `fx.css` in the head, and `script.js` then `fx.js` at the end of the body.

---

## Run locally

No installation needed.

1. Double-click `index.html`, or
2. Use VS Code with Live Server, or
3. From the project folder:

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

Google Fonts and the tool logos (Devicon) load from the internet. Offline, the page still works with fallback fonts and monogram logos.

---

## Customising

### Photos
Put `me-1.jpg`, `me-2.jpg` and `me-3.jpg` in `assets/`. To use other filenames, edit the `PHOTO` object in `fx.js`.

### Resume, links and email
Add `Resume.pdf` to the project root. Search `index.html` for the email, GitHub and LinkedIn links to change them.

### Projects
Edit the project cards in `index.html`. Popup text and filter categories are in the `D` array in `fx.js`, one entry per card in the same order.

### Toolkit
All in `fx.js`: `ROWS` (expandable-row notes), `AX` (radar levels), `TOOLS` (logo tiles and draggable tags), `CMD` (terminal commands).

### Theme
The site ships in dark mode. All dark-theme rules are in one block in `fx.css` headed DARK THEME. Delete that block to return to the light theme.

---

## Deploying to GitHub Pages

1. Create a repository named `haadiya-hasan.github.io`.
2. Upload all files, keeping the folder structure.
3. Go to Settings → Pages, choose Deploy from a branch, select `main` and `/ (root)`, then save.
4. After a minute the site is live at `https://haadiya-hasan.github.io/`.

```bash
git init
git add .
git commit -m "Interactive AI/ML portfolio"
git branch -M main
git remote add origin https://github.com/haadiya-hasan/haadiya-hasan.github.io.git
git push -u origin main
```

---

## Notes

- The contact form uses `mailto:`, so it opens the visitor's email app instead of sending directly.
- Browser storage is used only to remember the sound on/off choice.

---

## Tech

HTML5 · CSS3 · Vanilla JavaScript (Canvas 2D, Web Audio API, Web Animations API, IntersectionObserver) · Google Fonts (Manrope, DM Mono, Playfair Display) · Devicon

## Credits

Designed and built by **Haadiya Faruqi**.
