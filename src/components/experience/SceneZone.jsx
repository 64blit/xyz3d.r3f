import { useFrame } from '@react-three/fiber';
import React, { useState, useEffect, useRef } from 'react';
import { Box3, BoxHelper, Vector3 } from 'three';

export function SceneZone(props)
{
    const sceneData = props.object;

    const zoneRef = useRef();
    const boxMeshRef = useRef();
    const cameraViewBoxRef = useRef();

    useFrame(() =>
    {
        if (!props.isDebugging) return;
        if (!zoneRef.current) return;

        const box = new Box3();
        box.setFromObject(zoneRef.current);
        const size = box.getSize(new Vector3());
        boxMeshRef.current.position.copy(box.getCenter(new Vector3()));
        boxMeshRef.current.scale.set(...size);

        const cameraSize = sceneData.camera.target.getSize(new Vector3());
        cameraViewBoxRef.current.position.copy(sceneData.camera.targetPosition);
        cameraViewBoxRef.current.scale.set(...cameraSize);

    });


    return (
        <>
            <group ref={zoneRef}>
                {sceneData.objects.interactables.map((element, key) => (
                    <group
                        key={key}
                        onClick={props.interactionManager.handleInteraction}
                        onPointerEnter={props.interactionManager.handlePointerEnter}
                        onPointerLeave={props.interactionManager.handlePointerExit}
                    >
                        <primitive
                            object={element.object}
                            position={element.worldPosition}
                            scale={element.scale}
                            rotation={element.rotation}
                        />
                    </group>
                ))}



            </group>

            <mesh ref={boxMeshRef} visible={props.isDebugging}>
                <boxGeometry args={[ 1, 1, 1 ]} />
                <meshBasicMaterial wireframe color="cyan" />
            </mesh>

            <mesh ref={cameraViewBoxRef} visible={props.isDebugging}>
                <boxGeometry args={[ 1, 1, 1 ]} />
                <meshBasicMaterial wireframe color="red" />
            </mesh>
        </>
    );
}
