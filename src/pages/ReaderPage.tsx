import { useLocation, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import Header from '../components/layout/Header';
import BookViewer from '../components/book/BookViewer';
import BookControls from '../components/book/BookControls';
import { useBook } from '../hooks/useBook';

export default function ReaderPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const book = location.state?.book;

  // 📌 Memoisasi data buku agar tidak berubah
  const memoizedBook = useMemo(() => book, [book]);

  if (!memoizedBook) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Buku tidak ditemukan.</p>
        <button onClick={() => navigate('/')}>Kembali ke Katalog</button>
      </div>
    );
  }

  const { state, nextPage, prevPage } = useBook(memoizedBook.pages.length);

  return (
    <>
      <Header />
      <div style={{ padding: '1rem' }}>
        <button onClick={() => navigate('/')} style={{ marginBottom: '1rem', background: '#6b7280' }}>
          ← Kembali
        </button>
        <h2 style={{ textAlign: 'center' }}>{memoizedBook.title}</h2>
        <BookViewer 
          pages={memoizedBook.pages} 
          currentPage={state.currentPage} 
        />
        <BookControls
          currentPage={state.currentPage}
          totalPages={state.totalPages}
          onNext={nextPage}
          onPrev={prevPage}
        />
      </div>
    </>
  );
}
