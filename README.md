<div align="center">
  <img src="Frontend/public/logo.png" alt="CallOut Esports Logo" width="150"/>
  <h1>CallOut Esports</h1>
  <p><strong>Building India's Ultimate Esports Community.</strong></p>
  <p>Competitive tournaments • Fair play • Real rewards.</p>
</div>

<br/>

## 🎮 Overview

**CallOut Esports** is a premium, high-performance web platform designed to host, manage, and scale competitive gaming tournaments. Featuring a sleek, mobile-first **Jet Black & Neon Green** aesthetic, the platform is crafted to provide an elite, immersive experience tailored directly to the esports demographic. 

Whether players are dominating in **BGMI, Valorant, Free Fire Max, or Call of Duty Mobile**, CallOut serves as the central hub for registration, team management, and active event tracking.

---

## ⚡ Key Features

### For Players
- **Dynamic Tournaments Hub:** Real-time visibility into all active tournaments, displaying live prize pools, current slot capacities, and dynamic *LIVE NOW* indicators.
- **Dedicated Game Pages:** Sort active matches directly under supported flagship titles.
- **Player Dashboard:** A unified player portal to track upcoming registered events, recent activity, and personalized account statistics.
- **Secure Authentication:** Seamless Email/Password and one-click Google account sign-ins.
- **Mobile-First Experience:** Flawlessly responsive layout designed meticulously for iOS and Android players—complete with smooth slide-drawer navigation and stacked-card tables.

### For Administrators
- **Robust Admin Portal:** A secure toggle allowing admins to manage the entire ecosystem without leaving the dashboard.
- **Tournament Control:** Create, edit, and toggle active/completed lifecycle states of tournaments globally.
- **Registration Management:** Oversee incoming team registrations, verify payments, and export participants to CSV effortlessly.
- **User & Query Moderation:** Grant admin roles, manage the player network, and resolve incoming support tickets in real time.

---

## 🛠 Tech Stack

CallOut Esports is built using a modern, scalable, and highly performant architecture capable of accommodating thousands of concurrent competitors.

### Frontend Client
- **Framework:** Next.js (App Router)
- **Library:** React 18
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** React Icons (`react-icons`)

### Backend & Infrastructure
- **BaaS / Database:** Firebase (Firestore NoSQL) configured with strict real-time listeners for instant frontend sync without constant page refreshes.
- **Authentication:** Firebase Auth (JWT Strategy, Google OAuth Identity API).
- **Hosting / Edge:** Vercel (or preferred Next.js edge environments).

---

## 📂 Project Structure

```text
CALLOUT/
├── Frontend/                   # Next.js Application
│   ├── src/
│   │   ├── app/                # App Router (Pages, Layouts, API Routes)
│   │   │   ├── (auth)/         # Login, Register
│   │   │   ├── dashboard/      # Player & Admin Portals
│   │   │   ├── games/          # Supported titles
│   │   │   ├── tournaments/    # Live event grids
│   │   │   └── ... (Legal, About, Contact)
│   │   ├── components/         # Reusable UI (Cards, Navbars, Footers, Modals)
│   │   ├── hooks/              # Custom React hooks (e.g. useRealtimeCollection)
│   │   ├── lib/                # Configs (Firebase, context providers)
│   │   └── types/              # Global TypeScript interfaces
│   └── public/                 # Static Assets (Logos, Game Art)
└── Backend/                    # (If separate API service exists for strict admin endpoints)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- A Firebase Project configured with Firestore and Authentication.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/callout-esports.git
   cd callout-esports/Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the `Frontend/` root and provide your Firebase client keys.
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   *Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.*

---

## 🛡 License & Legal

All intellectual property rights, graphics, and codebase logic belong to **CallOut Esports**.  
Please refer to the `Terms of Service` and `Privacy Policy` located within the application regarding platform rules and data handling.

> **Need Support?** Reach out at [calloutesports@gmail.com](mailto:calloutesports@gmail.com) or ping the community [Discord server](https://discord.gg/calloutesports).
