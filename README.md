# Kariuki Moses - Portfolio

Personal portfolio website built with vanilla HTML, CSS, and JavaScript. Aurora-inspired dark
theme with an animated background, gradient accents and motion throughout — designed for
GitHub Pages deployment with no build step and no dependencies.

## Live Site

**<https://kariukimoseswambugu-lang.github.io/portfolio/>**

Deployed from the `main` branch via GitHub Pages.

## Pages

The site is a set of linked pages rather than one long scroll. Every page carries the same
navigation and a pagination bar at the bottom (Prev / Next plus numbered page dots), so you
can move through it page by page.

| # | Page | File | Contents |
| --- | --- | --- | --- |
| 1 | Home | `index.html` | Hero intro, stats, quick links to the other pages |
| 2 | About | `about.html` | Bio, profile card, how I work |
| 3 | Skills | `skills.html` | Front-end, back-end and tooling skill groups |
| 4 | Projects | `projects.html` | Five projects with screenshot covers and live demos |
| 5 | Contact | `contact.html` | Email, WhatsApp, GitHub, Facebook, Instagram, X |

## Contact Form

One reusable form component (`js/contact-modal.js`) renders in two places:

| Page | How it appears |
|---|---|
| **Contact** | Inline, permanently in the page under the contact methods (`<div data-contact-inline>`) |
| Every other page | Inside the "Get In Touch" dialog, opened by any `[data-contact-modal]` element |

On the Contact page the nav **Hire Me** button smooth-scrolls to the inline form and focuses
the first empty field instead of opening a dialog. Everywhere else the same button opens the
dialog. Without JavaScript the triggers are ordinary links to `contact.html`, so the form is
still reachable.

The form itself:

- **Full name**, **Email**, **Subject** and **Your request** are required; **Phone /
  WhatsApp** is optional. Fields validate inline and show per-field messages.
