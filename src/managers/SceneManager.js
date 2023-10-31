// Import necessary dependencies
import * as THREE from "three";
import { AnimationManager } from "./AnimationManager";
import { AudioManager } from "./AudioManager";

// Define a class called SceneManager
export class SceneManager
{
    constructor(scene, controls, animations, actions)
    {
        // Initialize scene, controls, and data arrays
        this.scene = scene;
        this.controls = controls;
        this.sceneZones = [];
        this.waypoints = [];

        this.physicsObjects = [];

        this.mediaObjects = {
            video: [],
            audio: [],
            positionalAudio: []
        };

        this.animationManager = new AnimationManager(animations, actions);
        this.audioManager = new AudioManager(this.controls.camera);

        // Call initialization methods
        this.populateSceneZones(scene);
        this.fixWaypoints();
        this.fixZones();

        this.animationManager.playLoopingAnimations();
        this.audioManager.playLoopingSounds();

        this.playAnimation = (name, loopType = THREE.LoopOnce) =>
        {
            return this.animationManager.playAnimation(name, loopType);
        }

        this.playSound = (name, loop = false) =>
        {
            return this.audioManager.playSound(name, loop);
        }

    }

    getAnimationAction(name)
    {
        return this.animationManager.actions[ name ];
    }

    // Populate scene zones and objects within zones
    populateSceneZones(scene)
    {
        const children = [ ...scene.children ];

        // Traverse through each child node in the scene
        children.forEach((child) =>
        {
            child.traverse((node) =>
            {

                // Extract animation data and update arrays
                this.animationManager.parseAnimations(node);
                this.audioManager.parseSounds(node);

                const userDataCopy = Object.assign({}, node.userData);

                let sceneZone = null;

                // Check if the node has a 'zone' in its user data
                if (userDataCopy && 'zone' in userDataCopy)
                {
                    sceneZone = this.getOrCreateSceneZone(userDataCopy.zone);
                }

                // Add the object to the appropriate scene zone
                this.addObject(sceneZone, node);
            });
        });

        // Sort scene zones and waypoints based on index
        this.sceneZones.sort((a, b) => a.index - b.index);
        this.waypoints.sort((a, b) => a.index - b.index);
    }

    // Get or create a scene zone based on name
    getOrCreateSceneZone(sceneZoneName)
    {
        let sceneZone = this.sceneZones.find((zone) => zone.name === sceneZoneName);
        if (!sceneZone)
        {
            sceneZone = this.createSceneZone(sceneZoneName);
        }
        return sceneZone;
    }

    // Create a new scene zone
    createSceneZone(sceneZoneName)
    {
        const newSceneZone = {
            name: sceneZoneName,
            index: -1,
            camera: {
                anchor: null,
                target: new THREE.Box3(),
                targetPosition: new THREE.Vector3(),
            },
            objects: {
                count: 0,
                interactables: [],
            }
        };

        this.sceneZones.push(newSceneZone);
        return newSceneZone;
    }

    getSceneZones()
    {
        return this.sceneZones;
    }

    getSceneZone(sceneZoneName)
    {
        for (let i = 0; i < this.sceneZones.length; i++)
        {
            const sceneZone = this.sceneZones[ i ];
            if (sceneZone.name === sceneZoneName)
            {
                return sceneZone;
            }
        }

        return null;
    }

    getPhysicsObjects()
    {
        return this.physicsObjects;
    }

    getSceneZoneByIndex(index)
    {
        for (let i = 0; i < this.sceneZones.length; i++)
        {
            const sceneZone = this.sceneZones[ i ];
            if (sceneZone.index === index)
            {
                return sceneZone;
            }
        }

        return null;
    }


