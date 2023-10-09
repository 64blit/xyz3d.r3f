import React, { useRef, useState, useEffect } from 'react';
import { ScrollControls, useAnimations, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from '@react-three/fiber';
import { SceneManager } from '../managers/SceneManager';
import { SceneZone } from './SceneZone';
import * as THREE from 'three';
import { Collidable } from 'spacesvr';
import { generateKey } from '../helpers/ReactHelpers';


export default function SceneXyz3D({
    path,
    setShowPopup,
    setPopupContent,
    isDebugging,
    setIsInitialized,
    children
})
{
    const { scene, animations } = useGLTF(path);
    const { ref, mixer, names, actions, clips } = useAnimations(animations, scene);
    const { camera } = useThree();

    const [ sceneManager, setSceneManager ] = useState(null);
    const [ interactables, setInteractables ] = useState(null);
    const [ collidables, setCollidables ] = useState(null);

    const playAnimation = (name, loopType) =>
    {
        const action = actions[ name ];

        if (!action)
        {
            return;
        }

        if (!action.isRunning())
        {
            action.setLoop(loopType, 1);
            action.clampWhenFinished = true;
            action.reset();
            action.play();
        }
    };


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

        const zoneNodes = [];
        sceneManager.getSceneZones().forEach((zone) =>
        {
            const node = <SceneZone
                setShowPopup={() => { }}
                setPopupContent={() => { }}
                goToSceneZone={() => { }}
                playAnimation={playAnimation}
                isDebugging={isDebugging}
                object={zone}
                key={generateKey(zone.name)}
            />;

            zoneNodes.push(node);
        });
        setInteractables(zoneNodes);

        const collidablesNodes = [];
        sceneManager.getCollidables().forEach((obj) =>
        {
            const node = <Collidable triLimit={1000} enabled={true} hideCollisionMeshes={true} key={obj.name}>
                <primitive object={obj} />
            </Collidable>;

            collidablesNodes.push(node);
        });

        setCollidables(collidablesNodes);

    }, [ sceneManager ]);

    return (
        <primitive object={scene}>
            {interactables}
            {collidables}
            {children}
        </primitive>
    );
}
