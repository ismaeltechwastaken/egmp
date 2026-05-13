# Contributing to EGMP

Thanks for your interest in contributing! Here's how you can help.

## Getting Started

```bash
git clone -b cf-pages https://github.com/ismaeltechwastaken/eg-modpack-launcher
cd eg-modpack-launcher
python3 -m http.server 8000
# open http://localhost:8000
```

## What I'm Looking For

- **Bug reports** - broken layouts, failed IPFS gateways, etc.
- **UI/UX improvements** - better responsiveness, accessibility, design tweaks.
- **IPFS Gateways** - any faster, reliable, or better IPFS gateways.
- **Repo** - typos
- **New Feature** - you can propose new features.

## Submitting Changes

1. Fork the repo and create a branch from `cf-pages`
2. Make your changes
3. Test locally with a static file server
4. Open a pull request with a clear description of what changed and why

## Code Style

- Vanilla HTML/CSS/JS - no frameworks or build tools
- Use CSS custom properties defined in `data/style.css`
- Test on desktop Chrome/Firefox at minimum

# Commit Messages

Commit messages should be in the format:

- `feat:` new features
- `fix:` bug fixes
- `docs:` documentation changes
- `style:` styling changes
- `refactor:` code refactoring
- `test:` adding or updating tests
- `chore:` maintenance tasks

## Project Structure

```
eg-modpack-launcher/
├── index.html                  # Main SPA entry point
├── 404.html                    # 404 fallback (redirects to SPA hash route)
├── offline.html                # Offline fallback page for service worker
├── sw.js                       # Service worker (caching, offline support, IPFS)
├── _redirects                  # Cloudflare Pages redirect rules
├── robots.txt                  # AI crawler blocks + search engine rules
├── sitemap.xml                 # Sitemap for SEO
├── site.webmanifest            # PWA web app manifest
├── favicon.ico                 # Favicons
├── favicon.svg
├── favicon-96x96.png
├── apple-touch-icon.png
├── web-app-manifest-192x192.png
├── web-app-manifest-512x512.png
├── data/
│   ├── script.js               # Main application logic (routing, IPFS, rendering)
│   ├── style.css               # Design tokens, CSS custom properties, fonts
│   ├── layout.css              # Structural layout and responsive breakpoints
│   ├── components.css          # Component styles (buttons, modals, loading, etc.)
│   ├── data.json               # Game variant config (mod lists, paths, metadata)
│   ├── changelog.html          # Static changelog HTML fragment
│   ├── manifest.json           # Legacy web app manifest
│   ├── logo.png                # Site logo
│   ├── onlineCheck.txt         # Connectivity check endpoint
│   ├── segoe-ui-normal.woff2   # Self-hosted font
│   └── segoe-ui-bold.woff2     # Self-hosted font (bold)
├── img/
│   └── preview.png             # Social preview image (OG/Twitter)
├── AGENTS.md                   # AI agent instructions
├── CHANGELOG.md                # Release changelog
├── CONTRIBUTING.md             # This file
├── CODE_OF_CONDUCT.md          # Code of conduct
├── LICENSE                     # MIT License
└── .gitignore
```

## Reporting Issues / Bugs

Open an issue with:

- Browser and OS
- Screenshots if relevant
- Expected vs actual behavior
- Steps to reproduce
- Any relevant logs

## Code of Conduct

Be nice and respectful to other contributors.

## License

If you contribute to EGMP, you agree to release your contributions under the [MIT license](LICENSE).

## Questions?

Join the [Discord](https://discord.com/invite/gNgrNhrQYU) or open an issue.
