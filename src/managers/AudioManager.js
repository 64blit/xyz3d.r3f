import * as THREE from "three";

// https://assets.mixkit.co/active_storage/sfx/212/212.wav

export class AudioManager
{
    constructor(camera)
    {
        this.loopingSounds = [];

        // Add audio listener to camera
        this.listener = new THREE.AudioListener();
        camera.add(this.listener);
        const loadedSounds = {};

        const sound = new THREE.Audio(this.listener);
        const audioLoader = new THREE.AudioLoader();

        // Function to play sound by name
        this.playSound = (source, loop = false, audioObj = null) =>
        {
            if (!audioObj) audioObj = sound;

            audioObj.setLoop(loop);
            audioObj.setVolume(1);

            if (audioObj.isPlaying)
            {
                audioObj.stop();
            }

            if (source in loadedSounds)
            {
                audioObj.setBuffer(loadedSounds[ source ]);
                audioObj.play();
                return;
            }

            audioLoader.load(source, function (buffer)
            {
                loadedSounds[ source ] = buffer;
                audioObj.setBuffer(buffer);
                audioObj.play();

            });

        };
    }

    // Function to play loop sounds
    playLoopingSounds()
    {
        for (let i = 0; i < this.loopingSounds.length; i++)
        {
            const element = this.loopingSounds[ i ];
            this.playSound(element, true, new THREE.Audio(this.listener));
            console.log("Playing Looping Sound: ", element);
        }
    }


    // Function to get looping sounds
    getLoopingSounds()
    {
        return this.loopingSounds;
    }

    // Extract sound data from user data
    parseSounds(object)
    {
        if (!("Media" in object.userData)) return;
        if (!("mediaType" in object.userData)) return;
        if (!("Audio" === object.userData.mediaType)) return;
        if (!("mediaTrigger" in object.userData))
        {
            console.log("No media trigger found, ensure a media trigger is set on your Audio enabled object.")
            return;
        }

        const mediaSrc = object.userData.mediaSrc;

        if (object.userData.mediaTrigger === "Looping")
        {
            this.loopingSounds.push(mediaSrc);
        }

        if (object.userData.mediaTrigger === "OnPointerEnter")
        {
            object.userData.mediaSrc = mediaSrc;
        }

        if (object.userData.mediaTrigger === "OnPointerExit")
        {
            object.userData.mediaSrc = mediaSrc;
        }

        if (object.userData.mediaTrigger === "OnSelect")
        {
            object.userData.mediaSrc = mediaSrc;
        }
    }
}
