# Kariuki Moses - Portfolio

Personal portfolio website built with vanilla HTML, CSS, and JavaScript. Designed with a modern minimal aesthetic and optimized for GitHub Pages deployment.

## Live Site

**<https://kariukimoseswambugu-lang.github.io/portfolio/>**

Deployed from the `main` branch via GitHub Pages.

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

## Customization

Edit `index.html` to update content. Styles are in `css/style.css`. Interactive behavior is in `js/main.js`. Images go in `assets/images/`.

## Embedded Project Demos

The portfolio includes live demos of all projects embedded directly in this repository:

| Project | Entry point |
| --- | --- |
| Hospital Management App | `projects/hospital-app/home.html` |
| Car Dealership Website | `projects/car-dealers/index.html` |
| Motorcycle Dealership | `projects/motorcycle-dealers/home.html` |
| Phones & Laptops Store | `projects/phones-laptops/index.html` |
| Real Estate Platform | `projects/estate/frontend/index.html` |

Every project is embedded in this repository and opens directly from the portfolio's
**Projects** section.

Most projects are self-contained (HTML/CSS/JS) and run as-is on GitHub Pages.
The Real Estate Platform (`projects/estate/`) has a full-stack backend (Node/Express on
port 5000), so it ships with a bundled static demo data set (`frontend/js/demo-data.js`).
When the backend is unreachable, its read-only pages (landing, property list, property
details, agents) render from that demo data, so they work on GitHub Pages too.

> **Note:** the Phones & Laptops store is a React single-page app. Deep-linking directly
> to a sub-route (then refreshing) is not supported on a static host such as GitHub Pages;
> open it from the portfolio link / root URL instead.

## License

MIT License - feel free to use as a template.