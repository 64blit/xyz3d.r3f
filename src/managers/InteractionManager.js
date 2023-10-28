

export class InteractionManager
{
    constructor(setShowPopup, setPopupContent, goToSceneZone, playAnimation)
    {
        this.interactables = [];
        this.setShowPopup = setShowPopup;
        this.setPopupContent = setPopupContent;
        this.goToSceneZone = goToSceneZone;
        this.playAnimation = playAnimation;


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
            if (event.object.userData?.type !== "interactable")
            {
                return;
            }

            document.body.style.cursor = "pointer";

            const onHoverAnimations = event.object.userData.OnPointerEnterAnimations || null;
            if (onHoverAnimations != null)
            {
                onHoverAnimations.forEach((actionName) =>
                {
                    this.playAnimation(actionName);
                });
            }
        }

        this.handlePointerExit = (event) =>
        {
            if (event.object.userData?.type !== "interactable")
            {
                return;
            }

            document.body.style.cursor = "auto";

            const onPointerExit = event.object.userData.OnPointerExitAnimations || null;
            if (onPointerExit != null)
            {
                onPointerExit.forEach((actionName) =>
                {
                    this.playAnimation(actionName);
                });
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

            await Promise.all(animationPromises);
        }

    }
}
