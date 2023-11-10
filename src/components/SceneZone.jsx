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

    const getCallbacks = (element) =>
    {
        const callbacks = {};

        const type = element.object.userData?.type;
        const data = element.object.userData?.interactableData;

        if (element.object.userData?.type !== "interactable")
        {
            return;
        }

        if (type === undefined || type === null)
        {
            console.log("Missing interactable type for ", element.object.name);
            return;
        }
        if (data === undefined || data === null)
        {
            console.log("Missing interactable data for ", element.object.name);
            return;
        }

        callbacks.onClick = (event) => props.interactionManager.handleInteraction(event, element);


        if (element.object.userData?.OnPointerEnterAnimations !== undefined && element.object.userData?.OnPointerEnterAnimations !== null)
        {
            callbacks.onPointerEnter = (event) => props.interactionManager.handlePointerEnter(event, element);
        }

        if (element.object.userData?.OnPointerExitAnimations !== undefined && element.object.userData?.OnPointerExitAnimations !== null)
        {
            callbacks.onPointerLeave = (event) => props.interactionManager.handlePointerExit(event, element);
        }

        return callbacks;

    }


    return (
        <>
            <group ref={zoneRef}>

                {sceneData.objects.interactables.map((element, key) => (
                    <group
                        key={key}
                        {...getCallbacks(element)}
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
