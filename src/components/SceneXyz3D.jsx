
import React, { useRef, useState, useEffect, Suspense } from 'react';
import { useGLTF } from "@react-three/drei";

import { SceneManager } from '../managers/SceneManager.js';
import { ProgressLoader } from './ProgressLoader.jsx';
import { Controls } from './Controls.jsx';
import { SceneZone } from './SceneZone.jsx';

export function SceneXyz3D(props)
{
    const [ sceneManager, setSceneManager ] = useState(null);

    const controlsRef = null;

    const gltf = useGLTF(props.path);
    const scene = gltf.scene;

    useEffect(() =>
    {
        const sceneManager = new SceneManager(scene);
        setSceneManager(sceneManager);

    }, [ scene ]);



    return (
        <>

            <Controls ref={controlsRef} />

            <Suspense fallback={<ProgressLoader />}>
                <primitive object={scene}>
                    {sceneManager?.getSceneZones().map((object, key) => (

                        <SceneZone
                            controlsRef={controlsRef}
                            sceneManager={sceneManager}
                            object={object}
                            key={key}
                        />
                    ))}
                </primitive>

                {props.children}
            </Suspense>

        </>
    );
}
