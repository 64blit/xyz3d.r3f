import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { SceneXyz3D } from './SceneXyz3D.jsx';
import { HtmlOverlay } from './HtmlOverlay.jsx';
import { ProgressLoader } from './ProgressLoader.jsx';
import { Environment } from '@react-three/drei';


export function Xyz3D()
{
    const [ showPopup, setShowPopup ] = useState(false);
    const [ popupContent, setPopupContent ] = useState(null);
    const [ isDebugging, setIsDebugging ] = useState(false);

    // if the user presses the "D" key, toggle debugging mode
    React.useEffect(() =>
    {
        const handleKeyDown = (event) =>
        {
            if (event.key === "d")
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

                {/* The 3D rendering canvas */}
                <Canvas>

                    {/* The loading screen */}
                    <Suspense fallback={<ProgressLoader />}>

                        {/* The 3D Scene */}
                        <SceneXyz3D
                            path={"assets/scene.glb"}
                            setShowPopup={setShowPopup}
                            isDebugging={isDebugging}
                            setPopupContent={setPopupContent}
                        />

                        {/* Skybox with an ambient light fallback */}

                        <ErrorBoundary fallback={<ambientLight intensity={10} />}>
                            <Environment files={"https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/kloofendal_43d_clear_puresky_1k.hdr"} frames={1} resolution={512} background />
                        </ErrorBoundary>


                    </Suspense>



                </Canvas>

            </div>

            {/* The container for HTML content */}
            {showPopup && <HtmlOverlay content={popupContent} setShowPopup={setShowPopup} />}

        </>
    );
}
