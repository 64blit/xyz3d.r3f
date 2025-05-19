# Issues and Solutions

This document tracks issues encountered during development and their solutions.

## Issue 1: Integrating ScrollTrigger with GSAP
**Description**: ScrollTrigger needs to be registered with GSAP before it can be used.

**Solution**: Import and register ScrollTrigger as a GSAP plugin.

```javascript
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
```

## Issue 2: Implementing camera intersection with 3D meshes
**Description**: Need a way to detect when the camera intersects with 3D meshes to trigger animations.

**Solution**: Create invisible trigger meshes in front of the camera on load and use raycasting to detect intersections.

```javascript
// Implementation in IntersectionManager
```
