import { useState, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

interface BookViewerProps {
  pages: string[];
  currentPage: number;
}

// 🔧 Komponen halaman dengan cache texture
function Page({ url, flipped, index }: { url: string; flipped: boolean; index: number }) {
  // 📌 useTexture akan otomatis cache berdasarkan URL
  const texture = useTexture(url);
  
  // 📌 Animasi hanya berjalan saat flipped berubah
  const { rotation } = useSpring({
    rotation: flipped ? Math.PI : 0,
    config: { mass: 1, tension: 170, friction: 26 },
    immediate: false, // Tetap pakai animasi
  });

  const posX = index * 0.02;

  return (
    <animated.mesh position={[posX, 0, 0]} rotation-y={rotation}>
      <planeGeometry args={[1.6, 2.2]} />
      <meshStandardMaterial 
        map={texture} 
        side={THREE.DoubleSide}
        // 🔧 Cegah reload texture berlebihan
        attach="material"
      />
    </animated.mesh>
  );
}

export default function BookViewer({ pages, currentPage }: BookViewerProps) {
  // 📌 State flipped halaman
  const [flippedPages, setFlippedPages] = useState<boolean[]>(() => 
    new Array(pages.length).fill(false)
  );

  // 📌 Update flipped hanya saat currentPage berubah
  useEffect(() => {
    setFlippedPages(pages.map((_, idx) => idx < currentPage));
  }, [currentPage, pages]);

  // 📌 Gunakan useMemo untuk mencegah re-render canvas
  const memoizedPages = useMemo(() => pages, [pages]);

  return (
    <div style={{ width: '100%', height: '70vh', background: '#e5e7eb' }}>
      <Canvas 
        camera={{ position: [0, 0, 3.5], fov: 50 }}
        // 🔧 Matikan automatic re-render
        frameloop="demand"
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls 
          enableZoom={true} 
          enablePan={false}
          // 🔧 Stabilkan kontrol
          dampingFactor={0.1}
        />
        {memoizedPages.map((url, idx) => (
          <Page 
            key={idx} 
            url={url} 
            flipped={flippedPages[idx] || false} 
            index={idx} 
          />
        ))}
      </Canvas>
    </div>
  );
}
