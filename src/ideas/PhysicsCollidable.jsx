import React, { useEffect, useMemo, useRef } from "react";
import { Collidable } from "spacesvr";

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
