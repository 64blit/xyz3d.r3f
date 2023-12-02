import { useEffect, useMemo, useRef, useState } from "react";
import { GroupProps, useThree } from "@react-three/fiber";
import { Frame } from "./Frame";
import
{
    DoubleSide,
    Material,
    PositionalAudio,
    sRGBEncoding,
    Vector2,
    AudioListener,
} from "three";

type Props = {
    src: string;
    size?: number;
    framed?: boolean;
    muted?: boolean;
    volume?: number;
    frameMaterial?: Material;
    frameWidth?: number;
    sourceObject?: any;
} & GroupProps;

export function Video(props: Props)
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
        ...rest
    } = props;

    const camera = useThree((state) => state.camera);

    const listener = useRef<THREE.AudioListener>();
    const [ speaker, setSpeaker ] = useState<THREE.PositionalAudio>();
    const [ dims, setDims ] = useState<Vector2>();

    const [ callbacks, setCallbacks ] = useState({});

    const video = useMemo(() =>
    {
        const v = document.createElement("video");
        // @ts-ignore
        v.playsInline = true;
        v.crossOrigin = "Anonymous";
        v.loop = true;
        v.src = src;
        v.autoplay = false;
        v.muted = muted ? muted : false;
        v.volume = volume;
        return v;
    }, []);

    useEffect(() =>
    {
        if (!speaker) return;

        speaker.setVolume(volume);
    }, [ volume, speaker ]);


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

    useEffect(() =>
    {

        const setupAudio = () =>
        {
            if (!muted && !video.paused && !speaker)
            {
                const listener = new AudioListener();
                camera.add(listener);

                const speak = new PositionalAudio(listener);
                speak.setMediaElementSource(video);
                speak.setRefDistance(5);
                speak.setRolloffFactor(.75);
                speak.setVolume(volume);
                speak.setDirectionalCone(180, 230, 0.1);

                setSpeaker(speak);
            }
        };

        const startVideo = () =>
        {
            const videoPromise =
                video
                    .play()
                    .then(() =>
                    {
                        const dimensions = new Vector2(video.videoWidth, video.videoHeight);
                        const max = Math.max(dimensions.x, dimensions.y);
                        const width = (dimensions.x / max) * size;
                        const height = (dimensions.y / max) * size;

                        setDims(new Vector2(width, height));
                        console.log('video dimensions', width, height);
                        video.pause();
                    });

            setupAudio();
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

        if (video)
        {
            startVideo().then(() =>
            {
                addCallbacks();
            });
        }

    }, [ speaker, video, muted, camera, volume, sourceObject ]);

    useEffect(() =>
    {
        return () =>
        {
            if (listener.current)
            {
                camera.remove(listener.current);
                listener.current.clear();
                listener.current = undefined;
            }
            if (speaker)
            {
                speaker.clear();
                speaker.disconnect();
                setSpeaker(undefined);
            }
            if (video)
            {
                video.pause();
                video.remove();
            }
        };
    }, []);

    if (!dims || !video)
    {
        return null;
    }

    return (
        <group name="spacesvr-video" {...rest}>
            <mesh
                {...callbacks}>
                <planeGeometry args={[ dims.width, dims.height ]} />
                <meshBasicMaterial side={DoubleSide}>
                    <videoTexture attach="map" args={[ video ]} encoding={sRGBEncoding} />
                </meshBasicMaterial>
            </mesh>
            {speaker && <primitive object={speaker} />}
            {/* {framed && (
                <Frame
                    width={width}
                    height={height}
                    thickness={frameWidth}
                    material={frameMaterial}
                />
            )} */}
        </group>
    );
}
