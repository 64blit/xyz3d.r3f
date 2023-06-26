import { Bounds, meshBounds } from "@react-three/drei";
import { Box3, Vector3 } from "three";


export class SceneManager
{
    constructor(scene)
    {
        this.scene = scene;

        this.sceneZones = [];
        this.loopingAnimations = [];

        this.populateSceneZones(scene);
    }

    populateSceneZones(scene)
    {

        const children = [ ...scene.children ];

        children.forEach((child) =>
        {
            child.traverse((node) =>
            {
                const userData = node.userData;

                this.addAnimations(node)

                if (userData && 'zone' in userData)
                {
                    const sceneZone = this.getSceneZone(userData.zone)
                    this.addObject(sceneZone, node);
                    this.scene.remove(node);
                }
            });
        });

        this.sceneZones.sort((a, b) => a.index - b.index);
    }

    addAnimations(object)
    {

        if ('LoopingAnimations' in object.userData)
        {
            const actionNames = object.userData.LoopingAnimations.replace(/\s/g, '').split(',');
            this.loopingAnimations.push(...actionNames);
        }
        if ('OnPointerEnter' in object.userData)
        {
            const actionNames = object.userData.OnPointerEnter.replace(/\s/g, '').split(',');
            object.userData.OnPointerEnter = actionNames;
        }
        if ('OnPointerExit' in object.userData)
        {
            const actionNames = object.userData.OnPointerExit.replace(/\s/g, '').split(',');
            object.userData.OnPointerExit = actionNames;

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
                interactables: [],
                backgrounds: []
            }
        };

        this.sceneZones.push(newSceneZone);

        return newSceneZone;
    }

    addObject(sceneZone, object)
    {
        sceneZone.cameraTarget.expandByObject(object);

        const target = new Vector3();
        sceneZone.cameraTarget.getCenter(target);
        sceneZone.cameraTargetPosition = target;

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

    addBackground(sceneZone, object)
    {
        sceneZone.objects.backgrounds.push(object);
    }

    addCameraAnchor(sceneZone, object)
    {
        const cameraAnchorIndex = object.userData.cameraAnchorIndex;
        sceneZone.index = cameraAnchorIndex;
        object.visible = false;

        sceneZone.cameraAnchor = object;
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

        sceneZone.objects.interactables.push(object);
    }

    getLoopingAnimations()
    {

        return this.loopingAnimations;
    }
}