    addObject(sceneZone, object)
    {
        let isCameraAnchor = false;

        const { worldPosition, worldRotation } = this.getWorldData(object);

        if ("Media" in object.userData)
        {
            object.visible = false;

            console.log("Media object found: " + object.name)

            if (object.userData.mediaType === "Audio")
            {
                this.mediaObjects.audio.push({
                    object,
                    worldPosition,
                    worldRotation,
                    mediaSrc: object.userData.mediaSrc
                });
            } else if (object.userData.mediaType === "Video")
            {
                console.log("Video object found: " + object.userData)
                this.mediaObjects.video.push({
                    object,
                    worldPosition,
                    worldRotation,
                    mediaSrc: object.userData.mediaSrc
                });
            } else if (object.userData.mediaType === "3D Positional Audio")
            {
                this.mediaObjects.positionalAudio.push({
                    object,
                    worldPosition,
                    mediaSrc: object.userData.mediaSrc
                });
            }
        }

        if ("Physics" in object.userData) 
        {
            //  Note: Interactable physics objects are handled in the physics component,
            //   not the scene zone component
            const { worldPosition, worldRotation } = this.getWorldData(object);
            object.userData[ "worldPosition" ] = worldPosition;
            object.userData[ "worldRotation" ] = worldRotation;
            this.physicsObjects.push(object);

        } else if ("type" in object.userData && object.userData.type == "interactable")
        {
            this.addInteractable(sceneZone, object);
        } else if ("type" in object.userData && object.userData.type == "cameraAnchor") 
        {
            isCameraAnchor = true;
            this.addCameraAnchor(sceneZone, object);
        }

        // Add the object to the scene zone's camera target
        if (sceneZone && !isCameraAnchor)
        {
            const target = new THREE.Vector3();
            sceneZone.camera.target.expandByObject(object);
            sceneZone.camera.target.getCenter(target);
            sceneZone.camera.targetPosition = target;
            sceneZone.objects.count++;
        }
    }

    // Fix empty scene zones by adjusting camera targets
    fixEmptyZones()
    {
        this.sceneZones.forEach((sceneZone) =>
        {
            if (sceneZone.objects.count === 0)
            {
                // Calculate camera target position based on camera anchor rotation
                const cameraAnchor = sceneZone.camera.anchor;
                const cameraAnchorPosition = cameraAnchor.position;
                const cameraAnchorRotation = cameraAnchor.quaternion;
                const cameraAnchorDirection = new THREE.Vector3(0, 0, -1);
                cameraAnchorDirection.applyQuaternion(cameraAnchorRotation);
                const cameraTargetPosition = new THREE.Vector3();
                cameraTargetPosition.copy(cameraAnchorDirection).add(cameraAnchorPosition);
                sceneZone.camera.targetPosition = cameraTargetPosition;
                sceneZone.camera.target.setFromCenterAndSize(cameraTargetPosition, new THREE.Vector3(1, 1, 1));
            }
        });
    }

    // Fix waypoints based on scene zones and camera anchors
    fixWaypoints()
    {
        this.waypoints.forEach((element) =>
        {
            const sceneZone = this.getSceneZoneByIndex(element.index);
            if (sceneZone)
            {
                // Use camera target position from scene zone
                element.camera.targetPosition = sceneZone.camera.targetPosition;
            } else
            {
                // Use camera anchor direction to point the camera
                const cameraAnchor = element.camera.anchor;
                const cameraAnchorPosition = cameraAnchor.position;
                const cameraAnchorRotation = cameraAnchor.quaternion;
                const cameraAnchorDirection = new THREE.Vector3(0, 0, -1);
                cameraAnchorDirection.applyQuaternion(cameraAnchorRotation);
                const cameraTargetPosition = new THREE.Vector3();
                cameraTargetPosition.copy(cameraAnchorDirection).add(cameraAnchorPosition);
                element.camera.targetPosition = cameraTargetPosition;
            }
        });
    }

    // Add a camera anchor to a scene zone
    addCameraAnchor(sceneZone, anchorObject)
    {
        const cameraAnchorIndex = anchorObject.userData.cameraAnchorIndex;
        anchorObject.visible = false;

        if (sceneZone)
        {
            sceneZone.index = cameraAnchorIndex;
            sceneZone.camera.anchor = anchorObject;
        }

        this.waypoints.push({
            index: cameraAnchorIndex,
            camera: {
                anchor: anchorObject,
                target: new THREE.Box3(),
                targetPosition: new THREE.Vector3(),
            }
        });
    }

