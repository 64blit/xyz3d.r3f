import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ErrorBoundary } from './ErrorBoundary.jsx';
import { SceneXyz3D } from './SceneXyz3D.jsx';
import { HtmlOverlay } from './HtmlOverlay.jsx';


export function Xyz3D()
{
    const [ displayPopup, setDisplayPopup ] = useState(false);
    const [ popupContent, setPopupContent ] = useState(null);

    return (
        <>
            {/* <ErrorBoundary> */}

            <Canvas>
                <ambientLight />
                <SceneXyz3D path={"assets/scene.glb"} onDisplayPopup={setDisplayPopup} setPopupContent={setPopupContent} />
            </Canvas>

            {displayPopup && <HtmlOverlay content={popupContent} setDisplayPopup={setDisplayPopup} />}

            {/* </ErrorBoundary> */}
        </>
    );
}
