# 🛡️ CodeCraft Admin Terminal

![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Firebase](https://img.shields.io/badge/Firebase-12.12-FFCA28?style=for-the-badge&logo=firebase)

The **CodeCraft Admin Terminal** is a high-performance command center built for hackathon organizers. It features a bespoke "Cyber-UI" aesthetic with immersive animations, real-time data synchronization, and a robust routing system.

---

## 🛠️ Tech Stack

- **Core**: React 19 (Functional Components & Hooks)
- **Routing**: `@tanstack/react-router` (Type-safe routing)
- **Styling**: Vanilla CSS + TailwindCSS (Cyberpunk theme)
- **Backend Sync**: Firebase Auth & Firestore + Custom REST API
- **State Management**: React State & Context

---

## 📂 Repository Structure

| Path | Purpose |
| :--- | :--- |
| `src/pages/` | Core views (Dashboard, Registrations, Teams, etc.) |
| `src/components/` | Reusable UI components and the main `AdminLayout` |
| `src/components/ui/` | Atomic UI elements like the `Loader` |
| `src/assets/` | Static media assets and vector graphics |
| `src/lib/` | Utilities for Firebase, cropping, and more |
| `src/router.tsx` | Centralized type-safe route configuration |
| `src/index.css` | Global design system and Cyber-UI animations |

---

## 🔄 Way of Working (Logic Flow)

```mermaid
graph TD
    A[User Access] --> B{Authenticated?}
    B -- No --> C[Firebase Auth Overlay]
    B -- Yes --> D[Select Hackathon Node]
    D --> E[Admin Dashboard]
    E --> F[Module Navigation]
    F --> G[Registrations]
    F --> H[Team Matrix]
    F --> I[Phase Architect]
    F --> J[Judge Nexus]
```

---

## 🚀 Getting Started

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Run Dev Environment**:

   ```bash
   npm run dev
   ```

3. **Build for Production**:

   ```bash
   npm run build
   ```
