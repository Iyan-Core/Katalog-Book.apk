import { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import { fetchBooksFromFirestore } from '../api/firestore';
import { Book, ProductDetail } from '../types/book';

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<{ detail: ProductDetail; image: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchBooksFromFirestore();
        setBooks(data);
        if (data.length > 0) {
          setSelectedBookId(data[0].id);
        }
      } catch (err) {
        console.error('Error:', err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const selectedBook = books.find(b => b.id === selectedBookId) || books[0];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handlePreview = (detail: ProductDetail, image: string) => {
    setSelectedProduct({ detail, image });
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setSelectedProduct(null);
  };

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

  if (!selectedBook) {
    return (
      <>
        <Header />
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>📭 Belum ada buku. Tambahkan dokumen di collection "books".</p>
        </div>
      </>
    );
  }

  // Gabungkan pages dengan details
  const products = selectedBook.pages.map((image, index) => ({
    image,
    detail: selectedBook.details[index] || { 
      name: `Produk ${index+1}`, 
      gender: 'Unisex', 
      size: '-', 
      description: 'Deskripsi belum tersedia' 
    }
  }));

  const filteredProducts = products.filter(p =>
    p.detail.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.detail.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.detail.gender.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Header />
      <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>📚 {selectedBook.title}</h2>

        {/* Pilihan buku jika lebih dari 1 */}
        {books.length > 1 && (
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {books.map(book => (
              <button
                key={book.id}
                onClick={() => setSelectedBookId(book.id)}
                style={{
                  padding: '0.4rem 1rem',
                  background: selectedBookId === book.id ? '#3b82f6' : '#e5e7eb',
                  color: selectedBookId === book.id ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                {book.title}
              </button>
            ))}
          </div>
        )}

        <div style={{ marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
          <input
            type="text"
            placeholder="🔍 Cari produk..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '1rem',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
          {searchQuery && (
            <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '0.5rem', textAlign: 'center' }}>
              Menampilkan {filteredProducts.length} dari {products.length} produk
            </p>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
          maxWidth: '800px',
          margin: '0 auto',
        }}>
          {filteredProducts.map(({ image, detail }, index) => (
            <div
              key={index}
              style={{
                background: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              <img
                src={image}
                alt={detail.name}
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
              <div style={{ padding: '0.75rem' }}>
                <h3 style={{ fontSize: '1rem', margin: '0 0 0.25rem 0', fontWeight: '600' }}>
                  {detail.name}
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    background: detail.gender === 'Pria' ? '#dbeafe' : detail.gender === 'Wanita' ? '#fce4ec' : '#e8e5f0',
                    color: detail.gender === 'Pria' ? '#1e40af' : detail.gender === 'Wanita' ? '#9c27b0' : '#4a148c',
                    fontWeight: '500',
                  }}>
                    {detail.gender}
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    background: '#f3f4f6',
                    color: '#374151',
                  }}>
                    {detail.size}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreview(detail, image);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                >
                  👁️ Preview
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            <p>🔍 Tidak ada produk yang sesuai dengan pencarian.</p>
          </div>
        )}
      </div>

      {showPreview && selectedProduct && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
            animation: 'fadeIn 0.3s ease-in',
          }}
          onClick={closePreview}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative',
              animation: 'slideUp 0.3s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closePreview}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(0,0,0,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                fontSize: '1.2rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
            >
              ✕
            </button>
            <img
              src={selectedProduct.image}
              alt={selectedProduct.detail.name}
              style={{
                width: '100%',
                height: 'auto',
                aspectRatio: '3/4',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            <div style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>{selectedProduct.detail.name}</h2>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{
                  fontSize: '0.85rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  background: selectedProduct.detail.gender === 'Pria' ? '#dbeafe' : selectedProduct.detail.gender === 'Wanita' ? '#fce4ec' : '#e8e5f0',
                  color: selectedProduct.detail.gender === 'Pria' ? '#1e40af' : selectedProduct.detail.gender === 'Wanita' ? '#9c27b0' : '#4a148c',
                  fontWeight: '500',
                }}>
                  {selectedProduct.detail.gender}
                </span>
                <span style={{
                  fontSize: '0.85rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  background: '#f3f4f6',
                  color: '#374151',
                }}>
                  {selectedProduct.detail.size}
                </span>
              </div>
              <p style={{ fontSize: '1rem', color: '#374151', lineHeight: '1.6', margin: 0 }}>
                {selectedProduct.detail.description}
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}
