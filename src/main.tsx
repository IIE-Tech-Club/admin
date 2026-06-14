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
if (typeof window !== "undefined") {
  const styles = {
    header:
      "background: linear-gradient(135deg, #00f2fe 0%, #4d79ff 100%); color: white; font-weight: bold; padding: 8px 12px; font-size: 14px; border-radius: 4px 4px 0 0; font-family: monospace;",
    body: "background: #0a0e27; color: #00f2fe; padding: 8px 12px; font-family: monospace; font-size: 12px; border-left: 3px solid #00f2fe; border-right: 3px solid #00f2fe; border-bottom: 3px solid #00f2fe; border-radius: 0 0 4px 4px;",
  };

  console.log("%c⚡ CODECRAFT PLATFORM INITIALIZED", styles.header);
  console.log(
    "%c✓ Engineered by: Ayush Choudhary\n✓ Project Year: 2026\n✓ Platform Status: OPERATIONAL\n✓ GitHub: https://github.com/AR128\n",
    styles.body,
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <RootProviders>
      <CustomCursor />
      <RouterProvider router={router} />
    </RootProviders>
  </StrictMode>,
);
