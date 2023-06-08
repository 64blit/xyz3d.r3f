import { Bounds } from '@react-three/drei';
import React, { useRef, useState, useEffect } from 'react';
import { render } from 'react-dom';
import * as THREE from 'three';

export function SceneZone(props)
{
    const sceneManager = props.sceneManager;
    const controlsRef = props.controlsRef;
    const sceneData = props.object;

    const handleInteraction = (event) =>
    {
        const type = event.object.userData.interactableType;
        const data = event.object.userData.interactableData;

        console.log("handleInteraction", event.object.userData);
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
                const sceneZone = sceneManager.getSceneZone(data);
                const position = sceneZone.cameraAnchor.position;
                let target = new THREE.Vector3();
                sceneZone.cameraTarget.getCenter(target);

                controlsRef.current?.setLookAt(...position, ...target, true);
                controlsRef.current?.fitToBox(sceneZone.cameraTarget, true);
                break;

            default:
                console.log("Unknown interactable type", type);
                break;

        }
    }

    return (
        <>
            {sceneData.objects.interactables.map((object, key) =>
            {
                return <primitive object={object} key={key} onClick={handleInteraction} />;
            })}

            {sceneData.objects.backgrounds.map((object, key) =>
            {
                return <primitive object={object} key={key} />;
            })}


        </>
    );

}

