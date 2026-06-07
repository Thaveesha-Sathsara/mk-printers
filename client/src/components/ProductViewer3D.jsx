import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, Center } from '@react-three/drei';
import * as THREE from 'three';

function Model({ url, userImageUrl, baseColor }) {
  const { scene } = useGLTF(url);
  
  // Directly load the image URL into a 3D texture
  const texture = useMemo(() => {
    if (!userImageUrl) return null;
    
    const loader = new THREE.TextureLoader();
    const tex = loader.load(userImageUrl, (loadedTex) => {
      
      // 1. Get the exact dimensions of the uploaded photo
      const imgAspect = loadedTex.image.width / loadedTex.image.height;
      
      // 2. The physical shape of the mug's print area (approx 2.5 times wider than it is tall).
      // TWEAK THIS NUMBER if the image still looks slightly stretched!
      const mugAspect = 2.5; 

      // 3. Compensate for Blender's UV stretching (Object-Fit: Cover)
      if (imgAspect > mugAspect) {
        // Image is too wide (Crop the left/right sides)
        const scale = mugAspect / imgAspect;
        loadedTex.repeat.set(scale, 1);
        loadedTex.offset.set((1 - scale) / 2, 0);
      } else {
        // Image is too tall (Crop the top/bottom for portrait photos)
        const scale = imgAspect / mugAspect;
        loadedTex.repeat.set(1, scale);
        loadedTex.offset.set(0, (1 - scale) / 2);
      }
    });

    // 4. CRITICAL FIX: Stop the 3D engine from repeating/tiling the image at the borders!
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    
    tex.flipY = false; 
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [userImageUrl]);

  // Apply the texture AND color to the model
  useMemo(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        // Apply the uploaded image if it exists
        child.material.map = texture || null;
        
        // Apply the base color (Blue, Red, Black, etc)
        child.material.color = new THREE.Color(baseColor);
        
        child.material.needsUpdate = true;
      }
    });
  }, [scene, texture, baseColor]);

  return <primitive object={scene} />;
}

export default function ProductViewer3D({ modelUrl, userImageUrl, baseColor }) {
  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing bg-gray-50 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 1.5], fov: 40 }}>
        <Environment preset="city" /> 
        <OrbitControls 
            autoRotate 
            autoRotateSpeed={1.5} 
            enableZoom={true} 
            enablePan={false} 
            minDistance={1.0} 
            maxDistance={2.5} 
            minPolarAngle={Math.PI / 4} 
            maxPolarAngle={Math.PI / 1.5} 
        />
        <React.Suspense fallback={null}>
          <Center scale={2.8}>
            <Model url={modelUrl} userImageUrl={userImageUrl} baseColor={baseColor} />
          </Center>
        </React.Suspense>
      </Canvas>
    </div>
  );
}