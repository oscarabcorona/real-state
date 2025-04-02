import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n/i18n";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "sonner";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
    <React.StrictMode>
      <App />
      <Toaster position="bottom-right" closeButton />
    </React.StrictMode>
  </ThemeProvider>
);
