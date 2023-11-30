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

        this.getAudio = () => sound;

        // create an AudioAnalyser, passing in the sound and desired fftSize
        this.analyser = new THREE.AudioAnalyser(sound, 32);

        // Function to play sound by name
        this.playSound = (parentObject, loop = false, audioObj = null) =>
        {
            if (!parentObject.userData?.mediaSrc) return;
            if (!audioObj) audioObj = sound;


            const source = parentObject.userData?.mediaSrc;
            const volume = parentObject.userData?.mediaVolume || 1;

            console.log("Playing Sound: " + source)

            if (!source) return;

            audioObj.setLoop(loop);
            audioObj.setVolume(volume);

            if (audioObj.isPlaying)
            {
                sound.stop();
                audioAverages.length = 0;
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

        const audioAverages = [];
        const averageSamples = 50;

        // Function to get the average frequency
        this.getAverageFrequency = () =>
        {
            const data = this.analyser.getAverageFrequency();
            audioAverages.push(data);

            if (audioAverages.length > averageSamples) audioAverages.shift();

            const average = audioAverages.reduce((sum, value) => sum + value, 0) / audioAverages.length;

            return average;
        }

    }

    // Function to play loop sounds
    playLoopingSounds()
    {
        for (let i = 0; i < this.loopingSounds.length; i++)
        {
            const element = this.loopingSounds[ i ];
            this.playSound(element, true, new THREE.Audio(this.listener));
        }
        this.loopingSounds.forEach((sound) =>
        {
            console.log("Playing Looping Sound: " + sound);
        });
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

        if (object.userData.mediaTrigger === "Looping")
        {
            this.loopingSounds.push(object);
        }

    }
}
