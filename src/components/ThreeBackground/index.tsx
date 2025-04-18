import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface ThreeBackgroundProps {
  className?: string;
}

const ThreeBackground: React.FC<ThreeBackgroundProps> = ({ className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Set up scene
    const scene = new THREE.Scene();
    
    // Set up camera
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);
    
    // Set up renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    containerRef.current.appendChild(renderer.domElement);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    const blueLight = new THREE.DirectionalLight(0x0066cc, 0.5);
    blueLight.position.set(-10, -10, -5);
    scene.add(blueLight);
    
    // Create spheres
    const spheres: THREE.Mesh[] = [];
    const colors = ['#0066cc', '#003366', '#0099ff', '#66ccff', '#003399', '#ffcc00'];
    
    // Create more spheres for a richer background
    for (let i = 0; i < 15; i++) {
      // Use different geometries for variety
      let geometry;
      if (i % 5 === 0) {
        // Icosahedron for some spheres
        geometry = new THREE.IcosahedronGeometry(1, 0);
      } else if (i % 7 === 0) {
        // Octahedron for some spheres
        geometry = new THREE.OctahedronGeometry(1, 0);
      } else {
        // Regular spheres for the rest
        geometry = new THREE.SphereGeometry(1, 32, 32);
      }
      
      // Create material with random properties
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colors[Math.floor(Math.random() * colors.length)]),
        roughness: 0.3 + Math.random() * 0.5,
        metalness: 0.1 + Math.random() * 0.3,
        transparent: true,
        opacity: 0.6 + Math.random() * 0.4,
        wireframe: i % 8 === 0 // Some spheres are wireframe
      });
      
      const sphere = new THREE.Mesh(geometry, material);
      
      // Random position in a wider area
      const x = (Math.random() - 0.5) * 15;
      const y = (Math.random() - 0.5) * 15;
      const z = (Math.random() - 0.5) * 10 - 5; // Push spheres back
      
      sphere.position.set(x, y, z);
      
      // Random scale with more variation
      const scale = 0.4 + Math.random() * 2;
      sphere.scale.set(scale, scale, scale);
      
      // Store random properties for animation
      (sphere as any).speed = 0.1 + Math.random() * 0.4;
      (sphere as any).rotationSpeed = 0.005 + Math.random() * 0.02;
      (sphere as any).initialY = y;
      (sphere as any).pulseSpeed = 0.2 + Math.random() * 0.5;
      (sphere as any).pulseIntensity = 0.05 + Math.random() * 0.1;
      
      scene.add(sphere);
      spheres.push(sphere);
    }
    
    // Add connecting lines between some spheres
    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: 0x0066cc, 
      transparent: true, 
      opacity: 0.3 
    });
    
    const connections: THREE.Line[] = [];
    
    // Connect some spheres with lines
    for (let i = 0; i < spheres.length; i++) {
      for (let j = i + 1; j < spheres.length; j++) {
        // Only connect if they're close enough
        const distance = spheres[i].position.distanceTo(spheres[j].position);
        if (distance < 8 && Math.random() > 0.7) {
          const geometry = new THREE.BufferGeometry().setFromPoints([
            spheres[i].position,
            spheres[j].position
          ]);
          
          const line = new THREE.Line(geometry, lineMaterial);
          scene.add(line);
          connections.push(line);
          
          // Store which spheres this line connects
          (line as any).sphereA = spheres[i];
          (line as any).sphereB = spheres[j];
        }
      }
    }
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Track mouse position for interactive effects
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    
    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse coordinates
      targetMouseX = (event.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    // Animation loop
    const clock = new THREE.Clock();
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      
      // Smooth mouse movement
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;
      
      // Update raycaster for hover effects
      mouse.x = mouseX;
      mouse.y = mouseY;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(spheres);
      
      // Reset all spheres to normal state
      spheres.forEach(sphere => {
        if ((sphere.material as THREE.MeshStandardMaterial).emissive) {
          (sphere.material as THREE.MeshStandardMaterial).emissive.set(0x000000);
        }
      });
      
      // Highlight hovered spheres
      intersects.forEach(intersect => {
        if ((intersect.object.material as THREE.MeshStandardMaterial).emissive) {
          (intersect.object.material as THREE.MeshStandardMaterial).emissive.set(0x333333);
        }
      });
      
      // Animate each sphere
      spheres.forEach(sphere => {
        const speed = (sphere as any).speed;
        const initialY = (sphere as any).initialY;
        const rotationSpeed = (sphere as any).rotationSpeed;
        const pulseSpeed = (sphere as any).pulseSpeed;
        const pulseIntensity = (sphere as any).pulseIntensity;
        
        // Rotate sphere
        sphere.rotation.x += rotationSpeed;
        sphere.rotation.y += rotationSpeed * 1.3;
        
        // Floating animation
        sphere.position.y = initialY + Math.sin(elapsedTime * speed * 0.5) * 0.3;
        
        // Subtle size pulsing
        const pulse = Math.sin(elapsedTime * pulseSpeed) * pulseIntensity + 1;
        sphere.scale.set(
          sphere.scale.x * (1 + (pulse - 1) * 0.01),
          sphere.scale.y * (1 + (pulse - 1) * 0.01),
          sphere.scale.z * (1 + (pulse - 1) * 0.01)
        );
        
        // Subtle movement based on mouse position
        sphere.position.x += mouseX * 0.001 * speed;
        sphere.position.z += mouseY * 0.001 * speed;
        
        // Keep spheres within bounds
        if (Math.abs(sphere.position.x) > 10) {
          sphere.position.x *= 0.99;
        }
        if (Math.abs(sphere.position.z) > 10) {
          sphere.position.z *= 0.99;
        }
      });
      
      // Update connecting lines
      connections.forEach(line => {
        const sphereA = (line as any).sphereA;
        const sphereB = (line as any).sphereB;
        
        // Update line vertices to follow spheres
        const positions = line.geometry.attributes.position.array as Float32Array;
        positions[0] = sphereA.position.x;
        positions[1] = sphereA.position.y;
        positions[2] = sphereA.position.z;
        positions[3] = sphereB.position.x;
        positions[4] = sphereB.position.y;
        positions[5] = sphereB.position.z;
        
        line.geometry.attributes.position.needsUpdate = true;
      });
      
      // Subtle camera movement
      camera.position.x = Math.sin(elapsedTime * 0.1) * 0.5;
      camera.position.y = Math.cos(elapsedTime * 0.1) * 0.5;
      camera.lookAt(0, 0, 0);
      
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose of geometries and materials
      spheres.forEach(sphere => {
        sphere.geometry.dispose();
        (sphere.material as THREE.Material).dispose();
      });
      
      // Dispose of connections
      connections.forEach(line => {
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
      });
    };
  }, []);
  
  return (
    <div ref={containerRef} className={`fixed inset-0 -z-10 ${className || ''}`}></div>
  );
};

export default ThreeBackground;
