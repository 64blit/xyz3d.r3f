import React, { useEffect, useRef, useState } from 'react';

import { Audio3D } from './Audio3D.tsx';
import { Video } from './Video';

export const Media = (props = { sceneManager }) =>
{
    const [ mediaContent, setMediaContent ] = useState(null);

    useEffect(() =>
    {
        if (!props.sceneManager) return;
        if (!props.sceneManager.mediaObjects) return;

        const loadMedia = (event) =>
        {
            const tempMediaContent =
                <>
                    <group>
                        {props.sceneManager?.mediaObjects.video.map((element, key) => (
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
                        ))}

                    </group>
                    <group>
                        {props.sceneManager?.mediaObjects.positionalAudio.map((element, key) => (
                            <Audio3D
                                key={key}
                                size={Math.max(...element.object.scale)}
                                url={element.mediaSrc}
                                sourceObject={element.object}
                                position={element.worldPosition}
                                quaternion={element.worldRotation}
                                muted={false}
                                framed
                            />
                        ))}

                    </group>
                </>
                ;

            setMediaContent(tempMediaContent);
            document.removeEventListener("click", loadMedia);

        }

        document.addEventListener("click", loadMedia);

        return () =>
        {
            document.removeEventListener("click", loadMedia);
        };

    }, [ props.sceneManager ]);

    return (
        <>
            {mediaContent}
        </>
    );
}

