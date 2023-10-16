import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { SceneXyz3D } from './experience/SceneXyz3D.jsx';
import { HtmlOverlay } from './helpers/HtmlOverlay.jsx';
import { ProgressLoader } from './helpers/ProgressLoader.jsx';
import { Environment } from '@react-three/drei';
import { NavBar } from './logic/NavBar.jsx';
import { ErrorBoundary } from 'react-error-boundary';


export function Xyz3D()
{
    const [ showPopup, setShowPopup ] = useState(false);
    const [ popupContent, setPopupContent ] = useState(null);
    const [ isInitialized, setIsInitialized ] = useState(false);
    const [ isDebugging, setIsDebugging ] = useState(false);
    const sceneRef = React.useRef(null);

    // if the user presses the "D" key, toggle debugging mode
    React.useEffect(() =>
    {
        const handleKeyDown = (event) =>
        {
            if (event.key === "-")
            {
                setIsDebugging(!isDebugging);
                console.log("Debugging mode: ", !isDebugging)
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [ isDebugging ]);



    return (
        <>

            {/* Wrapper div to cover the screen */}
            <div className="absolute inset-0 bg-black">

                {/* 3D rendering canvas */}
                <Canvas>

                    {/* Loading screen */}
                    <Suspense fallback={<ProgressLoader />}>

                        {/* 3D Scene */}
                        <SceneXyz3D
                            ref={sceneRef}
                            path={"assets/scene.glb"}
                            setShowPopup={setShowPopup}
                            setPopupContent={setPopupContent}
                            setIsInitialized={setIsInitialized}
                            isDebugging={isDebugging}
                        />

                        {/* Skybox with an ambient light fallback */}

                        <ErrorBoundary fallback={<ambientLight intensity={10} />}>
                            <Environment files={"https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/kloofendal_43d_clear_puresky_1k.hdr"} frames={1} resolution={512} background />
                        </ErrorBoundary>

                    </Suspense>
                </Canvas>

            </div>

            {/* Navbar */}
            {isInitialized && <NavBar xyzRef={sceneRef.current} />}

            {/* HTML popup container */}
            <HtmlOverlay content={popupContent} showPopup={showPopup} setShowPopup={setShowPopup} />

        </>
    );
}
