import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { SceneXyz3D } from './experience/SceneXyz3D.jsx';
import { HtmlOverlay } from './helpers/HtmlOverlay.jsx';
import { ProgressLoader } from './helpers/ProgressLoader.jsx';
import { Environment } from '@react-three/drei';
import { ErrorBoundary } from 'react-error-boundary';
import { SplashScreen } from './helpers/SplashScreen.jsx';
import { Seo } from './helpers/SEO.jsx';
import { HelmetProvider } from 'react-helmet-async';
import { NavBar } from './logic/NavBar.jsx';
import { ErrorBoundary } from 'react-error-boundary';

export function Xyz3D()
{
    const [ showPopup, setShowPopup ] = useState(false);
    const [ popupContent, setPopupContent ] = useState(null);
    const [ isDebugging, setIsDebugging ] = useState(false);
    const [ isLoaded, setIsLoaded ] = useState(false);
    const [ siteData, setSiteData ] = useState(null);
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
        <HelmetProvider>

            {/* Wrapper div to cover the screen */}
            <div className="absolute inset-0 bg-black">

                {/* 3D rendering canvas */}
                <Canvas>

                    {/* The loading screen */}
                    <Suspense fallback={<ProgressLoader setIsLoaded={setIsLoaded} />}>

                        {/* 3D Scene */}
                        <SceneXyz3D
                            ref={sceneRef}
                            path={"assets/scene.glb"}
                            setShowPopup={setShowPopup}
                            isDebugging={isDebugging}
                            setPopupContent={setPopupContent}
                            setSiteData={setSiteData}
                        />

                        {/* Skybox with an ambient light fallback */}
                        <ErrorBoundary fallback={<ambientLight intensity={10} />}>
                            <Environment files={"https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/kloofendal_43d_clear_puresky_1k.hdr"} frames={1} resolution={512} background />
                        </ErrorBoundary>

                    </Suspense>

                </Canvas>

                {/* The splash screen we show indicating how to interact with the scene. */}
                {
                    isLoaded
                    && siteData && <SplashScreen active={siteData.splashScreenActive} title={siteData.splashScreenTitle} body={siteData.splashScreenBody} button={siteData.splashScreenButton} />
                }

                {/* The seo content which is added to the head section. */}
                {
                    isLoaded
                    && siteData && <Seo url={siteData.siteURL} author={siteData.siteAuthor} title={siteData.siteTitle} description={siteData.description} icon={siteData.siteIconURL} image={siteData.siteIconURL} />
                }


            </div >

            {/* The container for HTML content */}
            < HtmlOverlay content={popupContent} showPopup={showPopup} setShowPopup={setShowPopup} />
            {/* Navbar */}
            {isInitialized && <NavBar xyzRef={sceneRef.current} />}

        </HelmetProvider >
    );
}
