import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function ShaderAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    camera: THREE.Camera
    scene: THREE.Scene
    renderer: THREE.WebGLRenderer
    uniforms: { time: { value: number }; resolution: { value: THREE.Vector2 } }
    animationId: number
  } | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current

    // ── Vertex shader ────────────────────────────────────────────────────────
    const vertexShader = `
      void main() {
        gl_Position = vec4( position, 1.0 );
      }
    `

    // ── Fragment shader — "Gaming vibe" neon rings ───────────────────────────
    const fragmentShader = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;

      // 2D rotation matrix
      mat2 rotate2d(float angle){
          return mat2(cos(angle),-sin(angle),
                      sin(angle),cos(angle));
      }

      // Pseudo-random function
      float random(vec2 st){
          return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*43758.5453123);
      }

      void main(void) {
          vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
          float t = time * 0.1;

          // UV warp — rings breathe and distort
          uv += vec2(sin(uv.y * 4.0 + t * 2.0), cos(uv.x * 4.0 + t * 2.0)) * 0.1;
          uv = rotate2d(t * 0.25) * uv;

          // Core ring accumulation
          float intensity = 0.0;
          float lineWidth = 0.02;

          for(int i = 0; i < 7; i++){
              float i_float = float(i);
              float wave = sin(t * 2.0 + i_float * 0.5) * 0.5 + 0.5;
              intensity += lineWidth / abs(wave - length(uv) + sin(uv.x + uv.y) * 0.1);
          }

          // Neon blue-to-magenta gradient
          vec3 color1 = vec3(0.0, 0.5, 1.0);   // Electric Blue
          vec3 color2 = vec3(1.0, 0.2, 0.5);   // Magenta/Pink

          vec3 baseColor = mix(color1, color2, sin(length(uv) * 2.0 - t) * 0.5 + 0.5);
          vec3 finalColor = baseColor * intensity;

          // Subtle grain for texture
          finalColor += (random(uv + t) - 0.5) * 0.08;

          gl_FragColor = vec4(finalColor, 1.0);
      }
    `

    // ── Three.js scene ───────────────────────────────────────────────────────
    const camera = new THREE.Camera()
    camera.position.z = 1

    const scene = new THREE.Scene()
    const geometry = new THREE.PlaneGeometry(2, 2)

    const uniforms = {
      time: { value: 1.0 },
      resolution: { value: new THREE.Vector2() },
    }

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
    })

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Resize handler
    const onWindowResize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      renderer.setSize(width, height)
      uniforms.resolution.value.x = renderer.domElement.width
      uniforms.resolution.value.y = renderer.domElement.height
    }
    onWindowResize()
    window.addEventListener('resize', onWindowResize, false)

    // Animation loop
    const animate = () => {
      const animationId = requestAnimationFrame(animate)
      uniforms.time.value += 0.05
      renderer.render(scene, camera)
      if (sceneRef.current) sceneRef.current.animationId = animationId
    }

    sceneRef.current = { camera, scene, renderer, uniforms, animationId: 0 }
    animate()

    // Cleanup
    return () => {
      window.removeEventListener('resize', onWindowResize)
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId)
        if (container && renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement)
        }
        renderer.dispose()
      }
      geometry.dispose()
      material.dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ background: '#000', overflow: 'hidden' }}
    />
  )
}

export default ShaderAnimation
