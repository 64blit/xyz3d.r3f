// A class named AudioManager that manages the audio of the three.js scene.

import * as THREE from "three";
export class AudioManager
{
    constructor(sounds, audioListener)
    {
        this.sounds = sounds;
        this.audioListener = audioListener;
        this.playingSounds = [];

        // Function to play sound by name
        this.playSound = (name) =>
        {
            const sound = this.sounds[ name ];

            if (sound && !sound.isPlaying)
            {
                sound.play();
                this.playingSounds.push(sound);
                //  return a promise that resolves when the sound is finished
                return new Promise((resolve) =>
                {
                    sound.onEnded = () =>
                    {
                        this.playingSounds = this.playingSounds.filter((s) =>
                        {
                            return s !== sound;
                        });
                        resolve();
                    };
                });
            }
        }
    }

    // Function to stop sound by name
    stopSound(name)
    {
        const sound = this.sounds[ name ];

        if (sound)
        {
            sound.stop();
        }
    }

    // Function to stop all sounds
    stopAllSounds()
    {
        this.playingSounds.forEach((sound) =>
        {
            sound.stop();
        });
    }

    // Extract sound data from user data
    parseSounds(object)
    {
        if ('Sounds' in object.userData)
        {
            let sounds = object.userData.Sounds;

            if (typeof sounds === 'string')
            {
                sounds = sounds.replace(/\s/g, '').split(',');
            } else
            {
                sounds = [];
            }

            this.sounds = sounds;
        }
    }
}
