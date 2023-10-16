import React, { useRef, useState, useEffect } from 'react';
import { ScrollControls, useAnimations, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from '@react-three/fiber';
import { SceneManager } from '../../managers/SceneManager.js';
import { Controls } from '../logic/Controls.jsx';
import { SceneZone } from './SceneZone.jsx';
import * as THREE from 'three';
import { SceneZoneWrapper } from './SceneZoneWrapper.jsx';
import { basicLerp, map } from '../../utils/BaseUtils.js';


export function SceneXyz3D(props)
{
    const { camera, size } = useThree();
    const { scene, animations } = useGLTF(props.path);
    const { ref, mixer, names, actions, clips } = useAnimations(animations, scene);

    const [ sceneManager, setSceneManager ] = useState(null);
    const [ scroll, setScroll ] = useState(null);
    const [ isBusy, setBusy ] = useState(false);
    const [ zoomObject, setZoomObject ] = useState(null);
    const [ isPointerDown, setPointerDown ] = useState(false);
    const controlsRef = useRef(null);

    // Function to play animation by name
    const playAnimation = (name, loopType = THREE.LoopOnce) =>
    {
        const action = actions[ name ];
        if (action && !action.isRunning())
        {
            action.setLoop(loopType);
            action.clampWhenFinished = true;
            action.reset();
            action.play();
        }
    }

    // Function to navigate to a scene zone by index
    const goToSceneZoneByIndex = (index) =>
    {
        if (!scroll || !camera || !sceneManager || !controlsRef.current) return;
        setBusy(true);

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
        setBusy(true);

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
            setBusy(false);
            return;
        }

        const newScrollOffset = sceneZone.index / (sceneManager.sceneZones.length - 1);
        const scrollTarget = scroll.el;
        const scrollTop = (scrollTarget.scrollHeight - scrollTarget.clientHeight) * newScrollOffset;

        scrollTarget.scrollTo({ top: scrollTop, behavior: "smooth" });

        const position = sceneZone.camera.anchor?.position;

        if (!position) return;

        const target = sceneZone.camera.targetPosition;

        controlsRef.current?.setLookAt(...position, ...target, true).then(() =>
        {
            setBusy(false);
        });
    }

    // Function to handle zooming
    const zoomHandler = (scene, pointer, raycaster) =>
    {
        if (!isPointerDown) return;
        if (zoomObject) return;

        raycaster.setFromCamera(pointer, controlsRef.current.camera);

        // Calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObjects(scene.children);

        if (intersects.length <= 0) return;

        controlsRef.current?.fitToBox(intersects[ 0 ].object, true);

        setZoomObject(intersects[ 0 ].object);
    }

    // Function to handle scrolling
    const scrollHandler = () =>
    {
        if (isPointerDown && scroll.delta < .0004) return;

        const scaledScrollOffset = scroll.offset * (sceneManager.waypoints.length - 1);
        const currentZoneIndex = Math.floor(scaledScrollOffset);
        const nextZoneIndex = Math.ceil(scaledScrollOffset);
        const currentZone = sceneManager.waypoints[ currentZoneIndex ];
        const nextZone = sceneManager.waypoints[ nextZoneIndex ];

        if (!currentZone || !nextZone) return;

        const percent = (scaledScrollOffset % 1);

        // Use slerp to interpolate camera position and target
        const cameraPosition = currentZone.camera.anchor.position.clone().lerp(nextZone.camera.anchor.position, percent);
        const cameraTarget = currentZone.camera.targetPosition.clone().lerp(nextZone.camera.targetPosition, percent);

        controlsRef.current.setLookAt(...cameraPosition, ...cameraTarget, true);

        if ("fov" in currentZone.camera.anchor)
        {
            controlsRef.current.camera.fov = basicLerp(currentZone.camera.anchor.fov, nextZone.camera.anchor.fov, percent);
            controlsRef.current.camera.near = basicLerp(currentZone.camera.anchor.near, nextZone.camera.anchor.near, percent);
            controlsRef.current.camera.far = basicLerp(currentZone.camera.anchor.far, nextZone.camera.anchor.far, percent);
            controlsRef.current.camera.updateProjectionMatrix();
            controlsRef.current.update(0);
        }

    };

    // UseFrame hook for animations and interactions
    useFrame(() =>
    {
        if (isBusy || !scroll || !camera || !sceneManager || !controlsRef.current) return;
        scrollHandler();
        // { scene, pointer, raycaster }
        // zoomHandler(scene, pointer, raycaster);
    });

    // Set up the scene manager on component mount
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

    // Go to the first scene zone on component mount
    useEffect(() =>
    {
        camera.position.set(0, 0, 0);
        camera.updateProjectionMatrix();
        goToSceneZoneByIndex(0);
    }, [ sceneManager ]);

    // Event handler for pointer down
    const onPointerDown = (event) =>
    {
        setPointerDown(true);
        setZoomObject(null);

        event.stopPropagation();
    }

    // Event handler for pointer up
    const onPointerUp = (event) =>
    {
        setPointerDown(false);
        setZoomObject(null);

        event.stopPropagation();
    }

    return (
        <>
            <ScrollControls enabled={true} pages={sceneManager?.waypoints.length - 1}>
                <Controls innerRef={controlsRef} />
                <SceneZoneWrapper setScroll={setScroll}>
                    <primitive
                        object={scene}
                        onDoubleClick={onPointerDown}
                        onPointerUp={onPointerUp}
                        onPointerDown={onPointerUp}
                        onPointerMissed={onPointerUp}
                    >
                        {controlsRef.current && sceneManager &&
                            sceneManager.getSceneZones().map((object, key) => (
                                <SceneZone
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
