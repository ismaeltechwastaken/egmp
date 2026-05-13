const IPFS_CIDS = [
  "bafybeidjzeaisikerhgwvs24tcxthl3vke6kvcgaoyd2diud5savtkmq7a",
];

const IPFS_GATEWAY_TEMPLATES = [
  "https://{cid}.ipfs.dweb.link",
  "https://{cid}.ipfs.w3s.link",
  "https://{cid}.ipfs.flk-ipfs.xyz",
  "https://{cid}.ipfs.cf-ipfs.com",
  "https://ipfs.io/ipfs/{cid}",
];

const IPFS_GAMES = [
  "explore/",
  "ultimate/",
  "tech/",
  "lite/",
  "magic/",
  "skyfactory/",
  "vanilla/",
  "downloads/",
];

function getGatewayUrls() {
  const urls = [];
  IPFS_CIDS.forEach((cid) => {
    IPFS_GATEWAY_TEMPLATES.forEach((tpl) => {
      urls.push(tpl.replace("{cid}", cid));
    });
  });
  return urls;
}

function isIpfsGame(path) {
  return IPFS_GAMES.some((g) => path.startsWith(g));
}

const VIRTUAL_PAGES = {
  downloads: {
    title: "Downloads - Eagler Modpack Launcher",
    render: renderDownloadPage,
  },
  changelog: {
    title: "Changelog - Eagler Modpack Launcher",
    render: renderChangelogPage,
  },
  404: {
    title: "404 - Eagler Modpack Launcher",
    render: render404Page,
  },
};

const CHANGELOG_DATA = [
  {
    version: "PRE-ALPHA-u0 - HOTFIXED ON: 2026-01-18",
    items: [
      "Fixed spawn rate of celebrities being way too high",
      "Fixed crash when using exnihilo rubber seeds",
      "Fixed autonomous activators not working on exnihilo sieves",
      "Fixed InvTweaks stack auto replacement not working",
      "Fixed the whole game occasionally crashing on exit",
    ],
    note: "(The dedicated server is still incomplete)",
  },
  {
    version: "PRE-ALPHA-u0 - Unreleased and Rereleased",
    description:
      "Iron is not harvestable by stone picks (lax1dude is angry at the beta testers because they never tested mining ores)",
  },
];

const HEADER_INFO_HTML = `
  <p>Allows you to run many classic Minecraft Forge 1.6.4 mods entirely in your browser.</p>
  <p>This is an early alpha version of the eagler modpack project. There is currently no dedicated multiplayer server implementation available. The launcher source code is open source under the MIT license.</p>
  <p>There are several variants of the modpack client available here that each build a different selections of mods. The "ultimate" variant of the client contains all available mods, <span class="text-highlight">however not all devices have enough memory</span> to run the ultimate variant without resource exhaustion, so several lightweight alternatives are available as well.</p>
  <p>WASM GC and JSPI may improve FPS and stability for certain devices. Requires "Experimental WebAssembly" to be enabled in chrome://flags.</p>
`;

const HEADER_DATE_TEXT = "Last updated: May 12, 2026";
const CHOOSE_TEXT =
  "Choose a client variant to launch in your browser (JSPI recommended - Mobile not supported)";

async function initLauncher() {
  const launcherContainer = document.getElementById("launcher-buttons");
  try {
    const resp = await fetch("data/data.json");
    const gamesData = await resp.json();
    window.modpacksData = gamesData;
    renderButtons(launcherContainer, gamesData);
    handleHash();
  } catch (e) {
    console.error("Failed to load data.json", e);
    launcherContainer.innerHTML =
      "<p class='error-message'>Failed to load configuration.</p>";
  }
}

function handleHash() {
  let hash = window.location.hash.substring(1);
  if (!hash || hash === "/") {
    showHome();
    return;
  }
  if (hash.startsWith("/")) hash = hash.substring(1);

  let decoded;
  try {
    decoded = atob(hash);
  } catch (e) {
    show404();
    return;
  }

  if (VIRTUAL_PAGES[decoded]) showVirtualPage(decoded);
  else if (decoded.includes("/") || decoded.endsWith(".html"))
    loadGame(decoded);
  else show404();
}

