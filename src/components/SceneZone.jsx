import { Box, useHelper } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import React, { useState, useEffect, useRef } from 'react';
import { Interactable, Video } from 'spacesvr';
import { Box3, BoxHelper, Vector3 } from 'three';

export function SceneZone(props)
{
    const sceneData = props.object;

    const [ hovered, setHovered ] = useState(false);

    const zoneRef = useRef(null);

    const { gl } = useThree();

    useEffect(() =>
    {
        document.body.style.cursor = hovered ? "pointer" : "auto";

    }, [ hovered ])


    const handleInteraction = (event) =>
    {
        const type = event.object.userData.interactableType;
        const data = event.object.userData.interactableData;

        playSelectAnimation(event.object);

        switch (type)
        {

            case "Popup HTML":
                props.setShowPopup(true);
                props.setPopupContent(data);

                gl.domElement.ownerDocument.exitPointerLock();

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
                    <Interactable
                        onClick={handleInteraction}
                        onHovered={handlePointerEnter}
                        onUnHovered={handlePointerExit}
                        key={key}
                    >
                        <primitive
                            object={element.object}
                            position={element.worldPosition}
                            scale={element.scale}
                            rotation={element.rotation}
                        />

                    </Interactable>
                ))}


                {sceneData.objects.videos.map((element, key) => (
                    <mesh
                        object={element.object}
                        key={key}
                        scale={element.object.scale}
                        position={element.worldPosition}
                        size={1}
                    >
                        <Video
                            src={element.src}
                            framed
                        >
                        </Video>
                    </mesh>
                ))}



            </group>
        </>
    );
}
