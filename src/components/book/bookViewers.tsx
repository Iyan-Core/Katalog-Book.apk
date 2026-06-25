import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, useTexture } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

interface BookViewerProps {
  pages: string[]; // array URL gambar
  currentPage: number;
  onPageChange?: (page: number) => void;
}

// Komponen halaman individu
function Page({ url, flipped, index }: { url: string; flipped: boolean; index: number }) {
  const texture = useTexture(url);
  const meshRef = useRef<THREE.Mesh>(null);

  // Animasi flip sederhana: rotasi pada sumbu Y jika flipped
  const { rotation } = useSpring({
    rotation: flipped ? Math.PI : 0,
    config: { mass: 1, tension: 170, friction: 26 },
  });

  // Posisi halaman: bergeser sedikit agar terlihat tumpukan
  const posX = index * 0.02;

  return (
    <animated.mesh
      ref={meshRef}
      position={[posX, 0, 0]}
      rotation-y={rotation}
    >
      <planeGeometry args={[1.6, 2.2]} />
      <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
    </animated.mesh>
  );
}

export default function BookViewer({ pages, currentPage, onPageChange }: BookViewerProps) {
  const [flippedPages, setFlippedPages] = useState<boolean[]>(new Array(pages.length).fill(false));

  // Saat currentPage berubah, kita "balik" semua halaman sebelum currentPage
  useEffect(() => {
    const newFlipped = pages.map((_, idx) => idx < currentPage);
    setFlippedPages(newFlipped);
  }, [currentPage, pages]);

  return (
    <div style={{ width: '100%', height: '70vh' }}>
      <Canvas camera={{ position: [0, 0, 3.5], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls enableZoom={true} enablePan={false} />

        {/* Tampilkan setiap halaman */}
        {pages.map((url, idx) => (
          <Page key={idx} url={url} flipped={flippedPages[idx]} index={idx} />
        ))}

        {/* Sampul belakang (opsional) */}
      </Canvas>
    </div>
  );
}
