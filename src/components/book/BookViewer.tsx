import { useState, useEffect, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useTexture, Environment } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

interface BookViewerProps {
  pages: string[];
  currentPage: number;
}

// 🔥 Komponen halaman dengan efek melengkung
function CurvedPage({ 
  url, 
  flipped, 
  index, 
  totalPages 
}: { 
  url: string; 
  flipped: boolean; 
  index: number; 
  totalPages: number;
}) {
  const texture = useTexture(url);
  const meshRef = useRef<THREE.Mesh>(null);
  
  // 🔥 Animasi rotasi dengan spring
  const { rotation } = useSpring({
    rotation: flipped ? Math.PI : 0,
    config: { mass: 1, tension: 180, friction: 30 },
    immediate: false,
  });

  // 🔥 Posisi halaman (efek tumpukan)
  const posX = (index - totalPages / 2) * 0.025;
  const posZ = -Math.abs(index - totalPages / 2) * 0.005;

  // 🔥 Geometri melengkung (curve)
  const geometry = useMemo(() => {
    const width = 1.6;
    const height = 2.2;
    const segments = 20;
    const geometry = new THREE.PlaneGeometry(width, height, segments, 1);
    
    // 🔥 Buat lengkungan seperti buku
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      // 🔥 Buat lengkungan berdasarkan posisi x
      const curve = Math.sin(x * 0.8) * 0.06;
      positions.setZ(i, curve);
    }
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  return (
    <animated.mesh
      ref={meshRef}
      position={[posX, 0, posZ]}
      rotation-y={rotation}
      geometry={geometry}
    >
      <meshStandardMaterial
        map={texture}
        side={THREE.DoubleSide}
        roughness={0.3}
        metalness={0.05}
        transparent={true}
        opacity={1}
      />
    </animated.mesh>
  );
}

// 🔥 Komponen buku utama
export default function BookViewer({ pages, currentPage }: BookViewerProps) {
  const [flippedPages, setFlippedPages] = useState<boolean[]>(
    new Array(pages.length).fill(false)
  );

  // 🔥 Update status flip
  useEffect(() => {
    const newFlipped = pages.map((_, idx) => idx < currentPage);
    setFlippedPages(newFlipped);
  }, [currentPage, pages]);

  // 🔥 Hitung halaman yang ditampilkan (hanya sekitar 10 halaman untuk performa)
  const visiblePages = useMemo(() => {
    const start = Math.max(0, currentPage - 5);
    const end = Math.min(pages.length, currentPage + 6);
    return pages.slice(start, end).map((url, idx) => ({
      url,
      index: start + idx,
      flipped: flippedPages[start + idx] || false,
    }));
  }, [pages, currentPage, flippedPages]);

  // 🔥 Efek ketebalan buku (spine)
  const spineWidth = pages.length * 0.008 + 0.1;

  return (
    <div style={{ 
      width: '100%', 
      height: '80vh', 
      background: 'linear-gradient(135deg, #e8e0d5 0%, #d5cdc2 100%)',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: 'inset 0 0 30px rgba(0,0,0,0.1)',
    }}>
      <Canvas
        camera={{ position: [0, 0.5, 4.5], fov: 40 }}
        frameloop="demand"
        shadows
      >
        {/* 🔥 Pencahayaan profesional */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-3, 4, -2]} intensity={0.6} />
        <pointLight position={[0, 2, 3]} intensity={0.3} />

        <Environment preset="studio" />

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={2}
          maxDistance={8}
          dampingFactor={0.1}
          target={[0, 0, 0]}
        />

        {/* 🔥 Punggung buku (spine) */}
        <mesh position={[-0.85, 0, 0]} castShadow>
          <boxGeometry args={[0.12, 2.4, spineWidth]} />
          <meshStandardMaterial color="#5d4037" roughness={0.8} metalness={0.1} />
        </mesh>

        {/* 🔥 Halaman kiri (statis) */}
        {visiblePages
          .filter(p => !p.flipped)
          .map(({ url, index }) => (
            <CurvedPage
              key={index}
              url={url}
              flipped={false}
              index={index}
              totalPages={pages.length}
            />
          ))}

        {/* 🔥 Halaman kanan (dengan animasi flip) */}
        {visiblePages
          .filter(p => p.flipped)
          .map(({ url, index }) => (
            <CurvedPage
              key={index}
              url={url}
              flipped={true}
              index={index}
              totalPages={pages.length}
            />
          ))}

        {/* 🔥 Efek bayangan bawah */}
        <mesh position={[0, -1.3, 0]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[4, 2]} />
          <shadowMaterial opacity={0.2} />
        </mesh>
      </Canvas>
    </div>
  );
}
