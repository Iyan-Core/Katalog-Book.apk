import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

interface BookViewerProps {
  pages: string[];
  currentPage: number;
}

export default function BookViewer({ pages, currentPage }: BookViewerProps) {
  const [flippedPages, setFlippedPages] = useState<boolean[]>(new Array(pages.length).fill(false));

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
        {pages.map((url, idx) => (
          <Page key={idx} url={url} flipped={flippedPages[idx]} index={idx} />
        ))}
      </Canvas>
    </div>
  );
}

function Page({ url, flipped, index }: { url: string; flipped: boolean; index: number }) {
  const texture = useTexture(url);
  const { rotation } = useSpring({
    rotation: flipped ? Math.PI : 0,
    config: { mass: 1, tension: 170, friction: 26 },
  });

  const posX = index * 0.02;

  return (
    <animated.mesh position={[posX, 0, 0]} rotation-y={rotation}>
      <planeGeometry args={[1.6, 2.2]} />
      <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
    </animated.mesh>
  );
}
