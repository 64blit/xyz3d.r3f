import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Physics, RigidBody } from '@react-three/rapier';
import { generateKey } from '../../utils/BaseUtils.js';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function PhysicsObjects(props)
{
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

            // sync animated objects with their physics pairs by copying the animation data
            actions.forEach((action) =>
            {
                if (action !== undefined && action !== null && action.isRunning()) 
                {
                    const currentPosition = obj.position.clone();
                    // Calculate the delta position between the current frame and the previous frame


                    ref.current.setTranslation(currentPosition, true);
                    ref.current.setRotation(obj.quaternion, true);
                    // ref.current.mass = 0;
                    // ref.current.type = 'fixed';
                    // ref.current.isDynamic(false);
                    // ref.current.setGravityScale(0);

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
                    onClick={props.interactionManager.handleInteraction}
                    onPointerEnter={props.interactionManager.handlePointerEnter}
                    onPointerLeave={props.interactionManager.handlePointerExit}
                    userData={userData}
                    ref={rigidBodyRefs[ i ]}
                    includeInvisible={includeInvisible}
                    position={obj.position}
                >
                    <primitive
                        object={obj.clone()}
                        position={[ 0, 0, 0 ]}
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
        <>
            {physicsNodes}
        </>
    );
}
