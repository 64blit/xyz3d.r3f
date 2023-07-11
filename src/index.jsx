import React from "react";
import { createRoot } from "react-dom/client";
import { Xyz3D } from "./components/Xyz3D";
import "./styles.css";

const root = createRoot(document.getElementById("root"));
root.render(<Xyz3D />);
