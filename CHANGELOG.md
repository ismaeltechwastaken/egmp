# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-05-06

### Added

- Initial release of the Eagler Modpack Launcher
- SPA with hash-based routing (home, changelog, downloads, 404)
- 7 modpack variants: Explore (82 mods), SkyFactory (64), Lite (63), Magic (52), Tech, Ultimate, and Vanilla
- Three client build types per variant: JSPI, Legacy (WASM GC), and JS
- IPFS-based game asset loading with multi-gateway fallback
- Streaming download progress UI with progress bar
- Offline HTML download page with per-variant download buttons
- Mod list popup with sorted mod names and links
- Service worker with network-first and stale-while-revalidate caching strategies
- Offline fallback page
- 404 page with SPA redirect
- PWA support via web app manifest
- Responsive design with breakpoints at 768px and 560px
- Self-hosted Segoe UI fonts (normal + bold)
- SEO meta tags, Open Graph, Twitter Cards
- `robots.txt` blocking AI crawlers
- In-game refresh button for cache-busting re-downloads
- MIT License
- Contributing guidelines, Code of Conduct, and AGENTS.md