    getWorldData(object)
    {
        const worldPosition = new THREE.Vector3();
        object.getWorldPosition(worldPosition);

        let worldRotation = new THREE.Quaternion();
        object.getWorldQuaternion(worldRotation);

        var localXRotation = new THREE.Quaternion();
        localXRotation.setFromAxisAngle(new THREE.Vector3(-1, 0, 0), Math.PI / 2);

        // Multiply the originalQuaternion by the localXRotation
        worldRotation.multiply(localXRotation);

        return { worldPosition, worldRotation };
    }

    // Add an interactable object to a scene zone
    addInteractable(sceneZone, object)
    {

        const { worldPosition, worldRotation } = this.getWorldData(object);

        // Add the object to a default scene zone if it does not exist
        if (!sceneZone)
        {
            const defaultInteractableZoneName = "_default_interactable_zone";
            sceneZone = this.getOrCreateSceneZone(defaultInteractableZoneName);
            sceneZone.camera.anchor = object;
            object.userData[ "zone" ] = defaultInteractableZoneName;
        }


        sceneZone.objects.interactables.push({ object, worldPosition });

        // This is a hack to make the object children interactable of an interactable parent
        // This can be possible removed with a group parent object
        object.children.forEach((child) =>
        {
            child.traverse((node) =>
            {
                node.userData.name = node.name;
                node.userData.type = object.userData.type;
                node.userData.interactableType = object.userData.interactableType;
                node.userData.interactableData = object.userData.interactableData;

                if (!("zone" in object.userData))
                {
                    node.userData[ "zone" ] = "_default_interactable_zone";
                }
            });
        });

    }

    // Get looping animation data
    getLoopingAnimations()
    {
        return this.animationManager.getLoopingAnimations();
    }

    // Fix scene zones by adjusting camera positions and targets
    fixZones()
    {
        this.fixEmptyZones();
        const padding = 1.15;

        // Move the camera anchor to ensure all scene zone content is in the camera frustum
        this.sceneZones.forEach(sceneZone =>
        {

            if (sceneZone.objects.count === 0 || sceneZone.camera.anchor === null)
            {
                return;
            }

            const position = sceneZone.camera.anchor.position;
            const target = sceneZone.camera.targetPosition;
            const targetBox = sceneZone.camera.target;

            this.controls.camera.fov = sceneZone.camera.anchor.fov;
            this.controls.camera.updateProjectionMatrix();
            this.controls.update(0);

            this.controls.fitToBox(targetBox, false);
            this.controls.update(0);

            let camDist = this.controls.camera.position.distanceTo(target) * padding;

            // Move the camera position and rotation to the camera anchor
            this.orbitCameraTo(position, target, camDist);

            // override the framing distance with the fitToBox method
            this.controls.update(0);

            sceneZone.camera.anchor.position.x = this.controls.camera.position.x;
            sceneZone.camera.anchor.position.y = this.controls.camera.position.y;
            sceneZone.camera.anchor.position.z = this.controls.camera.position.z;

            // Find the waypoint with index equal to sceneZone.index
            const waypoint = this.waypoints.find(waypoint => waypoint.index === sceneZone.index);

            waypoint.camera.anchor.position.x = this.controls.camera.position.x;
            waypoint.camera.anchor.position.y = this.controls.camera.position.y;
            waypoint.camera.anchor.position.z = this.controls.camera.position.z;

            waypoint.camera.targetPosition = sceneZone.camera.targetPosition;
        });

        // Update the camera position based on the first waypoint
        const waypoint = this.waypoints.find(waypoint => waypoint.index === 0);

        if (!waypoint)
        {
            return;
        }

        this.orbitCameraTo(waypoint.camera.anchor.position, waypoint.camera.targetPosition, 1, false);

    }


    // Orbit the camera to a specified position and look target
    orbitCameraTo(positionTarget, lookTarget, camDist = 0, damp = false)
    {
        const camDistThreshold = positionTarget.distanceTo(lookTarget);
        // Ensure the camera is positioned further than the distance to the anchor point
        if (camDist < camDistThreshold)
        {
            camDist = camDistThreshold;
        }

        // Calculate the new position target for the camera
        const newPositionTarget = positionTarget.clone().sub(lookTarget).setLength(camDist).add(lookTarget);

        if (this.controls === null)
        {
            return;
        }

        // Set the camera position and look target
        this.controls.setLookAt(...newPositionTarget, ...lookTarget, damp);
    }

}
