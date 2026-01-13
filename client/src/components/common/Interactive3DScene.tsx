'use client';

// React Three Fiber geçici olarak devre dışı - SSR sorunları nedeniyle
// import { Suspense, useRef, useState, useEffect } from 'react';
// import { Canvas, useFrame } from '@react-three/fiber';
// import { OrbitControls, Environment } from '@react-three/drei';
// import * as THREE from 'three';

// 3D component'ler geçici olarak devre dışı
// /**
//  * 3D sahne içinde dönen ekipman modeli
//  */
// function RotatingEquipment({ position, color = '#0066CC' }: { position: [number, number, number]; color?: string }) {
//   const meshRef = useRef<THREE.Mesh>(null);
//
//   useFrame((state) => {
//     if (meshRef.current) {
//       meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
//       meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
//     }
//   });
//
//   return (
//     <mesh ref={meshRef} position={position}>
//       <boxGeometry args={[2, 2, 2]} />
//       <meshStandardMaterial
//         color={color}
//         roughness={0.1}
//         metalness={0.8}
//         emissive={color}
//         emissiveIntensity={0.3}
//       />
//     </mesh>
//   );
// }
//
// /**
//  * 3D sahne içinde parçacık efekti
//  */
// function Particles({ count = 100 }: { count?: number }) {
//   const mesh = useRef<THREE.Points>(null);
//   const [particles] = useState(() => {
//     const positions = new Float32Array(count * 3);
//     for (let i = 0; i < count * 3; i++) {
//       positions[i] = (Math.random() - 0.5) * 20;
//     }
//     return positions;
//   });
//
//   useFrame((state) => {
//     if (mesh.current) {
//       mesh.current.rotation.x = state.clock.elapsedTime * 0.05;
//       mesh.current.rotation.y = state.clock.elapsedTime * 0.1;
//     }
//   });
//
//   return (
//     <points ref={mesh}>
//       <bufferGeometry>
//         <bufferAttribute
//           attach="attributes-position"
//           count={count}
//           array={particles}
//           itemSize={3}
//         />
//       </bufferGeometry>
//       <pointsMaterial size={0.1} color="#0066CC" transparent opacity={0.6} />
//     </points>
//   );
// }

/**
 * İnteraktif 3D sahne component'i
 * Geçici olarak devre dışı - SSR sorunları nedeniyle
 * Yerine animasyonlu gradient gösteriliyor
 */
export default function Interactive3DScene({
  className = '',
  showControls = true,
}: {
  className?: string;
  showControls?: boolean;
}) {
  // Geçici olarak sadece animasyonlu gradient göster
  return (
    <div className={`w-full h-full ${className} relative overflow-hidden`}>
      {/* Animasyonlu gradient arka plan */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0066CC]/30 via-[#00C49F]/20 to-[#FFBB28]/10 animate-pulse" />
      
      {/* Parallax efektli parçacıklar (CSS ile) */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#0066CC]/20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
      </div>
      
      {/* Glow efekti */}
      <div className="absolute inset-0 bg-gradient-radial from-[#0066CC]/10 via-transparent to-transparent animate-pulse" />
    </div>
  );
}
