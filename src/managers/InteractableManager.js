

class InteractableManager {
    constructor() {
        this.interactables = [];
    }

    addInteractable(interactable) {
        this.interactables.push(interactable);
    }

    removeInteractable(interactable) {
        const index = this.interactables.indexOf(interactable);
        if (index !== -1) {
            this.interactables.splice(index, 1);
        }
    }

    handleInteractionStart(event) {
        for (const interactable of this.interactables) {
            if (interactable.onInteractionStart) {
                interactable.onInteractionStart(event);
            }
        }
    }

    handleInteractionEnd(event) {
        for (const interactable of this.interactables) {
            if (interactable.onInteractionEnd) {
                interactable.onInteractionEnd(event);
            }
        }
    }

    handleInteraction(event) {
        for (const interactable of this.interactables) {
            if (interactable.onInteraction) {
                interactable.onInteraction(event);
            }
        }
    }
}
