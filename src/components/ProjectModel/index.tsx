import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface ProjectModelProps {
  className?: string;
  color?: string;
}

const ProjectModel: React.FC<ProjectModelProps> = ({ className, color = '#0066cc' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Set up scene
    const scene = new THREE.Scene();
    
    // Set up camera
    const camera = new THREE.PerspectiveCamera(50, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 2, 5);
    
    // Set up renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const spotLight = new THREE.SpotLight(0xffffff, 1);
    spotLight.position.set(5, 5, 5);
    spotLight.angle = 0.15;
    spotLight.penumbra = 1;
    spotLight.castShadow = true;
    scene.add(spotLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-5, -5, -5);
    scene.add(pointLight);
    
    // Create document group
    const group = new THREE.Group();
    scene.add(group);
    
    // Create a ground plane for better shadow effect
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.5;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Base document with rounded corners
    const baseGeometry = new THREE.BoxGeometry(2, 0.1, 2.8, 1, 1, 1);
    // Modify the geometry to have rounded corners
    baseGeometry.translate(0, 0, 0);
    
    // Create a better material with subtle texture
    const textureLoader = new THREE.TextureLoader();
    const paperTexture = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      roughness: 0.7,
      metalness: 0.1,
      // Add subtle noise to the material
      onBeforeCompile: (shader) => {
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <map_fragment>',
          `
          #include <map_fragment>
          // Add subtle noise pattern
          vec2 uv = vUv * 10.0;
          float noise = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
          diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * (0.95 + noise * 0.1), 0.5);
          `
        );
      }
    });
    
    const baseDocument = new THREE.Mesh(baseGeometry, paperTexture);
    baseDocument.castShadow = true;
    baseDocument.receiveShadow = true;
    group.add(baseDocument);
    
    // Add a subtle edge highlight
    const edgeGeometry = new THREE.BoxGeometry(2.02, 0.11, 2.82);
    const edgeMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xeeeeee,
      transparent: true,
      opacity: 0.5,
      side: THREE.BackSide
    });
    const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
    edge.position.set(0, 0, 0);
    group.add(edge);
    
    // Document content lines with better styling
    const lineGeometry = new THREE.BoxGeometry(1.6, 0.015, 0.08);
    const lineMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xe0e0e0,
      roughness: 0.5,
      metalness: 0.1
    });
    
    // Create different line patterns
    for (let i = 0; i < 8; i++) {
      // Vary line width for more realistic text appearance
      const width = i % 3 === 0 ? 1.2 : (i % 2 === 0 ? 1.4 : 1.6);
      const lineGeom = new THREE.BoxGeometry(width, 0.015, 0.08);
      
      const line = new THREE.Mesh(lineGeom, lineMaterial);
      // Offset some lines for paragraph effect
      const xOffset = i % 4 === 0 ? -0.1 : 0;
      line.position.set(xOffset, 0.06, 0.8 - i * 0.2);
      line.castShadow = true;
      group.add(line);
    }
    
    // Document header with glowing effect
    const headerGeometry = new THREE.BoxGeometry(1.6, 0.03, 0.25);
    const headerMaterial = new THREE.MeshStandardMaterial({ 
      color: new THREE.Color(color),
      roughness: 0.4,
      metalness: 0.6,
      emissive: new THREE.Color(color).multiplyScalar(0.2)
    });
    const header = new THREE.Mesh(headerGeometry, headerMaterial);
    header.position.set(0, 0.06, 1.2);
    header.castShadow = true;
    group.add(header);
    
    // Add a glow effect to the header
    const headerGlow = new THREE.Mesh(
      new THREE.BoxGeometry(1.65, 0.04, 0.3),
      new THREE.MeshBasicMaterial({ 
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide
      })
    );
    headerGlow.position.set(0, 0.06, 1.2);
    group.add(headerGlow);
    
    // University logo/seal with better materials
    const logoGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.03, 32);
    const logoMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffcc00,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x664400,
      emissiveIntensity: 0.2
    });
    const logo = new THREE.Mesh(logoGeometry, logoMaterial);
    logo.position.set(0, 0.06, -1);
    logo.castShadow = true;
    group.add(logo);
    
    // Add embossed details to the seal
    const sealDetailGeometry = new THREE.TorusGeometry(0.3, 0.02, 16, 32);
    const sealDetailMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xddaa00,
      metalness: 0.9,
      roughness: 0.1
    });
    const sealDetail = new THREE.Mesh(sealDetailGeometry, sealDetailMaterial);
    sealDetail.position.set(0, 0.08, -1);
    sealDetail.rotation.x = Math.PI / 2;
    sealDetail.castShadow = true;
    group.add(sealDetail);
    
    // Signature line with ink effect
    const signatureGeometry = new THREE.BoxGeometry(0.8, 0.01, 0.05);
    const signatureMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x333333,
      roughness: 0.3,
      metalness: 0.1
    });
    const signature = new THREE.Mesh(signatureGeometry, signatureMaterial);
    signature.position.set(-0.5, 0.06, -0.5);
    signature.castShadow = true;
    group.add(signature);
    
    // Add a handwritten signature effect
    const curvePoints = [];
    for (let i = 0; i < 20; i++) {
      const t = i / 19;
      // Create a wavy signature-like curve
      curvePoints.push(new THREE.Vector3(
        -0.8 + t * 0.6 + Math.sin(t * 10) * 0.03,
        0.07,
        -0.5 + Math.sin(t * 5) * 0.03
      ));
    }
    
    const signatureCurve = new THREE.CatmullRomCurve3(curvePoints);
    const signaturePathGeometry = new THREE.TubeGeometry(signatureCurve, 20, 0.005, 8, false);
    const signaturePathMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x000066,
      roughness: 0.3,
      metalness: 0.1
    });
    const signaturePath = new THREE.Mesh(signaturePathGeometry, signaturePathMaterial);
    signaturePath.castShadow = true;
    group.add(signaturePath);
    
    // Track mouse for interactive effects
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationY = 0;
    let targetRotationX = 0;
    
    const handleMouseMove = (event: MouseEvent) => {
      // Calculate mouse position relative to the container
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      // Convert to normalized coordinates (-1 to 1)
      mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Set target rotation based on mouse position
      targetRotationY = mouseX * 0.5;
      targetRotationX = mouseY * 0.2;
    };
    
    // Add mouse event listener
    window.addEventListener('mousemove', handleMouseMove);
    
    // Add touch support
    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        // Convert to normalized coordinates (-1 to 1)
        mouseX = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        mouseY = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Set target rotation based on touch position
        targetRotationY = mouseX * 0.5;
        targetRotationX = mouseY * 0.2;
      }
    };
    
    window.addEventListener('touchmove', handleTouchMove);
    
    // Animation loop
    const clock = new THREE.Clock();
    let currentRotationY = 0;
    let currentRotationX = 0;
    
    const animate = () => {
      const t = clock.getElapsedTime();
      
      // Smooth rotation towards target (mouse-controlled)
      currentRotationY += (targetRotationY - currentRotationY) * 0.05;
      currentRotationX += (targetRotationX - currentRotationX) * 0.05;
      
      // Apply rotations
      group.rotation.y = currentRotationY + t * 0.1; // Base rotation + mouse control
      group.rotation.x = currentRotationX;
      
      // Gentle floating animation
      group.position.y = Math.sin(t * 0.5) * 0.1;
      
      // Animate seal glow
      if (sealDetail) {
        sealDetail.rotation.z = t * 0.2;
      }
      
      // Animate header glow
      if (headerGlow) {
        headerGlow.material.opacity = 0.1 + Math.sin(t * 2) * 0.05;
      }
      
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose of all geometries and materials
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
    };
  }, [color]);
  
  return (
    <div ref={containerRef} className={`${className || ''}`}></div>
  );
};

export default ProjectModel;
