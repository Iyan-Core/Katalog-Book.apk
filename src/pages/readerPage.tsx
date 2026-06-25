import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/layout/header';
import BookViewer from '../components/book/bookViewer';
import BookControls from '../components/book/bookControls';
import { useBook } from '../hooks/useBook';

export default function ReaderPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const book = location.state?.book;

  if (!book) {
    return <div>Buku tidak ditemukan. <button onClick={() => navigate('/')}>Kembali</button></div>;
  }

  const { state, nextPage, prevPage } = useBook(book.pages.length);

  return (
    <>
      <Header />
      <div style={{ padding: '1rem' }}>
        <button onClick={() => navigate('/')} style={{ marginBottom: '1rem', background: '#6b7280' }}>
          ← Kembali ke Katalog
        </button>
        <h2>{book.title}</h2>
        <BookViewer pages={book.pages} currentPage={state.currentPage} />
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
