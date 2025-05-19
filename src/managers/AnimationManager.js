import { Bounds, meshBounds } from '@react-three/drei'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export class AnimationManager {
  constructor(animations, actions) {
    this.animations = animations
    this.actions = actions
    this.loopingAnimations = []
    this.scrollTriggers = []

    // Function to play animation by name
    this.playAnimation = (name, loopType = THREE.LoopOnce) => {
      const action = this.actions[name]
      let promise = null

      if (action && !action.isRunning()) {
        action.setLoop(loopType)
        action.clampWhenFinished = true
        action.reset()
        action.play()

        promise = new Promise(resolve => {
          return setTimeout(() => {
            resolve()
          }, action._clip.duration * 1000)
        })
      }
      return promise
    }
  }

  // Function to play loop animations
  playLoopingAnimations() {
    this.loopingAnimations.forEach(animation => {
      console.log('Playing animation: ' + animation)
      this.playAnimation(animation, THREE.LoopRepeat)
    })
  }

  // Function to get all actions which are bound to the given object
  getBoundedActions(object) {
    const actions = []

    const keys = Object.keys(this.actions)
    for (let index = 0; index < keys.length; index++) {
      const elementKey = keys[index]
      const element = this.actions[elementKey]

      if (
        element &&
        element._propertyBindings &&
        element._propertyBindings[0] &&
        element._propertyBindings[0].binding &&
        element._propertyBindings[0].binding.node &&
        element._propertyBindings[0].binding.node.name === object.name
      ) {
        actions.push(element)
      }
    }

    return actions
  }

  // Function to stop animation by name
  getLoopingAnimations() {
    return this.loopingAnimations
  }

  // Extract animation data from user data
  parseAnimations(object) {
    if ('LoopingAnimations' in object.userData) {
      let loopingAnimations = object.userData.LoopingAnimations

      if (typeof loopingAnimations === 'string') {
        loopingAnimations = loopingAnimations.replace(/\s/g, '').split(',')
      } else {
        loopingAnimations = object.userData.LoopingAnimations
      }

      this.loopingAnimations.push(...loopingAnimations)

      object.userData.LoopingAnimations = loopingAnimations
    }

    const extractAnimations = (userDataKey, objectUserData) => {
      if (userDataKey in objectUserData) {
        let animations = objectUserData[userDataKey]

        if (typeof animations === 'string') {
          animations = animations.replace(/\s/g, '').split(',')
        }

        objectUserData[userDataKey] = animations
        if (!('zone' in objectUserData)) {
          //  Adds a special animations zone to the objectUserData if it doesn't exist
          objectUserData['zone'] = '_default_animations_zone'
        }

        objectUserData['type'] = 'interactable'

        //  Adds the same animations to any children of the object
        const userDataCopy = Object.assign({}, object.userData)

        object.traverse(node => {
          node.userData = userDataCopy
        })
      }
    }

    extractAnimations('OnPointerEnterAnimations', object.userData)
    extractAnimations('OnPointerExitAnimations', object.userData)
    extractAnimations('OnSelectAnimations', object.userData)
    
    // Add support for scroll-triggered animations
    extractAnimations('OnScrollEnterAnimations', object.userData)
    extractAnimations('OnScrollExitAnimations', object.userData)
  }

  // Update target object's for animations
  cloneAnimations(object, animation) {
    const animationClone = animation.clone()
    animationClone.setLoop(THREE.LoopOnce)
    animationClone.clampWhenFinished = true
    object.userData.animationClones.push(animationClone)
  }
  
  // Set up ScrollTrigger for animations
  setupScrollTriggers(scroll, sceneManager) {
    this.scrollTriggers.forEach(trigger => trigger.kill());
    this.scrollTriggers = [];
    
    // Get all objects with scroll animations
    const objectsWithScrollAnimations = [];
    sceneManager.scene.traverse(node => {
      if (node.userData && (node.userData.OnScrollEnterAnimations || node.userData.OnScrollExitAnimations)) {
        objectsWithScrollAnimations.push(node);
      }
    });
    
    objectsWithScrollAnimations.forEach(object => {
      const zone = sceneManager.getSceneZone(object.userData.zone);
      if (!zone) return;
      
      const progress = zone.index / (sceneManager.waypoints.length - 1);
      
      const trigger = ScrollTrigger.create({
        trigger: scroll.el,
        start: `top+=${progress * 100 - 5}% top`,
        end: `top+=${progress * 100 + 5}% top`,
        onEnter: () => {
          if (object.userData.OnScrollEnterAnimations) {
            object.userData.OnScrollEnterAnimations.forEach(anim => {
              this.playAnimation(anim);
            });
          }
        },
        onLeave: () => {
          if (object.userData.OnScrollExitAnimations) {
            object.userData.OnScrollExitAnimations.forEach(anim => {
              this.playAnimation(anim);
            });
          }
        }
      });
      
      this.scrollTriggers.push(trigger);
    });
  }
}
