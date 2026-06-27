import { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import { fetchProductsFromFirestore } from '../api/firestore';
import { Product } from '../types/book';

type ViewMode = 'categories' | 'products';

export default function HomePage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('categories');
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showZoom, setShowZoom] = useState(false);

  // Ambil data produk dari Firestore
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchProductsFromFirestore();
        if (data.length === 0) {
          setError('📭 Belum ada produk di Firestore.');
        } else {
          setAllProducts(data);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Group produk berdasarkan size
  const sizeGroups = allProducts.reduce((acc, p) => {
    const size = p.size || 'Uncategorized';
    if (!acc[size]) acc[size] = [];
    acc[size].push(p);
    return acc;
  }, {} as Record<string, Product[]>);

  const sizeKeys = Object.keys(sizeGroups);

  // Produk berdasarkan size yang dipilih
  const filteredProducts = selectedSize ? sizeGroups[selectedSize] || [] : [];

  // Fungsi kembali ke daftar kategori
  const goBack = () => {
    setViewMode('categories');
    setSelectedSize(null);
  };

  // Fungsi buka zoom produk
  const openZoom = (product: Product) => {
    setSelectedProduct(product);
    setShowZoom(true);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div style={{ padding: '2rem', textAlign: 'center' }}>⏳ Memuat...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Coba Lagi</button>
        </div>
      </>
    );
  }

  if (allProducts.length === 0) {
    return (
      <>
        <Header />
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>📭 Belum ada produk. Tambahkan data di collection "products".</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #0f0a1a 0%, #1a1028 100%)',
        padding: '2rem 1rem',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

          {/* Tombol kembali (jika di mode produk) */}
          {viewMode === 'products' && (
            <button
              onClick={goBack}
              style={{
                background: 'rgba(255,215,0,0.15)',
                border: '1px solid #d4af37',
                color: '#d4af37',
                padding: '0.5rem 1.2rem',
                borderRadius: '30px',
                fontSize: '0.9rem',
                cursor: 'pointer',
                marginBottom: '1.5rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,215,0,0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,215,0,0.15)';
              }}
            >
              ← Kembali ke Daftar
            </button>
          )}

          {/* Mode Kategori (Cover Card) */}
          {viewMode === 'categories' && (
            <>
              <h2 style={{
                textAlign: 'center',
                color: '#d4af37',
                fontFamily: '"Playfair Display", serif',
                fontSize: '2.5rem',
                fontWeight: '300',
                letterSpacing: '4px',
                marginBottom: '0.5rem',
                textShadow: '0 0 40px rgba(212,175,55,0.1)',
              }}>
                Koleksi Parfum
              </h2>
              <p style={{
                textAlign: 'center',
                color: 'rgba(255,255,255,0.4)',
                fontSize: '0.9rem',
                letterSpacing: '2px',
                marginBottom: '3rem',
              }}>
                Pilih ukuran untuk melihat koleksi
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '2rem',
                maxWidth: '900px',
                margin: '0 auto',
              }}>
                {sizeKeys.map((size) => {
                  const productsInSize = sizeGroups[size];
                  const cover = productsInSize[0]?.coverUrl || '';
                  const count = productsInSize.length;

                  return (
                    <div
                      key={size}
                      onClick={() => {
                        setSelectedSize(size);
                        setViewMode('products');
                      }}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: '20px',
                        border: '1px solid rgba(255,215,0,0.1)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        position: 'relative',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                        e.currentTarget.style.borderColor = 'rgba(255,215,0,0.4)';
                        e.currentTarget.style.boxShadow = '0 16px 48px rgba(212,175,55,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.borderColor = 'rgba(255,215,0,0.1)';
                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)';
                      }}
                    >
                      {cover ? (
                        <img
                          src={cover}
                          alt={size}
                          style={{
                            width: '100%',
                            aspectRatio: '1/1',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          aspectRatio: '1/1',
                          background: 'linear-gradient(135deg, #2a1f3d, #1a1028)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#d4af37',
                          fontSize: '3rem',
                          fontWeight: '100',
                        }}>
                          {size.charAt(0)}
                        </div>
                      )}
                      <div style={{
                        padding: '1.2rem 1rem',
                        textAlign: 'center',
                        borderTop: '1px solid rgba(255,215,0,0.05)',
                      }}>
                        <h3 style={{
                          color: '#ffffff',
                          fontSize: '1.1rem',
                          fontWeight: '400',
                          letterSpacing: '1px',
                          margin: 0,
                        }}>
                          {size}
                        </h3>
                        <p style={{
                          color: 'rgba(255,255,255,0.3)',
                          fontSize: '0.8rem',
                          margin: '0.3rem 0 0',
                        }}>
                          {count} produk
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Mode Produk (Grid 4 Kolom) */}
          {viewMode === 'products' && selectedSize && (
            <>
              <h2 style={{
                color: '#d4af37',
                fontFamily: '"Playfair Display", serif',
                fontSize: '2rem',
                fontWeight: '300',
                letterSpacing: '3px',
                textAlign: 'center',
                marginBottom: '2rem',
              }}>
                {selectedSize}
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1.5rem',
                maxWidth: '1200px',
                margin: '0 auto',
              }}>
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => openZoom(product)}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: '16px',
                      border: '1px solid rgba(255,255,255,0.05)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.03)';
                      e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)';
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(212,175,55,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)';
                    }}
                  >
                    <img
                      src={product.coverUrl}
                      alt={product.name}
                      style={{
                        width: '100%',
                        aspectRatio: '3/4',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                    <div style={{ padding: '0.8rem 0.8rem 1rem' }}>
                      <h4 style={{
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        fontWeight: '400',
                        margin: '0 0 0.2rem',
                        letterSpacing: '0.5px',
                      }}>
                        {product.name}
                      </h4>
                      <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        flexWrap: 'wrap',
                        marginBottom: '0.3rem',
                      }}>
                        <span style={{
                          fontSize: '0.65rem',
                          padding: '0.15rem 0.6rem',
                          borderRadius: '20px',
                          background: 'rgba(212,175,55,0.15)',
                          color: '#d4af37',
                          border: '1px solid rgba(212,175,55,0.1)',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                        }}>
                          {product.gender}
                        </span>
                        <span style={{
                          fontSize: '0.65rem',
                          padding: '0.15rem 0.6rem',
                          borderRadius: '20px',
                          background: 'rgba(255,255,255,0.05)',
                          color: 'rgba(255,255,255,0.4)',
                          border: '1px solid rgba(255,255,255,0.05)',
                        }}>
                          {product.size}
                        </span>
                      </div>
                      <p style={{
                        color: 'rgba(255,255,255,0.3)',
                        fontSize: '0.7rem',
                        margin: 0,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: '1.4',
                      }}>
                        {product.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)' }}>
                  <p>Tidak ada produk untuk ukuran ini.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal Zoom */}
      {showZoom && selectedProduct && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '2rem',
            animation: 'fadeIn 0.3s ease-out',
          }}
          onClick={() => setShowZoom(false)}
        >
          <div
            style={{
              background: 'rgba(20,15,30,0.9)',
              border: '1px solid rgba(212,175,55,0.2)',
              borderRadius: '24px',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative',
              boxShadow: '0 32px 64px rgba(0,0,0,0.8)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowZoom(false)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(255,255,255,0.05)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '1.2rem',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
                zIndex: 10,
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              ✕
            </button>

            <img
              src={selectedProduct.coverUrl}
              alt={selectedProduct.name}
              style={{
                width: '100%',
                aspectRatio: '3/4',
                objectFit: 'cover',
                display: 'block',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
              }}
            />

            <div style={{ padding: '2rem' }}>
              <h2 style={{
                color: '#d4af37',
                fontSize: '1.8rem',
                fontWeight: '300',
                fontFamily: '"Playfair Display", serif',
                margin: '0 0 0.5rem',
                letterSpacing: '1px',
              }}>
                {selectedProduct.name}
              </h2>

              <div style={{
                display: 'flex',
                gap: '0.8rem',
                flexWrap: 'wrap',
                marginBottom: '1rem',
              }}>
                <span style={{
                  fontSize: '0.8rem',
                  padding: '0.2rem 1rem',
                  borderRadius: '20px',
                  background: 'rgba(212,175,55,0.15)',
                  color: '#d4af37',
                  border: '1px solid rgba(212,175,55,0.1)',
                }}>
                  {selectedProduct.gender}
                </span>
                <span style={{
                  fontSize: '0.8rem',
                  padding: '0.2rem 1rem',
                  borderRadius: '20px',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  {selectedProduct.size}
                </span>
                {selectedProduct.kategori && (
                  <span style={{
                    fontSize: '0.8rem',
                    padding: '0.2rem 1rem',
                    borderRadius: '20px',
                    background: 'rgba(255,255,255,0.03)',
                    color: 'rgba(255,255,255,0.3)',
                    border: '1px solid rgba(255,255,255,0.03)',
                  }}>
                    {selectedProduct.kategori}
                  </span>
                )}
              </div>

              <p style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.95rem',
                lineHeight: '1.8',
                margin: 0,
                whiteSpace: 'pre-wrap',
              }}>
                {selectedProduct.desc}
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}
