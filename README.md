```markdown
<!-- HEADER -->
<p align="center">
  <img src="https://github.com/siyam-exe/bakabot/blob/main/public/banner.png" width="100%" alt="BakaBot Banner">
</p>


<h1 align="center">🌸 BakaBot — The Anime Emotional Companion</h1>

<p align="center">
  <b>An immersive, emotionally-aware anime AI companion.</b><br>
  Built with <b>Next.js · Tailwind CSS · TypeScript · DeepSeek Chat v3.1 via OpenRouter</b>
</p>

<p align="center">
  🎭 <i>"Your emotionally unstable waifu… but in TypeScript."</i>
</p>

<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-14.2-black?logo=next.js" alt="Next.js"></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/TailwindCSS-3.4-38BDF8?logo=tailwindcss" alt="TailwindCSS"></a>
  <a href="https://openrouter.ai"><img src="https://img.shields.io/badge/OpenRouter-DeepSeek%20v3.1-9b59b6" alt="OpenRouter"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License"></a>
</p>

---

## 🖼️ Preview

> “Every mood swing… rendered in pixels.”

<p align="center">
  <img src="https://github.com/siyam-exe/bakabot/blob/main/public/preview.png" width="720" alt="BakaBot Preview Screenshot">
  <br>
  <sub><i>✨ Example interaction with dynamic emotion and anime-style text box ✨</i></sub>
</p>

---

## 📖 Overview

**BakaBot** is an AI-powered anime companion that reacts emotionally, visually, and linguistically like a real anime character.  
Your messages shape her **mood**, **dialogue tone**, and **appearance** — evolving from tsundere to affectionate as your bond grows.

---

## 💞 Core Features

### 🌈 Emotion System
- 10 evolving states: **Angry → Annoyed → Tsundere → Neutral → Curious → Shy → Happy → Excited → Flirty → Affectionate**
- Smooth, gradual transitions — no instant jumps  
- Emotion blending for realism  
- Memory-based emotional continuity  

### 💫 Visual Effects

| Effect | Description |
|--------|-------------|
| 💢 **Screen Shake** | Triggers when angry |
| ✨ **Glow Aura** | Active during happy/flirty moods |
| 🎨 **Color Tint** | Unique hue overlay per emotion |
| 💕 **Particles** | Hearts or sparkles depending on feeling |
| 🌀 **Smooth Animations** | 700ms sprite transitions with fade-in |

### 🧠 AI Personality
- Context-aware via **DeepSeek Chat v3.1 (OpenRouter)**
- Weighted **sentiment analysis** for emotion control  
- Interactive actions: 🤚 Pat · 💋 Kiss · 🍱 Eat · 🎬 Watch  
- Personality consistency across conversation threads  

---

## 🧩 Project Structure

```

bakabot/
├── app/
│   ├── api/chat/route.ts      # Emotion logic + DeepSeek API
│   ├── page.tsx               # Main UI + effects
│   ├── layout.tsx             # Root layout
│   └── globals.css            # Tailwind + animations
├── public/
│   ├── backgrounds/room.jpeg
│   └── characters/[emotion].png (×10)
├── .env.local
└── package.json

````

---

## 🚀 Setup & Installation

### 🧰 Prerequisites
- Node.js **v18+**
- An **OpenRouter API Key** — [Get one here](https://openrouter.ai/)

### ⚙️ Quick Start

```bash
# 1️⃣ Install dependencies
npm install

# 2️⃣ Add your OpenRouter API key
echo "OPENROUTER_API_KEY=your_api_key_here" > .env.local

# 3️⃣ Run the development server
npm run dev
````

Visit ➜ [http://localhost:3000](http://localhost:3000)

---

## 🎭 Emotion Table

| Level | Emotion      | Emoji | Description            |
| :---: | :----------- | :---: | ---------------------- |
|   0   | Angry        |   😠  | Loud and dramatic      |
|   1   | Annoyed      |   😒  | Pouty and sarcastic    |
|   2   | Tsundere     |   😤  | Flustered but caring   |
|   3   | Neutral      |   😐  | Balanced tone          |
|   4   | Curious      |   🤔  | Thoughtful and engaged |
|   5   | Shy          |   🫣  | Blushing and quiet     |
|   6   | Happy        |   😊  | Cheerful and warm      |
|   7   | Excited      |   🤩  | Hyperactive and bubbly |
|   8   | Flirty       |   😘  | Playful and teasing    |
|   9   | Affectionate |   💕  | Deeply caring          |

---

## 🎨 Visual Emotion Effects

| Emotion      | Tint            | Effect     | Particles |
| ------------ | --------------- | ---------- | --------- |
| Angry        | 🔴 Red (15%)    | Shake      | —         |
| Tsundere     | 💗 Pink (8%)    | None       | —         |
| Curious      | 🔵 Blue (8%)    | Sparkles ✨ | ✨         |
| Shy          | 💕 Pink (12%)   | None       | —         |
| Happy        | 💛 Yellow (10%) | Glow       | ✨         |
| Flirty       | 💖 Pink (15%)   | Glow       | 💕        |
| Affectionate | 🌹 Rose (18%)   | Glow       | 💕        |

---

## ⚙️ Configuration

### 🎛️ Adjust Emotion Sensitivity (`app/api/chat/route.ts`)

```ts
if (history.sentimentHistory.length > 5) // History window
const consistent = recentSentiments.filter(s => s > 0).length >= 2; // Mood shift threshold
moodChange = Math.min(1, avgSentiment * 0.6); // Smoothing rate
```

### 🎨 Visual Settings (`app/page.tsx`)

```ts
const particleCount = 8;
const tintOpacity = 0.15; // 15% overlay intensity
```

---

## 🕹️ Usage Tips

* 💬 Chat naturally — emotions evolve with tone
* 🤚 “Pat” increases comfort
* 💋 “Kiss” triggers stronger reactions
* 🎬 “Watch” and 🍱 “Eat” calm her mood
* 🔁 Stay consistent for stable emotional growth

---

## 🧠 Planned Enhancements

* 💾 Persistent memory system
* 🎤 Voice synthesis (anime-style dialogue)
* 💫 Visual novel event triggers
* 💬 Typing animation effects

---

## 🛠️ Tech Stack

| Tech                     | Description                  |
| ------------------------ | ---------------------------- |
| ⚛️ **Next.js 14+**       | React framework (App Router) |
| 🎨 **Tailwind CSS 3.4+** | Utility-first styling        |
| 💬 **DeepSeek v3.1**     | Emotionally intelligent LLM  |
| 🧑‍💻 **TypeScript 5+**  | Static typing                |
| ☁️ **Vercel**            | Deployment platform          |

---

## 🐞 Troubleshooting

| Issue           | Fix                                                        |
| --------------- | ---------------------------------------------------------- |
| API not working | Verify `.env.local` and restart server                     |
| Images missing  | Check filenames in `/public/characters/`                   |
| Emotions stuck  | Needs 2–3 consistent tones                                 |
| Build errors    | Run `rm -rf node_modules package-lock.json && npm install` |

---

## 📜 License

Released under the **MIT License**.
See [LICENSE](LICENSE) for details.

---

<p align="center">
  🩷 <i>Made with love (and TypeScript) for anime fans everywhere.</i>
</p>
```