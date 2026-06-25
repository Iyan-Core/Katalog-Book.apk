import { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import { fetchImagesFromImageKit } from '../api/imagekit';
import { Book } from '../types/book';

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        const pages = await fetchImagesFromImageKit();

        if (pages.length === 0) {
          throw new Error('Tidak ada produk ditemukan.');
        }

        // 🔥 Buat 1 buku dengan semua halaman sebagai produk
        setBooks([{
          id: '1',
          title: 'Katalog Parfum',
          coverUrl: pages[0],
          pages: pages,
        }]);
      } catch (err) {
        console.error('Error:', err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    loadBooks();
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <div style={{ padding: '2rem', textAlign: 'center' }}>⏳ Memuat katalog...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ background: '#fef2f2', color: '#991b1b', padding: '1.5rem', borderRadius: '8px', maxWidth: '600px', margin: '0 auto' }}>
            <h3>❌ Gagal Memuat Data</h3>
            <p style={{ marginTop: '0.5rem', wordBreak: 'break-word' }}>{error}</p>
            <button onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>
              Coba Lagi
            </button>
          </div>
        </div>
      </>
    );
  }

  if (books.length === 0) {
    return (
      <>
        <Header />
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>📭 Belum ada produk.</p>
        </div>
      </>
    );
  }

  const book = books[0];

  return (
    <>
      <Header />
      <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>📚 {book.title}</h2>
        
        {/* 🔥 Grid 2 Kolom (Responsif) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
          maxWidth: '800px',
          margin: '0 auto',
        }}>
          {book.pages.map((url, index) => (
            <div
              key={index}
              style={{
                background: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s',
                cursor: 'pointer',
              }}
              onClick={() => {
                // 🔥 Klik untuk melihat detail (opsional)
                console.log('Produk:', index);
              }}
            >
              <img
                src={url}
                alt={`Produk ${index + 1}`}
                style={{
                  width: '100%',
                  height: 'auto',
                  aspectRatio: '3/4',
                  objectFit: 'cover',
                  display: 'block',
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400?text=Error';
                }}
              />
              <div style={{ padding: '0.5rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>
                  Produk {index + 1}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
