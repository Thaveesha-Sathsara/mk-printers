import React, { useState, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, Center } from '@react-three/drei';
import * as THREE from 'three';

function getUVBounds(geometry) {
  const uvAttr = geometry.attributes.uv;
  if (!uvAttr) return null;
  let minU = Infinity, minV = Infinity, maxU = -Infinity, maxV = -Infinity;
  for (let i = 0; i < uvAttr.count; i++) {
    const u = uvAttr.getX(i);
    const v = uvAttr.getY(i);
    if (u < minU) minU = u;
    if (u > maxU) maxU = u;
    if (v < minV) minV = v;
    if (v > maxV) maxV = v;
  }
  return { minU, minV, maxU, maxV, spanU: maxU - minU, spanV: maxV - minV };
}

const normalisedGeometries = new WeakSet();

function normaliseAndCenterUVs(geometry, uvBounds) {
  if (normalisedGeometries.has(geometry)) return;
  const uvAttr  = geometry.attributes.uv;
  const posAttr = geometry.attributes.position;
  if (!uvAttr || !uvBounds) return;

  const { minU, minV, spanU, spanV } = uvBounds;
  const newUV = uvAttr.clone();
  for (let i = 0; i < newUV.count; i++) {
    newUV.setXY(
      i,
      (uvAttr.getX(i) - minU) / spanU,
      (uvAttr.getY(i) - minV) / spanV
    );
  }

  if (posAttr) {
    let frontZ = Infinity, frontU = 0.5;
    for (let i = 0; i < posAttr.count; i++) {
      const z = posAttr.getZ(i);
      if (z < frontZ) { frontZ = z; frontU = newUV.getX(i); }
    }
    const uShift = 0.5 - frontU;
    for (let i = 0; i < newUV.count; i++) {
      let u = newUV.getX(i) + uShift;
      u = ((u % 1) + 1) % 1;
      newUV.setX(i, u);
    }
  }

  newUV.needsUpdate = true;
  geometry.setAttribute('uv', newUV);
  normalisedGeometries.add(geometry);
}

function getPrintPhysicalAspect(geometry) {
  geometry.computeBoundingBox();
  const size = new THREE.Vector3();
  geometry.boundingBox.getSize(size);
  const dims = [size.x, size.y, size.z].sort((a, b) => b - a);
  const aspect = dims[0] / dims[1];
  return (isFinite(aspect) && aspect > 0) ? aspect : 1.5;
}

/**
 * Strategy:
 * - Canvas height = 1024px (= print area height)
 * - Canvas width  = 1024 * imgAspect (= natural image width at that height)
 * - Image drawn at full canvas size — NO stretching ever
 * - No repeat/offset tricks — canvas UV maps 1:1
 * - flipY = false, no horizontal mirror — cleanest possible state
 *   (if orientation is wrong we flip exactly one axis below)
 */
function createNaturalTexture(imgElement) {
  const imgAspect = imgElement.naturalWidth / imgElement.naturalHeight;

  const CANVAS_H = 1024;
  const CANVAS_W = Math.round(CANVAS_H * imgAspect);

  const canvas = document.createElement('canvas');
  canvas.width  = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.save();
  ctx.translate(0, CANVAS_H);
  ctx.scale(1, -1);
  ctx.drawImage(imgElement, 0, 0, CANVAS_W, CANVAS_H);
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.flipY      = true; // we already flipped manually above
  tex.wrapS      = THREE.RepeatWrapping;
  tex.wrapT      = THREE.ClampToEdgeWrapping;
  // No repeat, no offset — let it map naturally
  tex.repeat.set(1, 1);
  tex.offset.set(0, 0);
  tex.needsUpdate = true;
  return tex;
}

function Model({ url, userImageUrl, baseColor }) {
  const { scene } = useGLTF(url);
  const [userTex, setUserTex] = useState(null);

  const printAspect = useMemo(() => {
    let aspect = 1.5;
    scene.traverse((child) => {
      if (child.isMesh && child.material?.name === 'MugPrint') {
        const uvBounds = getUVBounds(child.geometry);
        normaliseAndCenterUVs(child.geometry, uvBounds);
        aspect = getPrintPhysicalAspect(child.geometry);
      }
    });
    return aspect;
  }, [scene]);

  useEffect(() => {
    if (!userImageUrl) { setUserTex(null); return; }
    let cancelled = false;
    const img = new Image();
    img.onload  = () => { if (!cancelled) setUserTex(createNaturalTexture(img)); };
    img.onerror = () => { if (!cancelled) setUserTex(null); };
    img.src = userImageUrl;
    return () => { cancelled = true; };
  }, [userImageUrl, printAspect]);

  useEffect(() => {
    scene.traverse((child) => {
      if (!child.isMesh || !child.material) return;
      const mat = child.material;
      if (mat.name === 'MugPrint') {
        mat.color     = new THREE.Color('#ffffff');
        mat.map       = userTex ?? null;
        mat.roughness = 0.25;
        mat.metalness = 0.0;
        mat.needsUpdate = true;
      } else if (mat.name === 'MugBase') {
        mat.color     = new THREE.Color(baseColor);
        mat.map       = null;
        mat.roughness = 0.3;
        mat.metalness = 0.05;
        mat.needsUpdate = true;
      }
    });
  }, [scene, baseColor, userTex]);

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
            <Model
              url={modelUrl}
              userImageUrl={userImageUrl}
              baseColor={baseColor}
            />
          </Center>
        </React.Suspense>
      </Canvas>
    </div>
  );
}