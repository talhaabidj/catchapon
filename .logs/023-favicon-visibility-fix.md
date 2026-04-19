# 023 - Favicon and Logo Visibility Fix

Date: 2026-04-19

## Context
Tab icon still showed browser fallback in some clients, and logo updates did not always reflect immediately.

## Root Cause
- Favicon setup only exposed limited icon variants and relied on a single-size ICO path.
- Browsers (especially mobile Safari/WebKit) can aggressively cache icon URLs.
- UI logo references reused the same static URL, so stale cached assets could persist.

## Changes
- Added a complete favicon set under `public/`:
  - `favicon.ico` (multi-size)
  - `favicon-16x16.png`
  - `favicon-32x32.png`
  - `apple-touch-icon.png`
  - `android-chrome-192x192.png`
  - `android-chrome-512x512.png`
- Added `public/site.webmanifest` with PWA icon declarations.
- Updated `index.html` icon links to use explicit sizes and cache-busted URLs.
- Updated loading-screen and desktop logo image URLs to cache-busted logo URL.
- Kept logo display background-free (no CSS border radius/shadow framing).

## Validation
- `npm run build` passes.
- Commit pushed to `main`.
