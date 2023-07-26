import { Bounds, meshBounds } from "@react-three/drei";
import { Box3, Vector3 } from "three";


export class SceneManager
{
    constructor(scene, controls)
    {
        this.scene = scene;
        this.controls = controls;

        this.sceneZones = [];
        this.waypoints = [];

        this.loopingAnimations = [];


        this.fillZones(scene);
        this.fixZones();
        this.fixWaypoints();
    }

    fillZones(scene)
    {

        const children = [ ...scene.children ];

        children.forEach((child) =>
        {
            child.traverse((node) =>
            {
                const userData = Object.assign({}, node.userData);

                this.addAnimations(node)

                let sceneZone = null;

                if (userData && 'zone' in userData)
                {
                    sceneZone = this.getSceneZone(userData.zone)
                    if (sceneZone == null)
                    {
                        sceneZone = this.createSceneZone(userData.zone);
                    }
                }

                this.addObject(sceneZone, node);

            });
        });

        this.sceneZones.sort((a, b) => a.index - b.index);
        this.waypoints.sort((a, b) => a.index - b.index);



    }

    addAnimations(object)
    {
        if ('LoopingAnimations' in object.userData)
        {
            // console.log(object.userData);

            object.userData.LoopingAnimations = object.userData.LoopingAnimations.replace(/\s/g, '').split(',');

            this.loopingAnimations.push(...object.userData.LoopingAnimations);
        }
        if ('OnPointerEnterAnimations' in object.userData)
        {
            // console.log(object.userData);
            const actionNames = object.userData.OnPointerEnterAnimations.replace(/\s/g, '').split(',');
            object.userData.OnPointerEnterAnimations = actionNames;
        }
        if ('OnPointerExitAnimations' in object.userData)
        {
            // console.log(object.userData);
            const actionNames = object.userData.OnPointerExitAnimations.replace(/\s/g, '').split(',');
            object.userData.OnPointerExitAnimations = actionNames;

        }
        if ('OnSelectAnimations' in object.userData)
        {
            const actionNames = object.userData.OnSelectAnimations.replace(/\s/g, '').split(',');
            object.userData.OnSelectAnimations = actionNames;
        }

    }

    getSceneZones()
    {
        return this.sceneZones;
    }

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

        if (sceneZone && !isCameraAnchor)
        {
            const target = new Vector3();
            sceneZone.cameraTarget.expandByObject(object);
            sceneZone.cameraTarget.getCenter(target);
            sceneZone.cameraTargetPosition = target;
            sceneZone.objects.count++;
        }

    }

    fixEmptyZones()
    {
        this.sceneZones.forEach((sceneZone) =>
        {
            if (sceneZone.objects.count === 0)
            {
                // sets the sceneZone.cameraTargetPosition to a point in the direction of the cameraAnchor's rotation
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

    fixWaypoints()
    {
        this.waypoints.forEach((element) =>
        {
            const sceneZone = this.getSceneZoneByIndex(element.index);
            if (sceneZone)
            {
                // uses the objects in the sceneZone to set the cameraTargetPosition
                element.cameraTargetPosition = sceneZone.cameraTargetPosition;

            } else
            {

                // Uses the direction of the camera anchor to point the camera
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
            })

        });

        if (sceneZone)
        {
            const worldPosition = new Vector3();
            object.getWorldPosition(worldPosition);

            sceneZone.objects.interactables.push({ object, worldPosition });
        }
    }

    getLoopingAnimations()
    {

        return this.loopingAnimations;
    }

    fixZones()
    {
        this.fixEmptyZones();

        // Move the camera anchor to make sure all scene zone content is in the camera frustum 
        this.sceneZones.forEach(sceneZone =>
        {
            if (sceneZone.objects.count === 0 || sceneZone.cameraAnchor === null)
            {
                return;
            }

            const position = sceneZone.cameraAnchor.position;
            const target = sceneZone.cameraTargetPosition;
            const targetBox = sceneZone.cameraTarget;

            const framingDistance = this.getFramingDistance(targetBox, 1);
            this.orbitCameraTo(position, target, framingDistance, false);
            this.controls.update(0);

            sceneZone.cameraAnchor.position.x = this.controls.camera.position.x;
            sceneZone.cameraAnchor.position.y = this.controls.camera.position.y;
            sceneZone.cameraAnchor.position.z = this.controls.camera.position.z;

            // a one liner that gets the waypoint with the .index value equal to the sceneZone.index
            const waypoint = this.waypoints.find(waypoint => waypoint.index === sceneZone.index);

            waypoint.cameraAnchor.position.x = this.controls.camera.position.x;
            waypoint.cameraAnchor.position.y = this.controls.camera.position.y;
            waypoint.cameraAnchor.position.z = this.controls.camera.position.z;

            waypoint.cameraTargetPosition = sceneZone.cameraTargetPosition;

        });

        const waypoint = this.waypoints.find(waypoint => waypoint.index === 0);

        this.orbitCameraTo(waypoint.cameraAnchor.position, waypoint.cameraTargetPosition, 1, false);

    }


    orbitCameraTo(positionTarget, lookTarget, camDist, damp = false)
    {
        // Keep the camera further than the distnace to the anchor point
        if (camDist < positionTarget.distanceTo(lookTarget))
        {
            camDist = positionTarget.distanceTo(lookTarget)
        }

        const newPositionTarget = positionTarget.clone().sub(lookTarget).setLength(camDist).add(lookTarget)

        if (!this.controls)
        {
            return
        }

        return this.controls.setLookAt(...newPositionTarget, ...lookTarget, damp)
    }

    // A function to make sure the threejs camera displays the entire bounding box
    getFramingDistance(sceneBox, offset = 1)
    {
        // the size of the sceneBox
        let boxSize = new Vector3()
        sceneBox.getSize(boxSize);
        boxSize = Math.max(...boxSize);

        let cameraDist = (offset * boxSize) / (2 * Math.atan((Math.PI * this.controls.camera.fov) / 360))

        return cameraDist
    }


}
