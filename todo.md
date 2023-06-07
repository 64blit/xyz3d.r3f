**To-Do List: React 3D Scene Project**

1. **Add Bounding Box to Interactables for Raycasting:**

   - Implement a bounding box component or mechanism for the interactable nodes.
   - Ensure the bounding box accurately encapsulates the interactable objects.
   - Set up raycasting logic to detect interactions with the bounding boxes.

2. **Add Callbacks for Interactables:**

   - Define callback functions for each type of interactable behavior (e.g., open link, pop-up HTML, go to scene zone, animation trigger).
   - Handle the interaction logic within each callback function.
   - Connect the interactable nodes with their respective callbacks.

3. **Add JSX for Scene Zones Wrapped in Bounds:**

   - Create a JSX component for each scene zone.
   - Wrap the content of each scene zone within a bounding box component.
   - Organize the nodes and interactable components within the scene zone JSX structure.

4. **Implement Camera Controller:**

   - Choose or develop a camera control library or component suitable for your project.
   - Integrate the camera controller into your React project.
   - Configure the camera control settings (e.g., rotation, zoom, pan) according to your requirements.

5. **Enable Navigation between Scene Zones:**
   - Implement functionality to transition between different scene zones.
   - Define a mechanism to determine which scene zone is active and control the camera position accordingly.
   - Handle the camera movements or animations when switching between scene zones.