window.addEventListener("hashchange", handleHash);

function resetView() {
  const container = document.querySelector(".container");
  const gameView = document.getElementById("game-view");
  const gameFrame = document.getElementById("game-iframe");
  const refreshBtn = document.getElementById("game-refresh-btn");
  container.style.display = "block";
  gameView.style.display = "none";
  if (gameFrame) gameFrame.remove();
  if (refreshBtn) refreshBtn.remove();
  document.body.classList.remove("no-scroll");
  hideLoading();
}

function showLoading(text, showProgress) {
  const overlay = document.getElementById("loading-overlay");
  const loadingText = document.getElementById("loading-text");
  const progressContainer = document.querySelector(".progress-bar-container");
  const progressBar = document.getElementById("progress-bar");
  const cacheStatus = document.getElementById("cache-status");
  if (overlay) overlay.style.display = "flex";
  if (loadingText) loadingText.textContent = text || "Loading...";
  if (progressContainer)
    progressContainer.style.display = showProgress ? "block" : "none";
  if (progressBar) progressBar.style.width = "0%";
  if (cacheStatus) cacheStatus.textContent = "";
}

function updateProgress(percent, text, cacheText) {
  const loadingText = document.getElementById("loading-text");
  const progressBar = document.getElementById("progress-bar");
  const cacheStatus = document.getElementById("cache-status");
  if (loadingText && text) loadingText.textContent = text;
  if (progressBar) progressBar.style.width = percent + "%";
  if (cacheStatus) cacheStatus.textContent = cacheText || "";
}

function hideLoading() {
  const overlay = document.getElementById("loading-overlay");
  if (overlay) {
    overlay.classList.add("fade-out");
    setTimeout(() => {
      overlay.style.display = "none";
      overlay.classList.remove("fade-out");
    }, 500);
  }
}

function updateNavButtons(showBackButton, currentPage) {
  const navLinks = document.querySelector(".top-nav-links");
  const existingBack = document.getElementById("back-to-launcher-link");
  const downloadLink = navLinks.querySelector('a[href="#/ZG93bmxvYWRz"]');
  const changelogLink = navLinks.querySelector('a[href="#/Y2hhbmdlbG9n"]');

  if (showBackButton && !existingBack) {
    const backLink = document.createElement("a");
    backLink.id = "back-to-launcher-link";
    backLink.href = "#/";
    backLink.className = "top-link";
    backLink.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> Back to Launcher`;
    navLinks.insertBefore(backLink, navLinks.firstChild);
  } else if (!showBackButton && existingBack) {
    existingBack.remove();
  }

  if (downloadLink) {
    downloadLink.style.display = currentPage === "downloads" ? "none" : "flex";
    if (currentPage !== "downloads") {
      downloadLink.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Download`;
    }
  }
  if (changelogLink)
    changelogLink.style.display = currentPage === "changelog" ? "none" : "flex";
}

function showHome() {
  resetView();
  document.title = "Eagler Modpack Launcher";
  updateNavButtons(false);
  const header = document.querySelector("header");
  if (header) header.style.display = "block";
  const container = document.getElementById("launcher-buttons");
  if (container && window.modpacksData)
    renderButtons(container, window.modpacksData);
  if (window.location.hash === "#/")
    history.replaceState(null, null, window.location.pathname);
}

function showVirtualPage(key) {
  resetView();
  const page = VIRTUAL_PAGES[key];
  if (!page) {
    show404();
    return;
  }
  document.title = page.title;
  updateNavButtons(true, key);
  const header = document.querySelector("header");
  if (header) header.style.display = "none";
  const container = document.getElementById("launcher-buttons");
  if (container) {
    container.innerHTML = "";
    container.className = "launcher-grid";
    page.render(container);
  }
}

function show404() {
  resetView();
  document.title = "404 - Eagler Modpack Launcher";
  updateNavButtons(true);
  const header = document.querySelector("header");
  if (header) header.style.display = "none";
  const container = document.getElementById("launcher-buttons");
  if (container) {
    container.innerHTML = "";
    container.className = "launcher-grid";
    render404Page(container);
  }
}

