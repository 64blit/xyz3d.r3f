import { useFrame } from '@react-three/fiber';
import React, { useState, useEffect, useRef } from 'react';
import { Box3, Vector3 } from 'three';


export function SceneZone(props)
{
    const sceneData = props.object;

    const [ hovered, setHovered ] = useState(false);

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

    useEffect(() =>
    {
        document.body.style.cursor = hovered ? "pointer" : "auto";

    }, [ hovered ])


    const handleInteraction = (event) =>
    {
        event.stopPropagation();

        const type = event.object.userData.interactableType;
        const data = event.object.userData.interactableData;

        playSelectAnimation(event.object);

        switch (type)
        {

            case "Popup HTML":
                props.setShowPopup(true);
                props.setPopupContent(data);
                break;

            case "Open Link":
                window.open(data, "_blank");
                break;

            case "Go To Scene Zone":
                props.goToSceneZone(data);
                break;

            default:
                break;

        }
    }

    // on hover callback for playing any hover animations found inside the userData varaiable under hoverAnimations
    const handlePointerEnter = (event) =>
    {
        setHovered(true);
        const onHoverAnimations = event.object.userData.OnPointerEnterAnimations || null;
        if (onHoverAnimations != null)
        {
            onHoverAnimations.forEach((actionName) =>
            {
                props.playAnimation(actionName);
            });
        }
    }

    const handlePointerExit = (event) =>
    {
        setHovered(false);
        const onPointerExit = event.object.userData.OnPointerExitAnimations || null;
        if (onPointerExit != null)
        {
            onPointerExit.forEach((actionName) =>
            {
                props.playAnimation(actionName);
            });
        }
    }

    const playSelectAnimation = (object) =>
    {
        const actions = object.userData.OnSelectAnimations || null;

        if (actions != null)
        {
            actions.forEach((actionName) =>
            {
                props.playAnimation(actionName);
            });
        }
    }

    return (
        <>
            <group ref={zoneRef}>
                {sceneData.objects.interactables.map((element, key) => (

                    <primitive
                        object={element.object}
                        position={element.worldPosition}
                        key={key}
                        onClick={handleInteraction}
                        onPointerEnter={handlePointerEnter}
                        onPointerLeave={handlePointerExit}
                    />
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
