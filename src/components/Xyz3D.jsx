import React, { useState, Suspense, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { SceneXyz3D } from './experience/SceneXyz3D.jsx';
import { HtmlOverlay } from './helpers/HtmlOverlay.jsx';
import { ProgressLoader } from './helpers/ProgressLoader.jsx';
import { Environment } from '@react-three/drei';
import { SplashScreen } from './helpers/SplashScreen.jsx';
import { Seo } from './helpers/SEO.jsx';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from 'react-error-boundary';
import { OnScreenControls } from './helpers/OnScreenControls.jsx';
import { Perf } from 'r3f-perf'

export function Xyz3D()
{
    const [ showPopup, setShowPopup ] = useState(false);
    const [ popupContent, setPopupContent ] = useState(null);
    const [ isDebugging, setIsDebugging ] = useState(false);
    const [ isLoaded, setIsLoaded ] = useState(false);
    const [ xyzAPI, setXyzAPI ] = useState(null);
    const [ screenClicked, setScreenClicked ] = useState(false);
    const canvasParent = useRef();


    // if the user presses the "-" key, toggle debugging mode
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
        <HelmetProvider>

            <div className="flex flex-col h-screen items-center transition-all transform delay-300 " >

                <div id='canvasparent' ref={canvasParent} className={`w-full h-full shrink bg-black transition-all delay-300`} >
                    {/* The seo content which is added to the head section. */}
                    {isLoaded && <Seo xyzAPI={xyzAPI} />}

                    {/* The 3D rendering canvas */}
                    <Canvas>

                        {/* The loading screen */}
                        <Suspense fallback={<ProgressLoader setIsLoaded={setIsLoaded} />}>

                            {/* 3D Scene */}
                            <SceneXyz3D
                                path={"assets/scene.glb"}
                                setShowPopup={setShowPopup}
                                isDebugging={isDebugging}
                                setPopupContent={setPopupContent}
                                setXyzAPI={setXyzAPI}
                            />

                            {/* Skybox with an ambient light fallback */}
                            <ErrorBoundary fallback={<ambientLight intensity={0} />}>
                                <Environment files={"https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/kloofendal_43d_clear_puresky_1k.hdr"} frames={1} resolution={512} ground background />
                            </ErrorBoundary>

                        </Suspense>

                        {isDebugging && <Perf />}
                    </Canvas>

                </div >

                {isLoaded &&
                    <OnScreenControls xyzAPI={xyzAPI} setScreenClicked={setScreenClicked} isLoaded />
                }

                {/* <div id="bottomScreen" className={`flex-grow w-full h-0 transition-all delay-300 bg-slate-700 ${(isLoaded) ? 'h-1/4 flex-grow' : 'h-0 flex-shrink'} `} ></div> */}

            </div>


        </HelmetProvider >
    );
}
