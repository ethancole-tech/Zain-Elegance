# 🪡 Zain Elegance — Complete Setup Guide

## Your Website Files Are Ready. Follow These Steps Exactly.

---

## STEP 1 — Create GitHub Account (if you don't have one)

1. Go to **https://github.com**
2. Click **Sign Up**
3. Enter your email, create a password, choose a username (e.g. `zainelegance`)
4. Verify your email

---

## STEP 2 — Create New Repository

1. After logging in, click the **"+"** icon (top right) → **New repository**
2. Repository name: `zain-elegance`
3. Set to **Public**
4. ✅ Check **"Add a README file"**
5. Click **Create repository**

---

## STEP 3 — Enable GitHub Pages (Free Hosting)

1. Inside your new repo, click **Settings** (top menu)
2. Scroll down to **Pages** (left sidebar)
3. Under **Source**, select **main** branch, folder **/ (root)**
4. Click **Save**
5. Wait 2 minutes. Your website will be live at:
   `https://YOUR-USERNAME.github.io/zain-elegance/`

---

## STEP 4 — Upload Files (In This Exact Order)

### How to upload any file:
1. Go to your repo on GitHub
2. Click **Add file** → **Upload files**
3. Drag the file in → scroll down → Click **Commit changes**

---

### 📁 FOLDER & FILE UPLOAD ORDER:

#### ROOT FILES (upload directly to main repo):
```
index.html      → drag and upload to root
shop.html       → drag and upload to root
about.html      → drag and upload to root
contact.html    → drag and upload to root
cart.html       → drag and upload to root
```

#### DATA FOLDER:
1. Click **Add file** → **Create new file**
2. In the filename box type: `data/products.json`
3. Paste the entire content of `products.json`
4. Click **Commit changes**

#### ASSETS/CSS FOLDER:
1. Click **Add file** → **Create new file**
2. Filename: `assets/css/style.css`
3. Paste content of `style.css`
4. Commit

#### ASSETS/JS FOLDER — Create each file same way:
```
assets/js/products.js   → paste content of products.js
assets/js/reviews.js    → paste content of reviews.js
assets/js/ai-chat.js    → paste content of ai-chat.js
assets/js/cart.js       → paste content of cart.js
```

#### ADMIN FOLDER:
```
admin/dashboard.html    → paste content of dashboard.html
```

#### IMAGE FOLDERS (create them by uploading a placeholder first):
```
assets/images/suits/          → upload your suit photos here
assets/images/bedsheets/      → upload your bedsheet photos here
assets/images/sofa-covers/    → upload your sofa cover photos here
assets/images/comforters/     → upload your comforter photos here
```

---

## STEP 5 — Add Your WhatsApp Number

Search for `923XXXXXXXXX` in every file and replace with your actual number.

**Format:** 92 then your number without the leading 0
- Example: If your number is **0312-3456789** → write **923123456789**

Files to update:
- `index.html`
- `shop.html`
- `about.html`
- `contact.html`
- `cart.html`
- `assets/js/products.js` (line 3)
- `assets/js/ai-chat.js` (line 3)
- `assets/js/cart.js` (line 3)
- `admin/dashboard.html`

---

## STEP 6 — Add Your Product Photos

### Photo naming guide:
Upload photos to the correct folder and name them exactly as below:

| File Name | Folder | Product |
|-----------|--------|---------|
| `gents-navy.jpg` | `assets/images/suits/` | Royal Navy Gents Suit |
| `gents-charcoal.jpg` | `assets/images/suits/` | Charcoal Grey Suit |
| `gents-sherwani.jpg` | `assets/images/suits/` | Ivory Sherwani |
| `ladies-pink.jpg` | `assets/images/suits/` | Rose Pink Ladies Suit |
| `ladies-green.jpg` | `assets/images/suits/` | Emerald Green Suit |
| `ladies-bridal.jpg` | `assets/images/suits/` | Maroon Bridal Suit |
| `white-cotton.jpg` | `assets/images/bedsheets/` | White Cotton Bedsheet |
| `blue-floral.jpg` | `assets/images/bedsheets/` | Floral Blue Bedsheet |
| `satin-luxury.jpg` | `assets/images/bedsheets/` | Luxury Satin Bedsheet |
| `velvet-brown.jpg` | `assets/images/sofa-covers/` | Velvet Sofa Cover |
| `embroidered.jpg` | `assets/images/sofa-covers/` | Embroidered Sofa Cover |
| `ivory-winter.jpg` | `assets/images/comforters/` | Ivory Comforter |
| `floral-quilted.jpg` | `assets/images/comforters/` | Floral Quilted Comforter |

