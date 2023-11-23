import React, { useState, useEffect, useMemo, useRef } from 'react';
import { generateKey } from "../utils/BaseUtils.js"
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PhysicsCollidable } from './PhysicsCollidable.jsx';
import { PhysicsBall } from './PhysicsBall.jsx';
import { Debug } from '@react-three/cannon';

export const PhysicsObjects = ({ sceneManager, interactionManager, isDebugging = false }) =>
{
    const [ physicsNodes, setPhysicsNodes ] = useState(null);

    // Create a ref for each physics object so that we can copy the animation data to the physics object
    const pobjs = sceneManager.getPhysicsObjects();
    const rigidBodyRefs = pobjs.map(() => useRef());

    // setup tje physics nodes on component mount
    useEffect(() =>
    {
        if (!sceneManager) return;
        if (!rigidBodyRefs) return;

        const physicsReactNodes = getPhyicsNodes(pobjs);
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

    }, [ sceneManager ]);


    // per frame we copy animation data from the source object to the physics object
    useFrame(() =>
    {
        if (!rigidBodyRefs) return;

        rigidBodyRefs.forEach((ref) =>
        {

            if (ref == null || ref.current === null || ref.current === undefined) return;

            const { obj, actions } = ref.current?.userData;

            if (obj === undefined || obj === null) return;
            if (actions === undefined || actions === null || actions.length <= 0) return;

            // sync animated objects with their physics pairs by copying the animation data
            actions.forEach((action) =>
            {
                if (action !== undefined && action !== null && action.isRunning()) 
                {
                    console.log(ref.current);
                    // ref.current.setTranslation(obj.position, true);
                    // ref.current.setRotation(obj.quaternion, true);
                }
            });

        });
    });

    // Get all actions on the object so that we can mimic the action movement on the physics object
    const getActions = (obj) =>
    {
        const boundActions = sceneManager.getBoundedActions(obj);

        if (obj.userData?.OnSelectAnimations
            || obj.userData?.OnPointerEnterAnimations
            || obj.userData?.OnPointerExitAnimations
            || obj.userData?.LoopingAnimations
            || boundActions.length > 0
        )
        {

            const oldActionNames = [
                ...(obj.userData.OnSelectAnimations || []),
                ...(obj.userData.OnPointerEnterAnimations || []),
                ...(obj.userData.OnPointerExitAnimations || []),
                ...(obj.userData.LoopingAnimations || []),
            ];

            const actions = [];
            actions.push(...boundActions);


            for (let i = 0; i < oldActionNames.length; i++)
            {
                const element = oldActionNames[ i ];

                let action = sceneManager.getAnimationAction(element);

                if (action)
                {
                    actions.push(action);
                }
            }

            return actions;

        }

        return null;
    };

    const getCallbacks = (obj) =>
    {
        const callbacks = {};
        const objCopy = Object.assign({}, obj);

        if (obj.userData?.OnSelectAnimations || obj.userData?.mediaTrigger === "OnSelect")
        {
            callbacks.onClick = (event) =>
            {
                event.object = objCopy;
                interactionManager.handleInteraction(event);
            };
        }

        if (obj.userData?.OnPointerEnterAnimations || obj.userData?.mediaTrigger === "OnPointerEnter")
        {
            callbacks.onPointerEnter = (event) =>
            {
                event.object = objCopy;
                interactionManager.handlePointerEnter(event);
            };
        }

        if (obj.userData?.OnPointerExitAnimations || obj.userData?.mediaTrigger === "OnPointerExit")
        {
            callbacks.onPointerLeave = (event) =>
            {
                event.object = objCopy;
                interactionManager.handlePointerExit(event);
            };
        }

        return callbacks;
    }


    const getPhyicsNodes = (physObjs) =>
    {
        let nodes = [];

        if (physObjs.length <= 0)
        {
            return null;
        }

        //  add a child node to the physics node parent
        //  for each physics object in the scene

        for (let i = 0; i < physObjs.length; i++)
        {
            const obj = physObjs[ i ];

            let node = null;

            const dynamicMass = parseInt(obj.userData[ "Dynamic" ]) || 0;
            const isStatic = obj.userData[ "Static" ] === "true";
            const invisible = obj.userData[ "Invisible" ] === "true";

            obj.visible = false;
            const actions = getActions(obj);
            let userData = { obj, actions };

            if (actions === null || actions.length <= 0)
            {
                rigidBodyRefs[ i ] = null;
                userData = {};
            }

            const callbacks = getCallbacks(obj);
            const key = generateKey("rb_" + obj.name);

            if (isStatic)
            {
                node =
                    <PhysicsCollidable
                        obj={obj}
                        key={key}
                        invisible={invisible}
                        userData={userData}
                        ref={rigidBodyRefs[ i ]}
                        {...callbacks}
                    />;
            }
            else if (dynamicMass >= 0)
            {
                node =
                    <PhysicsBall
                        obj={obj}
                        key={key}
                        mass={dynamicMass}
                        invisible={invisible}
                        userData={userData}
                        ref={rigidBodyRefs[ i ]}
                        {...callbacks}
                    />;
            }

            if (dynamicMass >= 0 || isStatic)
            {
                nodes.push(node);
            }

        }

        console.log("physics nodes", nodes.length, nodes)
        return (<>{nodes}</>);
    }
    return (
        <>
            {isDebugging ? (
                <>
                    <Debug color="black" scale={1.01}>
                        {physicsNodes}
                    </Debug>
                </>
            ) : (
                <>
                    {physicsNodes}
                </>
            )}
        </>
    )
}
