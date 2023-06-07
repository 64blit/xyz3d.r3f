import { Bounds } from '@react-three/drei';
import React, { useRef, useState, useEffect } from 'react';
import { render } from 'react-dom';

export function SceneZone(props)
{
    const sceneManager = props.sceneManager;
    const controlsRef = props.controlsRef;
    const sceneData = props.object;


    const handleInteraction = (event) =>
    {

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

