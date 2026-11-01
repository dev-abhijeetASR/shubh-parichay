# 🪔 ShubhParichay (शुभ परिचय)
### Royal Indian Marriage Biodata Studio & Generator

**ShubhParichay** is a traditional yet modern, high-converting marriage biodata builder web application built with **React**, **Vite**, and **Tailwind CSS**. It allows users to create, customize, preview, and download royal marriage biodatas in minutes.

---

## ✨ Features

- **🎨 5 Royal Theme Presets**:
  - *Royal Maroon & Gold* (Vedic Classic & Regal, modeled after traditional royal marriage scrolls)
  - *Pavitra Emerald & Gold* (South Indian & Sacred Temple Green)
  - *Peacock Blue & Gold* (Divine Krishna & Majestic)
  - *Rose Gold & Blush* (Modern, Soft & Romantic)
  - *Saffron & Sandalwood* (Vedic Sandhya & Auspicious)
- **🪔 Sacred Accents & Embellishments**:
  - Custom vector **Kalash SVG** (mango leaves, coconut, sacred kalava thread, swastika)
  - Customizable **Shloka presets** (*Ganeshay Namah*, *Radha-Krishna*, *Shiva*, *Gurudev*, *Saraswati*, *Waheguru*, or custom)
  - Radiant **Surya Rays** behind the arched portrait
  - Animated rotating **mandala backdrops**
  - Falling flower **petals animation** (marigold & rose petals)
- **👤 Interactive Form Editor**:
  - Photo upload with live crop/fit into the golden arched frame
  - Full Name, Community / Vansh badge (`रघुवंशी`), and Tagline
  - Date of Birth with **automatic live age calculation**
  - Astrological / Kundali details (Time, Place, Height, Manglik status, Gotra, Rashi, Nakshatra, Complexion)
  - Education & Career timeline (dynamic repeater: add/edit/delete milestones)
  - Introduction bio, hobbies with emoji tags, and spoken languages chips
  - Family members background (Grandparents, Parents, Siblings with "Late / स्वर्गवासी" badge support)
  - Direct contact links (Phone, Email, Current Address, Native Village Address linked with Google Maps)
- **⚡ Instant Live Synchronized Preview**:
  - Desktop, Tablet, and Mobile view toggles
  - Automatic `localStorage` persistence so data is never lost on refresh
- **📄 Multi-Format Export Engine**:
  - **Save PDF**: Print-ready A4 layout with page break avoidance and high-fidelity colors.
  - **Export Standalone HTML**: Generates a single, zero-dependency `.html` file with embedded CSS, SVGs, and base64 image data—ready to share on WhatsApp or deploy directly to **GitHub Pages**!
  - **Save / Load JSON**: Backup and restore user profiles anytime.
  - **Load Sample Data**: 1-click test with complete demo data.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
# Navigate to project directory
cd C:\Users\abhij\.gemini\antigravity\scratch\shubh-parichay

# Install dependencies (already completed)
npm install

# Start local development server
npm run dev
```

The app will launch at `http://localhost:3000`.

### Production Build
```bash
npm run build
```
Output files will be generated in `dist/`, ready for static hosting.

---

## 🌐 1-Click Deployment (Vercel / Netlify)

1. Push this directory to your GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of ShubhParichay"
   git branch -M main
   git remote add origin https://github.com/<your-username>/shubh-parichay.git
   git push -u origin main
   ```
2. Connect your repo on [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
3. The build settings are auto-detected (`npm run build`, output: `dist`).

---

## 💰 Monetization Roadmap (Future SaaS Integration)

1. **Freemium Tier**:
   - Free access to standard themes (Royal Maroon & Emerald).
   - Basic PDF download with discreet footer watermark.
2. **Premium Unlock (₹99 - ₹199 / $3 - $5 one-time)**:
   - Unlock all premium themes and special animated backgrounds.
   - Watermark-free, ultra-sharp print-ready PDF.
   - Single-file standalone HTML bundle.
3. **Hosted Custom Biodata Link (₹149/year)**:
   - Host candidate profiles on `shubhparichay.in/p/username` with rich WhatsApp OpenGraph link preview cards.
4. **Payment Gateways**:
   - Seamless plug-and-play integration with **Razorpay** (for India / UPI / Cards) or **Stripe** (International).

---

## 📁 Project Structure

```
shubh-parichay/
├── index.html                   # HTML entry point with Google Fonts
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind configuration & typography
├── package.json                 # Project dependencies
├── src/
│   ├── main.jsx                 # React root mount
│   ├── App.jsx                  # Main studio container (2-panel layout & state)
│   ├── index.css                # Custom animations, keyframes, print media rules
│   ├── themes.js                # 5 Royal color palettes & Shloka presets
│   ├── data/
│   │   └── initialData.js       # Default demo biodata data
│   ├── utils/
│   │   └── exportHtml.js        # Single-file standalone HTML compiler
│   └── components/
│       ├── Navbar.jsx           # Studio header, device toggles, export actions
│       ├── KalashSvg.jsx        # Vector sacred Kalash graphic
│       ├── MandalaRaysSvg.jsx   # Surya rays & rotating mandalas
│       ├── FallingPetals.jsx    # Animated falling rose & marigold petals
│       ├── BiodataPreview.jsx   # Live royal biodata card
│       └── FormEditor/
│           └── FormEditor.jsx   # Tabbed form controls (Basics, Kundali, Family, etc.)
```
