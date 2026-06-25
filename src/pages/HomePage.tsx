import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { fetchImagesFromImageKit } from '../api/imagekit';
import { Book } from '../types/book';

export default function HomePage() {
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBook = async () => {
      try {
        setLoading(true);
        const pages = await fetchImagesFromImageKit();
        if (pages.length === 0) {
          setError('Tidak ada gambar ditemukan di folder ImageKit.');
          setBook(null);
        } else {
          setBook({
            id: '1',
            title: 'Katalog Otomatis',
            coverUrl: pages[0],
            pages: pages,
          });
          setError(null);
        }
      } catch (err) {
        console.error(err);
        setError('Terjadi kesalahan saat memuat data dari ImageKit.');
        setBook(null);
      } finally {
        setLoading(false);
      }
    };
    loadBook();
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
          <p style={{ color: 'red' }}>❌ {error}</p>
          <button onClick={() => window.location.reload()}>Coba Lagi</button>
        </div>
      </>
    );
  }

  if (!book) {
    return (
      <>
        <Header />
        <div style={{ padding: '2rem', textAlign: 'center' }}>📭 Belum ada buku tersedia.</div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>📚 Pilih Buku</h2>
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
          <div style={{ border: '1px solid #ccc', borderRadius: '12px', padding: '1rem', width: '200px', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <img src={book.coverUrl} alt={book.title} style={{ width: '100%', borderRadius: '8px' }} />
            <h3>{book.title}</h3>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>{book.pages.length} halaman</p>
            <button onClick={() => navigate('/reader', { state: { book } })} style={{ marginTop: '0.5rem' }}>
              Baca Sekarang
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
