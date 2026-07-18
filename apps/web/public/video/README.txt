# Product video assets

Place final files here for the marketing site embed:

- amzi-loci-hero.mp4       — 90–120s hero film (required for embed)
- amzi-loci-hero.vtt       — English captions (optional)
- amzi-loci-hero-poster.jpg — poster frame (optional; SVG fallback included)

Test cut: amzi-loci-hero-test.mp4 (local review only)

Production script: docs/marketing/PRODUCT-VIDEO-SCRIPT.md
Test cut checklist: docs/marketing/PRODUCT-VIDEO-TEST-CUT.md

Override URLs at build time:
  VITE_PRODUCT_VIDEO_URL=/video/amzi-loci-hero.mp4
  VITE_PRODUCT_VIDEO_POSTER=/video/amzi-loci-hero-poster.jpg

Large MP4 files are gitignored — upload to server or GitHub Release and sync on deploy.
