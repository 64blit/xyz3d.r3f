import { Bounds, meshBounds } from "@react-three/drei";
import { Box3, Vector3 } from "three";


export class SceneManager
{
    constructor(scene, controls)
    {
        this.scene = scene;

        this.sceneZones = [];
        this.waypoints = [];
        this.loopingAnimations = [];

        this.fillZones(scene);

        this.fixZones(controls);
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


        if ('CameraAnimations' in object.userData)
        {
            const actionNames = object.userData.CameraAnimations.replace(/\s/g, '').split(',');

            if (typeof (object.userData.OnSelectAnimations) == Array)
            {
                object.userData.CameraAnimations.push(...actionNames);
            } else
            {
                object.userData.CameraAnimations = actionNames;
            }
        }



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

        // Creates the zone if it doesn't exist
        const newSceneZone = {
            name: sceneZoneName,

            index: -1,
            cameraAnchor: {},
            cameraTarget: new Box3(),
            cameraTargetPosition: new Vector3(),

            objects: {
                count: 0,
                interactables: [],
                backgrounds: []
            }
        };

        this.sceneZones.push(newSceneZone);

        return newSceneZone;
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

        if (sceneZone)
        {
            const target = new Vector3();
            sceneZone.cameraTarget.expandByObject(object);
            sceneZone.cameraTarget.getCenter(target);
            sceneZone.cameraTargetPosition = target;
            sceneZone.objects.count++;
        }

        switch (object.userData.type)
        {
            case 'background':
                this.addBackground(sceneZone, object);
                break;
            case 'interactable':
                this.addInteractable(sceneZone, object);
                break;
            case 'cameraAnchor':
                this.addCameraAnchor(sceneZone, object);
                break;
            default:
                break;
        }


    }

    fixEmptyZones()
    {
        this.sceneZones.forEach((sceneZone) =>
        {
            if (sceneZone.objects.count === 1)
            {

                // sets the sceneZone.cameraTargetPosition to a point in the direction of the cameraAnchor's rotation
                const cameraAnchor = sceneZone.cameraAnchor;
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

    addBackground(sceneZone, object)
    {

        if (sceneZone)
        {
            sceneZone.objects.backgrounds.push(object);
        }
    }

    addCameraAnchor(sceneZone, object)
    {
        const cameraAnchorIndex = object.userData.cameraAnchorIndex;
        object.visible = false;

        if (sceneZone)
        {
            sceneZone.index = cameraAnchorIndex;
            sceneZone.cameraAnchor = object;
        }

        this.waypoints.push({
            index: cameraAnchorIndex,
            cameraAnchor: object,
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
            sceneZone.objects.interactables.push(object);
        }
    }

    getLoopingAnimations()
    {

        return this.loopingAnimations;
    }

    fixZones(controls)
    {
        this.fixEmptyZones();

        // Move the camera anchor to make sure all scene zone content is in the camera frustum 
        this.sceneZones.forEach(sceneZone =>
        {
            const position = sceneZone.cameraAnchor.position;
            const target = sceneZone.cameraTargetPosition;

            controls.setLookAt(...position, ...target, false);
            controls.fitToBox(sceneZone.cameraTarget, false);
            controls.update(0);

            sceneZone.cameraAnchor.position.x = controls.camera.position.x;
            sceneZone.cameraAnchor.position.y = controls.camera.position.y;
            sceneZone.cameraAnchor.position.z = controls.camera.position.z;

            this.waypoints[ sceneZone.index ].cameraAnchor.position.x = controls.camera.position.x;
            this.waypoints[ sceneZone.index ].cameraAnchor.position.y = controls.camera.position.y;
            this.waypoints[ sceneZone.index ].cameraAnchor.position.z = controls.camera.position.z;

            this.waypoints[ sceneZone.index ].cameraTargetPosition = sceneZone.cameraTargetPosition;

        });

    }
}
