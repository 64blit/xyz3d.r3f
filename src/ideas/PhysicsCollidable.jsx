import * as THREE from "three";
import React, { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { useSphere } from "@react-three/cannon";
import { Collidable } from "spacesvr";
import { useTrimeshCollision } from "helpers/TrimeshHelper";

export const PhysicsCollidable = React.forwardRef((props, ref) =>
{
    const { obj, invisible } = props;
    // Wrap the object with the physics sphere and render the object inside the sphere.
    return (
        <Collidable
            triLimit={1000}
            enabled={true}
            hideCollisionMeshes={invisible}
            // ref={ref}
            {...props}
        >
            <primitive object={obj}
                position={obj.position}
                rotation={obj.rotation}
                scale={obj.scale}
            />
        </Collidable>
    );
});
