import { useEffect, useMemo, useRef, useState } from "react";
import { GroupProps, useThree } from "@react-three/fiber";
import { Frame } from "./Frame";
import { DoubleSide, Material, PositionalAudio, sRGBEncoding, Vector2, AudioListener } from "three";
import { Html } from "@react-three/drei";
import { element } from "three/examples/jsm/nodes/Nodes.js";

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

export function Video(props: Props) {
  const { src, size = 1, framed, muted, volume = 1, frameMaterial, frameWidth = 1, sourceObject = null, ...rest } = props;

  const camera = useThree(state => state.camera);

  const listener = useRef<THREE.AudioListener>();
  const [speaker, setSpeaker] = useState<THREE.PositionalAudio>();
  const [dims, setDims] = useState<Vector2 | null>();

  const [callbacks, setCallbacks] = useState({});
  const videoRef = useRef<HTMLVideoElement>(document.createElement("video"));

  const video = useMemo(() => {
    if (!src) return null;
    if (videoRef.current && videoRef.current.src === src) return videoRef.current;

    const v = videoRef.current;
    if (!v) return null;
    // @ts-ignore
    v.playsInline = true;
    v.autoplay = true;
    v.crossOrigin = "anonymous";
    v.loop = true;
    v.src = src;
    console.log("🍟logic/Video.tsx:54/(src):", src);
    v.autoplay = false;
    v.muted = muted ? muted : false;
    v.volume = volume;

    v.addEventListener("loadeddata", () => {
      setDims(new Vector2(v.videoWidth, v.videoHeight));
      console.log("🍀logic/Video.tsx:100/(video):", v.videoWidth);
    });

    return v;
  }, [src, videoRef.current]);

  useEffect(() => {
    if (!speaker) return;

    speaker.setVolume(volume);
  }, [volume, speaker]);

  const toggleVideo = () => {
    if (!video) return;
    if (video.paused) {
      video.play();
      console.log("🌿logic/Video.tsx:59/(video.paused):", video);
    } else {
      console.log("🍩logic/Video.tsx:64/(video.pause):", video);
      video.pause();
    }
  };

  useEffect(() => {
    const setupAudio = () => {
      if (!video) return;
      if (!muted && !video.paused && !speaker) {
        const listener = new AudioListener();
        listener.name = src + "-listener";
        camera.children.forEach(child => {
          if (child.name === listener.name) {
            camera.remove(child);
          }
        });
        camera.add(listener);

        const speak = new PositionalAudio(listener);
        speak.setMediaElementSource(video);
        speak.setRefDistance(10);
        speak.setRolloffFactor(0.75);
        speak.setVolume(volume);
        speak.setDirectionalCone(180, 230, 0.1);
        // use the rotation of the object to set the direction of the sound
        speak.rotation.set(-Math.PI / 2, 0, 0);
        // speak.rotation.set(0, 0, 0);

        setSpeaker(speak);
      }
    };

    const addCallbacks = () => {
      if (!video) return;
      const tempCallbacks = {};
      if ("Looping" === sourceObject.userData.mediaTrigger) {
        video.play();
      } else if ("OnSelect" === sourceObject.userData.mediaTrigger) {
        tempCallbacks["onClick"] = () => {
          toggleVideo();
        };
      } else if ("OnPointerExitMedia" === sourceObject.userData.mediaTrigger || "OnPointerEnter" === sourceObject.userData.mediaTrigger) {
        tempCallbacks["onPointerEnter"] = () => {
          video.play();
        };
        tempCallbacks["onPointerLeave"] = () => {
          video.pause();
        };
      }

      setCallbacks(tempCallbacks);
    };

    if (video) {
      console.log("🍿logic/Video.tsx:129/(video):", video);

      setupAudio();
      addCallbacks();
    }
  }, [speaker, video, muted, camera, volume, sourceObject]);

  useEffect(() => {
    return () => {
      if (listener.current) {
        camera.remove(listener.current);
        listener.current.clear();
        listener.current = undefined;
      }
      if (speaker) {
        speaker.clear();
        speaker.disconnect();
        setSpeaker(undefined);
      }
      if (video) {
        console.log("✨logic/Video.tsx:134/(video):", video);
        video.pause();
        video.remove();
      }
    };
  }, []);

  if (!dims || !video) {
    return null;
  }

  const max = Math.max(dims.x, dims.y);
  const width = (dims.x / max) * size;
  const height = (dims.y / max) * size;

  return (
    <group name={"spacesvr-video" + src} {...rest}>
      <mesh {...callbacks}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial side={DoubleSide}>
          <videoTexture attach='map' args={[video]} encoding={sRGBEncoding} />
        </meshBasicMaterial>
      </mesh>
      {speaker && <primitive object={speaker} />}
      {framed && <Frame width={width} height={height} thickness={frameWidth} material={frameMaterial} />}
    </group>
  );
}
