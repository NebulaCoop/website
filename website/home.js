// Let the useful page content paint before downloading and starting the 3D scene. Without WebGL the page simply
// keeps its painted sky.
const startScene = () => import('./comet-scene.js').catch(() => {});
if ('requestIdleCallback' in window) requestIdleCallback(startScene, { timeout: 300 });
else requestAnimationFrame(() => setTimeout(startScene, 0));
