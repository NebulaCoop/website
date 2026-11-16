// Points the download button at the latest release's Setup and shows its version. Without this (or if GitHub's API
// is unreachable or rate-limited) the button still works: it links to releases/latest/download/Nebula-Setup.exe.
(async () => {
  const button = document.getElementById("download");
  const line = document.getElementById("release");
  if (!button || !line) return;
  try {
    const response = await fetch("https://api.github.com/repos/NebulaCoop/nebula-coop/releases/latest", {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) return;
    const release = await response.json();
    const setup = (release.assets || []).find((asset) => asset.name === "Nebula-Setup.exe");
    if (setup) button.href = setup.browser_download_url;
    const version = String(release.tag_name || "").replace(/^v/, "");
    if (!version) return;
    const parts = [];
    const link = document.createElement("a");
    link.href = release.html_url;
    link.textContent = `Version ${version}`;
    parts.push(link);
    if (release.published_at) {
      const date = new Date(release.published_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
      parts.push(document.createTextNode(` · ${date}`));
    }
    if (setup && setup.size) parts.push(document.createTextNode(` · ${Math.round(setup.size / 1048576)} MB`));
    parts.push(document.createTextNode(" · Windows 10 or 11, 64-bit"));
    line.replaceChildren(...parts);
  } catch {
    // Keep the static link.
  }
})();
