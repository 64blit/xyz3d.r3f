import { StandardReality, HDRI } from "spacesvr";
import React, { ReactNode, Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import SceneXyz3D from "../components/SceneXyz3D";
import { HtmlOverlay } from "../components/HtmlOverlay";
import TransparentFloor from "ideas/TransparentFloor";

import { Perf, usePerf } from "r3f-perf";



export default function Xyz3DWorld()
{

  const [ isDebugging, setIsDebugging ] = React.useState(false);
  const [ showPopup, setShowPopup ] = useState(false);
  const [ popupContent, setPopupContent ] = useState(null);

  usePerf();

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
    <>

      <StandardReality physicsProps={{ gravity: [ 0, -9.86, 0 ] }} >

        <Suspense fallback={null}>

          <SceneXyz3D
            path={"assets/scene.glb"}
            setShowPopup={setShowPopup}
            setPopupContent={setPopupContent}
            isDebugging={isDebugging}
          />

          {/* <ErrorBoundary fallback={<ambientLight />}>

            <HDRI
              src="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/kloofendal_43d_clear_puresky_1k.hdr"
              disableBackground={false} // used to disable visual hdr (skybox)
              disableEnvironment={false} // used to disable environment map
            />

          </ErrorBoundary> */}
          <ambientLight intensity={5} />
          <directionalLight intensity={1} position={[ 0, 10, 0 ]} />
        </Suspense>

        < TransparentFloor />

        <Perf />

      </StandardReality >

      <HtmlOverlay content={popupContent} showPopup={showPopup} setShowPopup={setShowPopup} />
    </>
  );
}

