import { useFrame } from "@react-three/fiber";
import React, { useState, useEffect, useRef } from "react";
import { Box3, BoxHelper, Vector3 } from "three";
import { gsap } from "gsap";

export function SceneZone(props) {
  const sceneData = props.object;

  const zoneRef = useRef();
  const boxMeshRef = useRef();
  const cameraViewBoxRef = useRef();

  useFrame(() => {
    if (!props.isDebugging) return;
    if (!zoneRef.current) return;

    const box = new Box3();
    box.setFromObject(zoneRef.current);
    const size = box.getSize(new Vector3());
    boxMeshRef.current.position.copy(box.getCenter(new Vector3()));
    boxMeshRef.current.scale.set(...size);

    const cameraSize = sceneData.camera.target.getSize(new Vector3());
    cameraViewBoxRef.current.position.copy(sceneData.camera.targetPosition);
    cameraViewBoxRef.current.scale.set(...cameraSize);
  });

  const getCallbacks = element => {
    const callbacks = {};

    const mainObj = element.object;
    const type = mainObj.userData?.type;
    const data = mainObj.userData?.interactableData;

    if (mainObj.userData?.type !== "interactable") {
      return;
    }

    callbacks.onClick = event => props.interactionManager.handleInteraction(event, element);

    if (
      (mainObj.userData?.OnPointerEnterAnimations !== undefined && mainObj.userData?.OnPointerEnterAnimations !== null) ||
      mainObj.userData.mediaTrigger === "OnPointerEnter"
    ) {
      callbacks.onPointerEnter = event => {
        props.interactionManager.handlePointerEnter(event, element);
      };
    } else {
      callbacks.onPointerEnter = event => {
        document.body.style.cursor = "pointer";
        gsap.to(event.object.scale, { x: 1.1, y: 1.1, z: 1.1, duration: 0.25, ease: "power1" });
      };
    }

    if (
      (mainObj.userData?.OnPointerExitAnimations !== undefined && mainObj.userData?.OnPointerExitAnimations !== null) ||
      mainObj.userData.mediaTrigger === "OnPointerExit"
    ) {
      callbacks.onPointerLeave = event => {
        props.interactionManager.handlePointerExit(event, element);
      };
    } else {
      callbacks.onPointerLeave = event => {
        document.body.style.cursor = "auto";
        gsap.to(event.object.scale, { x: 1, y: 1, z: 1, duration: 0.5 });
      };
    }

    return callbacks;
  };

  return (
    <>
      <group ref={zoneRef}>
        {sceneData.objects.interactables.map((element, key) => (
          <group key={key} {...getCallbacks(element)}>
            <primitive object={element.object} position={element.worldPosition} scale={element.scale} rotation={element.rotation} />
          </group>
        ))}
      </group>

      <mesh ref={boxMeshRef} visible={props.isDebugging}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial wireframe color='cyan' />
      </mesh>

      <mesh ref={cameraViewBoxRef} visible={props.isDebugging}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial wireframe color='red' />
      </mesh>
    </>
  );
}
