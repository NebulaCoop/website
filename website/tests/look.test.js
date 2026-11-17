import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const files = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)],
  );
const templates = [
  ...files(resolve(root, 'templates/pages')),
  ...files(resolve(root, 'templates/blog')),
].filter((path) => path.endsWith('.html'));

test('every page loads theme.css last among the shared styles', () => {
  for (const path of templates) {
    const html = readFileSync(path, 'utf8');
    const player = html.indexOf('player-site.css');
    const theme = html.indexOf('theme.css');
    assert.ok(player > 0 && theme > player, `${path} must load theme.css after player-site.css`);
  }
});

test('the only game model is the home page planet, and no game fonts are used', () => {
  // Mackery chose Good Egg Galaxy's starting planet for the home page (2026-11-17). Nothing else from the game.
  const served = [...files(resolve(root, 'public')), ...files(resolve(root, 'assets'))];
  const models = served.filter((path) => /\.(glb|gltf|dae|bmd|bdl|arc)$/i.test(path));
  assert.deepEqual(
    models.map((path) => path.slice(root.length + 1)),
    ['public/environment/garden/DiskGardenPlanet.glb'],
  );
  const sources = [
    ...templates,
    resolve(root, 'style.css'),
    resolve(root, 'player-site.css'),
    resolve(root, 'theme.css'),
    resolve(root, 'docs.css'),
    resolve(root, 'blog.css'),
    resolve(root, 'comet-scene.js'),
    resolve(root, 'scripts/render-docs.mjs'),
  ];
  for (const path of sources)
    assert.doesNotMatch(readFileSync(path, 'utf8'), /Delfino|StarPiece|ForestHomePlanet/, path);
});

test('the home page has the comet scene and no Star Bit game', () => {
  const home = readFileSync(resolve(root, 'templates/pages/home.html'), 'utf8');
  assert.match(home, /id="space"/);
  assert.match(home, /id="orbit-status"/);
  assert.doesNotMatch(home, /id="star-count"|id="formation"|id="regenerate"/);
  assert.match(readFileSync(resolve(root, 'home.js'), 'utf8'), /comet-scene\.js/);
});