function getModCount(variant) {
  if (variant.mod_count !== undefined) return variant.mod_count;
  if (!variant.mods) return 0;
  if (variant.mods.length === 1 && variant.mods[0].name === "No mods") return 0;
  return variant.mods.length;
}

function renderButtons(container, data) {
  container.className = "modpack-list";
  container.innerHTML = "";
  const fullOrder = Object.keys(data).sort(
    (a, b) => getModCount(data[b]) - getModCount(data[a]),
  );

  fullOrder.forEach((id) => {
    if (!data[id]) return;
    const variant = data[id];
    const section = document.createElement("div");
    section.className = "modpack-section";

    const titleRow = document.createElement("div");
    titleRow.className = "modpack-title-row";

    const title = document.createElement("h2");
    title.className = "modpack-name";
    title.textContent = variant.name;
    titleRow.appendChild(title);
    if (variant.mods && variant.mods.length > 0)
      titleRow.appendChild(
        createModInfoButton(variant.mods, variant.name, getModCount(variant)),
      );
    section.appendChild(titleRow);

    const btnContainer = document.createElement("div");
    btnContainer.className = "modpack-buttons";
    if (variant.jspi_path)
      btnContainer.appendChild(createPlayButton(variant.jspi_path, "JSPI"));
    if (variant.gc_path)
      btnContainer.appendChild(createPlayButton(variant.gc_path, "Legacy"));
    if (variant.js_path)
      btnContainer.appendChild(createPlayButton(variant.js_path, "JS"));
    section.appendChild(btnContainer);
    container.appendChild(section);
  });
}

function createModInfoButton(mods, variantName, modCount) {
  const btn = document.createElement("button");
  btn.className = "mod-info-btn";
  btn.title = `View mods in ${variantName}`;
  const displayCount =
    modCount !== undefined
      ? modCount
      : mods.length === 1 && mods[0].name === "No mods"
        ? 0
        : mods.length;
  btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg><span class="mod-count">${displayCount}</span>`;
  btn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    showModsPopup(mods, variantName, displayCount);
  });
  return btn;
}

function showModsPopup(mods, variantName, modCount) {
  const existingPopup = document.getElementById("mods-popup");
  if (existingPopup) existingPopup.remove();

  const isNoMods = mods.length === 1 && mods[0].name === "No mods";
  const displayCount =
    modCount !== undefined ? modCount : isNoMods ? 0 : mods.length;

  const overlay = document.createElement("div");
  overlay.id = "mods-popup";
  overlay.className = "mods-popup-overlay";

  const popup = document.createElement("div");
  popup.className = "mods-popup";

  const header = document.createElement("div");
  header.className = "mods-popup-header";
  header.innerHTML = `<h3>${variantName} Mods (${displayCount})</h3><button class="mods-popup-close">&times;</button>`;
  popup.appendChild(header);

  const modsList = document.createElement("div");
  modsList.className = "mods-list";
  const sortedMods = [...mods].sort((a, b) => {
    const nameA = (typeof a === "string" ? a : a.name).toLowerCase();
    const nameB = (typeof b === "string" ? b : b.name).toLowerCase();
    return nameA.localeCompare(nameB);
  });

  sortedMods.forEach((mod) => {
    const modName = typeof mod === "string" ? mod : mod.name;
    const modUrl = typeof mod === "object" ? mod.url : null;

    if (modUrl) {
      const modLink = document.createElement("a");
      modLink.className = "mod-item";
      modLink.href = modUrl;
      modLink.target = "_blank";
      modLink.rel = "noopener noreferrer";
      modLink.textContent = modName;
      modsList.appendChild(modLink);
    } else {
      const modItem = document.createElement("div");
      modItem.className = "mod-item mod-item-nolink";
      modItem.textContent = modName;
      modsList.appendChild(modItem);
    }
  });

  popup.appendChild(modsList);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
  header
    .querySelector(".mods-popup-close")
    .addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });
}

function createPlayButton(path, label) {
  const btn = document.createElement("a");
  btn.className = "launcher-button";
  btn.href = `#/${btoa(path)}`;
  btn.textContent = label;
  return btn;
}

