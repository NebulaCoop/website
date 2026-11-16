# NebulaCoop website

The website for NebulaCoop and LumaLink Coop, at **https://nebula.mackery.com**. NebulaCoop is a fork of
[Nebula](https://github.com/keepvaibin/nebula) by keepvaibin that adds online co-op.

It's a plain static site (no build step): `public/` is served as-is by Cloudflare Workers static assets.

| File | What it is |
|---|---|
| `public/index.html` | The landing page |
| `public/styles.css` | All styles (the starfield is CSS gradients, no images) |
| `public/main.js` | Points the download button at the latest release's `Nebula-Setup.exe` and shows its version. Without it, the button still links to `releases/latest/download/Nebula-Setup.exe` |
| `public/404.html` | Shown for any path that doesn't exist |
| `public/_headers` | Security headers and the Content Security Policy (only `api.github.com` may be fetched) |
| `wrangler.jsonc` | The Worker's name and the `nebula.mackery.com` custom domain |

No Nintendo art or game files go on this site.

## Running it locally

```sh
npm install
npm run dev      # http://localhost:8787
```

Opening `public/index.html` directly in a browser also works.

## Deploying

The same way as [NebulaNet](https://github.com/NebulaCoop/NebulaNet): Cloudflare Workers Builds deploys `main` on
every push.

1. In the Cloudflare dashboard, **Workers & Pages > Create > Import a repository**, and pick `NebulaCoop/website`.
2. Keep the defaults: no build command, deploy command `npx wrangler deploy`.
3. The first deploy creates the `nebula.mackery.com` custom domain and its DNS record, because `mackery.com` is a
   zone on the same account. Nothing has to be added to DNS by hand.

Static asset requests are free and unlimited on the Workers Free plan.

To deploy by hand instead: `npx wrangler login`, then `npm run deploy`.
