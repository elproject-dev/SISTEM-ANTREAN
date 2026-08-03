import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerSW } from 'virtual:pwa-register';

// Start Service Worker manually for better reliability
registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(<App />);
