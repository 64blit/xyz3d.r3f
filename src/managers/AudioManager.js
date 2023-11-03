import * as THREE from "three";

// https://assets.mixkit.co/active_storage/sfx/212/212.wav

export class AudioManager
{
    constructor(camera)
    {
        this.loopingSounds = [];

        // Add audio listener to camera
        const listener = new THREE.AudioListener();
        camera.add(listener);
        const playingSounds = [];
        const loadedSounds = {};

        const sound = new THREE.Audio(listener);
        const audioLoader = new THREE.AudioLoader();

        // Function to play sound by name
        this.playSound = (source, loop = false) =>
        {
            sound.setLoop(loop);
            sound.setVolume(1);
            playingSounds.push(source);

            if (source in playingSounds)
            {
                this.stopSound(source);
            }

            if (sound.isPlaying)
            {
                sound.stop();
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

                sound.onEnded = () =>
                {
                    playingSounds.splice(playingSounds.indexOf(sound), 1);
                };
            });

        };
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

    // Function to stop sound by name
    stopSound(name)
    {
        for (let i = 0; i < playingSounds.length; i++)
        {
            if (playingSounds[ i ].name === name)
            {
                playingSounds[ i ].sound.stop();
                playingSounds.splice(i, 1);
            }
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
            object.userData.OnPointerEnterSound = mediaSrc;
        }

        if (object.userData.mediaTrigger === "OnPointerExit")
        {
            object.userData.OnPointerExitSound = mediaSrc;
        }

        if (object.userData.mediaTrigger === "OnSelect")
        {
            object.userData.OnSelectSound = mediaSrc;
        }
    }
}
