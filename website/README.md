# NebulaCoop website

The source of [nebula.mackery.com](https://nebula.mackery.com/): the player site (home page, co-op, download,
setup guide, player guide with playing online, help, credits, legal), the blog at `/blog/` and the modding
documentation at `/modding/docs/`, with its Co-op section. It is a static site built with [Vite](https://vite.dev/);
nothing runs on a server.

It is a remix of [Nebula's website](https://nebula.keepvaibin.com/) by keepvaibin (`website/` in
[keepvaibin/nebula](https://github.com/keepvaibin/nebula)), GPL-3.0 like Nebula.

## Run it locally

You need Node.js 22 or later. From this folder:

```sh
npm install
npm run dev
```

Open the address Vite prints. Saving a page's text, a template, a blog post or a modding docs page regenerates
the preview. Other commands:

| Command               | What it does                                            |
| --------------------- | ------------------------------------------------------- |
| `npm test`            | Checks every page, link, docs page, blog post and model |
| `npm run build`       | Builds the finished site into `dist/`                   |
| `npm run preview`     | Serves `dist/` to check a build                         |
| `npm run blog:drafts` | Previews blog posts marked `draft: true`                |
| `npm run format`      | Formats the source with Prettier                        |

## Where things are

| Path                                                                       | What it holds                                                              |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `content/site.json`                                                        | The site's name and address, used for every canonical link and the sitemap |
| `content/pages/*.json`                                                     | The text of each page; see [editing page text](content/pages/README.md)    |
| `templates/pages/*.html`                                                   | Page layout and link destinations, with placeholders for the text          |
| `content/pages.json`                                                       | Each page's address, template and text file                                |
| `content/blog/`                                                            | Blog posts; see [writing a post](content/blog/README.md)                   |
| `../docs/modding/`                                                         | The modding docs; see [writing the docs](../docs/modding/README.md)        |
| `scripts/`                                                                 | The page, docs and blog renderers, and the model and image optimizers      |
| `style.css`, `reference-ui.css`, `player-site.css`, `blog.css`, `docs.css` | Styles                                                                     |
| `main.js`, `star-physics.js`                                               | The home page's 3D scene: Star Bits, planets and collisions                |
| `site.js`, `docs.js`                                                       | Menus, help search and download counts; the docs sidebar and search        |
| `public/`                                                                  | Files served as they are: icons, fonts, models and textures                |

The `index.html` files beside the templates, and the `blog/` and `docs/` folders, are generated. Edit the text,
template, post or Markdown instead, then run `npm run content` (the dev server and the build do this for you).

## Publishing

Cloudflare Workers Builds builds `main` and publishes `dist/` to nebula.mackery.com, as a Worker with static assets
only (`wrangler.jsonc`). Static asset requests are free and unlimited on the Workers Free plan. One-time setup, in the
Cloudflare dashboard of the account that holds mackery.com:

1. **Workers & Pages > Create > Import a repository**, and pick `NebulaCoop/website`.
2. Keep the Worker's name `website` (it must match `name` in both `wrangler.jsonc` files). The build settings can
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

## Home page assets

The home page alone loads Three.js. The Star Bits and the Honeyhive and Good Egg planets are optimized GLB
files in `public/models/` and `public/environment/`; their COLLADA and PNG originals are in `assets/`. After
changing an original, run `npm run models:optimize` or `npm run images:optimize` and commit the results. The
image optimizer checks that every pixel of each WebP matches its PNG.

The Delfino font, models and textures belong to their respective owners, from
[The Models Resource](https://models.spriters-resource.com/wii/supermariogalaxy/). Nebula is not affiliated
with Nintendo.
