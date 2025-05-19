import React, { useRef, useState, useEffect, useMemo } from 'react'
import { ScrollControls, useAnimations, useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { SceneManager } from '../../managers/SceneManager.js'
import { Controls } from '../logic/Controls.jsx'
import { SceneZone } from './SceneZone.jsx'
import { ScrollWrapper } from '../helpers/ScrollWrapper.jsx'
import { PhysicsObjects } from '../logic/PhyicsObjects.jsx'
import { InteractionManager } from '../../managers/InteractionManager.js'
import { CameraManager } from '../../managers/CameraManager.js'
import { IntersectionManager } from '../../managers/IntersectionManager.js'
import { Video } from '../logic/Video'
import { generateKey } from '../../utils/BaseUtils.js'
import { Media } from '../logic/Media.jsx'
import useStore from '../../store'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const SceneXyz3D = props => {
  const { camera } = useThree()
  const { scene, animations } = useGLTF(props.path)
  const { mixer, actions } = useAnimations(animations, scene)

  const controlsRef = useRef(null)
  
  const setSceneZones = useStore(state => state.setSceneZones)
  const setWaypoints = useStore(state => state.setWaypoints)
  const setScrollProgress = useStore(state => state.setScrollProgress)
  const scrollProgress = useStore(state => state.scrollProgress)
  const isDebugging = useStore(state => state.isDebugging)
  
  const sceneManagerRef = useRef(null)
  const cameraManagerRef = useRef(null)
  const interactionManagerRef = useRef(null)
  const intersectionManagerRef = useRef(null)

  const initializeManagers = scroll => {
    if (sceneManagerRef.current) {
      cameraManagerRef.current.scroll = scroll
      return
    }

    const tempSceneManager = new SceneManager(scene, controlsRef.current, animations, actions, mixer)
    sceneManagerRef.current = tempSceneManager
    
    const tempCameraManager = new CameraManager(tempSceneManager, controlsRef.current, camera, scroll)
    cameraManagerRef.current = tempCameraManager

    const tempInteractionManager = new InteractionManager(
      props.setShowPopup,
      props.setPopupContent,
      tempCameraManager.goToSceneZoneByName,
      tempSceneManager.playAnimation,
      tempSceneManager.playSound
    )
    interactionManagerRef.current = tempInteractionManager
    
    // Initialize IntersectionManager
    const tempIntersectionManager = new IntersectionManager(
      camera,
      scene,
      tempSceneManager.playAnimation
    )
    intersectionManagerRef.current = tempIntersectionManager
    
    const allAnimations = [];
    scene.traverse(node => {
      if (node.userData) {
        ['OnPointerEnterAnimations', 'OnPointerExitAnimations', 'OnSelectAnimations', 'LoopingAnimations'].forEach(key => {
          if (node.userData[key]) {
            if (Array.isArray(node.userData[key])) {
              allAnimations.push(...node.userData[key]);
            } else if (typeof node.userData[key] === 'string') {
              allAnimations.push(node.userData[key]);
            }
          }
        });
      }
    });
    
    const uniqueAnimations = [...new Set(allAnimations)];
    tempIntersectionManager.createTriggerMeshesInFrontOfCamera(uniqueAnimations);
    
    setSceneZones(tempSceneManager.getSceneZones())
    setWaypoints(tempSceneManager.waypoints)
    
    const siteData = tempSceneManager.getSiteData()

    props.setXyzAPI({
      goToSceneZoneByIndex: tempCameraManager.goToSceneZoneByIndex,
      goToSceneZoneByName: tempCameraManager.goToSceneZoneByName,
      getSceneManager: () => tempSceneManager,
      getCameraManager: () => tempCameraManager,
      getInteractionManager: () => tempInteractionManager,
      getIntersectionManager: () => tempIntersectionManager,
      getSiteData: () => siteData,
    })
    
    setupScrollTrigger(scroll);
  }
  
  const setupScrollTrigger = (scroll) => {
    sceneManagerRef.current.getSceneZones().forEach((zone, index) => {
      if (!zone.camera.targetPosition) return;
      
      const progress = index / (sceneManagerRef.current.waypoints.length - 1);
      
      ScrollTrigger.create({
        trigger: scroll.el,
        start: `top+=${progress * 100}% top`,
        end: `top+=${progress * 100 + 10}% top`,
        onEnter: () => {
          console.log(`Entered zone ${zone.name}`);
          if (zone.objects.list.length > 0) {
            zone.objects.list.forEach(obj => {
              if (obj.userData.OnScrollEnterAnimations) {
                obj.userData.OnScrollEnterAnimations.forEach(anim => {
                  sceneManagerRef.current.playAnimation(anim);
                });
              }
            });
          }
        },
        onLeave: () => {
          console.log(`Left zone ${zone.name}`);
        }
      });
    });
  };

  // UseFrame hook for animations and intersections
  useFrame(() => {
    if (!cameraManagerRef.current) return;
    cameraManagerRef.current.update();
    
    if (intersectionManagerRef.current) {
      intersectionManagerRef.current.update();
    }
  })

  return (
    <>
      <ScrollControls enabled={true} pages={sceneManagerRef.current?.waypoints.length - 1 || 1}>
        <Controls innerRef={controlsRef} />

        <ScrollWrapper onReady={initializeManagers}>
          <primitive recieveShadows castShadows object={scene}>
            {controlsRef.current &&
              sceneManagerRef.current &&
              sceneManagerRef.current
                .getSceneZones()
                .map((object, key) => (
                  <SceneZone 
                    interactionManager={interactionManagerRef.current} 
                    isDebugging={isDebugging} 
                    object={object} 
                    key={key} 
                  />
                ))}
          </primitive>

          {sceneManagerRef.current && (
            <PhysicsObjects
              debug={isDebugging}
              sceneManager={sceneManagerRef.current}
              interactionManager={interactionManagerRef.current}
              isDebugging={isDebugging}
            />
          )}

          <Media 
            sceneManager={sceneManagerRef.current} 
            interactionManager={interactionManagerRef.current} 
          />

          {props.children}
        </ScrollWrapper>
      </ScrollControls>
    </>
  )
}
