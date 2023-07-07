
import React, { useRef, useState, useEffect } from 'react';
import { ScrollControls, useAnimations, useGLTF } from "@react-three/drei";

import { useFrame, useThree } from '@react-three/fiber';

import { SceneManager } from '../managers/SceneManager.js';
import { Controls } from './Controls.jsx';
import { SceneZone } from './SceneZone.jsx';
import * as THREE from 'three';
import { SceneZoneWrapper } from './SceneZoneWrapper.jsx';


export function SceneXyz3D(props)
{
    //  an enum for the scroll state
    const SCROLLING = Object.freeze({
        ENTERING: 0,
        EXITING: 1,
        IDLE: 2
    });
    const [ sceneManager, setSceneManager ] = useState(null);
    const [ scroll, setScroll ] = useState(null);
    const [ isBusy, setIsBusy ] = useState(false);
    const [ scrollState, setScrollState ] = useState(SCROLLING.ENTERING);
    const [ prevScrollPercentage, setPrevScrollPercentage ] = useState(0);

    const [ targetSceneZone, setTargetSceneZone ] = useState(1);

    const controlsRef = useRef(null);

    const { camera } = useThree();
    const { scene, animations } = useGLTF(props.path);
    const { ref, mixer, names, actions, clips } = useAnimations(animations, scene);

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

    const goToSceneZone = (name) =>
    {
        if (scroll == null || camera == null || sceneManager == null) return;

        setIsBusy(true);

        const sceneZone = sceneManager.getSceneZone(name);
        const newScrollOffset = sceneZone.index / (sceneManager.sceneZones.length - 1);

        const scrollTarget = scroll.el;
        const scrollTop = (scrollTarget.scrollHeight - scrollTarget.clientHeight) * (newScrollOffset);
        scrollTarget.scrollTo({ top: scrollTop });

        const position = sceneZone.cameraAnchor.position;
        const target = sceneZone.cameraTargetPosition;

        controlsRef.current?.setLookAt(...position, ...target, true);

        setIsBusy(false);
    }

    const scrollHandler = () =>
    {
        if (isBusy || scroll == null || camera == null || sceneManager == null) return;

        const scaledScrollOffset = scroll.offset * (sceneManager.sceneZones.length - 1);

        const currentZoneIndex = Math.floor(scaledScrollOffset);
        const nextZoneIndex = Math.ceil(scaledScrollOffset);
        const currentZone = sceneManager.sceneZones[ currentZoneIndex ];
        const nextZone = sceneManager.sceneZones[ nextZoneIndex ];


        const scrollPercentage = scaledScrollOffset % 1; // Interpolation factor, between 0 and 1 (0 for currentZone, 1 for nextZone)

        updateScrollState(scrollPercentage);

        // console.log(currentZone.name, nextZone.name, scrollState);
        playSceneZoneAnimations(nextZone, currentZone, scrollState);

        controlsRef.current?.lerpLookAt(
            ...currentZone.cameraAnchor.position,
            ...currentZone.cameraTargetPosition,
            ...nextZone.cameraAnchor.position,
            ...nextZone.cameraTargetPosition,
            scrollPercentage,
            false
        );
    };

    const playSceneZoneAnimations = (enterZone, exitZone, scrollState) =>
    {

        if (scrollState === SCROLLING.ENTERING)
        {
            console.log("Entering", enterZone.name);
            enterZone.enterAnimations.forEach((actionName) =>
            {
                playAnimation(actionName);
            });
        } else if (scrollState === SCROLLING.EXITING)
        {
            console.log("Exiting", exitZone.name);
            exitZone.exitAnimations.forEach((actionName) =>
            {
                playAnimation(actionName);
            });
        }
    }

    const updateScrollState = (scrollPercentage) =>
    {

        //  if we are entering or exiting a scene zone, set the scroll state
        if (
            ((prevScrollPercentage < .1 && scrollPercentage >= .1) ||
                (prevScrollPercentage > .9 && scrollPercentage <= .9))
            && (scrollState !== SCROLLING.EXITING)
        )
        {
            setScrollState(SCROLLING.EXITING);
        } else if (
            ((prevScrollPercentage >= .1 && scrollPercentage < .1) ||
                (prevScrollPercentage <= .9 && scrollPercentage > .9))
            && (scrollState !== SCROLLING.ENTERING)
        )
        {
            setScrollState(SCROLLING.ENTERING);
        } else
        {
            setScrollState(SCROLLING.IDLE);
        }

        setPrevScrollPercentage(scrollPercentage);
    }

    const fixCameraAnchorPositions = () =>
    {
        const sceneZones = sceneManager.sceneZones;
        // return;
        sceneZones.forEach(sceneZone =>
        {
            const position = sceneZone.cameraAnchor.position;
            const target = sceneZone.cameraTargetPosition;

            controlsRef.current?.setLookAt(...position, ...target, false);
            controlsRef.current?.fitToBox(sceneZone.cameraTarget, false);
            controlsRef.current?.update(0);

            sceneZone.cameraAnchor.position.x = controlsRef.current?.camera.position.x;
            sceneZone.cameraAnchor.position.y = controlsRef.current?.camera.position.y;
            sceneZone.cameraAnchor.position.z = controlsRef.current?.camera.position.z;

        });
    }

    useFrame(() =>
    {
        scrollHandler();
    });

    // set up scene manager
    useEffect(() =>
    {
        const sceneManager = new SceneManager(scene);
        setSceneManager(sceneManager);

        // play all looping animations
        sceneManager.getLoopingAnimations().forEach((actionName) =>
        {
            playAnimation(actionName, THREE.LoopRepeat);
        });

    }, [ scene, animations ]);

    // go to first scene zone on load
    useEffect(() =>
    {
        if (sceneManager)
        {
            fixCameraAnchorPositions();
            goToSceneZone(sceneManager.sceneZones[ 0 ].name);
        }

    }, [ sceneManager ]);



    return (
        <>
            <ScrollControls enabled={true} pages={sceneManager?.sceneZones.length} >
                <Controls innerRef={controlsRef} />
                {
                    sceneManager &&
                    controlsRef &&
                    <SceneZoneWrapper setScroll={setScroll}>


                        <primitive object={scene}>

                            {sceneManager.getSceneZones().map((object, key) => (

                                <SceneZone
                                    onScroll={setScroll}
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
                    </SceneZoneWrapper>
                }
            </ScrollControls>
        </>
    );

}
