import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";

window.addEventListener("message", (event) => {
  if (event.data?.type === "host:set-theme") {
    document.documentElement.classList.toggle(
      "dark",
      event.data.theme === "dark",
    );
  }
});

// Pushing the theme in from the host can race this listener attaching, so
// also actively ask for it once we're definitely ready to receive the reply.
try {
  window.parent?.postMessage({ type: "iframe:request-theme" }, "*");
} catch {
  // Ignore cross-origin postMessage restriction
}

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
}
