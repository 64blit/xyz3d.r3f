import { basicLerp } from '../utils/BaseUtils.js'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export class CameraManager {
  constructor(sceneManager, controls, camera, scroll) {
    this.scroll = scroll
    this.sceneManager = sceneManager
    this.controls = controls
    this.camera = camera
    this.busy = false

    this.hasUserScrolled = false
    this.scrollOffset = 0
    this.scrollTriggers = []

    this.setScrollPercentage = (element, percentage) => {
      const totalHeight = element.scrollHeight - element.clientHeight
      const scrollPosition = percentage * totalHeight
      element.scrollTop = scrollPosition
    }

    this.scroll.el.addEventListener('scroll', () => {
      if (this.busy) return
      this.hasUserScrolled = true
      this.scrollOffset = this.scroll.el.scrollTop / this.scroll.el.scrollHeight
    })

    // Function to navigate to a scene zone by index
    this.goToSceneZoneByIndex = index => {
      if (this.busy) return
      this.busy = true

      const sceneZone = this.sceneManager.waypoints[index]
      if (!sceneZone) {
        console.log('Scene zone not found, index: ', index)
        this.busy = false
        return
      }

      this.goToSceneZone(sceneZone)
    }

    // Function to navigate to a scene zone by name
    this.goToSceneZoneByName = name => {
      if (this.busy) return
      if (!this.camera) return
      if (!this.sceneManager) return

      this.busy = true

      const sceneZone = this.sceneManager.getSceneZone(name)
      if (!sceneZone) {
        console.log('Scene zone not found: ', name)
        return
      }

      this.goToSceneZone(sceneZone)
    }

    // Function to smoothly navigate to a scene zone
    this.goToSceneZone = sceneZone => {
      if (!sceneZone) return
      if (sceneZone.index < 0) return
      if (!this.scroll) return

      this.hasUserScrolled = false

      const position = sceneZone.camera.anchor?.position

      if (!position) return

      const target = sceneZone.camera.targetPosition

      const scrollTargetOffset = sceneZone.index / (this.sceneManager.waypoints.length - 1)

      this.setScrollPercentage(this.scroll.el, scrollTargetOffset)

      if (this.controls === undefined || this.controls === null) return

      this.controls.setLookAt(...position, ...target, true).then(() => {
        this.busy = false
      })

      const tl = gsap.timeline()

      tl.fromTo(
        this.controls.camera,
        { fov: this.controls.camera.fov },
        {
          fov: sceneZone.camera.anchor.fov,
          duration: this.controls.smoothTime,
          onUpdate: () => {
            this.controls.update(0)
            this.controls.camera.updateProjectionMatrix()
          },
        }
      )

      tl.fromTo(
        this.controls.camera,
        { near: this.controls.camera.near },
        {
          near: sceneZone.camera.anchor.near,
          duration: this.controls.smoothTime,
        }
      )

      tl.fromTo(
        this.controls.camera,
        { far: this.controls.camera.far },
        {
          far: sceneZone.camera.anchor.far,
          duration: this.controls.smoothTime,
        }
      )

      tl.play()
    }

    // Function to handle scrolling
    this.scrollHandler = () => {
      if (!this.scroll) return
      if (!this.hasUserScrolled) return
      if (this.busy) return
      if (this.scroll.delta < 0.000004) return

      const scaledScrollOffset = this.scrollOffset * (this.sceneManager.waypoints.length - 1)

      const currentZoneIndex = Math.floor(scaledScrollOffset)
      const nextZoneIndex = Math.ceil(scaledScrollOffset)
      const currentZone = this.sceneManager.waypoints[currentZoneIndex]
      const nextZone = this.sceneManager.waypoints[nextZoneIndex]

      if (!currentZone || !nextZone) return

      const percent = scaledScrollOffset % 1

      // Use slerp to interpolate camera position and target
      const cameraPosition = currentZone.camera.anchor.position.clone().lerp(nextZone.camera.anchor.position, percent)
      const cameraTarget = currentZone.camera.targetPosition.clone().lerp(nextZone.camera.targetPosition, percent)

      this.controls.setLookAt(...cameraPosition, ...cameraTarget, true)

      if ('fov' in currentZone.camera.anchor) {
        this.controls.camera.fov = basicLerp(currentZone.camera.anchor.fov, nextZone.camera.anchor.fov, percent)
        this.controls.camera.near = basicLerp(currentZone.camera.anchor.near, nextZone.camera.anchor.near, percent)
        this.controls.camera.far = basicLerp(currentZone.camera.anchor.far, nextZone.camera.anchor.far, percent)
        this.controls.camera.updateProjectionMatrix()
        this.controls.update(0)
      }
    }

    this.setupScrollTriggers = () => {
      this.scrollTriggers.forEach(trigger => trigger.kill());
      this.scrollTriggers = [];
      
      this.sceneManager.waypoints.forEach((waypoint, index) => {
        if (index === 0) return; // Skip first waypoint
        
        const progress = index / (this.sceneManager.waypoints.length - 1);
        const prevWaypoint = this.sceneManager.waypoints[index - 1];
        
        const trigger = ScrollTrigger.create({
          trigger: this.scroll.el,
          start: `top+=${progress * 100 - 10}% top`,
          end: `top+=${progress * 100 + 10}% top`,
          onUpdate: (self) => {
            const t = self.progress;
            const position = prevWaypoint.camera.anchor.position.clone()
              .lerp(waypoint.camera.anchor.position, t);
            const target = prevWaypoint.camera.targetPosition.clone()
              .lerp(waypoint.camera.targetPosition, t);
            
            if (!this.busy) {
              this.controls.setLookAt(...position, ...target, true);
            }
          }
        });
        
        this.scrollTriggers.push(trigger);
      });
    };

    this.goToSceneZoneByIndex(0)
  }

  update() {
    if (this.hasUserScrolled) {
      this.scrollHandler()
    }
  }
}
