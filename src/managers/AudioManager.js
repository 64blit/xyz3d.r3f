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
        this.playingSounds = [];

        // Function to play sound by name
        this.playSound = (name, loop = false) =>
        {
            const sound = new THREE.Audio(listener);
            const audioLoader = new THREE.AudioLoader();
            sound.setLoop(loop);

            playingSounds.push({ name, sound });

            this.stopSound(name);

            audioLoader.load(name, function (buffer)
            {
                sound.setBuffer(buffer);
                sound.setLoop(true);
                sound.setVolume(1);
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
        this.loopingSounds.forEach((sound) =>
        {
            console.log("Playing sound: " + sound);
            this.playSound(sound, true);
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
        if ("LoopingSounds" in object.userData)
        {
            let loopingSounds = object.userData.LoopingSounds;

            if (typeof loopingSounds === "string")
            {
                loopingSounds = loopingSounds.replace(/\s/g, "").split(",");
            } else
            {
                loopingSounds = object.userData.LoopingSounds;
            }

            this.loopingSounds.push(...loopingSounds);

            object.userData.LoopingSounds = loopingSounds;
        }

        const extractSounds = (userDataKey, objectUserData) =>
        {
            if (userDataKey in objectUserData)
            {
                let sounds = objectUserData[ userDataKey ];

                if (typeof sounds === "string")
                {
                    sounds = sounds.replace(/\s/g, "").split(",");
                }

                objectUserData[ userDataKey ] = sounds;

                //  Adds the same sounds to any children of the object
                const userDataCopy = Object.assign({}, object.userData);

                object.traverse((node) =>
                {
                    node.userData = userDataCopy;
                });
            }
        };

        extractSounds("OnPointerEnterSounds", object.userData);
        extractSounds("OnPointerExitSounds", object.userData);
        extractSounds("OnSelectSounds", object.userData);
    }
}
