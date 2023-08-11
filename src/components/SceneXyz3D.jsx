
import React, { useRef, useState, useEffect, componentDidMount, useImperativeHandle } from 'react';
import { ScrollControls, useAnimations, useGLTF } from "@react-three/drei";

import { useFrame, useThree } from '@react-three/fiber';

import { SceneManager } from '../managers/SceneManager.js';
import { Controls } from './Controls.jsx';
import { SceneZone } from './SceneZone.jsx';
import * as THREE from 'three';


export const SceneXyz3D = React.forwardRef((props, ref) =>
{
    const { camera } = useThree();
    const { scene, animations } = useGLTF(props.path);
    const { mixer, names, actions, clips } = useAnimations(animations, scene);

    const [ sceneManager, setSceneManager ] = useState(null);
    const [ isBusy, setIsBusy ] = useState(false);
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
        if (camera == null || sceneManager == null) return;

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


        const position = sceneZone.cameraAnchor.position;
        const target = sceneZone.cameraTargetPosition;

        controlsRef.current?.setLookAt(...position, ...target, true).then(() =>
        {
            setIsBusy(false);
        });
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


            <primitive object={scene}>

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
