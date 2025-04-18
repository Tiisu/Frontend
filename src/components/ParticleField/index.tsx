import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface ParticleFieldProps {
  className?: string;
}

const ParticleField: React.FC<ParticleFieldProps> = ({ className }) => {
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
    
    // Create particles
    const particleCount = 500;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount);
    
    const universityBlue = new THREE.Color('#0066cc');
    const universityGold = new THREE.Color('#ffcc00');
    const universityNavy = new THREE.Color('#003366');
    
    // Create particle positions and colors
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Create position in a sphere with some randomness
      let radius, theta, phi;
      
      // Create different distribution patterns
      if (i % 5 === 0) {
        // Some particles in a tighter core
        radius = 2 + Math.random() * 2;
        theta = Math.random() * Math.PI * 2;
        phi = Math.acos(2 * Math.random() - 1);
      } else if (i % 3 === 0) {
        // Some particles in a wider sphere
        radius = 4 + Math.random() * 3;
        theta = Math.random() * Math.PI * 2;
        phi = Math.acos(2 * Math.random() - 1);
      } else if (i % 7 === 0) {
        // Some particles in a ring formation
        radius = 6;
        theta = Math.random() * Math.PI * 2;
        phi = (Math.random() * 0.5 + 0.75) * Math.PI; // Concentrate around the equator
      } else {
        // Rest in a normal distribution
        radius = 3 + Math.random() * 4;
        theta = Math.random() * Math.PI * 2;
        phi = Math.acos(2 * Math.random() - 1);
      }
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      // Determine color - mix between university colors with bias
      let color;
      if (i % 4 === 0) {
        color = new THREE.Color().copy(universityGold);
      } else if (i % 5 === 0) {
        color = new THREE.Color().copy(universityNavy);
      } else {
        // Blend between blue and gold with more blue
        color = new THREE.Color().copy(universityBlue).lerp(universityGold, Math.random() * 0.7);
      }
      
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      
      // Vary particle sizes
      sizes[i] = Math.random() * 0.15 + 0.05;
      
      // Vary particle speeds
      speeds[i] = Math.random() * 0.5 + 0.2;
    }
    
    // Add attributes to geometry
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Custom attribute for animation
    particles.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));
    
    // Create custom shader material for more advanced effects
    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        mousePosition: { value: new THREE.Vector2(0, 0) },
        mouseStrength: { value: 0 }
      },
      vertexShader: `
        attribute float size;
        attribute float speed;
        uniform float time;
        uniform vec2 mousePosition;
        uniform float mouseStrength;
        varying vec3 vColor;
        
        void main() {
          vColor = color;
          
          // Copy position
          vec3 pos = position;
          
          // Add subtle wave motion based on position and time
          float waveX = sin(time * speed + position.x) * 0.1;
          float waveY = cos(time * speed + position.y) * 0.1;
          pos.x += waveX;
          pos.y += waveY;
          
          // Add mouse interaction
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          
          // Calculate distance to mouse in world space (xy plane)
          float distToMouse = length(worldPosition.xy - mousePosition);
          float mouseEffect = max(0.0, 1.0 - distToMouse / 2.0) * mouseStrength;
          
          // Push particles away from mouse
          vec2 dirFromMouse = normalize(worldPosition.xy - mousePosition);
          pos.x += dirFromMouse.x * mouseEffect * speed * 0.5;
          pos.y += dirFromMouse.y * mouseEffect * speed * 0.5;
          
          // Apply position
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          
          // Size attenuation
          gl_PointSize = size * (300.0 / -mvPosition.z);
          
          // Make particles bigger when mouse is near
          gl_PointSize *= (1.0 + mouseEffect * 2.0);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          // Create a circular particle
          float r = distance(gl_PointCoord, vec2(0.5, 0.5));
          if (r > 0.5) discard;
          
          // Smooth edges
          float alpha = 1.0 - smoothstep(0.3, 0.5, r);
          
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    // Create particle system
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Add touch support for mobile
    let isTouching = false;
    
    const handleTouchStart = () => {
      isTouching = true;
    };
    
    const handleTouchEnd = () => {
      isTouching = false;
      // Reset mouse position when touch ends
      targetMouseX = 0;
      targetMouseY = 0;
    };
    
    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        // Convert touch position to normalized coordinates
        targetMouseX = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        targetMouseY = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
      }
    };
    
    // Add touch event listeners
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchmove', handleTouchMove);
    
    // Animation loop
    const clock = new THREE.Clock();
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseStrength = 0;
    let targetMouseStrength = 0;
    
    // Track mouse movement
    const handleMouseMove = (event: MouseEvent) => {
      targetMouseX = (event.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = -(event.clientY / window.innerHeight) * 2 + 1;
      targetMouseStrength = 1.0; // Full strength when mouse is moving
      
      // Start decreasing strength after a delay
      setTimeout(() => {
        targetMouseStrength = 0.0;
      }, 100);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      
      // Smooth mouse movement
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;
      mouseStrength += (targetMouseStrength - mouseStrength) * 0.1;
      
      // Update shader uniforms
      (particleMaterial as THREE.ShaderMaterial).uniforms.time.value = elapsedTime;
      (particleMaterial as THREE.ShaderMaterial).uniforms.mousePosition.value.set(mouseX, mouseY);
      (particleMaterial as THREE.ShaderMaterial).uniforms.mouseStrength.value = mouseStrength;
      
      // Rotate particle system
      particleSystem.rotation.y = elapsedTime * 0.03;
      
      // Subtle tilt based on mouse position
      particleSystem.rotation.x = mouseY * 0.05;
      particleSystem.rotation.z = mouseX * 0.05;
      
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose of geometries and materials
      particles.dispose();
      particleMaterial.dispose();
    };
  }, []);
  
  return (
    <div ref={containerRef} className={`w-full h-full ${className || ''}`}></div>
  );
};

export default ParticleField;
