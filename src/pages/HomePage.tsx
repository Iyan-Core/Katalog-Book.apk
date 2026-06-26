import { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import { fetchProductsFromFirestore } from '../api/firestore';
import { Product } from '../types/book';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🚀 Memulai load data...');
        const data = await fetchProductsFromFirestore();
        console.log('📦 Data diterima:', data.length);
        
        if (data.length === 0) {
          setError('⚠️ Collection "products" kosong. Tambahkan data di Firebase Console.');
        } else {
          setProducts(data);
        }
      } catch (err) {
        console.error('❌ Error di HomePage:', err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter produk
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.gender.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <>
        <Header />
        <div style={{ padding: '2rem', textAlign: 'center' }}>⏳ Memuat produk...</div>
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

  // Jika produk kosong
  if (products.length === 0) {
    return (
      <>
        <Header />
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>📭 Belum ada produk. Tambahkan data di collection "products".</p>
        </div>
      </>
    );
  }

  // Tampilan Grid
  return (
    <>
      <Header />
      <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>📚 Katalog Parfum</h2>

        <div style={{ marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
          <input
            type="text"
            placeholder="🔍 Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '1rem',
              outline: 'none',
            }}
          />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
          maxWidth: '800px',
          margin: '0 auto',
        }}>
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              <img
                src={product.coverUrl}
                alt={product.name}
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
                  {product.name}
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    background: product.gender === 'Pria' || product.gender === 'Male' ? '#dbeafe' 
                      : product.gender === 'Wanita' || product.gender === 'Female' ? '#fce4ec' 
                      : '#e8e5f0',
                    color: product.gender === 'Pria' || product.gender === 'Male' ? '#1e40af' 
                      : product.gender === 'Wanita' || product.gender === 'Female' ? '#9c27b0' 
                      : '#4a148c',
                    fontWeight: '500',
                  }}>
                    {product.gender}
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    background: '#f3f4f6',
                    color: '#374151',
                  }}>
                    {product.size}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedProduct(product);
                    setShowPreview(true);
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
                  }}
                >
                  👁️ Preview
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            <p>🔍 Tidak ada produk yang sesuai.</p>
          </div>
        )}
      </div>

      {/* Modal Preview */}
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
          }}
          onClick={() => setShowPreview(false)}
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
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPreview(false)}
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
              }}
            >
              ✕
            </button>
            <img
              src={selectedProduct.coverUrl}
              alt={selectedProduct.name}
              style={{
                width: '100%',
                height: 'auto',
                aspectRatio: '3/4',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            <div style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>{selectedProduct.name}</h2>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{
                  fontSize: '0.85rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  background: selectedProduct.gender === 'Pria' || selectedProduct.gender === 'Male' ? '#dbeafe' 
                    : selectedProduct.gender === 'Wanita' || selectedProduct.gender === 'Female' ? '#fce4ec' 
                    : '#e8e5f0',
                  color: selectedProduct.gender === 'Pria' || selectedProduct.gender === 'Male' ? '#1e40af' 
                    : selectedProduct.gender === 'Wanita' || selectedProduct.gender === 'Female' ? '#9c27b0' 
                    : '#4a148c',
                  fontWeight: '500',
                }}>
                  {selectedProduct.gender}
                </span>
                <span style={{
                  fontSize: '0.85rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  background: '#f3f4f6',
                  color: '#374151',
                }}>
                  {selectedProduct.size}
                </span>
              </div>
              <p style={{ fontSize: '1rem', color: '#374151', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
                {selectedProduct.desc}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
