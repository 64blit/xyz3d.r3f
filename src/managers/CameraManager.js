
import { basicLerp } from '../utils/BaseUtils.js';
import { gsap } from 'gsap';

export class CameraManager
{
    constructor(sceneManager, controls, camera)
    {

        this.sceneManager = sceneManager;
        this.controls = controls;
        this.camera = camera;
        this.busy = false;

        // Function to navigate to a scene zone by index
        this.goToSceneZoneByIndex = (index) =>
        {
            if (this.busy) return;
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

            const position = sceneZone.camera.anchor?.position;

            if (!position) return;

            const target = sceneZone.camera.targetPosition;

            if (this.controls === undefined || this.controls === null) return;

            this.controls.setLookAt(...position, ...target, true).then(() =>
            {
                this.busy = false;
            });

            const tl = gsap.timeline();

            tl.fromTo(
                this.controls.camera,
                { fov: this.controls.camera.fov },
                {
                    fov: sceneZone.camera.anchor.fov,
                    duration: this.controls.smoothTime,
                    onUpdate: () =>
                    {
                        this.controls.update(0);
                        this.controls.camera.updateProjectionMatrix();
                    }
                }
            );

            tl.fromTo(
                this.controls.camera,
                { near: this.controls.camera.near },
                { near: sceneZone.camera.anchor.near, duration: this.controls.smoothTime }
            );

            tl.fromTo(
                this.controls.camera,
                { far: this.controls.camera.far },
                { far: sceneZone.camera.anchor.far, duration: this.controls.smoothTime }
            );


            tl.play();
        }



        this.goToSceneZoneByIndex(0);
    }

    update()
    {
    }

}
