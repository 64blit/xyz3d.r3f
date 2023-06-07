import React from "react";
import { createRoot } from "react-dom/client";
import { Xyz3D } from "./components/Xyz3D.jsx";
import "./styles.css";

const root = createRoot(document.getElementById("root"));
root.render(<Xyz3D />);
