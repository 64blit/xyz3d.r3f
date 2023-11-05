import CameraControls from 'camera-controls'
import React, { useEffect, useRef } from 'react'
import { extend, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three';

CameraControls.install({ THREE })
extend({ CameraControls })

export function Controls(props)
{
    const ref = props.innerRef;
    const camera = useThree((state) => state.camera);
    const gl = useThree((state) => state.gl);
    useFrame((state, delta) =>
    {
        ref.current.update(delta);
    });

    useEffect(() =>
    {
        const controls = ref.current;
        controls.azimuthRotateSpeed = .25;
        controls.polarRotateSpeed = .25;
        controls.truckSpeed = 1;
        controls.dollySpeed = 1;

    }, [ ref?.current ]);

    return (
        <cameraControls ref={ref} args={[ camera, gl.domElement ]} {...props} />
    )
}
