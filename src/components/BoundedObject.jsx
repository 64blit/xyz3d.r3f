import React, { useRef } from 'react';
import { useThree } from 'react-three-fiber';
import * as THREE from 'three';

const BoundedObject = () =>
{
    const objectRef = useRef();
    const obbRef = useRef();

    // Calculate and update the OBB whenever the object changes position or rotation
    const updateOBB = () =>
    {
        const object = objectRef.current;

        const box3 = new THREE.Box3().setFromObject(object);
        const obb = box3.clone().applyMatrix4(object.matrixWorld);

        obbRef.current = obb;
    };

    const { raycaster, camera } = useThree();

    const handleClick = (event) =>
    {
        const mouseCoords = {
            x: (event.clientX / window.innerWidth) * 2 - 1,
            y: -(event.clientY / window.innerHeight) * 2 + 1,
        };

        raycaster.setFromCamera(mouseCoords, camera);

        const intersects = raycaster.intersectsBox(obbRef.current);

        if (intersects)
        {
            // Call the onClick callback or perform desired actions
            console.log('Object clicked!');
        }
    };

    return (
        <primitive ref={objectRef} onClick={handleClick} onUpdate={updateOBB}>
            {/* Your object geometry, material, and other properties */}
        </primitive>
    );
};

export default BoundedObject;