function renderChangelogPage(container) {
  container.className = "changelog-container";
  const title = document.createElement("h2");
  title.className = "main-title";
  title.textContent = "Changelog";
  container.appendChild(title);

  CHANGELOG_DATA.forEach((entry) => {
    const entryDiv = document.createElement("div");
    entryDiv.className = "changelog-entry";

    const versionTitle = document.createElement("h3");
    versionTitle.className = "changelog-version";
    versionTitle.textContent = entry.version;
    entryDiv.appendChild(versionTitle);

    if (Array.isArray(entry.items)) {
      const list = document.createElement("ul");
      list.className = "changelog-list";
      entry.items.forEach((item) => {
        const li = document.createElement("li");
        li.className = "changelog-description";
        li.textContent = item;
        list.appendChild(li);
      });
      entryDiv.appendChild(list);
    }

    if (entry.description) {
      const desc = document.createElement("p");
      desc.className = "changelog-description";
      desc.textContent = entry.description;
      entryDiv.appendChild(desc);
    }

    if (entry.note) {
      const note = document.createElement("p");
      note.className = "changelog-description changelog-note";
      note.textContent = entry.note;
      entryDiv.appendChild(note);
    }

    container.appendChild(entryDiv);
  });
}

function renderDownloadPage(container) {
  container.innerHTML = "";
  const headerDiv = document.createElement("div");
  headerDiv.className = "download-header";
  headerDiv.innerHTML = `
    <h2 class="main-title">Eagler Modpack 1.6.4 first snapshot ("PRE-ALPHA-u0")</h2>
    <p class="update-text">${HEADER_DATE_TEXT}</p>
    <div class="info-box">${HEADER_INFO_HTML}</div>
    <p class="choose-text">${CHOOSE_TEXT}</p>
  `;
  container.appendChild(headerDiv);

  const listDiv = document.createElement("div");
  listDiv.className = "modpack-list";
  const data = window.modpacksData || {};
  const fullOrder = Object.keys(data).sort(
    (a, b) => getModCount(data[b]) - getModCount(data[a]),
  );

  fullOrder.forEach((id) => {
    if (!data[id]) return;
    const variant = data[id];
    const nameForFile =
      variant.name === "SkyFactory" ? "Skyfactory" : variant.name;
    const section = document.createElement("div");
    section.className = "modpack-section";

    const titleRow = document.createElement("div");
    titleRow.className = "modpack-title-row";
    const title = document.createElement("h2");
    title.className = "modpack-name";
    title.textContent = variant.name;
    titleRow.appendChild(title);
    if (variant.mods && variant.mods.length > 0)
      titleRow.appendChild(
        createModInfoButton(variant.mods, variant.name, getModCount(variant)),
      );
    section.appendChild(titleRow);

    const btnContainer = document.createElement("div");
    btnContainer.className = "modpack-buttons";
    btnContainer.appendChild(
      createDownloadButton(
        `downloads/Eaglercraft_WASM-GC_JSPI_Offline_${nameForFile}.html`,
        "JSPI",
        variant.name,
      ),
    );
    btnContainer.appendChild(
      createDownloadButton(
        `downloads/Eaglercraft_WASM-GC_Legacy_Offline_${nameForFile}.html`,
        "Legacy",
        variant.name,
      ),
    );
    btnContainer.appendChild(
      createDownloadButton(
        `downloads/Eaglercraft_Offline_${nameForFile}.html`,
        "JS",
        variant.name,
      ),
    );
    section.appendChild(btnContainer);
    listDiv.appendChild(section);
  });

  container.appendChild(listDiv);
}

