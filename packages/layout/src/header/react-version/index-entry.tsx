import { createRoot } from "react-dom/client";
import React, { StrictMode } from 'react';
import App from "./index.tsx";

createRoot(document.getElementById("layout__header")!).
  render(
    <StrictMode>
      <App />
    </StrictMode>
  );