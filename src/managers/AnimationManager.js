import { Bounds, meshBounds } from "@react-three/drei";
import * as THREE from "three";
export class AnimationManager
{
    constructor(animations, actions)
    {
        this.animations = animations;
        this.actions = actions;
        this.loopingAnimations = [];

        // Function to play animation by name
        this.playAnimation = (name, loopType = THREE.LoopOnce) =>
        {
            const action = this.actions[ name ];
            let promise = null;

            if (action && !action.isRunning())
            {
                action.setLoop(loopType);
                action.clampWhenFinished = true;
                action.reset();
                action.play();

                promise = new Promise(resolve =>
                {
                    return setTimeout(() =>
                    {
                        resolve()
                    }, action._clip.duration * 1000)
                })

            }
            return promise;
        }
    }

    // Function to play loop animations
    playLoopingAnimations()
    {
        this.loopingAnimations.forEach((animation) =>
        {
            console.log("Playing animation: " + animation)
            this.playAnimation(animation, THREE.LoopRepeat);
        });
    }

    // Function to stop animation by name
    getLoopingAnimations()
    {
        return this.loopingAnimations;
    }

    // Function to get all actions which are bound to the given object
    getBoundedActions(object)
    {
        const actions = [];

        const keys = Object.keys(this.actions);
        for (let index = 0; index < keys.length; index++)
        {
            const elementKey = keys[ index ];
            const element = this.actions[ elementKey ];

            if (element && element._propertyBindings && element._propertyBindings[ 0 ] && element._propertyBindings[ 0 ].binding && element._propertyBindings[ 0 ].binding.node && element._propertyBindings[ 0 ].binding.node.name === object.name)
            {
                actions.push(element);
            }
        }

        return actions;
    }

    // Extract animation data from user data
    parseAnimations(object)
    {
        if ('LoopingAnimations' in object.userData)
        {
            let loopingAnimations = object.userData.LoopingAnimations;

            if (typeof loopingAnimations === 'string')
            {
                loopingAnimations = loopingAnimations.replace(/\s/g, '').split(',');
            } else
            {
                loopingAnimations = object.userData.LoopingAnimations;
            }

            this.loopingAnimations.push(...loopingAnimations);

            object.userData.LoopingAnimations = loopingAnimations;
        }

        const extractAnimations = (userDataKey, objectUserData) =>
        {
            if (userDataKey in objectUserData)
            {
                let animations = objectUserData[ userDataKey ];


                if (typeof animations === 'string')
                {
                    animations = animations.replace(/\s/g, '').split(',');
                }


                objectUserData[ userDataKey ] = animations;
                if (!('zone' in objectUserData))
                {
                    //  Adds a special animations zone to the objectUserData if it doesn't exist
                    objectUserData[ "zone" ] = "_default_animations_zone";
                }

                objectUserData[ "type" ] = "interactable";

                //  Adds the same animations to any children of the object
                const userDataCopy = Object.assign({}, object.userData);

                object.traverse((node) =>
                {
                    node.userData = userDataCopy;
                });

            }


        };

        extractAnimations('OnPointerEnterAnimations', object.userData);
        extractAnimations('OnPointerExitAnimations', object.userData);
        extractAnimations('OnSelectAnimations', object.userData);
    }

    // Update target object's for animations
    cloneAnimations(object, animation)
    {
        const animationClone = animation.clone();
        animationClone.setLoop(THREE.LoopOnce);
        animationClone.clampWhenFinished = true;
        object.userData.animationClones.push(animationClone);
    }

}
