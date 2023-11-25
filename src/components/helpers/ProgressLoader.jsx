import React from "react";
import { Html, useProgress } from "@react-three/drei";
import LoadingScreen from "./LoadingScreen.jsx";

export function ProgressLoader({ setIsLoaded })
{
    const { active, progress, errors, item, loaded, total } = useProgress();

    const [ percent, setPercent ] = React.useState(0);

    React.useEffect(() =>
    {
        setPercent(Math.floor(progress));

        if (progress >= 99 || loaded >= total)
        {
            console.log("loaded")
            setIsLoaded(true);
        }

    }, [ progress ]);


    return (
        <>
            <Html fullscreen>
                <LoadingScreen progress={percent} />
            </Html>
        </>
    );
}
