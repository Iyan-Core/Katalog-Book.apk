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
        setError(null);

        // Cek environment variables
        const publicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY;
        const baseUrl = import.meta.env.VITE_IMAGEKIT_BASE_URL;
        const folderPath = import.meta.env.VITE_IMAGEKIT_FOLDER_PATH;

        if (!publicKey) {
          throw new Error('VITE_IMAGEKIT_PUBLIC_KEY tidak diisi. Periksa GitHub Secrets.');
        }
        if (!baseUrl) {
          throw new Error('VITE_IMAGEKIT_BASE_URL tidak diisi. Periksa GitHub Secrets.');
        }
        if (!folderPath) {
          throw new Error('VITE_IMAGEKIT_FOLDER_PATH tidak diisi. Periksa GitHub Secrets.');
        }

        const pages = await fetchImagesFromImageKit();

        if (pages.length === 0) {
          throw new Error(`Tidak ada gambar ditemukan di folder "${folderPath}". Pastikan folder tersebut berisi file gambar.`);
        }

        setBook({
          id: '1',
          title: 'Katalog Otomatis',
          coverUrl: pages[0],
          pages: pages,
        });
      } catch (err) {
        console.error('Error:', err);
        setError((err as Error).message);
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

  if (!book) {
    return (
      <>
        <Header />
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>📭 Tidak ada buku tersedia.</p>
          <button onClick={() => window.location.reload()}>Muat Ulang</button>
        </div>
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
