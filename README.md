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

## Project Structure

```
index.html          Home
about.html          About
skills.html         Skills (front-end / back-end / tooling)
projects.html       Projects
contact.html        Contact
css/style.css       Design tokens, themes and all components
js/main.js          Theme, nav, reveal, counters, tilt, ripple interactions
assets/images/      Site assets, including project screenshots
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
- **Images** — drop files in `assets/images/`.

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
