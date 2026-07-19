# Client BYOK — One Google Key

Hand this to clients or agency seats. One API key covers the full Amzi Loci workflow.

## Why Google only?

| Feature | Google | OpenAI alone | Anthropic alone |
|---------|--------|--------------|-----------------|
| Review insights | Yes | Yes | Yes |
| Listing copy | Yes | Yes | Yes |
| Listing images | **Yes** | No | No |
| Studio (Pro+) | Yes | Yes | Yes |

Listing images require Google Imagen/Gemini. No other provider can complete step 5.

**Typical cost:** $3–6 per listing (Gemini Flash text + Imagen Fast images).

---

## Setup (5 minutes)

### 1. Create your key

1. Open [Google AI Studio → API keys](https://aistudio.google.com/apikey)
2. Create a new key (one per client account recommended)
3. **Enable billing** on the linked Google Cloud project — image generation often fails without it

### 2. Add key in Amzi Loci

1. Open **Settings** in the desktop app sidebar
2. Find **Google AI**
3. Paste your key → **Test key** → **Save to keychain**
4. Leave Anthropic and OpenAI empty

### 3. Run your first project

1. **Projects** → New project → paste Amazon reviews
2. Insights + Copy: keep provider set to **Google**
3. Images: use **Imagen Fast** tier (upgrade only hero slots if needed)
4. Complete all six steps through **Export**

---

## Cost guardrails

- Set a Google billing alert at **$10–20/month**
- Track spend in the desktop **Usage** panel
- Use Imagen Fast for drafts; premium tiers only for final hero images

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Image step says Google key required | Save a Google key in Settings |
| Imagen error 403 or 429 | Enable billing; wait 60 seconds; retry |
| Text step fails | Provider dropdown must be **Google**, not Anthropic/OpenAI |
| Quota exceeded | Raise billing limit or enable paid tier |

---

## Product Video note

Product Video in the desktop app generates **storyboards and scripts** — not rendered video files. Export the storyboard and edit in CapCut, Premiere, or your ad tool.

---

## Links

- Full guide: https://amziloci.com/byok-setup
- Getting started: https://amziloci.com/getting-started
- Download: https://amziloci.com/download
