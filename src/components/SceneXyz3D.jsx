
import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Html, Scroll, ScrollControls, useAnimations, useGLTF, useScroll } from "@react-three/drei";

import { useFrame, useThree } from '@react-three/fiber';

import { SceneManager } from '../managers/SceneManager.js';
import { ProgressLoader } from './ProgressLoader.jsx';
import { Controls } from './Controls.jsx';
import { SceneZone } from './SceneZone.jsx';
import * as THREE from 'three';
import { map } from '../utils/BaseUtils.js';
import { RectAreaLightUniformsLib } from 'three-stdlib';
import { SceneZoneWrapper } from './SceneZoneWrapper.jsx';


export function SceneXyz3D(props)
{
    const [ sceneManager, setSceneManager ] = useState(null);
    const [ scroll, setScroll ] = useState(null);

    const [ targetSceneZone, setTargetSceneZone ] = useState(1);

    const controlsRef = useRef(null);

    const { camera } = useThree();
    const { scene, animations } = useGLTF(props.path);
    const { actions } = useAnimations(animations);

    // play animation by name
    const playAnimation = (name) =>
    {
        actions[ name ].play();
    }

    const goToSceneZone = (name) =>
    {
        const sceneZone = sceneManager.getSceneZone(name);

        const position = sceneZone.cameraAnchor.position;
        const target = sceneZone.cameraTargetPosition;

        controlsRef.current?.setLookAt(...position, ...target, true);
        controlsRef.current?.fitToBox(sceneZone.cameraTarget, true);
    }

    const scrollHandler = () =>
    {
        if (scroll == null || camera == null || sceneManager == null) return;

        const scaledScrollOffset = scroll.offset * (sceneManager.sceneZones.length - 1);

        const currentZoneIndex = Math.floor(scaledScrollOffset);
        const nextZoneIndex = Math.ceil(scaledScrollOffset);
        const currentZone = sceneManager.sceneZones[ currentZoneIndex ];
        const nextZone = sceneManager.sceneZones[ nextZoneIndex ];

        const t = scaledScrollOffset % 1; // Interpolation factor, between 0 and 1 (0 for currentZone, 1 for nextZone)

        controlsRef.current?.lerpLookAt(
            ...currentZone.cameraAnchor.position,
            ...currentZone.cameraTargetPosition,
            ...nextZone.cameraAnchor.position,
            ...nextZone.cameraTargetPosition,
            t,
            true
        );
    };


    const fixSceneZonesPositions = () =>
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

    }, [ scene ]);

    // go to first scene zone on load
    useEffect(() =>
    {
        if (sceneManager)
        {
            fixSceneZonesPositions();
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

                        <Suspense fallback={<ProgressLoader />}>

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
                        </Suspense>
                    </SceneZoneWrapper>
                }
            </ScrollControls>
        </>
    );
}
