import React, { useRef, useState, useEffect } from 'react';
import { useAnimations, useGLTF } from "@react-three/drei";
import { SceneManager } from '../managers/SceneManager';
import { SceneZone } from './SceneZone';
import * as THREE from 'three';
import { Collidable, usePlayer } from 'spacesvr';
import { generateKey } from '../helpers/ReactHelpers';
import { PhysicsBall } from '../ideas/PhysicsBall';
import { PhysicsCollidable } from '../ideas/PhysicsCollidable';
import { gsap } from 'gsap';
import { CameraManager } from '../managers/CameraManager';
import { InteractionManager } from '../managers/InteractionManager';
import { Media } from '../logic/Media';
import { useFrame, useThree } from '@react-three/fiber';
import { PhysicsObjects } from '../ideas/PhyicsObjects';


export default function SceneXyz3D({
    path,
    setShowPopup,
    setPopupContent,
    setXyzAPI,
    isDebugging = false,
})
{
    const { scene, animations } = useGLTF(path);
    const { ref, mixer, names, actions, clips } = useAnimations(animations, scene);

    const [ sceneZoneNodes, setSceneZoneNodes ] = useState(null);

    const playerState = usePlayer();

    const { camera } = useThree();
    const [ sceneManager, setSceneManager ] = useState(null);
    const [ interactionManager, setInteractionManager ] = useState(null);
    const [ cameraManager, setCameraManager ] = useState(null);
    const { gl } = useThree();

    const initializeManagers = (playerState) =>
    {
        // only initialize once
        if (sceneManager || playerState === null || playerState === undefined)
        {
            return;
        }

        camera.children.length = 0;
        const tempSceneManager = new SceneManager(scene, camera, animations, actions, mixer);
        setSceneManager(tempSceneManager);

        const tempCameraManager = new CameraManager(tempSceneManager, camera, playerState);
        setCameraManager(tempCameraManager);

        const tempInteractionManager = new InteractionManager(gl.domElement, setShowPopup, setPopupContent, tempCameraManager.goToSceneZoneByName, tempSceneManager.playAnimation, tempSceneManager.playSound);

        setInteractionManager(tempInteractionManager);
        const siteData = tempSceneManager.getSiteData();

        setXyzAPI({
            goToSceneZoneByIndex: tempCameraManager.goToSceneZoneByIndex,
            goToSceneZoneByName: tempCameraManager.goToSceneZoneByName,
            getSceneManager: () => { return tempSceneManager },
            getCameraManager: () => { return tempCameraManager },
            getInteractionManager: () => { return tempInteractionManager },
            getSiteData: () => { return siteData }
        })
    };


    // UseFrame hook for animations and interactions
    useFrame(() =>
    {
        if (!cameraManager)
        {
            initializeManagers(playerState);
            return;
        }

        cameraManager.update(playerState);
    });




    // Go to the first scene zone on component mount
    useEffect(() =>
    {
        if (!sceneManager) return;

        const getSceneZoneNodes = () =>
        {
            const zoneNodes = [];
            sceneManager.getSceneZones().forEach((zone) =>
            {
                const node = <SceneZone
                    interactionManager={interactionManager}
                    isDebugging={isDebugging}
                    object={zone}
                    key={generateKey(zone.name)}
                />;

                zoneNodes.push(node);
            });
            return zoneNodes;
        }
        const zoneNodes = getSceneZoneNodes();
        setSceneZoneNodes(zoneNodes);

    }, [ sceneManager ]);


    return (
        <>
            {
                sceneManager && <primitive object={scene}>

                    {sceneZoneNodes}

                    <PhysicsObjects
                        isDebugging={isDebugging}
                        sceneManager={sceneManager}
                        interactionManager={interactionManager}
                    />

                    <Media sceneManager={sceneManager} interactionManager={interactionManager} isDebugging={isDebugging} />

                </primitive>
            }
        </>
    );
}
