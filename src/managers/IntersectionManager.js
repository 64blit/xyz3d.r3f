import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export class IntersectionManager {
  constructor(camera, scene, playAnimation) {
    this.camera = camera;
    this.scene = scene;
    this.playAnimation = playAnimation;
    this.raycaster = new THREE.Raycaster();
    this.triggerMeshes = [];
    this.intersectedMeshes = new Set();
    
    this.updateRaycaster = () => {
      this.raycaster.set(
        this.camera.position.clone(),
        new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion)
      );
    };
    
    this.checkIntersections = () => {
      this.updateRaycaster();
      
      const intersects = this.raycaster.intersectObjects(this.triggerMeshes);
      
      intersects.forEach(intersect => {
        const mesh = intersect.object;
        if (!this.intersectedMeshes.has(mesh.uuid)) {
          this.intersectedMeshes.add(mesh.uuid);
          this.triggerAnimation(mesh);
        }
      });
      
      this.triggerMeshes.forEach(mesh => {
        if (!intersects.find(i => i.object.uuid === mesh.uuid) && this.intersectedMeshes.has(mesh.uuid)) {
          this.intersectedMeshes.delete(mesh.uuid);
        }
      });
    };
    
    this.triggerAnimation = (mesh) => {
      if (mesh.userData.animations) {
        mesh.userData.animations.forEach(animation => {
          this.playAnimation(animation);
        });
      }
    };
    
    this.createTriggerMesh = (position, size, animations) => {
      const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
      const material = new THREE.MeshBasicMaterial({ 
        visible: false // Make it invisible
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(position);
      mesh.userData.animations = animations;
      
      this.scene.add(mesh);
      this.triggerMeshes.push(mesh);
      
      return mesh;
    };
    
    this.createTriggerMeshesInFrontOfCamera = (animations, distance = 5, count = 5) => {
      this.triggerMeshes.forEach(mesh => this.scene.remove(mesh));
      this.triggerMeshes = [];
      
      const cameraDirection = new THREE.Vector3(0, 0, -1);
      cameraDirection.applyQuaternion(this.camera.quaternion);
      
      for (let i = 0; i < count; i++) {
        const distanceMultiplier = (i + 1) * distance;
        const position = this.camera.position.clone().add(
          cameraDirection.clone().multiplyScalar(distanceMultiplier)
        );
        
        const meshAnimations = animations[i] ? [animations[i]] : 
          animations.length > 0 ? [animations[0]] : ['defaultAnimation'];
        
        this.createTriggerMesh(
          position,
          { x: 3, y: 3, z: 0.5 }, // thin plane perpendicular to camera
          meshAnimations
        );
      }
    };
    
    this.removeTriggerMesh = (mesh) => {
      const index = this.triggerMeshes.indexOf(mesh);
      if (index !== -1) {
        this.triggerMeshes.splice(index, 1);
        this.scene.remove(mesh);
      }
    };
  }
  
  update() {
    this.checkIntersections();
  }
}
