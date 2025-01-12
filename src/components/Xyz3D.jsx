import React, { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { SceneXyz3D } from "./experience/SceneXyz3D.jsx";
import { HtmlOverlay } from "./helpers/HtmlOverlay.jsx";
import { ProgressLoader } from "./helpers/ProgressLoader.jsx";
import { Environment, BakeShadows, CubeCamera } from "@react-three/drei";
import { SplashScreen } from "./helpers/SplashScreen.jsx";
import { Seo } from "./helpers/SEO.jsx";
import { HelmetProvider } from "react-helmet-async";
import { ErrorBoundary } from "react-error-boundary";
import { Perf } from "r3f-perf";
import * as THREE from "three";

export function Xyz3D() {
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState(null);
  const [isDebugging, setIsDebugging] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [xyzAPI, setXyzAPI] = useState(null);

  // if the user presses the "-" key, toggle debugging mode
  React.useEffect(() => {
    const handleKeyDown = event => {
      if (event.key === "-") {
        setIsDebugging(!isDebugging);
        console.log("Debugging mode: ", !isDebugging);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDebugging]);

  const created = obj => {
    console.log("🌿components/Xyz3D.jsx:33/(obj):", obj);
  };

  return (
    <HelmetProvider>
      {/* Wrapper div to cover the screen */}
      <div className='absolute inset-0 bg-black'>
        {/* 3D rendering canvas */}
        <Canvas shadows={true} dpr={[1, 2]} gl={{ alpha: false }} onCreated={created}>
          <BakeShadows />
          {/* Ground plane to visualize shadows */}
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
            <planeGeometry args={[100, 100]} />
            <shadowMaterial opacity={0.5} />
          </mesh>
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
            <ErrorBoundary fallback={<ambientLight intensity={1} />}>
              <Environment
                ground
                files={"https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/kloofendal_43d_clear_puresky_1k.hdr"}
                frames={1}
                resolution={512}
                background
                intensity={0}
                environmentIntensity={0}
                backgroundIntensity={0}
              ></Environment>

              <directionalLight
                castShadow={true}
                intensity={1}
                position={[0, 1000, 0]}
                rotation={[115, 0, 0]}
                shadow-bias={-0.00001}
                shadow-mapSize-width={2048 * 2}
                shadow-mapSize-height={2048 * 2}
                shadow-camera-near={0.5}
                shadow-camera-far={1000}
                shadow-camera-left={-1000}
                shadow-camera-right={1000}
                shadow-camera-top={1000}
                shadow-camera-bottom={-1000}
              />
            </ErrorBoundary>
          </Suspense>

          {isDebugging && <Perf />}
        </Canvas>
      </div>

      {/* The splash screen we show indicating how to interact with the scene. */}
      {isLoaded && <SplashScreen xyzAPI={xyzAPI} />}

      {/* The seo content which is added to the head section. */}
      {isLoaded && <Seo xyzAPI={xyzAPI} />}

      {/* The container for HTML content */}
      <HtmlOverlay content={popupContent} showPopup={showPopup} setShowPopup={setShowPopup} />
    </HelmetProvider>
  );
}
