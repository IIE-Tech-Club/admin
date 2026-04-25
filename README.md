# 🛠️ CodeCraft Admin Portal

The administrative command center for CodeCraft. A high-performance, reactive dashboard built with Vite, React, and TanStack Router, designed for real-time hackathon management and participant oversight.

![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TanStack Router](https://img.shields.io/badge/TanStack%20Router-FF4154?style=for-the-badge&logo=tanstack&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## 📂 Project Structure

| Path | Description |
| :--- | :--- |
| `src/main.tsx` | Application entry point. |
| `src/router.tsx` | Centralized route definitions using TanStack Router. |
| `src/pages/` | High-level page components (Dashboard, Registrations, etc.). |
| `src/components/` | Reusable UI components and layouts. |
| `src/lib/` | Utility functions and service initializations (Firebase). |
| `src/assets/` | Static assets and styling tokens. |

---

## 🛠️ Way of Working (Logic Flow)

```mermaid
graph TD
    A[User Entry] --> B{Auth Check}
    B -- No --> C[Login Page]
    B -- Yes --> D[Select Hackathon]
    D --> E[Admin Layout]
    E --> F[Dashboard: Metrics]
    E --> G[Registrations: Management]
    E --> H[Phases: Architect]
    E --> I[Organizers: Config]
```

---

## ⚡ Quick Start

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Run Development Server**

   ```bash
   npm run dev
   ```

3. **Build for Production**

   ```bash
   npm run build
   ```

---

## 🔑 Key Features

- **Phase Architect**: Customize hackathon phases dynamically.
- **Real-time Metrics**: Track registrations and submissions via Firebase.
- **Team Management**: Oversee participant groupings and details.
- **Asset Handling**: Integrated image cropping and Cloudinary uploads.
