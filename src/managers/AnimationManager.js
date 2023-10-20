import { Bounds, meshBounds } from "@react-three/drei";
import { Box3, Vector3, Quaternion } from "three";

// Define a class called SceneManager
export class AnimationManager
{
    constructor(animations, actions)
    {
        this.animations = animations;
        this.actions = actions;
        this.loopingAnimations = [];
    }

    // Function to play animation by name
    playAnimation(name, loopType = THREE.LoopOnce)
    {
        const action = this.actions[ name ];

        if (action && !action.isRunning())
        {
            action.setLoop(loopType);
            action.clampWhenFinished = true;
            action.reset();
            action.play();
        }
    }

    // Function to stop animation by name
    getLoopingAnimations()
    {
        return this.loopingAnimations;
    }

    playLoopingAnimations()
    {
        this.loopingAnimations.forEach((animation) =>
        {
            this.playAnimation(animation, THREE.LoopRepeat);
        });
    }

    // Extract animation data from user data
    extractAnimationsFromUserData(object)
    {
        if ('LoopingAnimations' in object.userData)
        {
            const loopingAnimations = object.userData.LoopingAnimations.replace(/\s/g, '').split(',');
            this.loopingAnimations.push(...loopingAnimations);
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
