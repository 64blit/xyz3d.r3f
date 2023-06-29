import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { SceneXyz3D } from './SceneXyz3D.jsx';
import { HtmlOverlay } from './HtmlOverlay.jsx';
import { ProgressLoader } from './ProgressLoader.jsx';
import EnvironmentXyz3D from './EnvironmentXyz3D.jsx';


export function Xyz3D()
{
    const [ displayPopup, setDisplayPopup ] = useState(false);
    const [ popupContent, setPopupContent ] = useState(null);


    return (
        <>
            {/* Wrapper div to cover the screen */}
            <div className="absolute inset-0 bg-black">

                {/* The 3D rendering canvas */}
                <Canvas>

                    {/* The progress bar / loading screen */}
                    <Suspense fallback={<ProgressLoader />}>

                        {/* The 3D Scene */}
                        <SceneXyz3D
                            path={"assets/scene.glb"}
                            onDisplayPopup={setDisplayPopup}
                            setPopupContent={setPopupContent}
                        />

                        {/* The environment light and background (ie. skybox) */}
                        <EnvironmentXyz3D files={"assets/4k.hdr"} frames={1} resolution={512} background />

                    </Suspense>
                </Canvas>

            </div>

            {/* The container for HTML content */}
            {displayPopup && <HtmlOverlay content={popupContent} setDisplayPopup={setDisplayPopup} />}
        </>
    );
}
