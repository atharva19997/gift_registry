# Sara & Atharva — Wedding Registry

A tiny, free, static website for your wedding gift registry. No server, no
database, no logins. It just reads a single file (`gifts.json`) and shows the
gifts nicely. You update that one file whenever you want to add a gift or mark
one as gifted.

## Files

| File | What it does |
|------|--------------|
| `index.html` | The page itself (hero, "how to gift", claim banner, gallery). |
| `style.css` | The look and feel. |
| `script.js` | Reads `gifts.json` and draws the cards. Builds the WhatsApp claim links. |
| `gifts.json` | **The only file you edit.** Your list of gifts. |

## Before you publish — 2 things to change

1. **Nothing to set for contact details.** No phone number is stored
   anywhere. Each "Claim this gift" button opens WhatsApp with a message
   already written (including the gift title), and the guest chooses to send
   it to Atharva or Sara.
2. **The date/details** in the hero paragraph, if you'd like to add them.

---

## How to add a gift (the JSON template)

`gifts.json` is a list `[ ... ]` of gift objects. Copy this block, paste it as a
new item, and fill it in. **Every gift needs a unique `id`.** Put a comma
between items, but not after the last one.

```json
{
  "id": "g4",
  "title": "Name of the gift",
  "description": "One short, friendly line about it.",
  "imageUrl": "https://.../image.jpg",
  "link": "https://www.amazon.in/dp/XXXX",
  "status": "available",
  "giftedBy": []
}
```

Field guide:

- **id** — any short unique text (`g4`, `g5`, …). No two gifts share one.
- **title / description** — shown on the card. Plain text; no HTML needed.
- **imageUrl** — a **direct link to an image** (ends in `.jpg`/`.png`/`.webp`,
  or an Unsplash `images.unsplash.com/...` link). See below for how to get one.
- **link** — the product page (Amazon, Flipkart, anywhere). Must start with
  `http://` or `https://`.
- **status** — `"available"` or `"gifted"`.
- **giftedBy** — a list of names, e.g. `["Priya", "Rohan"]`. Empty `[]` until gifted.

### How to get a product image URL (imageUrl)

Amazon/Flipkart block automatic image fetching, so paste the image link in
yourself once. Easiest ways:

- **Right-click the product photo → "Copy image address"** (Chrome/Edge/Firefox
  on desktop). Paste that link into `imageUrl`.
- **Or** take a screenshot of the product, upload it to a free image host
  (e.g. [imgur.com](https://imgur.com) or [postimages.org](https://postimages.org)),
  and copy the **direct** image link they give you.
- **Or** drop the image file into this repo (e.g. an `images/` folder) and use
  `"imageUrl": "images/mixer.jpg"`.

If an image ever fails to load, the card shows a small ornament instead — the
site never breaks.

## How to mark a gift as "gifted"

Edit that gift in `gifts.json`:

```json
"status": "gifted",
"giftedBy": ["Priya", "Rohan"]
```

Save/commit, and within a minute the site shows the "Gifted" badge and a
line of thanks. That's it.

---

## Publish it free on GitHub Pages (no coding)

### 1. Make a free GitHub account
Go to **https://github.com** → **Sign up**. It's free.

### 2. Create a repository
- Click the **+** (top-right) → **New repository**.
- **Repository name:** `wedding-registry` (or anything you like).
- Set it to **Public**.
- Click **Create repository**.

### 3. Upload the files
- On the new repo page, click **uploading an existing file**
  (or **Add file → Upload files**).
- Drag in **all four files**: `index.html`, `style.css`, `script.js`,
  `gifts.json` (and the `images/` folder if you made one).
- Scroll down, click **Commit changes**.

### 4. Turn on GitHub Pages
- In the repo, click **Settings** → **Pages** (left sidebar).
- Under **Build and deployment → Source**, choose **Deploy from a branch**.
- **Branch:** select **main**, folder **/ (root)** → **Save**.

### 5. Get your live link
- Wait ~1 minute, then refresh the **Pages** settings page.
- Your site appears at the top:
  **`https://YOUR-USERNAME.github.io/wedding-registry/`**
- Share that link with guests.

### 6. Edit gifts later — right in the browser, no coding
- Go to your repo, click **`gifts.json`**.
- Click the **pencil ✏️ (Edit)** icon (top-right of the file).
- Add a gift (using the template above) or change a `status`/`giftedBy`.
- Scroll down → **Commit changes**. The live site updates within a minute.

---

## Good to know

- **It stays free and live indefinitely.** GitHub Pages for public repos has no
  expiry. There is **nothing to renew before Feb 2027** (or ever) — the site
  only goes away if *you* delete the repository.
- **It's safe.** There are no forms, no comment boxes, and nothing on the page
  that can write to your site. Only you, signed into GitHub, can change the
  gift list. The code also treats all gift text as plain text, so pasted content
  can never run as code.
- **Custom domain (optional).** If you own a domain, Settings → Pages →
  **Custom domain** lets you use e.g. `sara-and-atharva.com`.
