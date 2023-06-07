

export class SceneManager
{
    constructor(scene)
    {
        this.scene = scene;

        this.sceneZones = [];

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
                // if a new scene zone is found in the node which is not already in the scenezone array add it to the array
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
        sceneZone.objects.interactables.push(object);
    }

}
