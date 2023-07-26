import React from "react";
import { Html, useProgress } from "@react-three/drei";
import InfinitySVG from "./InfinitySVG";

export function ProgressLoader()
{
    const { active, progress, errors, item, loaded, total } = useProgress();

    return (
        <>
            <Html center>
                <InfinitySVG progress={Math.floor(progress)} />
            </Html>
        </>
    );
}
