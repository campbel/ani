# Booty Bay Banana Company — guild website

A static site for the Booty Bay Banana Company, a World of Warcraft guild that
presents itself as Azeroth's leading banana commodities enterprise. No build
step, no dependencies: open `index.html` in a browser or serve the folder.

## Pages

| File | What it is |
|---|---|
| `index.html` | Home / investor relations: live-ish ticker tape, commodities board, key figures, latest filings |
| `mission.html` | Corporate charter: mission statement, vision, five values, company history, org structure, CEO note |
| `forecast-2027.html` | FY2027 Annual Outlook: shareholder letter, guidance, charts, roadmap, financials, KPIs, risk factors, glossary |
| `roster.html` | Leadership & trading floor, rendered from `assets/roster.js` |
| `careers.html` | Recruitment page, written as job postings |

## Run it locally

```sh
cd bbbc
python3 -m http.server 8080
# then open http://localhost:8080
```

## Customize

- **Roster:** edit `assets/roster.js`. Each entry has a name, corporate title, guild role, class, and optional quote.
- **Open positions and contact details:** edit the job cards and the contact callout in `careers.html`.
- **Market board instruments:** the `MARKET` array at the top of `assets/site.js`. Prices are a seeded random walk, generated in the browser.
- **Forecast numbers:** the guidance tiles and tables are plain HTML in `forecast-2027.html`; the chart data lives in the `window.BBBC_CHARTS` block at the bottom of that file. Table views and tooltips re-render from the same arrays.
- **Theme:** colors are CSS custom properties at the top of `assets/style.css`.

## Hosting

The folder is plain HTML, so it works on GitHub Pages, Netlify, Cloudflare Pages,
or any static host. For GitHub Pages from this repo, either point Pages at a
branch whose root contains these files or copy the folder to `docs/`.
