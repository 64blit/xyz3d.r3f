import React, { useRef, useState, useEffect } from 'react';
import { ScrollControls, useAnimations, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from '@react-three/fiber';
import { SceneManager } from '../managers/SceneManager';
import { SceneZone } from './SceneZone';
import * as THREE from 'three';
import { Collidable } from 'spacesvr';
import { generateKey } from '../helpers/ReactHelpers';
import { PhysicsBall } from './PhysicsBall';
import { PhysicsCollidable } from './PhysicsCollidable';


export default function SceneXyz3D({
    path,
    setShowPopup,
    setPopupContent,
    isDebugging
})
{
    const { scene, animations } = useGLTF(path);
    const { ref, mixer, names, actions, clips } = useAnimations(animations, scene);

    const [ sceneManager, setSceneManager ] = useState(null);
    const [ sceneZoneNodes, setSceneZoneNodes ] = useState(null);
    const [ physicsNodes, setPhysicsNodes ] = useState(null);

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

    const getSceneZoneNodes = () =>
    {
        const zoneNodes = [];
        sceneManager.getSceneZones().forEach((zone) =>
        {
            const node = <SceneZone
                setShowPopup={setShowPopup}
                setPopupContent={setPopupContent}
                playAnimation={playAnimation}
                isDebugging={isDebugging}
                object={zone}
                key={generateKey(zone.name)}
            />;

            zoneNodes.push(node);
        });
        return zoneNodes;
    }

    const getPhyicsNodes = () =>
    {
        const physicsNodes = [];
        sceneManager.getPhysicsObjects().forEach((obj) =>
        {
            const gravity = parseInt(obj.userData[ "Gravity" ]) || 0;
            const collides = obj.userData[ "Collidable" ] === "true";

            scene.remove(obj);


            let node = <PhysicsCollidable obj={obj} key={generateKey(obj.name)} />;

            if (gravity > 0)
            {
                node = <PhysicsBall obj={obj} mass={gravity} key={generateKey(obj.name)} />;
            }

            physicsNodes.push(node);
        });
        return physicsNodes;
    }

    // Go to the first scene zone on component mount
    useEffect(() =>
    {
        if (!sceneManager) return;

        const zoneNodes = getSceneZoneNodes();
        setSceneZoneNodes(zoneNodes);

        const physicsNodes = getPhyicsNodes();
        setPhysicsNodes(physicsNodes);

    }, [ sceneManager ]);

    // Set up the scene manager on component mount
    useEffect(() =>
    {
        const manager = new SceneManager(scene);
        setSceneManager(manager);

        // Play all looping animations
        manager.getLoopingAnimations().forEach((actionName) =>
        {
            playAnimation(actionName, THREE.LoopRepeat);
        });
    }, []);
    return (
        <primitive object={scene}>
            {sceneZoneNodes}
            {physicsNodes}
        </primitive>
    );
}
