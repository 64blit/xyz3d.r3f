import { StandardReality, HDRI } from "spacesvr";
import React, { ReactNode, Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import SceneXyz3D from "../components/SceneXyz3D";
import { ProgressLoader } from "../components/ProgressLoader";
import { HtmlOverlay } from "../components/HtmlOverlay";
import { useThree } from "@react-three/fiber";
import { SceneZoneWrapper } from "components/SceneZoneWrapper";

import { Perf } from 'r3f-perf'

export default function Xyz3DWorld()
{

  const [ isDebugging, setIsDebugging ] = React.useState(false);
  const [ showPopup, setShowPopup ] = useState(false);
  const [ popupContent, setPopupContent ] = useState(null);


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

    <StandardReality>

      <Suspense fallback={null}>

        <SceneXyz3D
          path={"assets/scene.glb"}
          setShowPopup={setShowPopup}
          setPopupContent={setPopupContent}
          isDebugging={isDebugging}
        />

        <ErrorBoundary fallback={<ambientLight intensity={10} />}>

          <HDRI
            src="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/kloofendal_43d_clear_puresky_1k.hdr"
            disableBackground={true} // used to disable visual hdr (skybox)
            disableEnvironment={false} // used to disable environment map
          />

        </ErrorBoundary>
      </Suspense>

      {/* Wrapper div to cover the screen
        <div className="absolute inset-0 bg-black">

        </div>

        {showPopup && <HtmlOverlay content={popupContent} setShowPopup={setShowPopup} />} */}
    </StandardReality>
  );
}

