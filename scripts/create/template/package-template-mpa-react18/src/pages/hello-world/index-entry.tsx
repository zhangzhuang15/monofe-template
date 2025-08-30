/* eslint-disable react/react-in-jsx-scope */
import { createRoot } from "react-dom/client";
import { StrictMode } from 'react';
import App from "./index.tsx";

createRoot(document.getElementById("root")!).
  render(
    <StrictMode>
      <App />
    </StrictMode>
  );