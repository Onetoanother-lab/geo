---
name: webgl-performance
description: Use only if a WebGL/Three.js scene is proposed or added to this project — progressive enhancement, lazy loading, disposal, DPR limits and 2D fallback.
---

# WebGL performance (project rules)

The current build deliberately uses **no WebGL**: SVG + Canvas 2D carry the atmosphere, which keeps school laptops and projectors reliable. Adding WebGL requires a clear storytelling gain that SVG/Canvas cannot deliver.

If you add a WebGL scene:
- Lazy-load it with `React.lazy` + dynamic `import('three')`; it must not be in the initial chunk.
- Feature-detect (`WebGL2RenderingContext`), and render the existing 2D scene as the fallback on failure or when `reduced` is true.
- `renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))`; textures ≤ 2048px, compressed.
- Render on demand: pause the loop when the scene is offscreen (IntersectionObserver) or the tab is hidden.
- Dispose geometries, materials, textures and the renderer on unmount.
- Particles: hundreds, not tens of thousands. Measure with the Performance panel at 4× CPU throttle before keeping an effect.
