import React, { useRef, useState, useEffect } from 'react';
import { ScrollControls, useAnimations, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from '@react-three/fiber';
import { SceneManager } from '../managers/SceneManager.js';
import { Controls } from './Controls.jsx';
import { SceneZone } from './SceneZone.jsx';
import * as THREE from 'three';
import { SceneZoneWrapper } from './SceneZoneWrapper.jsx';

// React component for the 3D scene
export function SceneXyz3D(props)
{
    const { camera } = useThree();
    const { scene, animations } = useGLTF(props.path);
    const { ref, mixer, names, actions, clips } = useAnimations(animations, scene);

    const [ sceneManager, setSceneManager ] = useState(null);
    const [ scroll, setScroll ] = useState(null);
    const [ isBusy, setIsBusy ] = useState(false);
    const controlsRef = useRef(null);

    // Function to play animation by name
    const playAnimation = (name, loopType = THREE.LoopOnce) =>
    {
        if (actions[ name ] && !actions[ name ].isRunning())
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
        if (!scroll || !camera || !sceneManager || !controlsRef.current) return;

        setIsBusy(true);

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
        if (!scroll || !camera || !sceneManager) return;

        setIsBusy(true);

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
        if (!sceneZone) return;

        const newScrollOffset = sceneZone.index / (sceneManager.sceneZones.length - 1);
        const scrollTarget = scroll.el;
        const scrollTop = (scrollTarget.scrollHeight - scrollTarget.clientHeight) * newScrollOffset;
        scrollTarget.scrollTo({ top: scrollTop, behavior: "smooth" });

        const position = sceneZone.cameraAnchor.position;
        const target = sceneZone.cameraTargetPosition;

        controlsRef.current?.setLookAt(...position, ...target, true).then(() =>
        {
            setIsBusy(false);
        });
    }

    // Function to handle scrolling
    const scrollHandler = () =>
    {
        if (isBusy || !scroll || !camera || !sceneManager || !controlsRef.current) return;

        const scaledScrollOffset = scroll.offset * (sceneManager.waypoints.length - 1);
        const currentZoneIndex = Math.floor(scaledScrollOffset);
        const nextZoneIndex = Math.ceil(scaledScrollOffset);
        const currentZone = sceneManager.waypoints[ currentZoneIndex ];
        const nextZone = sceneManager.waypoints[ nextZoneIndex ];

        if (!currentZone || !nextZone) return;

        const percent = scaledScrollOffset % 1;

        // Use slerp to interpolate camera position and target
        const cameraPosition = currentZone.cameraAnchor.position.clone().lerp(nextZone.cameraAnchor.position, percent);
        const cameraTarget = currentZone.cameraTargetPosition.clone().lerp(nextZone.cameraTargetPosition, percent);

        controlsRef.current.setLookAt(...cameraPosition, ...cameraTarget, true);
    };

    useFrame(() =>
    {
        scrollHandler();
    });

    // Set up the scene manager
    useEffect(() =>
    {
        const manager = new SceneManager(scene, controlsRef.current);
        setSceneManager(manager);

        // Play all looping animations
        manager.getLoopingAnimations().forEach((actionName) =>
        {
            playAnimation(actionName, THREE.LoopRepeat);
        });

    }, [ animations, controlsRef ]);

    // Go to the first scene zone on load
    useEffect(() =>
    {
        camera.position.set(0, 0, 0);
        camera.updateProjectionMatrix();

        goToSceneZoneByIndex(0);
    }, [ sceneManager ]);

    return (
        <>
            <ScrollControls enabled={true} pages={sceneManager?.waypoints.length - 1}>
                <Controls innerRef={controlsRef} />

                <SceneZoneWrapper setScroll={setScroll}>
                    <primitive object={scene}>
                        {controlsRef.current &&
                            sceneManager &&
                            sceneManager.getSceneZones().map((object, key) => (
                                <SceneZone
                                    onScroll={setScroll}
                                    setShowPopup={props.setShowPopup}
                                    setPopupContent={props.setPopupContent}
                                    goToSceneZone={goToSceneZoneByName}
                                    playAnimation={playAnimation}
                                    isDebugging={props.isDebugging}

                                    object={object}
                                    key={key}
                                />
                            ))}
                    </primitive>

                    {props.children}
                </SceneZoneWrapper>
            </ScrollControls>
        </>
    );
}