- Submissions POST to [Web3Forms](https://web3forms.com) at `https://api.web3forms.com/submit`
  (no signup flow, no backend needed) and arrive in the inbox as a table. A hidden `botcheck`
  checkbox filters bots.
- The visitor's address travels as `replyto` and their name as the sender name, so you can
  reply straight from the email without copying anything.
- **Open in my email app** is a fallback that opens the visitor's mail client with the same
  details pre-filled. It is also offered automatically if the automatic send fails.

> **One-time setup:** paste the free access key from [web3forms.com](https://web3forms.com)
> into `ACCESS_KEY` at the top of `js/contact-modal.js`. The key is safe to publish — it only
> routes mail to `OWNER_EMAIL`. While `ACCESS_KEY` is empty the form skips the doomed request
> and points the visitor at the mail-app fallback instead.

To point the form at a different inbox, change `OWNER_EMAIL` at the top of
`js/contact-modal.js`. To move the inline form, move the `<div data-contact-inline></div>`
mount — the component goes wherever the mount is.

## Getting Started

1. Clone or download this repository
2. Open `index.html` in your browser to view locally
3. No build tools or dependencies required

## Deployment

This site is a static build (no build tools), so it can be served from any static host.
It is currently published with GitHub Pages:

- Repository: <https://github.com/kariukimoseswambugu-lang/portfolio>
- Pages source: `main` branch, `/` (root)
- URL: <https://kariukimoseswambugu-lang.github.io/portfolio/>

To publish a change, commit and push to `main`; GitHub Pages rebuilds automatically.

## Search Engines

Everything a crawler needs is already in the repository, so the only manual step left is
telling each search engine that the site exists (see the numbered list below).

| Piece | What it does |
| --- | --- |
| `sitemap.xml` | Lists the five pages with priorities — this is the link you submit |
| `robots.txt` | Allows every crawler and points at the sitemap |
| `assets/images/og-cover.jpg` | 1200×630 share card used by `og:image` / `twitter:image` |
| Open Graph + Twitter tags | On every page: canonical URL, title, description and share image |
| JSON-LD (`index.html`) | `Person` + `WebSite` structured data — name, role, location, skills, social profiles |

**To get the site indexed** (this needs your own Google/Bing account — nobody else can
claim the site for you):

1. Google — <https://search.google.com/search-console> → add a property for
   `https://kariukimoseswambugu-lang.github.io/portfolio/` → verify with the **HTML tag**
   method. The tag is already in the `<head>` of `index.html`:
   `<meta name="google-site-verification" content="Kzp5dWBeUi4fPUMjnoJH4JnkGVHnM8z8xB_8ad7cjxg">`
   — leave it there, Google re-checks it periodically. (The **HTML file** method — dropping
   their file into the repository root — works too if you ever need a fallback.)
2. Submit the sitemap: `https://kariukimoseswambugu-lang.github.io/portfolio/sitemap.xml`.
3. Bing, which also feeds DuckDuckGo — <https://www.bing.com/webmasters> → same two steps.
4. Links are what actually get you found: put the site URL in your GitHub profile, and in
   your Facebook, Instagram, X and WhatsApp profiles.

> `robots.txt` sits in the `/portfolio/` subfolder, so crawlers read GitHub's own file at
> the host root instead. The sitemap submission is what matters; the file is kept for
> documentation and for crawlers that do follow it.

## Works on Every Screen

Every page was measured in real layout viewports from **280×653** (Galaxy Fold) to
**1920×1080**, including landscape phones (740×360, 390×300) and an iPad in both
orientations. All five pages are free of horizontal overflow and of clipped content at every
one of them.

| Area | What was done |
| --- | --- |
| Layout | Grid tracks use `minmax(min(330px, 100%), 1fr)`, so a card can never be forced wider than its column. The hero card carries an explicit `width` — an `auto` inline margin wins over `justify-self: stretch`, which had been collapsing the card (and its photo) to 2px on phones and tablets |
| Tap targets | Menu toggle, theme button, dialog close and pager dots are all at least 44×44px |
| Touch | `touch-action: manipulation` removes the double-tap delay and the grey tap flash. The hover-only "View project" pill is shown outright where there is no hover (`@media (hover: none)`) |
| Notches & bars | `viewport-fit=cover` plus `env(safe-area-inset-*)` on the nav, dialog, back-to-top button and footer |
| Short screens | The mobile menu caps itself to the visible height, scrolls inside itself and locks the page behind it — landscape phones used to cut off the last links |
| Mobile keyboards | Form inputs are 16px, so iOS Safari does not zoom the page when a field is focused |
| Text | Long addresses wrap instead of overflowing; the smallest labels step up to about 12px on phones |
| Performance | Fewer and softer blurred layers below 768px, and the orb parallax only runs for `pointer: fine` |
| Home screen | `manifest.json` + `assets/icons/` give Android and iOS a proper icon when the site is saved to the home screen |

Pinch-to-zoom is never disabled (there is no `maximum-scale` or `user-scalable=no`).

## Project Structure

```
index.html          Home
about.html          About
skills.html         Skills (front-end / back-end / tooling)
projects.html       Projects
contact.html        Contact
css/style.css       Design tokens, themes and all components
js/main.js          Theme, nav, reveal, counters, tilt, ripple interactions
js/contact-modal.js "Get In Touch" dialog + form submission logic
assets/images/      Site assets: nav logo, hero + About portraits, project screenshots
assets/icons/       Home-screen icons (192, 512 and apple-touch-icon)
manifest.json       Web app manifest: name, colours, icons
projects/           Embedded, runnable project demos
```

## Customization

- **Content** — edit the relevant page (`index.html`, `about.html`, `skills.html`,
  `projects.html`, `contact.html`).
- **Theme** — colour tokens live in the `:root` / `[data-theme="dark"]` / `[data-theme="light"]`
  blocks at the top of `css/style.css`. The visitor's choice is stored in `localStorage`
  under `km-theme`.
- **Interactions** — page state, counters, skill bars, 3D tilt and the button ripple are in
  `js/main.js`.
- **Social colours** — each social account keeps its real brand colour. The hero icon tiles
  use `.social__link--github|facebook|whatsapp|x|instagram|email` and the Contact page pills
  use `.contact__method--*`. Both are driven by a `--brand` (fill/gradient) and
  `--brand-ink` (resting icon colour) custom property, so a new network is a two-line rule.
- **Images** — drop files in `assets/images/`. If you swap `hero-portrait.jpg`, regenerate
  `assets/icons/` from it as well (a square crop centred on the face, resized to 512, 192 and
  180px), otherwise the home-screen icon keeps the old photo.

## Embedded Project Demos

The portfolio includes live demos of all projects embedded directly in this repository:

| Project | Entry point |
| --- | --- |
| Hospital Management App | `projects/hospital-app/home.html` |
| Car Dealership Website | `projects/car-dealers/index.html` |
| Motorcycle Dealership | `projects/motorcycle-dealers/home.html` |
| Phones & Laptops Store | `projects/phones-laptops/index.html` |
| Real Estate Platform | `projects/estate/frontend/index.html` |

Every project is embedded in this repository and opens directly from the **Projects** page.
Each card cover is a real screenshot of the running demo, stored in `assets/images/`.

The nav brand mark uses `assets/images/logo.jpg`, the About page portrait uses
`assets/images/about-portrait.jpg` and the home hero card uses
`assets/images/hero-portrait.jpg` — square crops of the same photograph. All three are framed
around the face by a face-detection crop, so drop in a replacement at the same paths (square,
ideally 600×600 or larger) to swap them.

Most projects are self-contained (HTML/CSS/JS) and run as-is on GitHub Pages. Several also
ship the Node.js/Express + MySQL backends they were built against:

- Hospital Management App — Express + MySQL
- Car Dealership Website — Express + MySQL, JWT auth
- Motorcycle Dealership — Express + MySQL
- Real Estate Platform — Express + MySQL, JWT auth (plus MongoDB, PostgreSQL and a PHP
  backend variant in `projects/estate/backend/`)

Those backends are not reachable on static hosting, so the Real Estate Platform ships a
bundled static data set (`frontend/js/demo-data.js`). When the backend is unreachable, its
read-only pages (landing, property list, property details, agents) render from that demo
data, so they work on GitHub Pages too.

> **Note:** the Phones & Laptops store is a React single-page app. Deep-linking directly
> to a sub-route (then refreshing) is not supported on a static host such as GitHub Pages;
> open it from the portfolio link / root URL instead.

## License

MIT License - feel free to use as a template.
