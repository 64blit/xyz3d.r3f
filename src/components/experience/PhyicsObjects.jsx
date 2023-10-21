import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Physics, RigidBody } from '@react-three/rapier';
import { generateKey } from '../../utils/BaseUtils.js';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function PhysicsObjects(props)
{
    const [ hovered, setHovered ] = useState(false);
    const [ physicsNodes, setPhysicsNodes ] = useState(null);

    const rigidBodyRefs = props.sceneManager.getPhysicsObjects().map(() => useRef());

    // per frame we copy animation data from the source object to the physics object
    useFrame(() =>
    {
        rigidBodyRefs.forEach((ref) =>
        {

            if (ref == null || ref.current === null || ref.current === undefined) return;

            const { obj, actions } = ref.current?.userData;

            if (obj === undefined || obj === null) return;
            if (actions === undefined || actions === null || actions.length <= 0) return;

            actions.forEach((action) =>
            {
                if (action)
                {
                    ref.current.setTranslation(obj.position, true);
                    ref.current.setRotation(obj.quaternion, true);
                }
            });

        });
    });

    // setup tje physics nodes on component mount
    useEffect(() =>
    {
        if (props.sceneManager === null || props.sceneManager === undefined)
        {
            return;
        }

        const physicsObjects = props.sceneManager.getPhysicsObjects();
        const physicsReactNodes = getPhyicsNodes(physicsObjects);
        setPhysicsNodes(physicsReactNodes);

        // loop over rigidBodyRefs and remove all elements which are null
        for (let i = 0; i < rigidBodyRefs.length; i++)
        {
            const ref = rigidBodyRefs[ i ];
            if (ref === null)
            {
                rigidBodyRefs.splice(i, 1);
                i--;
            }
        }

    }, [ props.sceneManager ]);


    // Get all actions on the object so that we can mimic the action movement on the physics object
    const getActions = (obj) =>
    {

        if (obj.userData?.OnSelectAnimations
            || obj.userData?.OnPointerEnterAnimations
            || obj.userData?.OnPointerExitAnimations
            || obj.userData?.LoopingAnimations
        )
        {

            const oldActionNames = [
                ...(obj.userData.OnSelectAnimations || []),
                ...(obj.userData.OnPointerEnterAnimations || []),
                ...(obj.userData.OnPointerExitAnimations || []),
                ...(obj.userData.LoopingAnimations || []),
            ];

            const actions = [];

            for (let i = 0; i < oldActionNames.length; i++)
            {
                const element = oldActionNames[ i ];

                let action = props.sceneManager.getAnimationAction(element);

                if (action)
                {
                    actions.push(action);
                }
            }

            return actions;

        }

        return null;
    };

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
                props.playAnimation(actionName);
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


    const getPhyicsNodes = (physicsObjects) =>
    {
        let physicsNodes = [];


        if (physicsObjects.length <= 0)
        {
            return null;
        }

        let includeInvisible = false;

        //  add a child node to the physics node parent
        //  for each physics object in the scene

        for (let i = 0; i < physicsObjects.length; i++)
        {
            const obj = physicsObjects[ i ];

            let node = null;

            const dynamicMass = parseInt(obj.userData[ "Dynamic" ]) || 0;
            const isStatic = obj.userData[ "Static" ] === "true";
            const invisible = obj.userData[ "Invisible" ] === "true";

            // if any object is invisible, make sure it's still considered in the physics simulation
            includeInvisible = includeInvisible || invisible;

            obj.visible = false;
            const actions = getActions(obj);
            let userData = { obj, actions };

            if (actions === null || actions.length <= 0)
            {
                rigidBodyRefs[ i ] = null;
                userData = {};
            }

            node =
                <RigidBody
                    key={generateKey("rb_" + obj.name)}
                    type={dynamicMass > 0 ? "dynamic" : "fixed"}
                    mass={dynamicMass}
                    onClick={handleInteraction}
                    onPointerEnter={handlePointerEnter}
                    onPointerLeave={handlePointerExit}
                    userData={userData}
                    ref={rigidBodyRefs[ i ]}
                >
                    <primitive
                        object={obj.clone()}
                        visible={!invisible}
                    />

                </RigidBody>;


            if (dynamicMass > 0 || isStatic)
            {
                physicsNodes.push(node);
            }

        }

        return (
            <Physics debug={props.isDebugging} gravity={[ 0, -9.81, 0 ]} includeInvisible={includeInvisible}>
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
