import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ErrorBoundary } from './ErrorBoundary.jsx';
import { SceneXyz3D } from './SceneXyz3D.jsx';
import { HtmlOverlay } from './HtmlOverlay.jsx';
import { Environment, Sky, Stars, useEnvironment } from '@react-three/drei';


export function Xyz3D()
{
    const [ displayPopup, setDisplayPopup ] = useState(false);
    const [ popupContent, setPopupContent ] = useState(null);

    const envMap = useEnvironment({ files: "assets/4k.hdr" });


    return (
        <>
            <ErrorBoundary>

                <Canvas>
                    <SceneXyz3D
                        envMap={envMap}
                        path={"assets/scene.glb"}
                        onDisplayPopup={setDisplayPopup}
                        setPopupContent={setPopupContent}
                    />

                    <Environment map={envMap} frames={1} resolution={512} background />
                </Canvas>

                {displayPopup && <HtmlOverlay content={popupContent} setDisplayPopup={setDisplayPopup} />}

            </ErrorBoundary>
        </>
    );
}
