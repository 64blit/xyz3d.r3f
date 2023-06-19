import React, { useRef, useState, useEffect, Suspense } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, Scroll, ScrollControls, useAnimations, useGLTF } from "@react-three/drei";
import { Bloom, DepthOfField, EffectComposer } from '@react-three/postprocessing';

import { SceneManager } from '../managers/SceneManager.js';
import { ProgressLoader } from './ProgressLoader.jsx';
import { Controls } from './Controls.jsx';
import { SceneZone } from './SceneZone.jsx';
import { SceneZoneWrapper } from './SceneZoneWrapper.jsx';

export function SceneXyz3D(props)
{
    const [ sceneManager, setSceneManager ] = useState(null);
    const [ scroll, setScroll ] = useState(null);
    const [ enableBloom, setEnableBloom ] = useState(true);
    const [ enableDepthOfField, setEnableDepthOfField ] = useState(true);
    const [ dofDist, setDofDist ] = useState(0);

    const controlsRef = useRef(null);

    const { camera, gl } = useThree();
    const { scene, animations } = useGLTF(props.path);
    const { actions } = useAnimations(animations);

    // play animation by name
    const playAnimation = (name) =>
    {
        actions[ name ].play();
    }

    const goToSceneZone = (name) =>
    {
        if (scroll == null || camera == null || sceneManager == null) return;

        const sceneZone = sceneManager.getSceneZone(name);
        const scrollPosition = sceneZone.index / (sceneManager.sceneZones.length - 1);

        setScroll({ offset: scrollPosition });

        const position = sceneZone.cameraAnchor.position;
        const target = sceneZone.cameraTargetPosition;

        controlsRef.current?.setLookAt(...position, ...target, true);
    }

    const scrollHandler = () =>
    {
        if (scroll == null || camera == null || sceneManager == null) return;

        const scaledScrollOffset = scroll.offset * (sceneManager.sceneZones.length - 1);

        const currentZoneIndex = Math.floor(scaledScrollOffset);
        const nextZoneIndex = Math.ceil(scaledScrollOffset);
        const currentZone = sceneManager.sceneZones[ currentZoneIndex ];
        const nextZone = sceneManager.sceneZones[ nextZoneIndex ];

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

    const fixSceneZonesPositions = () =>
    {
        const sceneZones = sceneManager.sceneZones;

        sceneZones.forEach((sceneZone) =>
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
            <Html fullscreen>
                <div className="post-effects-controls">
                    <label>
                        <input
                            type="checkbox"
                            checked={enableBloom}
                            onChange={(e) => setEnableBloom(e.target.checked)}
                        />
                        Enable Bloom
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={enableDepthOfField}
                            onChange={(e) => setEnableDepthOfField(e.target.checked)}
                        />
                        Enable Depth of Field
                    </label>
                </div>
            </Html>
            <ScrollControls enabled={true} pages={sceneManager?.sceneZones.length}>

                <Controls innerRef={controlsRef} />
                {sceneManager && controlsRef && (
                    <SceneZoneWrapper setScroll={setScroll}>
                        <Suspense fallback={<ProgressLoader />}>
                            <primitive object={scene}>
                                {sceneManager.getSceneZones().map((object, key) => (
                                    <SceneZone
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
                )}

            </ScrollControls>

            <EffectComposer>
                {enableBloom && (
                    <Bloom intensity={1.5} luminanceThreshold={0.9} luminanceSmoothing={0.9} />
                )}
                {enableDepthOfField && (
                    <DepthOfField focusDistance={dofDist} focalLength={0.02} bokehScale={2} height={480} />
                )}

            </EffectComposer>
        </>
    );
}
