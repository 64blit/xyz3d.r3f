import * as THREE from "three";

// https://assets.mixkit.co/active_storage/sfx/212/212.wav

export class AudioManager
{
    constructor(camera)
    {
        this.loopingSounds = [];
        const self = this;


        // // get the average frequency of the sound
        // const data = analyser.getAverageFrequency();

        // Add audio listener to camera
        const listener = new THREE.AudioListener();
        camera.add(listener);
        const loadedSounds = {};

        const sound = new THREE.Audio(listener);
        const audioLoader = new THREE.AudioLoader();

        // create an AudioAnalyser, passing in the sound and desired fftSize
        this.analyser = new THREE.AudioAnalyser(sound, 32);

        // Function to play sound by name
        this.playSound = (source, loop = false) =>
        {
            sound.setLoop(loop);
            sound.setVolume(1);

            if (sound.isPlaying)
            {
                sound.stop();
                audioAverages.length = 0;
            }

            if (source in loadedSounds)
            {
                sound.setBuffer(loadedSounds[ source ]);
                sound.play();
                return;
            }

            audioLoader.load(source, function (buffer)
            {
                loadedSounds[ source ] = buffer;
                sound.setBuffer(buffer);
                sound.play();
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
            this.playSound(element, true);

        }
        this.loopingSounds.forEach((sound) =>
        {
            console.log("Playing sound: " + sound);
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
