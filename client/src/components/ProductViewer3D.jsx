import React, { useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, Center } from '@react-three/drei';
import * as THREE from 'three';

// The inner 3D model component
function Model({ url, fabricCanvas }) {
  const { scene } = useGLTF(url);
  
  // Create a live texture bridge from the Fabric.js HTML canvas
  const canvasTexture = useMemo(() => {
    if (!fabricCanvas) return null;
    const tex = new THREE.CanvasTexture(fabricCanvas);
    tex.anisotropy = 16; 
    tex.colorSpace = THREE.SRGBColorSpace; 
    
    // THE MAGIC FIX: GLTF files read coordinates upside down. We must disable flipY!
    tex.flipY = false; 
    
    return tex;
  }, [fabricCanvas]);

  // Update texture every frame
  useFrame(() => {
    if (canvasTexture) {
      canvasTexture.needsUpdate = true;
    }
  });

  // Apply texture to the model
  useMemo(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        if (canvasTexture) {
          child.material.map = canvasTexture;
        }
        child.material.needsUpdate = true;
      }
    });
  }, [scene, canvasTexture]);

  return <primitive object={scene} />;
}

// The outer wrapper
export default function ProductViewer3D({ modelUrl, fabricCanvas }) {
  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing bg-gray-50 rounded-xl overflow-hidden">
      
      {/* 1. Camera moved much closer (Z is now 1.5 instead of 2.5) and FOV tightened */}
      <Canvas camera={{ position: [0, 0, 1.5], fov: 40 }}>
        <Environment preset="city" /> 
        
        {/* 2. Zoom limits tightened to prevent the user from zooming out into the void */}
        <OrbitControls 
            autoRotate 
            autoRotateSpeed={1.5} 
            enableZoom={true} 
            enablePan={false} 
            minDistance={1.0}  // Let them zoom in very close
            maxDistance={2.5}  // Stop them from zooming out too far
            minPolarAngle={Math.PI / 4} 
            maxPolarAngle={Math.PI / 1.5} 
        />
        
        <React.Suspense fallback={null}>
          {/* 3. Scale bumped up to 1.6 to ensure it fills the box */}
          <Center scale={2.8}>
            <Model url={modelUrl} fabricCanvas={fabricCanvas} />
          </Center>
        </React.Suspense>
      </Canvas>
    </div>
  );
}