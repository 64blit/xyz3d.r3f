import React, { useEffect, useRef, useState } from 'react';

import { Audio3D } from './Audio3D.tsx';
import { Video } from './Video';

export const Media = (props = { sceneManager }) =>
{
    const [ mediaObjects, setMediaObjects ] = useState(null);
    const mediaObjectsRef = useRef();

    useEffect(() =>
    {
        if (!props.sceneManager) return;
        if (!props.sceneManager.mediaObjects) return;

        const tempMediaObjects = props.sceneManager.mediaObjects;

        setMediaObjects(tempMediaObjects);
        mediaObjectsRef.current = tempMediaObjects;

    }, [ props.sceneManager ]);

    return (
        <group>
            {
                props.sceneManager?.mediaObjects.video.map((element, key) => (
                    <Video
                        key={key}
                        size={Math.max(...element.object.scale)}
                        src={element.mediaSrc}
                        position={element.worldPosition}
                        quaternion={element.worldRotation}
                        sourceObject={element.object}
                        muted={false}
                        framed >
                    </Video>
                ))
            }

            {/* {mediaObjectsRef.current
                &&
                mediaObjectsRef.current.audio
                &&
                mediaObjectsRef.current.audio.map((element, key) => (
                    <PositionalAudio
                        key={key}
                        onClick={props.interactionManager.handleInteraction}
                        onPointerEnter={props.interactionManager.handlePointerEnter}
                        size={Math.max(...element.object.scale)}
                        src={element.mediaSrc}
                        position={element.worldPosition}
                        quaternion={element.worldRotation}
                        muted={false}
                        framed
                    />
                ))
            } */}
        </group>
    );
}

