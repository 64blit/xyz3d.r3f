import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Physics, RigidBody } from '@react-three/rapier';
import { generateKey } from '../../utils/BaseUtils.js';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function PhysicsObjects(props)
{
    const [ hovered, setHovered ] = useState(false);
    const [ physicsNodes, setPhysicsNodes ] = useState(null);
    const [ physicsMixers, setPhysicsMixers ] = useState([]);

    const rigidBodyRefs = props.sceneManager.getPhysicsObjects().map(() => useRef())


    const { scene } = useThree();

    useFrame((state, delta) =>
    {
        if (physicsMixers.length <= 0)
        {
            return;
        }

        physicsMixers.forEach((mixer) =>
        {
            mixer.update(delta);
        });

    });

    useEffect(() =>
    {
        if (props.sceneManager === null || props.sceneManager === undefined)
        {
            return;
        }

        const physicsObjects = props.sceneManager.getPhysicsObjects();
        setPhysicsNodes(getPhyicsNodes(physicsObjects))
    }, [ props.sceneManager ]);

    useEffect(() =>
    {
        if (physicsNodes === null || physicsNodes === undefined)
        {
            return;
        }

        setupMixers(rigidBodyRefs);
    }, [ physicsNodes ]);

    const setupMixers = (nodes) =>
    {

        const mixers = [];

        for (let i = 0; i < nodes.length; i++)
        {
            const obj = nodes[ i ].current;

            // if OnSelectAnimation is in object userData then log it and the props.sceneManager
            // will play the animation when the object is clicked
            if (obj.userData?.OnSelectAnimations || obj.userData?.OnPointerEnterAnimations || obj.userData?.OnPointerExitAnimations || obj.userData?.LoopingAnimations)
            {
                const oldActionNames = [
                    ...(obj.userData.OnSelectAnimations || []),
                    ...(obj.userData.OnPointerEnterAnimations || []),
                    ...(obj.userData.OnPointerExitAnimations || []),
                    ...(obj.userData.LoopingAnimations || []),
                ];

                obj.parent = obj.clone();
                console.log("asdasdads", obj.parent, obj.type, obj.name, obj.parent.type, obj.parent.name);

                const newMixer = new THREE.AnimationMixer(obj.parent);

                for (let i = 0; i < oldActionNames.length; i++)
                {
                    const element = oldActionNames[ i ];
                    let action = props.sceneManager.getAnimationAction(element);

                    console.log((action._propertyBindings));

                    action._propertyBindings.forEach((binding) =>
                    {

                        binding.rootNode = obj.parent;
                    });

                    const newAction = newMixer.clipAction(action._clip);

                    action = newAction;

                }

                mixers.push(newMixer);

            }
        }

        setPhysicsMixers(mixers);

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
            const collides = obj.userData[ "Static" ] === "true";
            const invisible = obj.userData[ "Invisible" ] === "true";

            // if any object is invisible, make sure it's still considered in the physics simulation
            includeInvisible = includeInvisible || invisible;

            node =
                <RigidBody
                    key={generateKey("rb_" + obj.name)}
                    type={dynamicMass > 0 ? "dynamic" : "fixed"}
                    mass={dynamicMass}
                    onClick={handleInteraction}
                    onPointerEnter={handlePointerEnter}
                    onPointerLeave={handlePointerExit}
                    userData={obj}
                >
                    <primitive object={obj} visible={!invisible}
                        ref={rigidBodyRefs[ i ]}
                    />

                </RigidBody>;


            if (dynamicMass > 0 || collides)
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
