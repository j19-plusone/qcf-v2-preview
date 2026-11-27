# QCF Briefs — Friday update

Routine briefs are a weekday job. Weekends are rest days.

Public pages are teasers only: a summary plus item titles, regions/tags and sources. Do not publish the full `what`/`why` body, trends, internal `qcf` commentary, implications, posters (they show the full brief) or PDFs. Full PDFs are emailed to subscribers from `Founder@qcf.org.cn` (Zoho EU).

## Add a new week

From the repository root:

1. Import Chinese sources (strips internal `qcf` and `implications` unless you pass `--include-internal`):

   `python3 tools/briefs/import_from_archive.py`

2. Write or update the matching English file:

   `data/briefs/src/<cat>/<YYYYMMDD>.en.json`

   Categories: `biogene`, `qe-rwa`, `edu`. Keep the translation faithful, neutral and factual. Preserve names, numbers, dates, DOIs and URLs. Convert 万/亿. Do not add claims.

3. Rebuild the public pages:

   `python3 tools/briefs/build_briefs.py`

4. Check `briefs.html` and the new brief pages in Chinese and English (`?lang=zh`, `?lang=en`), and spot-check one other language (it should fall back to English plus a machine-translation note).

5. Commit on a feature branch and open a pull request into `main`. Merging to `main` publishes to [https://qcf.org.cn/](https://qcf.org.cn/) (GitHub Pages, repo `j19-plusone/qcf-v2-preview`). Push and merge as the `j19-plusone` GitHub account; the default `gh` account is pull-only on this repo.

Do not commit PDFs or full-content posters. `briefs-media/` is gitignored for that reason.

## Request-full-text form

Each brief page has a bilingual “Request full text / 索取全文” form: email (required), name (optional), and a consent checkbox linking to `privacy.html`.

The site is static GitHub Pages, so it cannot send email by itself. Until a form backend is connected, `FORM_ENDPOINT` in `assets/briefs.js` is empty and submit opens the visitor’s email app with a pre-filled message to `Founder@qcf.org.cn`.

Simplest no-cost ways to capture signups without a mail client (no new paid account; Jessica would create or enable one of these herself):

1. **Zoho Forms (preferred if already available in the Zoho EU org that hosts `founder@qcf.org.cn`)** — enable Forms, create a form that emails submissions to `founder@qcf.org.cn`, and give us the public form action URL. Then set `FORM_ENDPOINT` in `assets/briefs.js`.
2. **Formspree** (free tier, form endpoint in the static page) or **Web3Forms** (free access key designed for static sites), pointing to `founder@qcf.org.cn`. Set `FORM_ENDPOINT` to the URL they provide.

Do not put a private API secret in this public repository. A public form ID or a browser-side key that the provider intends for static forms is fine.

## Files

- `data/briefs/src/<cat>/*.zh.json` — Chinese source of truth
- `data/briefs/src/<cat>/*.en.json` — English translation (required for a complete public page)
- `tools/briefs/import_from_archive.py` — import from the briefs archive
- `tools/briefs/build_briefs.py` — generates `briefs.html`, `brief-*.html` and `data/briefs/briefs.json`
