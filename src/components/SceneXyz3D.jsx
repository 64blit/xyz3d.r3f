
import React, { useRef, useState, useEffect, useImperativeHandle } from 'react';
import { useAnimations, useGLTF } from "@react-three/drei";

import { useThree, useFrame } from '@react-three/fiber';

import { SceneManager } from '../managers/SceneManager.js';
import { Controls } from './Controls.jsx';
import { SceneZone } from './SceneZone.jsx';
import * as THREE from 'three';


export const SceneXyz3D = React.forwardRef((props, ref) =>
{
    const { camera } = useThree();
    const { scene, animations } = useGLTF(props.path);
    const { actions } = useAnimations(animations, scene);

    const [ zoomObject, setZoomObject ] = useState(null);
    const [ isPointerDown, setPointerDown ] = useState(false);
    const [ sceneManager, setSceneManager ] = useState(null);

    const controlsRef = useRef(null);

    useImperativeHandle(ref, () => ({
        goToSceneZoneByIndex,
        goToSceneZoneByName,
        getSceneManager,
    }));

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
    const getSceneManager = () =>
    {
        return sceneManager;
    }

    const goToSceneZoneByIndex = (index) =>
    {
        if (camera == null || sceneManager == null || controlsRef.current == null) return;


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
        if (camera == null || sceneManager == null) return;


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


        const position = sceneZone.cameraAnchor.position;
        const target = sceneZone.cameraTargetPosition;

        controlsRef.current?.setLookAt(...position, ...target, true);
    }


    // Function to handle zooming
    const zoomHandler = (scene, pointer, raycaster) =>
    {
        if (!isPointerDown) return;
        if (zoomObject) return;

        raycaster.setFromCamera(pointer, controlsRef.current.camera);

        // Calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObjects(scene.children);
        if (intersects.length < 0) return;

        intersects.sort((a, b) => a.distance - b.distance);

        controlsRef.current?.fitToBox(intersects[ 0 ].object, true);
        setZoomObject(intersects[ 0 ].object);
    }


    // UseFrame hook for animations and interactions
    useFrame(({ scene, pointer, raycaster }) =>
    {
        if (!camera || !sceneManager || !controlsRef.current) return;
        zoomHandler(scene, pointer, raycaster);
    });

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

        if (camera == null || sceneManager == null) return;

        goToSceneZoneByIndex(0);
        props.setIsInitialized(true);

    }, [ sceneManager ]);


    return (
        <>

            <Controls innerRef={controlsRef} />


            <primitive
                object={scene}
                onDoubleClick={onPointerDown}
                onPointerUp={onPointerUp}
                onPointerDown={onPointerUp}
                onPointerMissed={onPointerUp}
            >
                {
                    controlsRef.current &&
                    sceneManager &&
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
                    ))
                }

                {props.children}
            </primitive>



        </>
    );

});

