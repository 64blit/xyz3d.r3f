import { StandardReality, HDRI } from "spacesvr";
import React, { ReactNode, Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import SceneXyz3D from "../components/SceneXyz3D";
import { HtmlOverlay } from "../helpers/HtmlOverlay";
import { HelmetProvider } from "react-helmet-async";
// import { Perf, usePerf } from "r3f-perf";


export default function Xyz3DWorld()
{

  const [ showPopup, setShowPopup ] = useState(false);
  const [ popupContent, setPopupContent ] = useState(null);
  const [ isDebugging, setIsDebugging ] = useState(false);
  const [ isLoaded, setIsLoaded ] = useState(false);
  const [ xyzAPI, setXyzAPI ] = useState(null);

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

  // usePerf();

  return (
    <HelmetProvider>

      <StandardReality physicsProps={{ gravity: [ 0, -9.86, 0 ] }} >


        <SceneXyz3D
          path={"assets/scene.glb"}
          setShowPopup={setShowPopup}
          setPopupContent={setPopupContent}
          setXyzAPI={setXyzAPI}
          isDebugging={isDebugging}
        />

        <ErrorBoundary fallback={<ambientLight />}>

          <HDRI
            src="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/kloofendal_43d_clear_puresky_1k.hdr"
            disableBackground={false} // used to disable visual hdr (skybox)
            disableEnvironment={false} // used to disable environment map
          />

        </ErrorBoundary>

        {/* <Perf /> */}

      </StandardReality >

      {/* The splash screen we show indicating how to interact with the scene. */}
      {isLoaded && <SplashScreen xyzAPI={xyzAPI} />}

      {/* The seo content which is added to the head section. */}
      {isLoaded && <Seo xyzAPI={xyzAPI} />}

      <HtmlOverlay content={popupContent} showPopup={showPopup} setShowPopup={setShowPopup} />
    </HelmetProvider>
  );
}

