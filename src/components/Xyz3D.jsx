import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ErrorBoundary } from './ErrorBoundary.jsx';
import { SceneXyz3D } from './SceneXyz3D.jsx';
import { HtmlOverlay } from './HtmlOverlay.jsx';
import { Environment, Sky, Stars, useEnvironment } from '@react-three/drei';
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

                    {/* The loading screen */}
                    <Suspense fallback={<ProgressLoader />}>

                        <SceneXyz3D
                            path={"assets/scene.glb"}
                            onDisplayPopup={setDisplayPopup}
                            setPopupContent={setPopupContent}
                        />

                        <EnvironmentXyz3D files={"assets/4k.hdr"} frames={1} resolution={512} background />

                    </Suspense>
                </Canvas>

            </div>

            {displayPopup && <HtmlOverlay content={popupContent} setDisplayPopup={setDisplayPopup} />}
        </>
    );
}