async function streamFetch(url, gateway, onProgress) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status} from ${gateway}`);

  const totalSize = parseInt(response.headers.get("content-length") || "0");
  const reader = response.body.getReader();
  const chunks = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    if (onProgress) onProgress(received, totalSize, gateway);
  }

  return { blob: new Blob(chunks), received, total: totalSize, gateway };
}

async function fetchWithGatewayFallback(path, onProgress, status) {
  const gateways = getGatewayUrls();
  let lastErr;

  for (let i = 0; i < gateways.length; i++) {
    const gw = gateways[i];
    try {
      if (status) status(`Trying gateway ${i + 1}/${gateways.length}...`, gw);
      const result = await streamFetch(`${gw}/${path}`, gw, onProgress);
      return result;
    } catch (err) {
      console.warn(`Gateway failed: ${gw}`, err);
      lastErr = err;
    }
  }
  throw lastErr || new Error("All IPFS gateways failed");
}

function createDownloadButton(url, label, variantName) {
  const btn = document.createElement("a");
  btn.className = "download-button";
  btn.href = "#";
  btn.textContent = label;

  btn.addEventListener("click", async function (e) {
    e.preventDefault();
    document.body.classList.add("no-scroll");

    const downloadType =
      label === "JSPI"
        ? "WASM GC JSPI"
        : label === "Legacy"
          ? "WASM GC Legacy"
          : "JS";
    const fileName = url.split("/").pop();

    showLoading("Preparing download...", true);
    updateProgress(
      0,
      "Preparing download...",
      `${variantName} ${downloadType}`,
    );

    try {
      const result = await fetchWithGatewayFallback(
        url,
        (received, total, gateway) => {
          const mb = (received / (1024 * 1024)).toFixed(2);
          if (total > 0) {
            const percent = Math.min(100, Math.round((received / total) * 100));
            updateProgress(percent, `Downloading... ${percent}%`, `${mb} MB`);
          } else {
            updateProgress(
              Math.min(90, Math.round(received / 500000)),
              "Downloading...",
              `${mb} MB`,
            );
          }
        },
        (msg) => updateProgress(0, msg, `${variantName} ${downloadType}`),
      );

      const blob = new Blob([result.blob], { type: "text/html" });
      const downloadUrl = URL.createObjectURL(blob);
      const finalMB = (result.received / (1024 * 1024)).toFixed(2);

      updateProgress(100, "Download Complete!", `${finalMB} MB`);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      updateProgress(
        100,
        "Saved!",
        `${variantName} ${downloadType} (${finalMB} MB)`,
      );
      setTimeout(() => {
        hideLoading();
        document.body.classList.remove("no-scroll");
      }, 1500);
    } catch (error) {
      updateProgress(0, "Download Failed", error.message);
      setTimeout(() => {
        hideLoading();
        document.body.classList.remove("no-scroll");
      }, 2500);
    }
  });

  return btn;
}

function render404Page(container) {
  container.className = "error-container";
  container.innerHTML = `
    <h2 class="error-title-green error-title-large">404</h2>
    <p class="error-description">Looks like this page got lost in the MATRIX.</p>
    <a href="#/" class="launcher-button go-home-btn">Back Home</a>
  `;
}

function extractScriptSources(html) {
  const sources = [];
  const re = /<script[^>]+src=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    if (!/^https?:|^\/\//i.test(m[1])) sources.push(m[1]);
  }
  return sources;
}

function mountGameRefreshButton(relativePath) {
  const existing = document.getElementById("game-refresh-btn");
  if (existing) existing.remove();

  const btn = document.createElement("button");
  btn.id = "game-refresh-btn";
  btn.className = "game-refresh-btn";
  btn.title = "Re-download the latest version of this client";
  btn.setAttribute("aria-label", "Re-download client");
  btn.innerHTML = "&#x21bb;";
  btn.addEventListener("click", async () => {
    btn.disabled = true;
    try {
      if ("caches" in window) {
        const names = await caches.keys();
        await Promise.all(names.map((n) => caches.delete(n)));
      }
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) await reg.update();
      }
    } catch (err) {
      console.warn("Refresh failed:", err);
    } finally {
      const url = `#/${btoa(relativePath)}`;
      window.location.hash = "";
      setTimeout(() => {
        window.location.hash = url;
      }, 50);
      btn.disabled = false;
    }
  });
  document.body.appendChild(btn);
}

