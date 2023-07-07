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
                const userData = Object.assign({}, node.userData);

                let sceneZone = null
                if (userData && 'zone' in userData)
                {
                    sceneZone = this.getSceneZone(userData.zone)
                    this.addObject(sceneZone, node);
                    this.scene.remove(node);
                }

                this.addAnimations(sceneZone, node)
            });
        });

        this.sceneZones.sort((a, b) => a.index - b.index);
    }

    addAnimations(sceneZone, object)
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



        if (sceneZone == null)
        {
            return;
        }

        if ('OnSceneEnterAnimations' in object.userData)
        {
            // console.log(object.userData);
            object.userData.OnSceneEnterAnimations = object.userData.OnSceneEnterAnimations.replace(/\s/g, '').split(',');
            sceneZone.enterAnimations.push(...object.userData.OnSceneEnterAnimations);
        }

        if ('OnSceneExitAnimations' in object.userData)
        {
            // console.log(object.userData);
            object.userData.OnSceneExitAnimations = object.userData.OnSceneExitAnimations.replace(/\s/g, '').split(',');
            sceneZone.exitAnimations.push(...object.userData.OnSceneExitAnimations);
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
            enterAnimations: [],
            exitAnimations: [],

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
