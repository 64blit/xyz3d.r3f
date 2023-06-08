
import React, { useRef, useState, useEffect, Suspense, forwardRef } from 'react';
import { useAnimations, useGLTF } from "@react-three/drei";

import { SceneManager } from '../managers/SceneManager.js';
import { ProgressLoader } from './ProgressLoader.jsx';
import { Controls } from './Controls.jsx';
import { SceneZone } from './SceneZone.jsx';
import * as THREE from 'three';


export function SceneXyz3D(props)
{
    const [ sceneManager, setSceneManager ] = useState(null);

    const controlsRef = useRef(null);

    const { scene, animations } = useGLTF(props.path);

    const { actions } = useAnimations(animations);

    // play animation by name
    const playAnimation = (name) =>
    {
        actions[ name ].play();
    }

    const goToSceneZone = (sceneZone) =>
    {
        const position = sceneZone.cameraAnchor.position;
        let target = new THREE.Vector3();
        sceneZone.cameraTarget.getCenter(target);

        controlsRef.current?.setLookAt(...position, ...target, true);
        controlsRef.current?.fitToBox(sceneZone.cameraTarget, true);
    }

    useEffect(() =>
    {
        const sceneManager = new SceneManager(scene);
        setSceneManager(sceneManager);
        goToSceneZone(sceneManager.sceneZones[ 0 ]);

    }, [ scene ]);



    return (
        <>

            <Controls innerRef={controlsRef} />

            <Suspense fallback={<ProgressLoader />}>
                <primitive object={scene}>

                    {controlsRef != null && sceneManager?.getSceneZones().map((object, key) => (

                        <SceneZone
                            sceneManager={sceneManager}
                            onDisplayPopup={props.onDisplayPopup}
                            setPopupContent={props.setPopupContent}
                            goToSceneZone={goToSceneZone}
                            playAnimation={playAnimation}

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
