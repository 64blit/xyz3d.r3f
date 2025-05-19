import { create } from 'zustand';

const useStore = create((set, get) => ({
  cameraPosition: { x: 0, y: 0, z: 0 },
  cameraTarget: { x: 0, y: 0, z: 0 },
  cameraFov: 50,
  
  scrollProgress: 0,
  hasUserScrolled: false,
  
  animationQueue: [],
  loopingAnimations: [],
  
  sceneZones: [],
  waypoints: [],
  currentZoneIndex: 0,
  
  showPopup: false,
  popupContent: null,
  isDebugging: false,
  isLoaded: false,
  
  xyzAPI: null,
  
  setScrollProgress: (progress) => set({ scrollProgress: progress, hasUserScrolled: true }),
  setCameraPosition: (position) => set({ cameraPosition: position }),
  setCameraTarget: (target) => set({ cameraTarget: target }),
  setCameraFov: (fov) => set({ cameraFov: fov }),
  setShowPopup: (show) => set({ showPopup: show }),
  setPopupContent: (content) => set({ popupContent: content }),
  setIsDebugging: (isDebugging) => set({ isDebugging }),
  setIsLoaded: (isLoaded) => set({ isLoaded }),
  setXyzAPI: (api) => set({ xyzAPI: api }),
  setSceneZones: (zones) => set({ sceneZones: zones }),
  setWaypoints: (waypoints) => set({ waypoints }),
  setCurrentZoneIndex: (index) => set({ currentZoneIndex: index }),
  
  queueAnimation: (name) => {
    const queue = get().animationQueue;
    set({ animationQueue: [...queue, name] });
  },
  
  addLoopingAnimation: (name) => {
    const animations = get().loopingAnimations;
    if (!animations.includes(name)) {
      set({ loopingAnimations: [...animations, name] });
    }
  },
  
  dequeueAnimation: () => {
    const queue = get().animationQueue;
    const [_, ...rest] = queue;
    set({ animationQueue: rest });
    return queue[0];
  },
}));

export default useStore;
