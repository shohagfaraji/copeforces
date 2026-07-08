import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import Stats from "./pages/Stats.jsx";

const path = window.location.pathname.replace(/\/+$/, "") || "/";
const rootElement = path === "/stats" ? <Stats /> : <App />;

createRoot(document.getElementById("root")).render(
    <StrictMode>{rootElement}</StrictMode>,
);
