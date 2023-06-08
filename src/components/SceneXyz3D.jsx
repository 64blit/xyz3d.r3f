
import React, { useRef, useState, useEffect, Suspense, forwardRef } from 'react';
import { useGLTF } from "@react-three/drei";

import { SceneManager } from '../managers/SceneManager.js';
import { ProgressLoader } from './ProgressLoader.jsx';
import { Controls } from './Controls.jsx';
import { SceneZone } from './SceneZone.jsx';


export function SceneXyz3D(props)
{
    const [ sceneManager, setSceneManager ] = useState(null);

    const controlsRef = useRef(null);

    const gltf = useGLTF(props.path);
    const scene = gltf.scene;

    useEffect(() =>
    {
        const sceneManager = new SceneManager(scene);
        setSceneManager(sceneManager);

    }, [ scene ]);



    return (
        <>

            <Controls innerRef={controlsRef} />

            <Suspense fallback={<ProgressLoader />}>
                <primitive object={scene}>

                    {controlsRef != null && sceneManager?.getSceneZones().map((object, key) => (

                        <SceneZone
                            controlsRef={controlsRef}
                            sceneManager={sceneManager}
                            onDisplayPopup={props.onDisplayPopup}
                            setPopupContent={props.setPopupContent}

                            object={object}
                            key={key}
                        />
                    ))}

                </primitive>

                {props.children}
            </Suspense>

        </>
    );
}
