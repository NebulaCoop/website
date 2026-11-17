# NebulaCoop website

The website for NebulaCoop and LumaLink Coop at **https://nebula.mackery.com**. NebulaCoop is a fork of
[Nebula](https://github.com/keepvaibin/nebula) by keepvaibin that adds online co-op, and this site is built from
[Nebula's website](https://nebula.keepvaibin.com/), with a look of its own.

The folders keep upstream Nebula's layout, so its page, docs and blog changes can be brought over path for path
(styles and the home page scene are our own, so leave those out):

| Path                                      | What it holds                                                                                        |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [`website/`](website/README.md)           | The site: pages, templates, styles, the home page's scene, the blog, tests and the Cloudflare config |
| [`docs/modding/`](docs/modding/README.md) | The modding docs, Nebula's plus the `coop/` section                                                  |
| `.github/workflows/website.yml`           | Tests and builds every pull request; Cloudflare Workers Builds publishes `main`                      |

To work on it: `cd website`, `npm install`, `npm run dev`. Publishing is in
[website/README.md](website/README.md#publishing).

Imported from keepvaibin/nebula at `e3a36fa36` (2026-11-15). GPL-3.0, like Nebula and NebulaCoop.
