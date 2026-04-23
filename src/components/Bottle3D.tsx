import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float, MeshDistortMaterial, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

const BottleModel = () => {
  const meshRef = useRef<THREE.Group>(null);

  // Slow rotation for idling
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Bottle Body - Glass */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 2.5, 32]} />
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.5}
          chromaticAberration={0.02}
          anisotropy={0.1}
          distortion={0}
          distortionScale={0}
          temporalDistortion={0}
          clearcoat={1}
          attenuationDistance={0.5}
          attenuationColor="#ffffff"
          color="#ffffff"
        />
      </mesh>

      {/* Liquid Contents */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.75, 0.75, 2.2, 32]} />
        <meshPhysicalMaterial
          color="#d4af37"
          roughness={0}
          metalness={0.1}
          transmission={0.5}
          thickness={0.2}
          ior={1.4}
        />
      </mesh>

      {/* Golden Cap / Collar */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.85, 0.85, 0.4, 32]} />
        <meshStandardMaterial
          color="#d4af37"
          metalness={0.9}
          roughness={0.1}
          envMapIntensity={1}
        />
      </mesh>

      {/* Dropper Bulb (Top) */}
      <mesh position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 1.5]} />
        <meshStandardMaterial
          color="#111111"
          roughness={0.2}
          metalness={0}
        />
      </mesh>

      {/* Internal Stem */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 1.8, 16]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.9}
          thickness={0.1}
          opacity={0.3}
          transparent
        />
      </mesh>

      {/* X Logo Label (Simple mesh for now) */}
      <mesh position={[0, -0.5, 0.81]} rotation={[0, 0, 0]}>
        <planeGeometry args={[1, 0.4]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.8} side={THREE.DoubleSide} />
        {/* We would ideally use a texture here, but for now a black band */}
      </mesh>
    </group>
  );
};

export const Bottle3D = () => {
  return (
    <div className="w-full h-full min-h-[400px] cursor-grab active:cursor-grabbing">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={35} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        {/* High-end environmental reflection simulation */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <shadowMaterial transparent opacity={0.4} />
        </mesh>

        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <BottleModel />
        </Float>

        <OrbitControls 
          enableZoom={false} 
          minPolarAngle={Math.PI / 3} 
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
};
