import * as THREE from 'three';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { ScrollControls, useAnimations, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from '@react-three/fiber';
import { SceneManager } from '../../managers/SceneManager.js';
import { Controls } from '../logic/Controls.jsx';
import { SceneZone } from './SceneZone.jsx';
import { SceneZoneWrapper } from './SceneZoneWrapper.jsx';
import { basicLerp } from '../../utils/BaseUtils.js';
import { PhysicsObjects } from './PhyicsObjects.jsx';
import { InteractionManager } from '../../managers/InteractionManager.js';
import { CameraManager } from '../../managers/CameraManager.js';


export function SceneXyz3D(props)
{
    const { camera } = useThree();
    const { scene, animations } = useGLTF(props.path);
    const { mixer, actions } = useAnimations(animations, scene);

    const [ scroll, setScroll ] = useState(null);
    const controlsRef = useRef(null);

    const [ sceneManager, setSceneManager ] = useState(null);
    const [ interactionManager, setInteractionManager ] = useState(null);
    const [ cameraManager, setCameraManager ] = useState(null);

    useEffect(() =>
    {
        if (!controlsRef.current || sceneManager || !scroll)
        {
            return;
        }

        const tempSceneManager = new SceneManager(scene, controlsRef.current, animations, actions, mixer);

        setSceneManager(tempSceneManager);

        console.log(scroll)
        const tempCameraManager = new CameraManager(scroll, tempSceneManager, controlsRef.current, camera);

        setCameraManager(tempCameraManager);

        const interactionManager = new InteractionManager(props.setShowPopup, props.setPopupContent, tempCameraManager.goToSceneZoneByName, tempSceneManager.playAnimation);

        setInteractionManager(interactionManager);

    }, [ camera, scroll, actions, controlsRef.current, animations, mixer ]);

    // UseFrame hook for animations and interactions
    useFrame(() =>
    {
        console.log(scroll.delta)
        if (!cameraManager) return;
        cameraManager.update();
    });


    return (
        <>
            <ScrollControls enabled={true} pages={sceneManager?.waypoints.length - 1}>

                <Controls innerRef={controlsRef} />

                <SceneZoneWrapper setScroll={setScroll}>

                    <primitive
                        object={scene}
                    >

                        {controlsRef.current
                            && sceneManager
                            && sceneManager.getSceneZones().map((object, key) => (
                                <SceneZone
                                    interactionManager={interactionManager}
                                    isDebugging={props.isDebugging}
                                    object={object}
                                    key={key}
                                />
                            ))}

                    </primitive>

                    {sceneManager &&
                        <PhysicsObjects
                            debug={props.isDebugging}
                            sceneManager={sceneManager}
                            interactionManager={interactionManager}
                            isDebugging={props.isDebugging}
                        />}

                    {props.children}
                </SceneZoneWrapper>
            </ScrollControls>
        </>
    );
}
