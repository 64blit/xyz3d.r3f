import * as THREE from "three";
import React, { useEffect, useRef, useState } from "react";
import { useSphere } from "@react-three/cannon";

export const PhysicsBall = React.forwardRef((props, ref) =>
{
    const { obj, mass, invisible } = props;
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
        widthSegments: 12,
        heightSegments: 8,
        position: obj.position,
        rotation: obj.rotation.clone(),
        linearDamping: 0.9,
        angularDamping: 0.1,
        args: [ boundingSphere.radius * Math.max(...obj.scale) ],
    }));

    ref = ballRef;

    useEffect(() =>
    {
        // Set the sphere's position to match the object's position.
        api.position.copy(obj.position);
        api.rotation.copy(obj.rotation.clone());

    }, [ obj.position, api.position ]);

    // Wrap the object with the physics sphere and render the object inside the sphere.
    return (
        <primitive
            object={obj}
            scale={obj.scale}
            rotation={obj.rotation}
            ref={ballRef}
            visible={!invisible}
            {...props} />
    );
});
