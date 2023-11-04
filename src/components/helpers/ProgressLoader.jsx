import React from "react";
import { Html, useProgress } from "@react-three/drei";
import LoadingScreen from "./LoadingScreen.jsx";

export function ProgressLoader()
{
    const { active, progress, errors, item, loaded, total } = useProgress();

    const [ percent, setPercent ] = React.useState(0);

    React.useEffect(() =>
    {
        setPercent(Math.floor(progress));
    }, [ progress ]);


    return (
        <>
            <Html center>
                <LoadingScreen progress={percent} />
            </Html>
        </>
    );
}
