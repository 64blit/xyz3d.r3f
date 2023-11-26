
import { basicLerp } from '../utils/BaseUtils.js';
import { gsap } from 'gsap';
import * as THREE from 'three';

export class CameraManager
{
    constructor(sceneManager, camera, playerState)
    {
        this.playerState = playerState;
        this.sceneManager = sceneManager;
        this.camera = camera;
        this.busy = false;

        // Function to navigate to a scene zone by index
        this.goToSceneZoneByIndex = (index) =>
        {
            if (this.busy) return;
            if (!this.playerState) return;

            this.busy = (true);

            const sceneZone = this.sceneManager.waypoints[ index ];
            if (!sceneZone)
            {
                console.log("Scene zone not found, index: ", index);
                return;
            }

            this.goToSceneZone(sceneZone);
        }

        // Function to navigate to a scene zone by name
        this.goToSceneZoneByName = (name) =>
        {

            if (this.busy) return;
            if (!this.camera) return;
            if (!this.sceneManager) return;
            if (!this.playerState) return;

            this.busy = true;

            const sceneZone = this.sceneManager.getSceneZone(name);
            if (!sceneZone)
            {
                console.log("Scene zone not found: ", name);
                return;
            }

            this.goToSceneZone(sceneZone);
        }

        // Function to smoothly navigate to a scene zone
        this.goToSceneZone = (sceneZone) =>
        {
            if (!sceneZone) return;
            if (sceneZone.index < 0) return;
            if (!this.playerState) return;

            // const position = new THREE.Vector3();
            // sceneZone.camera.anchor?.getWorldPosition(position);

            const position = sceneZone.camera.anchor?.position;

            if (!position) return;

            // Retrieve the current player position using the custom `get` method
            const currentPlayerPosition = this.playerState.position.get();

            // Animate position components separately
            gsap.to(currentPlayerPosition, {
                duration: 1,
                x: position.x,
                y: position.y,
                z: position.z,
                onUpdate: () =>
                {
                    // Update the player position using the custom `set` method
                    this.playerState.position.set(currentPlayerPosition);
                },
                onComplete: () =>
                {
                    this.busy = false;
                }
            });
        }


        this.goToSceneZoneByIndex(0);
    }



    update(playerState)
    {
        this.playerState = playerState;
    }

}
