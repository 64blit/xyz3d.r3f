import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Audio3D } from './Audio3D.tsx';
import { Video3D } from './Video3D.tsx';
import { generateKey } from 'helpers/ReactHelpers.js';

export const Media = ({ sceneManager, isDebugging }) =>
{
    const [ mediaContent, setMediaContent ] = useState(null);

    useEffect(() =>
    {
        if (!sceneManager) return;
        if (!sceneManager.mediaObjects) return;

        const loadMedia = (event) =>
        {
            const tempMediaContent =
                <>
                    <group>
                        {sceneManager?.mediaObjects.video.map((element, key) => (
                            <Video3D
                                key={generateKey(key)}
                                size={Math.max(...element.object.scale)}
                                src={element.mediaSrc}
                                position={element.worldPosition}
                                quaternion={element.worldRotation}
                                sourceObject={element.object}
                                muted={false}
                                isDebugging={isDebugging}
                                volume={element.volume}
                                framed >
                            </Video3D>
                        ))}
                        {sceneManager?.mediaObjects.positionalAudio.map((element, key) => (
                            <Audio3D
                                key={generateKey(key)}
                                size={Math.max(...element.object.scale)}
                                url={element.mediaSrc}
                                sourceObject={element.object}
                                position={element.worldPosition}
                                quaternion={element.worldRotation}
                                muted={false}
                                isDebugging={isDebugging}
                                volume={element.volume}
                            />
                        ))}
                    </group>
                </>;

            setMediaContent(tempMediaContent);
            document.removeEventListener("click", loadMedia);

        }

        document.addEventListener("click", loadMedia);

        return () =>
        {
            document.removeEventListener("click", loadMedia);
        };

    }, [ sceneManager ]);

    return (
        <>
            {mediaContent}
        </>
    );
}

