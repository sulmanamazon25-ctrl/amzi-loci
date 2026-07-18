# Product Video — Test Cut v0.5

Rough assembly for internal review **before** final VO, color grade, and music.

## Goal

Validate pacing, accuracy of the real app UI, and Amazon-policy messaging. Duration target: **90–120s**.

## Assembly checklist

- [ ] Import screen captures from shot list ([`PRODUCT-VIDEO-SCRIPT.md`](./PRODUCT-VIDEO-SCRIPT.md))
- [ ] Placeholder VO (your voice or temp track) following script timestamps
- [ ] Add 3 disclaimer lower-thirds at 1:06, 1:12, 1:18 (adjust to final edit)
- [ ] Blur any API key input fields
- [ ] Export **1080p H.264** → `apps/web/public/video/amzi-loci-hero-test.mp4`
- [ ] Share unlisted link or local file for approval

## Recording settings

| Setting | Value |
|---------|--------|
| Resolution | 2560×1440 or 1920×1080 |
| App theme | Dark (v0.11 default) |
| Cursor | Visible, slow movements |
| Sample project | “Garlic Press — Client A” |
| Provider in UI | OpenAI or Google for copy; Google for images |

## Review criteria (approve before final)

1. Every workflow step matches **shipping v0.11** UI (sidebar, timeline, six steps).
2. Insights show **verbatim source quotes** from pasted reviews.
3. Compliance checklist visible before export.
4. Settings segment shows **Test key** and **OS keychain** messaging.
5. No banned claim language in generated copy on screen.
6. CTA ends on **amziloci.com/download**, not generic “sign up”.

## After approval

1. Record professional VO (or ElevenLabs / studio talent).
2. Final edit + captions → `amzi-loci-hero.mp4` + `amzi-loci-hero.vtt`.
3. Set `VITE_PRODUCT_VIDEO_URL=/video/amzi-loci-hero.mp4` for production build (optional).
4. Deploy web app — embed appears on Home and Download automatically when file exists.

## File locations

```
apps/web/public/video/
  amzi-loci-hero-test.mp4   # test cut (optional, gitignored if large)
  amzi-loci-hero.mp4        # final hero (gitignored if large)
  amzi-loci-hero.vtt        # captions
  amzi-loci-hero-poster.jpg # poster frame
  README.txt
```

Large MP4 files are gitignored; host via deploy sync or CDN if needed.
