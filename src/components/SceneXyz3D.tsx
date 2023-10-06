import React, { useRef, useState, useEffect } from 'react';
import { ScrollControls, useAnimations, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from '@react-three/fiber';
import { SceneManager } from '../managers/SceneManager.js';
import { SceneZone } from './SceneZone';
import * as THREE from 'three';
import { SceneZoneWrapper } from './SceneZoneWrapper';
import { Collidable } from 'spacesvr';
import { generateKey } from '../helpers/ReactHelpers.js';

export default function SceneXyz3D({ path, setShowPopup, setPopupContent, isDebugging, setIsInitialized, children })
{
    const { scene, animations } = useGLTF(path);
    // const { ref, mixer, names, actions, clips } = useAnimations(animations, scene);

    const [ sceneManager, setSceneManager ] = useState(null);
    const [ interactables, setInteractables ] = useState(null);
    const [ collidables, setCollidables ] = useState(null);

    // Function to play animation by name
    const playAnimation = (name, loopType = THREE.LoopOnce) =>
    {
        if (!actions[ name ])
        {
            return;
        }

        if (!actions[ name ].isRunning())
        {
            actions[ name ].setLoop(loopType);
            actions[ name ].clampWhenFinished = true;
            actions[ name ].reset();
            actions[ name ].play();
        }
    }

    // Function to navigate to a scene zone by index
    const goToSceneZoneByIndex = (index) =>
    {
        if (!scroll || !sceneManager) return;

        const sceneZone = sceneManager.waypoints[ index ];
        if (!sceneZone)
        {
            console.log("Scene zone not found, index: ", index);
            return;
        }

        goToSceneZone(sceneZone);
    }

    // Function to navigate to a scene zone by name
    const goToSceneZoneByName = (name) =>
    {
        if (!scroll || !sceneManager) return;

        const sceneZone = sceneManager.getSceneZone(name);
        if (!sceneZone)
        {
            console.log("Scene zone not found: ", name);
            return;
        }

        goToSceneZone(sceneZone);
    }

    // Function to smoothly navigate to a scene zone
    const goToSceneZone = (sceneZone) =>
    {
        if (!sceneZone || sceneZone.index < 0)
        {
            return;
        }

        const position = sceneZone.cameraAnchor?.position;

        if (!position) return;

        const target = sceneZone.cameraTargetPosition;

        // ?.setLookAt(...position, ...target, true).then(() =>
        // {
        //     setBusy(false);
        // });
    }

    // Set up the scene manager on component mount
    useEffect(() =>
    {
        if (!animations) return;

        const manager = new SceneManager(scene);
        setSceneManager(manager);

        // Play all looping animations
        manager.getLoopingAnimations().forEach((actionName) =>
        {
            playAnimation(actionName, THREE.LoopRepeat);
        });
    }, [ animations ]);

    // Go to the first scene zone on component mount
    useEffect(() =>
    {
        if (!sceneManager) return;

        goToSceneZoneByIndex(0);

        const zoneNodes = [];
        sceneManager.getSceneZones().forEach((zone) =>
        {
            const node = <SceneZone
                setShowPopup={setShowPopup}
                setPopupContent={setPopupContent}
                goToSceneZone={goToSceneZoneByName}
                playAnimation={playAnimation}
                isDebugging={isDebugging}
                object={zone}
                key={generateKey(zone.name)}
            />;

            zoneNodes.push(node);
        });
        setInteractables(zoneNodes);

        const collidables = [];
        sceneManager.getCollidables().forEach((obj) =>
        {
            const node = <Collidable triLimit={1000} enabled={true} hideCollisionMeshes={true} key={obj.name} >
                <primitive object={obj} />
            </Collidable >;

            collidables.push(node);
        });

        setCollidables(collidables);

    }, [ sceneManager ]);


    return (


        <primitive object={scene} >
            {interactables}
            {collidables}

            {children}
        </primitive>

    );
}
