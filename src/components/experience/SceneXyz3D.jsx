import React, { useRef, useState, useEffect, useMemo } from 'react';
import { ScrollControls, useAnimations, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from '@react-three/fiber';
import { SceneManager } from '../../managers/SceneManager.js';
import { Controls } from '../logic/Controls.jsx';
import { SceneZone } from './SceneZone.jsx';
import * as THREE from 'three';
import { SceneZoneWrapper } from './SceneZoneWrapper.jsx';
import { basicLerp } from '../../utils/BaseUtils.js';
import { PhysicsObjects } from './PhyicsObjects.jsx';
import { gsap } from 'gsap';


export function SceneXyz3D(props)
{
    const { camera, size } = useThree();
    const { scene, animations } = useGLTF(props.path);
    const { ref, mixer, names, actions, clips } = useAnimations(animations, scene);

    const [ scroll, setScroll ] = useState(null);
    const controlsRef = useRef(null);
    const [ busy, setBusy ] = useState(false);

    const [ sceneManager, setSceneManager ] = useState(null);

    useEffect(() =>
    {
        if (controlsRef.current == null || sceneManager !== null)
        {
            return;
        }

        setSceneManager(new SceneManager(scene, controlsRef.current, animations, actions, mixer));

    }, [ camera, scroll, actions, controlsRef.current, animations, mixer ]);

    // Go to the first scene zone on component mount
    useEffect(() =>
    {
        goToSceneZoneByIndex(0);
    }, [ sceneManager, scroll ]);

    // Function to navigate to a scene zone by index
    const goToSceneZoneByIndex = (index) =>
    {
        if (busy || !scroll) return;
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
        if (busy || !scroll || !camera || !sceneManager) return;
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
            return;
        }

        const newScrollOffset = sceneZone.index / (sceneManager.sceneZones.length - 1);
        const scrollTarget = scroll.el;
        const scrollTop = (scrollTarget.scrollHeight - scrollTarget.clientHeight) * newScrollOffset;

        scrollTarget.scrollTo({ top: scrollTop, behavior: 'smooth' });

        const position = sceneZone.camera.anchor?.position;

        if (!position) return;

        const target = sceneZone.camera.targetPosition;
        const controls = controlsRef.current;

        if (controls === undefined || controls === null) return;

        controls.setLookAt(...position, ...target, true).then(() => setBusy(false));

        const tl = gsap.timeline();

        tl.fromTo(
            controls.camera,
            { fov: controls.camera.fov },
            { fov: sceneZone.camera.anchor.fov, duration: controls.smoothTime, onUpdate: () => { controls.update(0); controls.camera.updateProjectionMatrix(); }, onComplete: () => { setBusy(false); } }
        );

        tl.fromTo(
            controls.camera,
            { near: controls.camera.near },
            { near: sceneZone.camera.anchor.near, duration: controls.smoothTime }
        );

        tl.fromTo(
            controls.camera,
            { far: controls.camera.far },
            { far: sceneZone.camera.anchor.far, duration: controls.smoothTime }
        );


        tl.play();
    }


    // Function to handle scrolling
    const scrollHandler = () =>
    {
        if (busy || !scroll || scroll.delta < .0004) return;

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
        const controls = controlsRef.current;

        controls.setLookAt(...cameraPosition, ...cameraTarget, true);

        if ("fov" in currentZone.camera.anchor)
        {
            controls.camera.fov = basicLerp(currentZone.camera.anchor.fov, nextZone.camera.anchor.fov, percent);
            controls.camera.near = basicLerp(currentZone.camera.anchor.near, nextZone.camera.anchor.near, percent);
            controls.camera.far = basicLerp(currentZone.camera.anchor.far, nextZone.camera.anchor.far, percent);
            controls.camera.updateProjectionMatrix();
            controls.update(0);
        }

    };

    // UseFrame hook for animations and interactions
    useFrame(() =>
    {
        scrollHandler();
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
                                    setShowPopup={props.setShowPopup}
                                    setPopupContent={props.setPopupContent}
                                    goToSceneZone={goToSceneZoneByName}
                                    playAnimation={sceneManager.playAnimation}
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
                            playAnimation={sceneManager.playAnimation}
                            setShowPopup={props.setShowPopup}
                            setPopupContent={props.setPopupContent}
                            goToSceneZone={goToSceneZoneByName}
                            isDebugging={props.isDebugging}
                        />}

                    {props.children}
                </SceneZoneWrapper>
            </ScrollControls>
        </>
    );
}
