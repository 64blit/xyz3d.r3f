import { useEffect, useMemo, useRef, useState } from "react";
import { GroupProps, useThree } from "@react-three/fiber";
import { AudioAnalyser, PositionalAudio, Vector3, AudioListener } from "three";
import autoprefixer from "autoprefixer";

type AudioProps = {
    url: string;
    dCone?: Vector3;
    rollOff?: number;
    volume?: number;
    sourceObject?: any;
    setAudioAnalyser?: (aa: AudioAnalyser) => void;
    fftSize?: 64 | 128 | 256 | 512 | 1024;
} & GroupProps;

export function Audio3D(props: AudioProps)
{
    const {
        url,
        dCone = new Vector3(180, 230, 0.1),
        rollOff = 1,
        volume = 1,
        sourceObject = null,
        setAudioAnalyser,
        fftSize = 128,
        ...rest
    } = props;


    const [ speaker, setSpeaker ] = useState<PositionalAudio>();
    const camera = useThree((state) => state.camera);
    const [ callbacks, setCallbacks ] = useState({});
    const [ objectCopy, setObjectCopy ] = useState(null);
    const [ audioStarted, setAudioStarted ] = useState(false);

    const audio = useMemo(() =>
    {
        const a = document.createElement("audio");
        a.src = url;
        a.preload = "auto";
        a.crossOrigin = "Anonymous";
        a.loop = false;
        a.autoplay = true;
        a.muted = true;
        return a;
    }, []);

    const toggleAudio = () =>
    {
        if (audio.paused)
        {
            audio.play();
        }
        else
        {
            audio.pause();
        }
    }

    useEffect(() =>
    {
        if (audioStarted) return;

        const startAudio = () =>
        {
            if (audioStarted) return;
            setAudioStarted(true);

            audio.volume = 0;
            audio.muted = true;
            audio.setAttribute("muted", "true");
            audio.setAttribute("volume", "0");
            audio.play().then(() =>
            {
                setupAudio()
                audio.volume = 1;
                audio.muted = false;
                audio.setAttribute("muted", "false");
                audio.setAttribute("volume", "1");

            });
        };

        const setupAudio = () =>
        {
            if (!audio.paused && !speaker)
            {
                const listener = new AudioListener();
                camera.add(listener);

                const speak = new PositionalAudio(listener);
                speak.setMediaElementSource(audio);
                speak.setRefDistance(.75);
                speak.setRolloffFactor(rollOff);
                speak.setVolume(volume);
                speak.setDirectionalCone(dCone.x, dCone.y, dCone.z);

                if (setAudioAnalyser)
                {
                    setAudioAnalyser(new AudioAnalyser(speak, fftSize));
                }

                setSpeaker(speak);
            }
        };

        const addCallbacks = () =>
        {
            const tempCallbacks = {};
            if ('Looping' === sourceObject.userData.mediaTrigger)
            {
                audio.loop = true;
                audio.play();
            } else if ('OnSelect' === sourceObject.userData.mediaTrigger)
            {
                tempCallbacks[ 'onClick' ] = () =>
                {
                    toggleAudio();
                }
            } else if ('OnPointerExit' === sourceObject.userData.mediaTrigger || 'OnPointerEnter' === sourceObject.userData.mediaTrigger)
            {
                tempCallbacks[ 'onPointerEnter' ] = () =>
                {
                    audio.play();
                }
            }
            setCallbacks(tempCallbacks);
        }

        if (audio)
        {

            addCallbacks();
            startAudio();
        }
    }, [ speaker, audio, url, sourceObject, audioStarted ]);

    useEffect(() =>
    {
        if (!speaker) return;

        speaker.setRolloffFactor(rollOff);
        speaker.setVolume(volume);
        speaker.setDirectionalCone(dCone.x, dCone.y, dCone.z);
    }, [ dCone, rollOff, volume ]);

    return (
        <primitive object={sourceObject.clone()} visible={false} {...callbacks} {...rest} >
            {
                speaker && <primitive {...rest} object={speaker} />
            }
        </primitive>
    );
}
