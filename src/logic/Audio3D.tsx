import { useEffect, useMemo, useRef, useState } from "react";
import { GroupProps, useThree } from "@react-three/fiber";
import * as THREE from "three"
type AudioProps = {
    url: string;
    dCone?: THREE.Vector3;
    rollOff?: number;
    volume?: number;
    sourceObject?: any;
    setAudioAnalyser?: (aa: THREE.AudioAnalyser) => void;
    fftSize?: 64 | 128 | 256 | 512 | 1024;
} & GroupProps;

export function Audio3D(props: AudioProps)
{
    const {
        url,
        dCone = new THREE.Vector3(180, 230, 0.1),
        rollOff = 1,
        volume = 1,
        sourceObject = null,
        setAudioAnalyser,
        fftSize = 128,
        ...rest
    } = props;


    const { camera } = useThree();

    const [ speaker, setSpeaker ] = useState<THREE.PositionalAudio>();
    const [ callbacks, setCallbacks ] = useState({});

    const audio = useMemo(() =>
    {
        const a = document.createElement("audio");
        a.src = url;
        a.preload = "auto";
        a.crossOrigin = "Anonymous";
        a.loop = false;
        a.autoplay = false;
        a.volume = volume;

        return a;
    }, []);

    const playToggle = () =>
    {
        if (audio.paused)
        {
            audio.play();
        } else
        {
            audio.pause();
        }
    };

    useEffect(() =>
    {
        let listener = null;
        const setupAudio = () =>
        {
            return;
            listener = new THREE.AudioListener();
            listener.name = "audio_listener";
            const speak = new THREE.PositionalAudio(listener);
            speak.setMediaElementSource(audio);
            speak.setRefDistance(1);
            speak.setRolloffFactor(rollOff);
            speak.setVolume(volume);
            speak.context.resume();
            // speak.setDirectionalCone(dCone.x, dCone.y, dCone.z);

            camera.add(listener);

            if (setAudioAnalyser)
            {
                setAudioAnalyser(new THREE.AudioAnalyser(speak, fftSize));
            }

            setSpeaker(speak);
        };

        const addCallbacks = () =>
        {
            const tempCallbacks = {};
            if ('Looping' === sourceObject.userData?.mediaTrigger)
            {
                audio.loop = true;
                audio.play();
            } else if ('OnSelect' === sourceObject.userData?.mediaTrigger)
            {
                tempCallbacks[ 'onClick' ] = () =>
                {
                    playToggle();
                }
            } else if ('OnPointerExit' === sourceObject.userData?.mediaTrigger || 'OnPointerEnter' === sourceObject.userData?.mediaTrigger)
            {
                tempCallbacks[ 'onPointerEnter' ] = () =>
                {
                    audio.play();
                }
            }
            setCallbacks(tempCallbacks);
        }

        if (audio && !speaker)
        {
            audio.play().then(() =>
            {
                audio.pause();
                setupAudio();
                addCallbacks();
            });
        }

    }, [ audio ]);

    useEffect(() =>
    {
        if (!speaker) return;
        speaker.setRolloffFactor(rollOff);
        speaker.setVolume(volume);
    }, [ rollOff, volume ]);

    return (
        <primitive object={sourceObject.clone()} visible={false} {...callbacks} {...rest} >
            {
                speaker && <primitive {...rest} object={speaker} />
            }
        </primitive>
    );
}
