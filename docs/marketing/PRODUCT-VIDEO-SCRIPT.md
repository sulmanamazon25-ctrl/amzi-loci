# Amzi Loci — Product Video (Hero 90–120s)

Production reference for the high-polish hero film. Sample scenario: **Stainless Steel Garlic Press** (kitchen gadget — no health/supplement claims).

## Deliverables

| Asset | Length | File (when ready) |
|-------|--------|-------------------|
| Hero film | 90–120s | `apps/web/public/video/amzi-loci-hero.mp4` |
| Captions | — | `apps/web/public/video/amzi-loci-hero.vtt` |
| Poster | — | `apps/web/public/video/amzi-loci-hero-poster.jpg` |

Test cut v0.5 checklist: [`PRODUCT-VIDEO-TEST-CUT.md`](./PRODUCT-VIDEO-TEST-CUT.md)

---

## Voiceover script (~105s)

| Time | VO | On-screen |
|------|-----|-----------|
| **0:00–0:08** | Your buyers already told you what matters — in their reviews. But most listings still sound like generic AI fluff. | Motion title card: “Reviews → Listing” |
| **0:08–0:18** | Copy-pasting into ChatGPT. No character limits. No upload pack. No idea if you're Amazon-compliant. | Quick cuts: browser tabs, messy docs (B-roll or stylized) |
| **0:18–0:22** | Amzi Loci is different. | App logo + dark UI fade in |
| **0:22–0:30** | One Windows desk. Six steps. Reviews are the source of truth. | Dashboard → open project “Garlic Press — Client A” |
| **0:30–0:40** | Paste real Amazon reviews. AI extracts what buyers care about — with verbatim quotes from the reviews. | Reviews step → Extract insights → insight cards with source quotes |
| **0:40–0:48** | Apply your brand kit — colors, tone, reference look — so copy and images stay on-brand. | Brand step — color swatches, tone slider |
| **0:48–0:58** | Generate listing copy grounded in those insights. Title, bullets, description — with an Amazon-style preview. | Copy step → preview card |
| **0:58–1:06** | Generate main and gallery images. Pick a cost tier — Imagen Fast for drafts, higher tiers for hero shots. | Images step — tier selector visible |
| **1:06–1:12** | Before you upload, run the compliance checklist — limits, risky claims, AI disclosure reminders. | Export step — checklist pass/warn states |
| **1:12–1:18** | Export one upload pack: copy, images, checklist, and README. You paste into Seller Central yourself. | Zip export confirmation |
| **1:18–1:28** | Bring your own API keys. They stay in Windows Credential Manager — not on our servers. Test, save, track usage per project. | Settings → BYOK cards → Test key → Saved |
| **1:28–1:38** | You pay AI providers directly. Typical cost: two to eight dollars per listing, depending on review volume and image tier. | Lower-third: “BYOK — you control cost” |
| **1:38–1:48** | Amzi Loci. Review-driven Amazon listings for agencies and serious sellers. Download free for 14 days. | CTA: amziloci.com/download |

---

## On-screen disclaimers (lower-third, ~3s each)

1. **Export-first** — You paste into Seller Central. No direct Amazon connection in v0.11.
2. **AI images** — Disclose when Amazon asks during upload. Keep product representation accurate.
3. **BYOK** — You pay Anthropic, OpenAI, and Google directly via your keys.

---

## Shot list (screen capture)

Record at **1440p**, dark theme, **blur all API key fields**.

| # | Scene | App location | Must show |
|---|--------|--------------|-----------|
| 1 | Dashboard | `/` sidebar | Project list, “New project” |
| 2 | Reviews | Workflow step 1 | Paste 8–12 realistic reviews (garlic press) |
| 3 | Insights | Step 2 | Extract button → 8+ insights with **sourceQuote** visible |
| 4 | Brand | Step 3 | Primary color, tone, saved kit name |
| 5 | Copy | Step 4 | Generate → title + 5 bullets in preview |
| 6 | Images | Step 5 | Tier = **imagen-fast**; at least 1 generated slot |
| 7 | Export | Step 6 | Compliance checklist (1 pass, 1 warn OK) → Export zip |
| 8 | Settings | Settings panel | All 3 providers; Test + Save; “Saved to OS keychain” |
| 9 | Usage | Usage panel (optional) | Per-project API call log |
| 10 | Close | Browser mock | Seller Central paste (staged, not fake API) |

### Sample review snippets (garlic press)

Use for recording — mix positive and constructive:

- “Easiest press I've owned — cleans in seconds.”
- “Heavy duty hinge, doesn't flex like cheap ones.”
- “Wish the handles were slightly longer for big hands.”
- “Garlic comes out minced not mashed — great for cooking.”

---

## Amazon policy alignment (do / don't)

**Do show:** verbatim review quotes, character counts, compliance warnings, manual export, AI disclosure warn item.

**Don't show:** “#1 seller”, health cures, fake Seller Central auto-publish, guaranteed ranking claims.

---

## Audio / motion notes

- **VO:** Calm agency tone, American or neutral English, no hype.
- **Music:** Minimal ambient, −18 LUFS under VO.
- **Motion:** Step labels 1–6 matching marketing site timeline; indigo `#4F46E5` on `#09090B`.
