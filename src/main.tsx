import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import "./index.css";
import { router } from "./router";
import CustomCursor from "./components/CustomCursor";
import { RootProviders } from "./components/RootProviders";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

// System initialization log
if (typeof window !== "undefined" && !(window as any).__CODECRAFT_LOGGED__) {
  (window as any).__CODECRAFT_LOGGED__ = true;
  const headerStyle = "background: linear-gradient(135deg, #00f2fe 0%, #4d79ff 100%); color: white; font-weight: bold; padding: 6px 12px; border-radius: 4px; font-size: 13px;";
  const itemStyle = "color: #00f2fe; font-weight: bold; padding: 4px 8px; border: 2px solid #00f2fe; border-radius: 4px; margin-top: 4px;";
  console.log("%c⚡ CODECRAFT PLATFORM INITIALIZED", headerStyle);
  console.log("%c✓ Engineered by: Ayush Choudhary", itemStyle);
  console.log("%c✓ Project Year: 2026", itemStyle);
  console.log("%c✓ Platform Status: OPERATIONAL", itemStyle);
  console.log("%c✓ GitHub: https://github.com/AR128", itemStyle);
}

createRoot(rootElement).render(
  <StrictMode>
    <RootProviders>
      <CustomCursor />
      <RouterProvider router={router} />
    </RootProviders>
  </StrictMode>,
);
