<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=SAVIOUR&fontSize=80&fontColor=fff&animation=twinkling&fontAlignY=35&desc=Disaster%20Management%20Platform&descSize=25&descAlignY=55" width="100%"/>

<a href="https://git.io/typing-svg"><img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&pause=1000&color=3B82F6&center=true&vCenter=true&random=false&width=600&lines=Empowering+Communities+During+Disasters;Real-time+Emergency+Coordination;Save+Lives+with+Technology;Community+Resilience+Platform" alt="Typing SVG" /></a>

<br/><br/>

<a href="https://saviour-web.vercel.app" target="_blank"><img src="https://img.shields.io/badge/LIVE_DEMO-Visit_Platform-0066FF?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo"/></a>
&nbsp;
<a href="https://github.com/Ravikumar-2016/SaviourWeb" target="_blank"><img src="https://img.shields.io/badge/SOURCE_CODE-GitHub-181717?style=for-the-badge&logo=github" alt="GitHub"/></a>

</div>

<br/>

## About

**SAVIOUR** is a next-generation disaster management platform designed to **save lives** and **strengthen community resilience** during emergencies. Built with cutting-edge web technologies, it provides real-time coordination, instant alerts, and comprehensive resource management.

<br/>

## Features

| Feature | Description |
|---------|-------------|
| **Emergency SOS** | Real-time alerts with GPS location tracking |
| **Priority Levels** | High/Medium/Low emergency categorization |
| **Weather Integration** | OpenWeatherMap local alerts |
| **Interactive Maps** | Visualize emergencies & resources |
| **Community Chat** | Local coordination channels |
| **Resource Management** | Track and share essential supplies |
| **Safety Guidelines** | Comprehensive emergency protocols |
| **Video Tutorials** | First aid & safety procedures |

<br/>

## Tech Stack

<div align="center">

**Frontend:** Next.js 15 • React 18 • TypeScript • TailwindCSS • Framer Motion

**Backend:** Firebase Firestore • Firebase Auth • Vercel

**UI:** shadcn/ui • Radix UI • Zustand

**Maps & APIs:** Leaflet • OpenWeatherMap • Nominatim

</div>

<br/>

## Project Structure

```
saviour/
├── public/                 # Static assets
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/            # API routes
│   │   ├── auth/           # Authentication pages
│   │   ├── dashboard/      # User dashboard
│   │   └── admin-dashboard/# Admin interface
│   ├── components/         # Reusable UI components
│   │   ├── Safety/         # Disaster safety guides
│   │   └── ui/             # Base UI components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities & actions
│   └── types/              # TypeScript definitions
└── ...                     # Config files
```

<br/>

## Quick Start

**Prerequisites:** Node.js v18+, npm or yarn, Firebase account

**1. Clone the repository**
```bash
git clone https://github.com/Ravikumar-2016/SaviourWeb.git
cd SaviourWeb/saviour
```

**2. Install dependencies**
```bash
npm install
```

**3. Setup environment variables**
```bash
cp .env.example .env.local
```

**4. Start development server**
```bash
npm run dev
```

<br/>

## Environment Variables

Create a `.env.local` file:

```env
# API Keys
NEXT_PUBLIC_GEMINI_API_KEY=
NEXT_PUBLIC_OPENWEATHERMAP_API_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# Auth
JWT_SECRET=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
BASE_URL=

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Email (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=
SMTP_FROM_NAME=Saviour_Team
CONTACT_RECIPIENT_EMAIL=
```

<br/>

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

<br/>

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer" width="100%"/>

**If this project helped you, consider giving it a star!**

Built with ❤️ by the **Saviour Team**

</div>
