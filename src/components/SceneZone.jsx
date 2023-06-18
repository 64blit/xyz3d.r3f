import { Scroll, ScrollControls, useScroll } from '@react-three/drei';
import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

export function SceneZone(props)
{
    const sceneData = props.object;

    const [ hovered, setHovered ] = useState(false);

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
                props.onDisplayPopup(true);
                props.setPopupContent(data);
                break;

            case "Open Link":
                window.open(data, "_blank");
                break;

            case "Go To Scene Zone":
                props.goToSceneZone(data);
                break;

            default:
                console.log("Unknown interactable type", type);
                break;

        }
    }

    // on hover callback for playing any hover animations found inside the userData varaiable under hoverAnimations
    const handleHoverOver = (event) =>
    {
        setHovered(true);
        const onHoverAnimations = event.object.userData.onHoverAnimations;
        if (onHoverAnimations != null)
        {
            onHoverAnimations.forEach((actionName) =>
            {
                props.playAnimation(actionName);
            });
        }
    }
    const handleHoverOff = (event) =>
    {
        setHovered(false);
    }

    const playSelectAnimation = (object) =>
    {
        const onClickAnimations = object.userData.onClickAnimations;
        if (onClickAnimations != null)
        {
            onClickAnimations.forEach((actionName) =>
            {
                props.playAnimation(actionName);
            });
        }
    }


    return (
        <>
            {sceneData.objects.interactables.map((object, key) =>
            {
                return <primitive
                    object={object}
                    key={key}
                    onClick={handleInteraction}
                    onPointerOver={handleHoverOver}
                    onPointerOut={handleHoverOff} />;
            })}

            {sceneData.objects.backgrounds.map((object, key) =>
            {
                return <primitive object={object} key={key} />;
            })}
        </ >
    );

}

