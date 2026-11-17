# NebulaCoop website

The source of [nebula.mackery.com](https://nebula.mackery.com/): the player site (home page, co-op, download,
setup guide, player guide with playing online, help, credits, legal), the blog at `/blog/` and the modding
documentation at `/modding/docs/`, with its Co-op section. It is a static site built with [Vite](https://vite.dev/);
nothing runs on a server.

It is built from [Nebula's website](https://nebula.keepvaibin.com/) by keepvaibin (`website/` in
[keepvaibin/nebula](https://github.com/keepvaibin/nebula)), GPL-3.0 like Nebula: the page renderer, the blog and
the modding docs come from there. The look is NebulaCoop's own, at keepvaibin's request: see [The look](#the-look).

## Run it locally

You need Node.js 22 or later. From this folder:

```sh
npm install
npm run dev
```

Open the address Vite prints. Saving a page's text, a template, a blog post or a modding docs page regenerates
the preview. Other commands:

| Command               | What it does                                     |
| --------------------- | ------------------------------------------------ |
| `npm test`            | Checks every page, link, docs page and blog post |
| `npm run build`       | Builds the finished site into `dist/`            |
| `npm run preview`     | Serves `dist/` to check a build                  |
| `npm run blog:drafts` | Previews blog posts marked `draft: true`         |
| `npm run format`      | Formats the source with Prettier                 |
| `npm run icons`       | Redraws the icons in `public/` from the logo     |

## Where things are

| Path                                                                | What it holds                                                              |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `content/site.json`                                                 | The site's name and address, used for every canonical link and the sitemap |
| `content/pages/*.json`                                              | The text of each page; see [editing page text](content/pages/README.md)    |
| `templates/pages/*.html`                                            | Page layout and link destinations, with placeholders for the text          |
| `content/pages.json`                                                | Each page's address, template and text file                                |
| `content/blog/`                                                     | Blog posts; see [writing a post](content/blog/README.md)                   |
| `../docs/modding/`                                                  | The modding docs; see [writing the docs](../docs/modding/README.md)        |
| `scripts/`                                                          | The page, docs and blog renderers, and the icon maker                      |
| `style.css`, `player-site.css`, `theme.css`, `blog.css`, `docs.css` | Styles                                                                     |
| `comet-scene.js`                                                    | The home page's 3D scene: the planet and the players' comets               |
| `site.js`, `docs.js`                                                | Menus, help search and download counts; the docs sidebar and search        |
| `public/`                                                           | Files served as they are: icons, the home page planet, robots.txt, headers |

The `index.html` files beside the templates, and the `blog/` and `docs/` folders, are generated. Edit the text,
template, post or Markdown instead, then run `npm run content` (the dev server and the build do this for you).

## Publishing

Cloudflare Workers Builds builds `main` and publishes `dist/` to nebula.mackery.com, as a Worker with static assets
only (`wrangler.jsonc`). Static asset requests are free and unlimited on the Workers Free plan. One-time setup, in the
Cloudflare dashboard of the account that holds mackery.com:

1. **Workers & Pages > Create > Import a repository**, and pick `NebulaCoop/website`.
2. Name the Worker `nebulaweb` (it must match `name` in both `wrangler.jsonc` files). The build settings can
   stay empty: `npx wrangler deploy` from the repository root reads the root `wrangler.jsonc`, whose `build.command`
   builds the site before `website/dist` is uploaded. Setting **Root directory** `website`, **Build command**
   `npm run build` also works, and uses this folder's `wrangler.jsonc`.
3. Optional: a build variable `GITHUB_TOKEN` (a token with no scopes is enough) lifts GitHub's rate limit for the
   release and download count the build reads.

The first deploy creates the `nebula.mackery.com` custom domain and its DNS record. To deploy by hand instead:
`npx wrangler login`, then `npm run deploy`. `npm run cf:preview` serves the build through Wrangler locally, with
`public/_headers` and the 404 page as Cloudflare serves them.

`.github/workflows/website.yml` at the repository root runs the tests, the build, Prettier and a Wrangler dry run on
every pull request and push; it publishes nothing.

## The look

NebulaCoop's style is "the Comet Observatory at night": a deep violet sky, gold lamplight and each player's comet
colour as an accent. `style.css` and `player-site.css` lay the pages out, and `theme.css`, loaded last, gives them
their colours, type, buttons and panels. `docs.css` and `blog.css` use the same colours.

- Type: [Fredoka](https://fonts.google.com/specimen/Fredoka) for headings and buttons,
  [Nunito](https://fonts.google.com/specimen/Nunito) for reading, both bundled from Fontsource (SIL Open Font
  License).
- Logo: `assets/brand/nebulacoop-mark.svg`. `npm run icons` renders the favicons and `brand-logo.png` from it.
- Home page: `comet-scene.js` shows Good Egg Galaxy's starting planet turning slowly, with a few players'
  comets in orbit. Only the home page loads Three.js. Until the
  planet loads, or if it can't, a small planet drawn in code stands in.

The planet (`public/environment/garden/`: `DiskGardenPlanet.glb` and its WebP textures) is the game's own model,
as on Nebula's website, from [The Models Resource](https://models.spriters-resource.com/wii/supermariogalaxy/). It
belongs to Nintendo. So does the cursor, the game's menu hand pointer (`assets/brand/hand-pointer.png`, put together
from the textures and colours in the game's `LayoutData/DPDPointer.arc`; `npm run icons` sizes it into `public/cursor/`). Nothing else on the site comes from the game. Nebula and NebulaCoop are not affiliated with
Nintendo.
