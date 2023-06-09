
import React, { useRef, useState, useEffect, componentDidMount } from 'react';
import { ScrollControls, useAnimations, useGLTF } from "@react-three/drei";

import { useFrame, useThree } from '@react-three/fiber';

import { SceneManager } from '../managers/SceneManager.js';
import { Controls } from './Controls.jsx';
import { SceneZone } from './SceneZone.jsx';
import * as THREE from 'three';
import { SceneZoneWrapper } from './SceneZoneWrapper.jsx';


export function SceneXyz3D(props)
{
    const { camera } = useThree();
    const { scene, animations } = useGLTF(props.path);
    const { ref, mixer, names, actions, clips } = useAnimations(animations, scene);


    const [ sceneManager, setSceneManager ] = useState(null);
    const [ scroll, setScroll ] = useState(null);
    const [ isBusy, setIsBusy ] = useState(false);
    const controlsRef = useRef(null);

    // play animation by name
    const playAnimation = (name, loopType = THREE.LoopOnce) =>
    {

        if (actions[ name ] && actions[ name ].isRunning() == false)
        {

            console.log("Playing animation: ", name)

            actions[ name ].setLoop(loopType);
            actions[ name ].clampWhenFinished = true;
            actions[ name ].reset();
            actions[ name ].play();
        }


    }

    const goToSceneZoneByIndex = (index) =>
    {
        if (scroll == null || camera == null || sceneManager == null || controlsRef.current == null) return;

        setIsBusy(true);

        const sceneZone = sceneManager.waypoints[ index ];

        if (sceneZone == null)
        {
            console.log("Scene zone not found, index: ", index);
            return;
        }

        goToSceneZone(sceneZone);

    }

    const goToSceneZoneByName = (name) =>
    {
        if (scroll == null || camera == null || sceneManager == null) return;

        setIsBusy(true);

        const sceneZone = sceneManager.getSceneZone(name);

        if (sceneZone == null)
        {
            console.log("Scene zone not found: ", name);
            return;
        }

        goToSceneZone(sceneZone);

    }

    const goToSceneZone = (sceneZone) =>
    {
        if (sceneZone == null)
        {
            return;
        }

        const newScrollOffset = sceneZone.index / (sceneManager.sceneZones.length - 1);

        const scrollTarget = scroll.el;
        const scrollTop = (scrollTarget.scrollHeight - scrollTarget.clientHeight) * (newScrollOffset);
        scrollTarget.scrollTo({ top: scrollTop, behavior: "smooth" });

        const position = sceneZone.cameraAnchor.position;
        const target = sceneZone.cameraTargetPosition;

        controlsRef.current?.setLookAt(...position, ...target, true).then(() =>
        {
            setIsBusy(false);
        });
    }



    const scrollHandler = () =>
    {
        if (isBusy || scroll == null || camera == null || sceneManager == null) return;

        const scaledScrollOffset = scroll.offset * (sceneManager.waypoints.length - 1);

        const currentZoneIndex = Math.floor(scaledScrollOffset);
        const nextZoneIndex = Math.ceil(scaledScrollOffset);
        const currentZone = sceneManager.waypoints[ currentZoneIndex ];
        const nextZone = sceneManager.waypoints[ nextZoneIndex ];

        const percent = scaledScrollOffset % 1; // Interpolation factor, between 0 and 1 (0 for currentZone, 1 for nextZone)

        controlsRef.current?.lerpLookAt(
            ...currentZone.cameraAnchor.position,
            ...currentZone.cameraTargetPosition,
            ...nextZone.cameraAnchor.position,
            ...nextZone.cameraTargetPosition,
            percent,
            true
        );
    };

    useFrame(() =>
    {
        scrollHandler();
    });

    // set up scene manager
    useEffect(() =>
    {
        const manager = new SceneManager(scene, controlsRef.current);
        setSceneManager(manager);

        // play all looping animations
        manager.getLoopingAnimations().forEach((actionName) =>
        {
            playAnimation(actionName, THREE.LoopRepeat);
        });

    }, [ animations, controlsRef ]);

    // go to first scene zone on load
    useEffect(() =>
    {

        goToSceneZoneByIndex(0);

    }, [ sceneManager ]);


    return (
        <>

            <ScrollControls enabled={true} pages={sceneManager?.waypoints.length - 1} >

                <Controls innerRef={controlsRef} />

                <SceneZoneWrapper setScroll={setScroll}>

                    <primitive object={scene}>

                        {
                            controlsRef.current &&
                            sceneManager &&
                            sceneManager.getSceneZones().map((object, key) => (
                                <SceneZone
                                    onScroll={setScroll}
                                    setShowPopup={props.setShowPopup}
                                    setPopupContent={props.setPopupContent}
                                    goToSceneZone={goToSceneZoneByName}
                                    playAnimation={playAnimation}

                                    object={object}
                                    key={key}
                                />
                            ))
                        }

                    </primitive>

                    {props.children}
                </SceneZoneWrapper>

            </ScrollControls>

        </>
    );

}
