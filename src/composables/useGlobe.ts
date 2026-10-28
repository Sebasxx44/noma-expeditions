import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { GlobeRendering } from '@/types';

const coordinate = (lat: number, lon: number, radius = 1.3): THREE.Vector3 => {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;
  return new THREE.Vector3(-radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
};
const inside = (lat: number, lon: number): boolean => {
  const regions = [
    [[-166, 70], [-120, 73], [-55, 50], [-80, 25], [-100, 16], [-130, 47]],
    [[-80, 12], [-42, -3], [-39, -20], [-72, -56], [-80, -18]],
    [[-18, 36], [36, 31], [51, 12], [31, -35], [12, -30], [-15, 3]],
    [[-12, 39], [10, 71], [160, 66], [145, 30], [110, 6], [70, 8], [43, 38]],
    [[112, -12], [152, -10], [155, -38], [118, -36]],
    [[-52, 60], [-20, 70], [-40, 83], [-62, 78]],
  ];
  return regions.some((polygon) => {
    let hit = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) hit = !hit;
    }
    return hit;
  });
};

export const useGlobe = (): GlobeRendering => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' }); } catch { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 0.25, 4.8);
    const globe = new THREE.Group();
    globe.rotation.set(0.15, 0.1, -0.18);
    scene.add(globe);
    const surface = new THREE.Mesh(new THREE.SphereGeometry(1.28, 48, 32), new THREE.MeshStandardMaterial({ color: '#223c30', roughness: 0.9 }));
    globe.add(surface);
    const grid = new THREE.Mesh(new THREE.SphereGeometry(1.292, 36, 18), new THREE.MeshBasicMaterial({ color: '#7a9880', wireframe: true, transparent: true, opacity: 0.12 }));
    globe.add(grid);
    const positions: number[] = [];
    for (let latitude = -60; latitude < 80; latitude += 3) {
      for (let longitude = -180; longitude < 180; longitude += 3) {
        if (inside(latitude, longitude)) {
          const point = coordinate(latitude, longitude, 1.3);
          positions.push(point.x, point.y, point.z);
        }
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    globe.add(new THREE.Points(geometry, new THREE.PointsMaterial({ color: '#e6dfc9', size: 0.021, transparent: true, opacity: 0.85 })));
    const routeMaterial = new THREE.LineBasicMaterial({ color: '#ec774c', transparent: true, opacity: 0.9 });
    const base = coordinate(40, -74);
    [[-50, -73], [64, -21], [46, 12]].forEach(([latitude, longitude]) => {
      const target = coordinate(latitude, longitude);
      const middle = base.clone().add(target).normalize().multiplyScalar(1.9);
      const curve = new THREE.QuadraticBezierCurve3(base, middle, target);
      globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(50)), routeMaterial));
      const marker = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 10), new THREE.MeshBasicMaterial({ color: '#f5865d' }));
      marker.position.copy(target);
      globe.add(marker);
    });
    scene.add(new THREE.AmbientLight(0xffffff, 2.4));
    const sun = new THREE.DirectionalLight('#fff4d9', 3);
    sun.position.set(-3, 3, 4);
    scene.add(sun);
    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();
    let active = true;
    let frame = 0;
    let previous = 0;
    let targetX = 0;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = (event: PointerEvent) => { targetX = (event.clientX / window.innerWidth - 0.5) * 0.3; };
    window.addEventListener('pointermove', pointer, { passive: true });
    const observer = new IntersectionObserver(([entry]) => { active = entry.isIntersecting; });
    observer.observe(container);
    const draw = (time: number) => {
      if (active) {
        if (!reduced.matches) {
          const delta = Math.min((time - previous) / 1000, 0.05);
          globe.rotation.y += delta * 0.09;
          globe.rotation.x += (targetX - globe.rotation.x) * 0.02;
        }
        renderer.render(scene, camera);
      }
      previous = time;
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    setAvailable(true);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', pointer);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.Line) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material: THREE.Material) => material.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  return { containerRef, available };
};
