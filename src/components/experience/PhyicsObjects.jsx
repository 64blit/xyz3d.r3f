import React, { useState, useEffect } from 'react';
import { Physics, RigidBody } from '@react-three/rapier';
import { generateKey } from '../../utils/BaseUtils.js';

export function PhysicsObjects({ sceneManager, isDebugging, playAnimation })
{
    const [ hovered, setHovered ] = useState(false);
    const [ physicsNodes, setPhysicsNodes ] = useState(null);

    React.useEffect(() =>
    {
        if (sceneManager === null || sceneManager === undefined)
        {
            return;
        }

        setPhysicsNodes(getPhyicsNodes())
    }, [ sceneManager ]);

    useEffect(() =>
    {
        document.body.style.cursor = hovered ? "pointer" : "auto";

    }, [ hovered ])


    const playSelectAnimation = (object) =>
    {
        const actions = object.userData.OnSelectAnimations || null;

        if (actions != null)
        {
            actions.forEach((actionName) =>
            {
                playAnimation(actionName);
            });
        }
    }

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


    const getPhyicsNodes = () =>
    {
        let physicsNodes = [];

        const physicsObjects = sceneManager.getPhysicsObjects();

        if (physicsObjects.length <= 0)
        {
            return null;
        }

        let includeInvisible = false;
        //  add a child node to the physics node parent
        //  for each physics object in the scene
        physicsObjects.forEach((obj) =>
        {
            let node = null;

            const dynamicMass = parseInt(obj.userData[ "Dynamic" ]) || 0;
            const collides = obj.userData[ "Static" ] === "true";
            const invisible = obj.userData[ "Invisible" ] === "true";

            // if any object is invisible, make sure it's still considered in the physics simulation
            includeInvisible = includeInvisible || invisible;

            node =
                <RigidBody
                    type={dynamicMass > 0 ? "dynamic" : "fixed"}
                    mass={dynamicMass}
                    key={generateKey("rb_" + obj.name)}
                    uuid={obj.uuid}
                    onClick={handleInteraction}
                    onPointerEnter={handlePointerEnter}
                    onPointerLeave={handlePointerExit}>

                    <primitive object={obj} visible={!invisible} />

                </RigidBody>;

            if (dynamicMass > 0 || collides)
            {
                physicsNodes.push(node);
            }

        });

        return (
            <Physics debug={isDebugging} gravity={[ 0, -9.81, 0 ]} includeInvisible={includeInvisible}>
                {physicsNodes}
            </Physics>
        );
    }


    return (
        <group>
            {physicsNodes}
        </group>
    );
}
