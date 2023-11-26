
import { basicLerp } from '../utils/BaseUtils.js';
import { gsap } from 'gsap';

export class CameraManager
{
    constructor(sceneManager, controls, camera, scroll)
    {
        this.scroll = scroll;
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
            if (!this.scroll) return;

            const position = sceneZone.camera.anchor?.position;

            if (!position) return;

            const target = sceneZone.camera.targetPosition;

            const newScrollOffset = sceneZone.index / (this.sceneManager.sceneZones.length - 1);
            const scrollTarget = this.scroll.el;
            const scrollTop = (scrollTarget.scrollHeight - scrollTarget.clientHeight) * newScrollOffset;

            scrollTarget.scrollTo({ top: scrollTop });

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


        // Function to handle scrolling
        this.scrollHandler = () =>
        {

            if (!this.scroll) return;
            if (this.busy) return;
            if (this.scroll.delta < .00004) return;

            const scaledScrollOffset = this.scroll.offset * (this.sceneManager.waypoints.length - 1);
            const currentZoneIndex = Math.floor(scaledScrollOffset);
            const nextZoneIndex = Math.ceil(scaledScrollOffset);
            const currentZone = this.sceneManager.waypoints[ currentZoneIndex ];
            const nextZone = this.sceneManager.waypoints[ nextZoneIndex ];

            if (!currentZone || !nextZone) return;

            const percent = (scaledScrollOffset % 1);

            // Use slerp to interpolate camera position and target
            const cameraPosition = currentZone.camera.anchor.position.clone().lerp(nextZone.camera.anchor.position, percent);
            const cameraTarget = currentZone.camera.targetPosition.clone().lerp(nextZone.camera.targetPosition, percent);

            this.controls.setLookAt(...cameraPosition, ...cameraTarget, true);

            if ("fov" in currentZone.camera.anchor)
            {
                this.controls.camera.fov = basicLerp(currentZone.camera.anchor.fov, nextZone.camera.anchor.fov, percent);
                this.controls.camera.near = basicLerp(currentZone.camera.anchor.near, nextZone.camera.anchor.near, percent);
                this.controls.camera.far = basicLerp(currentZone.camera.anchor.far, nextZone.camera.anchor.far, percent);
                this.controls.camera.updateProjectionMatrix();
                this.controls.update(0);
            }

        };

        this.goToSceneZoneByIndex(0);
    }


    update()
    {
        this.scrollHandler();
    }

}