**Tips for photos:**
- Use portrait orientation (taller than wide) for suits
- Minimum 800x1000 pixels
- JPG format, under 500KB each
- Good lighting, plain background preferred

---

## STEP 7 — Admin Dashboard Password

Open `admin/dashboard.html` and find this line:
```
const ADMIN_PASSWORD = "zain2025";
```
Change `zain2025` to your own password. Keep it secret!

Access your admin panel at:
`https://YOUR-USERNAME.github.io/zain-elegance/admin/dashboard.html`

---

## HOW TO UPDATE PRODUCTS (After Launch)

### To change a price:
1. Go to GitHub → `data/products.json`
2. Click the ✏️ pencil (edit) icon
3. Find the product and change the `"price"` number
4. Click **Commit changes**
5. Website updates in 1-2 minutes ✓

### To toggle stock (Available ↔ Out of Stock):
Change `"available": true` to `"available": false` (or vice versa)

### To add a new product:
Copy any existing product block in `products.json`, paste it at the end,
change the `id`, `name`, `price`, `image`, etc.

### Using the Admin Dashboard (easier):
1. Go to `/admin/dashboard.html`
2. Enter your password
3. Toggle availability with the switches
4. Update prices in the boxes
5. Click **Save All Changes**
6. Click **Copy JSON**
7. Go to GitHub → `data/products.json` → Edit → Paste → Commit

---

## YOUR FINAL FOLDER STRUCTURE ON GITHUB

```
zain-elegance/
├── index.html
├── shop.html
├── about.html
├── contact.html
├── cart.html
├── README.md
│
├── data/
│   └── products.json          ← Edit this to update products
│
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── products.js
│   │   ├── reviews.js
│   │   ├── ai-chat.js
│   │   └── cart.js
│   └── images/
│       ├── suits/
│       ├── bedsheets/
│       ├── sofa-covers/
│       └── comforters/
│
└── admin/
    └── dashboard.html         ← Your secret management panel
```

---

## IMPORTANT NOTES

- **AI Chat needs Anthropic API key** to work. The chat widget uses Claude API.
  Go to https://console.anthropic.com → Get API Key → 
  Add it to `ai-chat.js` in the fetch headers as `"x-api-key": "YOUR_KEY"`
  
- **Free hosting on GitHub Pages** — your website will be at:
  `https://YOUR-USERNAME.github.io/zain-elegance/`

- **Custom domain** (optional later): Buy `zainelegance.pk` from PakNIC or any domain registrar,
  then in GitHub repo → Settings → Pages → Custom domain → enter your domain.

---

## QUICK CHECKLIST ✅

- [ ] GitHub account created
- [ ] Repository `zain-elegance` created
- [ ] GitHub Pages enabled
- [ ] All 5 HTML files uploaded (index, shop, about, contact, cart)
- [ ] `data/products.json` uploaded
- [ ] `assets/css/style.css` uploaded
- [ ] All 4 JS files uploaded
- [ ] `admin/dashboard.html` uploaded
- [ ] WhatsApp number replaced everywhere (923XXXXXXXXX → your number)
- [ ] Product photos uploaded to correct folders
- [ ] Admin password changed
- [ ] Website tested on mobile

---

**Your website URL:** `https://YOUR-USERNAME.github.io/zain-elegance/`

For any help, WhatsApp us or ask the AI assistant on the website! 🎉
