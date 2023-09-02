// Import necessary dependencies
import { Bounds, meshBounds } from "@react-three/drei";
import { Box3, Vector3 } from "three";

// Define a class called SceneManager
export class SceneManager
{
    constructor(scene, controls)
    {
        // Initialize scene, controls, and data arrays
        this.scene = scene;
        this.controls = controls;
        this.sceneZones = [];
        this.waypoints = [];
        this.loopingAnimations = [];

        // Call initialization methods
        this.populateSceneZones(scene);
        this.fixWaypoints();
        this.fixZones();
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
                this.extractAnimationsFromUserData(node);

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

    // Extract animation data from user data
    extractAnimationsFromUserData(object)
    {
        if ('LoopingAnimations' in object.userData)
        {
            const loopingAnimations = object.userData.LoopingAnimations.replace(/\s/g, '').split(',');
            this.loopingAnimations.push(...loopingAnimations);
        }

        const extractAnimations = (userDataKey, objectUserData) =>
        {
            if (userDataKey in objectUserData)
            {
                const animations = objectUserData[ userDataKey ];


                if (typeof animations === 'string')
                {
                    animations = animations.replace(/\s/g, '').split(',')
                }

                objectUserData[ userDataKey ] = animations;
                if (!('zone' in objectUserData))
                {
                    //  Adds a special animations zone to the objectUserData if it doesn't exist
                    objectUserData[ "zone" ] = "_default_animations_zone";
                    objectUserData[ "type" ] = "interactable";
                }

                //  Adds the same animations to any children of the object
                const userDataCopy = Object.assign({}, object.userData);

                object.traverse((node) =>
                {
                    node.userData = userDataCopy;
                });

            }
        };

        extractAnimations('OnPointerEnterAnimations', object.userData);
        extractAnimations('OnPointerExitAnimations', object.userData);
        extractAnimations('OnSelectAnimations', object.userData);
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
            cameraAnchor: null,
            cameraTarget: new Box3(),
            cameraTargetPosition: new Vector3(),
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

        switch (object.userData.type)
        {
            case 'interactable':
                this.addInteractable(sceneZone, object);
                break;
            case 'cameraAnchor':
                isCameraAnchor = true;
                this.addCameraAnchor(sceneZone, object);
                break;
            default:
                break;
        }

        // Add the object to the scene zone's camera target
        if (sceneZone && !isCameraAnchor)
        {
            const target = new Vector3();
            sceneZone.cameraTarget.expandByObject(object);
            sceneZone.cameraTarget.getCenter(target);
            sceneZone.cameraTargetPosition = target;
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
                const cameraAnchor = sceneZone.cameraAnchor;
                const cameraAnchorPosition = cameraAnchor.position;
                const cameraAnchorRotation = cameraAnchor.quaternion;
                const cameraAnchorDirection = new Vector3(0, 0, -1);
                cameraAnchorDirection.applyQuaternion(cameraAnchorRotation);
                const cameraTargetPosition = new Vector3();
                cameraTargetPosition.copy(cameraAnchorDirection).add(cameraAnchorPosition);
                sceneZone.cameraTargetPosition = cameraTargetPosition;
                sceneZone.cameraTarget.setFromCenterAndSize(cameraTargetPosition, new Vector3(1, 1, 1));
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
                element.cameraTargetPosition = sceneZone.cameraTargetPosition;
            } else
            {
                // Use camera anchor direction to point the camera
                const cameraAnchor = element.cameraAnchor;
                const cameraAnchorPosition = cameraAnchor.position;
                const cameraAnchorRotation = cameraAnchor.quaternion;
                const cameraAnchorDirection = new Vector3(0, 0, -1);
                cameraAnchorDirection.applyQuaternion(cameraAnchorRotation);
                const cameraTargetPosition = new Vector3();
                cameraTargetPosition.copy(cameraAnchorDirection).add(cameraAnchorPosition);
                element.cameraTargetPosition = cameraTargetPosition;
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
            sceneZone.cameraAnchor = anchorObject;
        }

        this.waypoints.push({
            index: cameraAnchorIndex,
            cameraAnchor: anchorObject,
            cameraTarget: new Box3(),
            cameraTargetPosition: new Vector3()
        });
    }

    // Add an interactable object to a scene zone
    addInteractable(sceneZone, object)
    {
        object.children.forEach((child) =>
        {
            child.traverse((node) =>
            {
                node.userData.name = node.name;
                node.userData.type = object.userData.type;
                node.userData.interactableType = object.userData.interactableType;
                node.userData.interactableData = object.userData.interactableData;
            });
        });

        if (sceneZone)
        {
            const worldPosition = new Vector3();
            object.getWorldPosition(worldPosition);

            sceneZone.objects.interactables.push({ object, worldPosition });
        }
    }

    // Get looping animation data
    getLoopingAnimations()
    {
        return this.loopingAnimations;
    }

    // Fix scene zones by adjusting camera positions and targets
    fixZones()
    {
        this.fixEmptyZones();

        // Move the camera anchor to ensure all scene zone content is in the camera frustum
        this.sceneZones.forEach(sceneZone =>
        {

            if (sceneZone.objects.count === 0 || sceneZone.cameraAnchor === null)
            {
                return;
            }

            const position = sceneZone.cameraAnchor.position;
            const target = sceneZone.cameraTargetPosition;
            const targetBox = sceneZone.cameraTarget;

            const framingDistance = this.calculateFramingDistance(targetBox, 1.15); // 1.15 adds a 15% padding to the scene zone content
            this.orbitCameraTo(position, target, framingDistance, false);
            this.controls.update(0);

            sceneZone.cameraAnchor.position.x = this.controls.camera.position.x;
            sceneZone.cameraAnchor.position.y = this.controls.camera.position.y;
            sceneZone.cameraAnchor.position.z = this.controls.camera.position.z;

            // Find the waypoint with index equal to sceneZone.index
            const waypoint = this.waypoints.find(waypoint => waypoint.index === sceneZone.index);

            waypoint.cameraAnchor.position.x = this.controls.camera.position.x;
            waypoint.cameraAnchor.position.y = this.controls.camera.position.y;
            waypoint.cameraAnchor.position.z = this.controls.camera.position.z;

            waypoint.cameraTargetPosition = sceneZone.cameraTargetPosition;
        });

        // Update the camera position based on the first waypoint
        const waypoint = this.waypoints.find(waypoint => waypoint.index === 0);
        if (!waypoint)
        {
            return;
        }
        this.orbitCameraTo(waypoint.cameraAnchor.position, waypoint.cameraTargetPosition, 1, false);
    }

    // Orbit the camera to a specified position and look target
    orbitCameraTo(positionTarget, lookTarget, camDist, damp = false)
    {
        // Ensure the camera is positioned further than the distance to the anchor point
        if (camDist < positionTarget.distanceTo(lookTarget))
        {
            camDist = positionTarget.distanceTo(lookTarget);
        }

        // Calculate the new position target for the camera
        const newPositionTarget = positionTarget.clone().sub(lookTarget).setLength(camDist).add(lookTarget);

        if (!this.controls)
        {
            return;
        }

        // Set the camera position and look target
        return this.controls.setLookAt(...newPositionTarget, ...lookTarget, damp);
    }

    // Calculate the framing distance for camera
    calculateFramingDistance(sceneBox, offset)
    {
        // Calculate the size of the sceneBox
        let boxSize = new Vector3();
        sceneBox.getSize(boxSize);
        boxSize = boxSize.length();

        if (this.controls.camera.aspect > 1)
        {
            boxSize = boxSize * this.controls.camera.aspect;
        }

        // Calculate the half vertical field of view (FOV)
        const halfFOVVertical = (Math.PI * this.controls.camera.fov) / 360;

        // Calculate the half horizontal FOV using the aspect ratio
        const halfFOVHorizontal = Math.atan(Math.tan(halfFOVVertical) * this.controls.camera.aspect);

        // Calculate the required camera distance for proper framing
        const requiredCameraDist = boxSize / (2 * Math.tan(halfFOVHorizontal));

        // Apply offset to the calculated distance
        return requiredCameraDist * offset;
    }
}
