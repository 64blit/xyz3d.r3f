

export class InteractionManager
{
    constructor(setShowPopup, setPopupContent, goToSceneZone, playAnimation, playSound)
    {
        this.interactables = [];
        this.setShowPopup = setShowPopup;
        this.setPopupContent = setPopupContent;
        this.goToSceneZone = goToSceneZone;
        this.playAnimation = playAnimation;
        this.playSound = playSound;


        this.handleInteraction = async (event) =>
        {
            event.stopPropagation();

            const type = event.object.userData.interactableType;
            const data = event.object.userData.interactableData;

            // Play all the select animations first, then trigger the interaction
            await this.playSelectAnimation(event.object);

            document.body.style.cursor = "auto";

            switch (type)
            {
                case "Popup HTML":
                    this.setShowPopup(true);
                    this.setPopupContent(data);
                    break;

                case "Open Link":
                    window.open(data, "_blank");
                    break;

                case "Go To Scene Zone":
                    this.goToSceneZone(data);
                    break;

                default:
                    break;
            }
        }

        // on hover callback for playing any hover animations found inside the userData varaiable under hoverAnimations
        this.handlePointerEnter = (event) =>
        {

            document.body.style.cursor = "pointer";

            const actions = event.object.userData.OnPointerEnterAnimations || null;
            if (actions != null)
            {
                actions.forEach((actionName) =>
                {
                    this.playAnimation(actionName);
                });
            }

            const sound = event.object.userData.mediaSrc || null;

            if (sound != null)
            {
                this.playSound(sound);
            }
        }

        this.handlePointerExit = (event) =>
        {

            document.body.style.cursor = "auto";

            const actions = event.object.userData.OnPointerExitAnimations || null;
            if (actions != null)
            {
                actions.forEach((actionName) =>
                {
                    this.playAnimation(actionName);
                });
            }

            const sound = event.object.userData.mediaSrc || null;

            if (sound != null)
            {
                this.playSound(sound);
            }
        }

        this.playSelectAnimation = async (object) =>
        {
            const actions = object.userData.OnSelectAnimations || null;
            const animationPromises = [];

            if (actions != null)
            {
                actions.forEach((actionName) =>
                {
                    animationPromises.push(this.playAnimation(actionName));
                });
            }

            const sound = object.userData.mediaSrc || null;

            if (sound != null)
            {
                this.playSound(sound);
            }

            await Promise.all(animationPromises);
        }

    }
}
