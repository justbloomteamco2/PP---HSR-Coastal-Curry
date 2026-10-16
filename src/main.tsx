import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
// @ts-ignore CSS is loaded by the bundler.
import "./style.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