async function loadGame(relativePath) {
  const container = document.querySelector(".container");
  const gameView = document.getElementById("game-view");
  const useIpfs = isIpfsGame(relativePath);

  document.title = "Loading...";
  container.style.display = "none";
  gameView.style.display = "block";
  document.body.classList.add("no-scroll");

  const entryPath = relativePath.endsWith("/")
    ? `${relativePath}index.html`
    : relativePath;
  let chosenGateway = null;

  if (useIpfs) {
    showLoading("Connecting to IPFS gateway...", true);
    updateProgress(0, "Connecting to IPFS gateway...", "");

    try {
      const indexResult = await fetchWithGatewayFallback(
        entryPath,
        (received, total) => {
          const kb = (received / 1024).toFixed(1);
          if (total > 0) {
            const percent = Math.min(99, Math.round((received / total) * 100));
            updateProgress(
              Math.min(15, percent),
              "Downloading client manifest...",
              `${kb} KB`,
            );
          } else {
            updateProgress(5, "Downloading client manifest...", `${kb} KB`);
          }
        },
        (msg) => updateProgress(0, msg, ""),
      );
      chosenGateway = indexResult.gateway;

      const html = await indexResult.blob.text();
      const scripts = extractScriptSources(html);
      const baseDir = relativePath.endsWith("/")
        ? relativePath
        : relativePath.replace(/[^/]+$/, "");

      let totalAcrossScripts = 0;
      let receivedAcrossScripts = 0;
      const scriptTotals = new Array(scripts.length).fill(0);

      for (let i = 0; i < scripts.length; i++) {
        const src = scripts[i];
        const fullPath = `${baseDir}${src}`;
        const url = `${chosenGateway}/${fullPath}`;
        try {
          await streamFetch(url, chosenGateway, (received, total) => {
            if (total && scriptTotals[i] !== total) {
              totalAcrossScripts += total - scriptTotals[i];
              scriptTotals[i] = total;
            }
            const cur = receivedAcrossScripts + received;
            const mb = (cur / (1024 * 1024)).toFixed(2);
            if (totalAcrossScripts > 0) {
              const percent = Math.min(
                99,
                Math.round((cur / totalAcrossScripts) * 100),
              );
              updateProgress(
                percent,
                `Downloading game... ${percent}%`,
                `${mb} MB · ${i + 1}/${scripts.length}`,
              );
            } else {
              updateProgress(
                Math.min(90, 15 + Math.round(received / 1000000)),
                "Downloading game...",
                `${mb} MB · ${i + 1}/${scripts.length}`,
              );
            }
          });
        } catch (err) {
          console.warn(`Failed to preload ${fullPath}:`, err);
        }
        receivedAcrossScripts += scriptTotals[i];
      }

      updateProgress(100, "Ready", "");
    } catch (err) {
      console.error("IPFS preload failed:", err);
      updateProgress(0, "Failed to connect to IPFS gateway", err.message);
      setTimeout(() => {
        hideLoading();
        window.location.hash = "";
      }, 2500);
      return;
    }
  } else {
    showLoading("Loading game...", false);
  }

  const gameUrl =
    useIpfs && chosenGateway ? `${chosenGateway}/${entryPath}` : relativePath;

  const iframe = document.createElement("iframe");
  iframe.id = "game-iframe";
  iframe.style.cssText =
    "width:100%;height:100%;border:none;position:absolute;top:0;left:0;z-index:1;background:#000;";
  iframe.allowFullscreen = true;

  let iframeLoaded = false;
  iframe.onload = function () {
    iframeLoaded = true;
    hideLoading();
    document.title = "Playing...";
    mountGameRefreshButton(relativePath);
  };

  setTimeout(
    () => {
      if (!iframeLoaded) {
        hideLoading();
        document.title = "Playing...";
        mountGameRefreshButton(relativePath);
      }
    },
    useIpfs ? 20000 : 10000,
  );

  gameView.appendChild(iframe);
  iframe.src = gameUrl;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLauncher);
} else {
  initLauncher();
}
