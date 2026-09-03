"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { AlertCircle } from "lucide-react";

interface ThreeSceneProps {
  content: string;
}

export default function ThreeScene({ content }: ThreeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    let active = true;
    let renderer: THREE.WebGLRenderer | null = null;
    let animationFrameId: number;
    const currentContainer = containerRef.current;

    // Track user drag interaction
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotationSpeedX = 0.01;
    let rotationSpeedY = 0.015;
    let targetRotationX = 0;
    let targetRotationY = 0;

    let geometry: THREE.BufferGeometry | null = null;
    let material: THREE.MeshStandardMaterial | null = null;
    let handleMouseDown: (e: MouseEvent) => void;
    let handleMouseMove: (e: MouseEvent) => void;
    let handleMouseUp: () => void;
    let resizeObserver: ResizeObserver | null = null;

    const initThree = () => {
      try {
        // 1. Safe parsing of the JS config object
        const fn = new Function(`
          return (${content});
        `);
        const config = fn();

        if (typeof config !== "object" || config === null) {
          throw new Error("Configuration must be a JavaScript object literal.");
        }

        const shape = config.shape || "torusKnot";
        const color = config.color || "#8b5cf6";
        const wireframe = !!config.wireframe;
        const scale = typeof config.scale === "number" ? config.scale : 1.2;
        rotationSpeedX = typeof config.rotationSpeedX === "number" ? config.rotationSpeedX : 0.01;
        rotationSpeedY = typeof config.rotationSpeedY === "number" ? config.rotationSpeedY : 0.015;

        setError(null);

        // 2. Setup Three.js Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#09090b");

        // 3. Camera Setup
        const width = currentContainer.clientWidth || 500;
        const height = currentContainer.clientHeight || 500;
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.z = 8;

        // 4. Renderer Setup
        renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current!,
          antialias: true,
          alpha: false,
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // 5. Lighting Setup
        const ambientLight = new THREE.AmbientLight("#1e1b4b", 1.5);
        scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight("#06b6d4", 3, 50);
        pointLight1.position.set(5, 5, 5);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight("#ec4899", 2, 50);
        pointLight2.position.set(-5, -5, 5);
        scene.add(pointLight2);

        const dirLight = new THREE.DirectionalLight("#ffffff", 1);
        dirLight.position.set(0, 5, 10);
        scene.add(dirLight);

        // 6. Geometry Selection
        switch (shape) {
          case "cube":
            geometry = new THREE.BoxGeometry(2, 2, 2);
            break;
          case "sphere":
            geometry = new THREE.SphereGeometry(1.5, 64, 64);
            break;
          case "torus":
            geometry = new THREE.TorusGeometry(1.2, 0.4, 32, 100);
            break;
          case "torusKnot":
          default:
            geometry = new THREE.TorusKnotGeometry(1.0, 0.35, 120, 16);
            break;
        }

        // 7. Material Setup (MeshStandardMaterial for glowing reflections)
        material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(color),
          wireframe: wireframe,
          roughness: 0.15,
          metalness: 0.85,
          flatShading: shape === "cube",
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.scale.set(scale, scale, scale);
        scene.add(mesh);

        // 8. Grid Helper for futuristic visual baseline
        const gridHelper = new THREE.GridHelper(10, 20, "#27272a", "#18181b");
        gridHelper.position.y = -2.5;
        scene.add(gridHelper);

        // 9. Interactive Drag to Rotate Event Listeners
        handleMouseDown = (e: MouseEvent) => {
          isDragging = true;
          previousMousePosition = {
            x: e.clientX,
            y: e.clientY,
          };
        };

        handleMouseMove = (e: MouseEvent) => {
          if (!isDragging) return;
          const deltaMove = {
            x: e.clientX - previousMousePosition.x,
            y: e.clientY - previousMousePosition.y,
          };

          targetRotationY += deltaMove.x * 0.005;
          targetRotationX += deltaMove.y * 0.005;

          previousMousePosition = {
            x: e.clientX,
            y: e.clientY,
          };
        };

        handleMouseUp = () => {
          isDragging = false;
        };

        currentContainer.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        // 10. Animation Loop
        const animate = () => {
          if (!active) return;
          animationFrameId = requestAnimationFrame(animate);

          // Apply auto rotation + drag rotation smoothing
          if (!isDragging) {
            mesh.rotation.y += rotationSpeedY;
            mesh.rotation.x += rotationSpeedX;
          } else {
            mesh.rotation.y += (targetRotationY - mesh.rotation.y) * 0.1;
            mesh.rotation.x += (targetRotationX - mesh.rotation.x) * 0.1;
          }

          if (renderer) {
            renderer.render(scene, camera);
          }
        };

        animate();

        // 11. Responsive resize observer
        resizeObserver = new ResizeObserver((entries) => {
          if (!entries || entries.length === 0 || !renderer) return;
          const { width: newWidth, height: newHeight } = entries[0].contentRect;
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        });
        resizeObserver.observe(currentContainer);

      } catch (err: unknown) {
        if (active) {
          const errMsg = err instanceof Error ? err.message : String(err);
          setError(errMsg || "Three.js Syntax/Rendering Error.");
        }
      }
    };

    const timer = setTimeout(initThree, 0);

    // Cleanup function
    return () => {
      active = false;
      clearTimeout(timer);
      cancelAnimationFrame(animationFrameId);
      
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      
      if (currentContainer && handleMouseDown) {
        currentContainer.removeEventListener("mousedown", handleMouseDown);
      }
      if (handleMouseMove) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
      if (handleMouseUp) {
        window.removeEventListener("mouseup", handleMouseUp);
      }

      // Dispose WebGL resources to avoid leaks
      if (geometry) geometry.dispose();
      if (material) material.dispose();
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [content]);

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center bg-[#09090b] overflow-hidden select-none cursor-grab active:cursor-grabbing">
      {error ? (
        <div className="glass-accent rounded-xl border border-destructive/20 p-5 max-w-lg text-left glow-accent m-4 select-text">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-foreground font-mono">Three.js Object Configuration Error</h4>
              <p className="mt-2 text-xs font-mono text-muted-foreground leading-relaxed whitespace-pre-wrap max-h-40 overflow-x-auto">
                {error}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <canvas ref={canvasRef} className="w-full h-full block" />
      )}
    </div>
  );
}
