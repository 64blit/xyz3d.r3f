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

type Props = {
    src: string;
    size?: number;
    framed?: boolean;
    isDebugging?: boolean;
    muted?: boolean;
    volume?: number;
    frameMaterial?: Material;
    frameWidth?: number;
    sourceObject?: any;
} & GroupProps;

export function Video3D(props: Props)
{
    const {
        src,
        size = 1,
        framed,
        muted,
        volume = 1,
        frameMaterial,
        frameWidth = 1,
        sourceObject = null,
        isDebugging = false,
        ...rest
    } = props;

    const { camera } = useThree();

    const [ speaker, setSpeaker ] = useState<THREE.PositionalAudio>();
    const [ videoState, setVideoState ] = useState<Object>();
    const [ callbacks, setCallbacks ] = useState({});

    const video = useMemo(() =>
    {
        const v = document.createElement("video");

        v.playsInline = true;
        v.crossOrigin = "Anonymous";
        v.loop = true;
        v.src = src;
        v.autoplay = false;
        v.volume = volume;
        v.muted = muted ? muted : false;

        return v;
    }, []);

    useMemo(() =>
    {
        const setupAudio = () =>
        {
            if (!muted)
            {
                const listener = new AudioListener();
                listener.name = "video_listener";
                camera.add(listener);

                const speak = new PositionalAudio(listener);
                speak.setMediaElementSource(video);
                const dist = 12;
                speak.setRefDistance(dist);
                speak.setRolloffFactor(1);
                speak.setVolume(1);
                speak.setDirectionalCone(180, 230, 0.1);

                setSpeaker(speak);
            }
        };

        const startVideo = () =>
        {
            const videoPromise =
                video.play()
                    .then(() =>
                    {

                        const max = Math.max(video.videoWidth, video.videoHeight);
                        const width = (video.videoWidth / max) * size;
                        const height = (video.videoHeight / max) * size;
                        setVideoState({ width, height });
                        video.pause();
                        setupAudio();
                    }).catch((err) =>
                    {
                    });

            return videoPromise;
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
                    toggleVideo();

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

        startVideo().then(() =>
        {
            addCallbacks();
        });

    }, [ video ]);

    const toggleVideo = () =>
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
        <group name="videos" {...rest}>
            <mesh
                {...callbacks}>
                <planeGeometry args={[ videoState?.width, videoState?.height ]} />
                <meshBasicMaterial side={DoubleSide}>
                    <videoTexture attach="map" args={[ video ]} encoding={sRGBEncoding} />
                </meshBasicMaterial>
            </mesh>

            {speaker && <primitive object={speaker} ></primitive>}

        </group>
    );
}
