import { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import { fetchProductsFromFirestore } from '../api/firestore';
import { sendVisitNotification } from '../api/email';
import { Product } from '../types/book';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [visitorEmail, setVisitorEmail] = useState(() => localStorage.getItem('visitorEmail') || '');
  const [showEmailPopup, setShowEmailPopup] = useState(!localStorage.getItem('visitorEmail'));

  // Toast hilang 3 detik
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Ambil lokasi (akan muncul popup izin setelah email diisi)
  const getLocation = (): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { timeout: 5000, enableHighAccuracy: true }
      );
    });
  };

  // Kirim notifikasi dengan lokasi
  const sendNotification = async () => {
    if (!visitorEmail) {
      setToast('❌ Email belum diisi.');
      return;
    }
    try {
      const location = await getLocation();
      await sendVisitNotification('walanton2@gmail.com', {
        visitorEmail,
        userAgent: navigator.userAgent,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        referrer: document.referrer || 'Direct',
        timestamp: new Date().toLocaleString('id-ID'),
        url: window.location.href,
        latitude: location?.lat,
        longitude: location?.lng,
      });
      setToast('✅ Notifikasi terkirim!');
    } catch (err) {
      console.error(err);
      setToast('❌ Gagal kirim notifikasi.');
    }
  };

  // Kirim otomatis setelah email tersimpan
  useEffect(() => {
    if (visitorEmail) {
      sendNotification();
    }
  }, [visitorEmail]);

  // Ambil data produk dari Firestore
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchProductsFromFirestore();
        if (data.length === 0) {
          setError('📭 Collection "products" kosong. Tambahkan data di Firebase Console.');
        } else {
          setProducts(data);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.gender.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (visitorEmail.trim()) {
      localStorage.setItem('visitorEmail', visitorEmail.trim());
      setShowEmailPopup(false);
    }
  };

  // Ganti dengan link shop Anda
  const SHOP_LINK = 'https://shop.example.com';

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
            <h3>❌ Error</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>Coba Lagi</button>
          </div>
        </div>
      </>
    );
  }

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

  return (
    <>
      <Header />
      <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Popup email */}
        {showEmailPopup && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '400px',
              width: '100%',
              textAlign: 'center',
            }}>
              <h3 style={{ marginBottom: '0.5rem' }}>📧 Masukkan Email Anda</h3>
              <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1rem' }}>
                Kami akan mengirim notifikasi ke admin. Email Anda tidak akan disalahgunakan.
              </p>
              <form onSubmit={handleEmailSubmit}>
                <input
                  type="email"
                  placeholder="contoh@email.com"
                  value={visitorEmail}
                  onChange={(e) => setVisitorEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    marginBottom: '1rem',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                  }}
                >
                  Kirim & Lanjutkan
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Toast notifikasi */}
        {toast && (
          <div style={{
            position: 'fixed',
            top: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: toast.includes('✅') ? '#10b981' : '#ef4444',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            zIndex: 9999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            animation: 'fadeInDown 0.3s ease-out',
            fontSize: '0.95rem',
          }}>
            {toast}
          </div>
        )}

        {/* Search bar */}
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

        {/* Grid produk 2 kolom */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
          maxWidth: '800px',
          margin: '0 auto',
        }}>
          {filtered.map((p) => (
            <div
              key={p.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <img
                src={p.coverUrl}
                alt={p.name}
                style={{
                  width: '100%',
                  aspectRatio: '3/4',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              <div style={{ padding: '0.75rem' }}>
                <h3 style={{ fontSize: '1rem', margin: '0 0 0.25rem 0' }}>{p.name}</h3>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    background: '#e5e7eb',
                  }}>
                    {p.gender}
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    background: '#f3f4f6',
                  }}>
                    {p.size}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedProduct(p);
                    setShowPreview(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  👁️ Preview
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            <p>🔍 Tidak ada produk yang sesuai.</p>
          </div>
        )}
      </div>

      {/* Tombol chat ke shop (pojok kanan bawah) */}
      <button
        onClick={() => window.open(SHOP_LINK, '_blank')}
        style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          background: '#25d366',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '56px',
          height: '56px',
          fontSize: '1.8rem',
          cursor: 'pointer',
          zIndex: 999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="Chat dengan kami"
      >
        💬
      </button>

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
                top: 10,
                right: 10,
                background: 'rgba(0,0,0,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: 36,
                height: 36,
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
                  background: '#e5e7eb',
                }}>
                  {selectedProduct.gender}
                </span>
                <span style={{
                  fontSize: '0.85rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  background: '#f3f4f6',
                }}>
                  {selectedProduct.size}
                </span>
              </div>
              <p style={{ fontSize: '1rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {selectedProduct.desc}
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>
  );
}
