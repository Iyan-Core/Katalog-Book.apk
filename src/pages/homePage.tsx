import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/header';

export default function HomePage() {
  const navigate = useNavigate();

  // Contoh data buku (gunakan gambar placeholder)
  const sampleBook = {
    id: '1',
    title: 'Buku Sampel',
    coverUrl: 'https://picsum.photos/seed/book1/400/600',
    pages: [
      'https://picsum.photos/seed/page1/400/600',
      'https://picsum.photos/seed/page2/400/600',
      'https://picsum.photos/seed/page3/400/600',
      'https://picsum.photos/seed/page4/400/600',
    ],
  };

  const handleOpenBook = () => {
    navigate('/reader', { state: { book: sampleBook } });
  };

  return (
    <>
      <Header />
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Pilih Buku</h2>
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '2rem' }}>
          <div style={{ border: '1px solid #ccc', borderRadius: '12px', padding: '1rem', width: '200px' }}>
            <img src={sampleBook.coverUrl} alt="cover" style={{ width: '100%', borderRadius: '8px' }} />
            <h3>{sampleBook.title}</h3>
            <button onClick={handleOpenBook}>Baca Sekarang</button>
          </div>
        </div>
      </div>
    </>
  );
}
