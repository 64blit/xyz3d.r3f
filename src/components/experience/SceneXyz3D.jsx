import React, { useRef, useState, useEffect, useMemo } from 'react';
import { ScrollControls, useAnimations, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from '@react-three/fiber';
import { SceneManager } from '../../managers/SceneManager.js';
import { Controls } from '../logic/Controls.jsx';
import { SceneZone } from './SceneZone.jsx';
import { SceneZoneWrapper } from '../helpers/SceneZoneWrapper.jsx';
import { PhysicsObjects } from '../logic/PhyicsObjects.jsx';
import { InteractionManager } from '../../managers/InteractionManager.js';
import { CameraManager } from '../../managers/CameraManager.js';
import { Video } from '../logic/Video';
import { Audio } from '../logic/Audio';


export function SceneXyz3D(props)
{
    const { camera } = useThree();
    const { scene, animations } = useGLTF(props.path);
    const { mixer, actions } = useAnimations(animations, scene);

    const controlsRef = useRef(null);

    const [ sceneManager, setSceneManager ] = useState(null);
    const [ interactionManager, setInteractionManager ] = useState(null);
    const [ cameraManager, setCameraManager ] = useState(null);

    const initializeManagers = (scroll) =>
    {
        const tempSceneManager = new SceneManager(scene, controlsRef.current, animations, actions, mixer);

        setSceneManager(tempSceneManager);

        const tempCameraManager = new CameraManager(tempSceneManager, controlsRef.current, camera, scroll);

        setCameraManager(tempCameraManager);

        const tempInteractionManager = new InteractionManager(props.setShowPopup, props.setPopupContent, tempCameraManager.goToSceneZoneByName, tempSceneManager.playAnimation);

        setInteractionManager(tempInteractionManager);
    };

    // UseFrame hook for animations and interactions
    useFrame(() =>
    {
        if (!cameraManager) return;
        cameraManager.update();
    });


    return (
        <>
            <ScrollControls enabled={true} pages={sceneManager?.waypoints.length - 1}>

                <Controls innerRef={controlsRef} />

                <SceneZoneWrapper onReady={initializeManagers}>

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

                    {sceneManager
                        && <>

                            <PhysicsObjects
                                debug={props.isDebugging}
                                sceneManager={sceneManager}
                                interactionManager={interactionManager}
                                isDebugging={props.isDebugging}
                            />
                        </>}

                    {sceneManager
                        && sceneManager.videoObjects.map((element, key) => (
                            <Video
                                key={key}
                                size={Math.max(...element.object.scale)}
                                src={element.src}
                                position={element.worldPosition}
                                quaternion={element.worldRotation}
                                muted={false}
                                framed
                            >
                            </Video>
                        ))
                    }

                    {sceneManager
                        && sceneManager.audioObjects.map((element, key) => (
                            <Audio
                                key={key}
                                size={Math.max(...element.object.scale)}
                                src={element.src}
                                position={element.worldPosition}
                                quaternion={element.worldRotation}
                                muted={false}
                                framed
                            >
                            </Audio>
                        ))
                    }



                    {props.children}
                </SceneZoneWrapper>
            </ScrollControls>
        </>
    );
}
