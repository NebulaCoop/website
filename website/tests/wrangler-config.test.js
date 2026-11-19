import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

// Cloudflare can publish from the repository root (../wrangler.jsonc) or from website/ (wrangler.jsonc).
// Both must describe the same Worker.
function readJsonc(url) {
  const text = readFileSync(url, 'utf8')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/,(\s*[}\]])/g, '$1');
  return JSON.parse(text);
}

test('the root and website/ Wrangler configs publish the same Worker', () => {
  const site = readJsonc(new URL('../wrangler.jsonc', import.meta.url));
  const root = readJsonc(new URL('../../wrangler.jsonc', import.meta.url));

  assert.equal(root.name, site.name);
  assert.equal(root.compatibility_date, site.compatibility_date);
  assert.deepEqual(root.routes, site.routes);
  // Workers Builds runs `wrangler preview` on pull requests, which fails without a `previews` block.
  assert.deepEqual(root.previews, site.previews);
  assert.equal(typeof site.previews, 'object');
  assert.equal(root.assets.directory, './website/dist');
  assert.equal(site.assets.directory, './dist');
  assert.deepEqual({ ...root.assets, directory: '' }, { ...site.assets, directory: '' });
  assert.match(root.build.command, /npm run build/);
});
