import { StandardReality, HDRI } from "spacesvr";
import React, { ReactNode, Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import SceneXyz3D from "../components/SceneXyz3D";
import { HtmlOverlay } from "../helpers/HtmlOverlay";
// import { Perf, usePerf } from "r3f-perf";


export default function Xyz3DWorld()
{

  const [ showPopup, setShowPopup ] = useState(false);
  const [ popupContent, setPopupContent ] = useState(null);

  // usePerf();

  return (
    <>

      <StandardReality physicsProps={{ gravity: [ 0, -9.86, 0 ] }} >


        <SceneXyz3D
          path={"assets/scene.glb"}
          setShowPopup={setShowPopup}
          setPopupContent={setPopupContent}
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

      <HtmlOverlay content={popupContent} showPopup={showPopup} setShowPopup={setShowPopup} />
    </>
  );
}

