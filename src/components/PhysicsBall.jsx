import * as THREE from "three";
import React, { useEffect, useRef, useState } from "react";
import { useSphere } from "@react-three/cannon";

export function PhysicsBall({ obj, mass, invisible }) 
{
    const boundingSphere = new THREE.Sphere();
    obj.traverse((child) =>
    {
        if (child.isMesh)
        {
            child.geometry.computeBoundingSphere();
            boundingSphere.union(child.geometry.boundingSphere);
        }
    });

    const [ ballRef, api ] = useSphere(() => ({
        mass: mass,
        position: obj.position,
        linearDamping: 0.9,
        angularDamping: 0.1,
        args: [ boundingSphere.radius / 2 ]
    }));

    useEffect(() =>
    {
        // Set the sphere's position to match the object's position.
        api.position.copy(obj.position);

    }, [ obj.position, api.position ]);

    // Wrap the object with the physics sphere and render the object inside the sphere.
    return (
        <primitive object={obj} scale={obj.scale} rotation={obj.rotation} ref={ballRef} visible={!invisible} />
    );
};
