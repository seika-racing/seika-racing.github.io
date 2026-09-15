# Seika Racing — seika.racing

Static site for the Seika Racing sailing team and the Seika Racing app.
Built with [Eleventy](https://www.11ty.dev/) and deployed to GitHub Pages by
`.github/workflows/deploy.yml` on every push to `main`, plus a weekly rebuild
so the Watch page picks up new YouTube uploads.

## Working on it

```sh
npm install
npm run dev      # http://localhost:8080 with live reload
npm run build    # writes the site to _site/
```

## Where things live

| What | Where |
|---|---|
| Pages | `src/*.njk` (home, team, calendar, watch, app, 404) |
| Shared layout, nav, footer | `src/_includes/layout.njk` |
| Site name, email, social links, nav | `src/_data/site.json` |
| Calendar events | `src/_data/events.json` |
| App copy: features and hardware tiers | `src/_data/app.json` |
| YouTube videos | fetched at build from the channel feed (`src/_data/videos.js`), fallback list in `videos-fallback.json` |
| Styles and JS | `src/assets/css/main.css`, `src/assets/js/main.js` |
| Media | `src/assets/media/` |

### Adding an event

Add an object to `src/_data/events.json`:

```json
{
  "id": "2027-05-regata-example",
  "title": "Regata Example",
  "type": "regatta",
  "start": "2027-05-14",
  "end": "2027-05-16",
  "location": "Baiona",
  "notes": "Optional description.",
  "url": "https://optional-event-site.example",
  "tbc": false
}
```

- `id` must be unique and stable; it becomes the anchor on the calendar page and the UID in the iCal feed.
- `type` is one of `regatta`, `training`, `boatwork`, `social`.
- `end` is optional for single-day events. Dates are all-day, `YYYY-MM-DD`.
- `tbc: true` shows a "dates TBC" tag and marks the event tentative in the feed.

The calendar page, the "Next up" block on the home page, the next training day on the
Team page and `/calendar.ics` all come from this one file. Past events move to the archive
automatically.

### Videos

The Watch page and the home page pull the latest uploads from the YouTube channel at build time.
Nothing to edit. To force a refresh, run the "Build and deploy" workflow from the Actions tab.

## Deployment

GitHub Pages must be set to deploy from **GitHub Actions** (Settings → Pages → Source),
not from the branch. The custom domain is set by `src/CNAME`.
