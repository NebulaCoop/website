import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchDownloadStats } from '../download-stats.js';

test('download total includes every page and beta assets, excluding drafts', async () => {
  const calls = [];
  const stats = await fetchDownloadStats(async (url) => {
    calls.push(url);
    const rows =
      calls.length === 1
        ? Array.from({ length: 100 }, () => ({ assets: [{ download_count: 2 }] }))
        : [
            { prerelease: true, assets: [{ download_count: 3 }] },
            { draft: true, assets: [{ download_count: 10 }] },
          ];
    return { ok: true, json: async () => rows };
  });
  assert.equal(stats.total, 203);
  assert.equal(stats.releases, 101);
  assert.equal(calls.length, 2);
  assert.match(calls[1], /page=2$/);
});

test('the latest version is the newest published full release', async () => {
  const stats = await fetchDownloadStats(async (url) => {
    assert.match(url, /repos\/NebulaCoop\/nebula-coop\/releases/);
    return {
      ok: true,
      json: async () => [
        {
          tag_name: 'v1.0.4-beta.1',
          prerelease: true,
          published_at: '2026-11-15T00:00:00Z',
          assets: [],
        },
        { tag_name: 'v1.0.3', published_at: '2026-11-12T19:22:52Z', assets: [] },
        { tag_name: 'v1.0.2', published_at: '2026-11-11T19:29:20Z', assets: [] },
        { tag_name: 'v1.0.5', draft: true, assets: [] },
      ],
    };
  });
  assert.deepEqual(stats.latest, { version: '1.0.3', published: '2026-11-12T19:22:52Z' });
});

test('a GitHub failure rejects instead of showing an incomplete total', async () => {
  await assert.rejects(
    fetchDownloadStats(async () => ({ ok: false, status: 403 })),
    /403/,
  );
});
