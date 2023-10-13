import React, { useRef, useState, useEffect } from 'react';
import { ScrollControls, useAnimations, useGLTF } from "@react-three/drei";
import { SceneManager } from '../managers/SceneManager';
import { SceneZone } from './SceneZone';
import * as THREE from 'three';
import { Collidable, usePlayer } from 'spacesvr';
import { generateKey } from '../helpers/ReactHelpers';
import { PhysicsBall } from './PhysicsBall';
import { PhysicsCollidable } from './PhysicsCollidable';
import { gsap } from 'gsap';


export default function SceneXyz3D({
    path,
    setShowPopup,
    setPopupContent
})
{
    const { scene, animations } = useGLTF(path);
    const { ref, mixer, names, actions, clips } = useAnimations(animations, scene);

    const [ sceneManager, setSceneManager ] = useState(null);
    const [ sceneZoneNodes, setSceneZoneNodes ] = useState(null);
    const [ physicsNodes, setPhysicsNodes ] = useState(null);

    const playerState = usePlayer();


    const playAnimation = (name, loopType) =>
    {
        const action = actions[ name ];

        if (!action)
        {
            return;
        }

        if (action.isRunning())
        {
            return;
        }

        action.setLoop(loopType);
        action.clampWhenFinished = true;
        action.reset();
        action.play();

    };


    const goToSceneZone = (zoneName) =>
    {
        const zone = sceneManager.getSceneZone(zoneName);

        if (!zone) { return; }

        // Retrieve the current player position using the custom `get` method
        const currentPlayerPosition = playerState.position.get();

        // Animate position components separately
        gsap.to(currentPlayerPosition, {
            duration: 1,
            x: zone.cameraAnchor.position.x,
            y: zone.cameraAnchor.position.y,
            z: zone.cameraAnchor.position.z,
            onUpdate: () =>
            {
                // Update the player position using the custom `set` method
                playerState.position.set(currentPlayerPosition);
            },
        });
    }

    const getSceneZoneNodes = () =>
    {
        const zoneNodes = [];
        sceneManager.getSceneZones().forEach((zone) =>
        {
            const node = <SceneZone
                setShowPopup={setShowPopup}
                setPopupContent={setPopupContent}
                goToSceneZone={goToSceneZone}
                playAnimation={playAnimation}
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
            const dynamicMass = parseInt(obj.userData[ "Dynamic" ]) || 0;
            const collides = obj.userData[ "Static" ] === "true";
            const invisible = obj.userData[ "Invisible" ] === "true";

            let node = null;

            if (collides)
            {
                node = <PhysicsCollidable obj={obj} key={generateKey(obj.name)} invisible={invisible} />;
            }
            else if (dynamicMass > 0)
            {
                node = <PhysicsBall obj={obj} mass={dynamicMass} invisible={invisible} key={generateKey(obj.name)} />;
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
