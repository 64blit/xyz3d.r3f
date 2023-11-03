import React from "react";
import { Html, useProgress } from "@react-three/drei";
import LoadingScreen from "./LoadingScreen.jsx";

export function ProgressLoader()
{
    const { active, progress, errors, item, loaded, total } = useProgress();

    return (
        <>
            <Html center>
                <LoadingScreen progress={Math.floor(progress)} />
            </Html>
        </>
    );
}
