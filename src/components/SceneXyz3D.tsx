import React, { useRef, useState, useEffect } from 'react';
import { useAnimations, useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { SceneManager } from '../managers/SceneManager.js';
import { SceneZone } from './SceneZone';
import * as THREE from 'three';
import { SceneZoneWrapper } from './SceneZoneWrapper';
import { Collidable } from 'spacesvr';
import { generateKey } from '../helpers/ReactHelpers.js';

export default function SceneXyz3D({
    path,
    setShowPopup,
    setPopupContent,
    isDebugging,
})
{
    const gltfResult = useGLTF(path);
    const { scene, animations } = gltfResult as {
        scene: THREE.Group;
        animations: THREE.AnimationClip[];
    };


    const [ sceneManager, setSceneManager ] = useState<SceneManager | null>(null);
    const [ interactables, setInteractables ] = useState<React.ReactNode[] | null>(null);
    const [ collidables, setCollidables ] = useState<React.ReactNode[] | null>(null);

    const { actions } = useAnimations(animations, scene);

    // Function to play animation by name
    const playAnimation = (name: string, loopType: THREE.AnimationActionLoopStyles) =>
    {
        if (!actions[ name ])
        {
            return;
        }

        if (!actions[ name ].isRunning())
        {
            actions[ name ].setLoop(loopType, 1);
            actions[ name ].clampWhenFinished = true;
            actions[ name ].reset();
            actions[ name ].play();
        }
    };

    // Function to navigate to a scene zone by index
    const goToSceneZoneByIndex = (index: number) =>
    {
        if (!sceneManager) return;

        const sceneZone = sceneManager.waypoints[ index ];
        if (!sceneZone)
        {
            console.log('Scene zone not found, index: ', index);
            return;
        }

        goToSceneZone(sceneZone);
    };

    // Function to navigate to a scene zone by name
    const goToSceneZoneByName = (name: string) =>
    {
        if (!sceneManager) return;

        const sceneZone = sceneManager.getSceneZone(name);
        if (!sceneZone)
        {
            console.log('Scene zone not found: ', name);
            return;
        }

        goToSceneZone(sceneZone);
    };

    // Function to smoothly navigate to a scene zone
    const goToSceneZone = (sceneZone: any) =>
    {
        if (!sceneZone || sceneZone.index < 0)
        {
            return;
        }

        const position = sceneZone.cameraAnchor?.position;

        if (!position) return;

        const target = sceneZone.cameraTargetPosition;

        // ?.setLookAt(...position, ...target, true).then(() =>
        // {
        //     setBusy(false);
        // });
    };

    // Set up the scene manager on component mount
    useEffect(() =>
    {
        if (!animations) return;

        const manager = new SceneManager(scene);
        setSceneManager(manager);

        // Play all looping animations
        manager.getLoopingAnimations().forEach((actionName: string) =>
        {
            playAnimation(actionName, THREE.LoopRepeat);
        });
    }, [ animations ]);

    // Go to the first scene zone on component mount
    useEffect(() =>
    {
        if (!sceneManager) return;

        goToSceneZoneByIndex(0);

        const zoneNodes: React.ReactNode[] = [];
        sceneManager.getSceneZones().forEach((zone: any) =>
        {
            const node = (
                <SceneZone
                    setShowPopup={setShowPopup}
                    setPopupContent={setPopupContent}
                    goToSceneZone={goToSceneZoneByName}
                    playAnimation={playAnimation}
                    isDebugging={isDebugging}
                    object={zone}
                    key={generateKey(zone.name)}
                />
            );

            zoneNodes.push(node);
        });
        setInteractables(zoneNodes);

        const collidables: React.ReactNode[] = [];
        sceneManager.getCollidables().forEach((obj: any) =>
        {
            const node = (
                <Collidable triLimit={1000} enabled={true} hideCollisionMeshes={true} key={obj.name}>
                    <primitive object={obj} />
                </Collidable>
            );

            collidables.push(node);
        });

        setCollidables(collidables);
    }, [ sceneManager ]);

    return (
        <primitive object={scene}>
            {interactables}
            {collidables}

        </primitive>
    );
}
