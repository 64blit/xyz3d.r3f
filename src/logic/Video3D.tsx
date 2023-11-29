import { useEffect, useMemo, useRef, useState } from "react";
import { GroupProps, useThree } from "@react-three/fiber";

import
{
    DoubleSide,
    Material,
    PositionalAudio,
    sRGBEncoding,
    Vector2,
    AudioListener,
} from "three";

import { PositionalAudioHelper } from "three/examples/jsm/helpers/PositionalAudioHelper.js";

import { Frame } from "spacesvr";

type Props = {
    src: string;
    size?: number;
    framed?: boolean;
    isDebugging?: boolean;
    muted?: boolean;
    rollOff?: number;
    volume?: number;
    frameMaterial?: Material;
    frameWidth?: number;
    sourceObject?: any;
} & GroupProps;

type VideoState = {
    width: number;
    height: number;
};

export function Video3D(props: Props)
{
    const {
        src,
        size = 1,
        framed,
        muted,
        volume = 1,
        rollOff = 1,
        frameMaterial,
        frameWidth = 1,
        sourceObject = null,
        isDebugging = false,
        ...rest
    } = props;

    const { camera } = useThree();

    const [ speaker, setSpeaker ] = useState<THREE.PositionalAudio>();
    const [ videoState, setVideoState ] = useState<VideoState>();
    const [ callbacks, setCallbacks ] = useState(null);

    const video = useMemo(() =>
    {
        const v = document.createElement("video");

        v.playsInline = true;
        v.crossOrigin = "Anonymous";
        v.loop = true;
        v.src = src;
        v.preload = "auto";
        v.autoplay = false;
        v.volume = volume;
        v.muted = muted ? muted : false;

        return v;
    }, []);

    const toggleActive = () =>
    {
        if (video.paused)
        {
            video.play();
        }
        else
        {
            video.pause();
        }
    }


    useMemo(() =>
    {
        const setupAudio = () =>
        {
            // After a dependecy update of the project, positional audio has stopped working.
            return;
            const listener = new AudioListener();
            listener.name = "video_listener";
            const speak = new PositionalAudio(listener);
            speak.setMediaElementSource(video);
            speak.setRefDistance(1);
            speak.setRolloffFactor(rollOff);
            speak.setVolume(volume);
            speak.setDirectionalCone(180, 230, 0.1);

            setSpeaker(speak);
            camera.add(listener);
        };


        const addCallbacks = () =>
        {
            const tempCallbacks = {};
            if ('Looping' === sourceObject.userData.mediaTrigger)
            {
                video.play();
            } else if ('OnSelect' === sourceObject.userData.mediaTrigger)
            {
                tempCallbacks[ 'onClick' ] = () => 
                {
                    toggleActive();

                }
            } else if ('OnPointerExitMedia' === sourceObject.userData.mediaTrigger || 'OnPointerEnter' === sourceObject.userData.mediaTrigger)
            {
                tempCallbacks[ 'onPointerEnter' ] = () =>
                {
                    video.play();
                }
                tempCallbacks[ 'onPointerLeave' ] = () =>
                {
                    video.pause();
                }
            }
            setCallbacks(tempCallbacks);
        }


        if (video)
        {
            video.play().then(() =>
            {
                video.pause();
                setupAudio();
                addCallbacks();
                const max = Math.max(video.videoWidth, video.videoHeight);
                const width = (video.videoWidth / max) * size;
                const height = (video.videoHeight / max) * size;
                setVideoState({ width, height });
            });
        }

    }, [ video ]);


    useEffect(() =>
    {
        if (!speaker) return;
        speaker.setVolume(volume);
    }, [ volume ]);

    // Never fired because this component is added on the fly
    useEffect(() =>
    {
        if (!speaker) return;
        if (isDebugging)
        {
            const helper = new PositionalAudioHelper(speaker, 10);
            speaker.add(helper);
        } else
        {
            speaker.children = [];
        }
    }, [ isDebugging ])


    if (!video) return null;


    return (
        <>
            {videoState && <>
                <group name="videos" {...rest}>
                    <mesh
                        {...callbacks}>
                        <planeGeometry args={[ videoState?.width, videoState?.height ]} />
                        <meshBasicMaterial side={DoubleSide}>
                            <videoTexture attach="map" args={[ video ]} encoding={sRGBEncoding} />
                        </meshBasicMaterial>
                    </mesh>
                    {speaker && <primitive object={speaker} position={[ 0, 0, 0 ]} ></primitive>}

                    {framed && (
                        <Frame
                            width={videoState?.width}
                            height={videoState?.height}
                            thickness={frameWidth}
                            material={frameMaterial}
                        />
                    )}

                </group>
            </>
            }
        </>

    );
}
