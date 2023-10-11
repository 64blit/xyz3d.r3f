import * as THREE from "three";
import React, { useEffect, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { useSphere } from "@react-three/cannon";
import { Collidable } from "spacesvr";

export function PhysicsCollidable({ obj }) 
{

    // Wrap the object with the physics sphere and render the object inside the sphere.
    return (
        <Collidable
            triLimit={1000}
            enabled={true}
            hideCollisionMeshes={true}>
            <primitive object={obj} />
        </Collidable>
    );
};
