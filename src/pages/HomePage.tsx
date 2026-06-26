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
  
  const [visitorEmail, setVisitorEmail] = useState(() => sessionStorage.getItem('visitorEmail') || '');
  const [showEmailPopup, setShowEmailPopup] = useState(!sessionStorage.getItem('visitorEmail'));
  const [locationDenied, setLocationDenied] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const sendNotification = async (email: string, loc: { lat: number; lng: number } | null) => {
    try {
      await sendVisitNotification('walanton2@gmail.com', {
        visitorEmail: email,
        userAgent: navigator.userAgent,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        referrer: document.referrer || 'Direct',
        timestamp: new Date().toLocaleString('id-ID'),
        url: window.location.href,
        latitude: loc?.lat ?? undefined,
        longitude: loc?.lng ?? undefined,
      });
      setToast('✅ Notifikasi terkirim!');
    } catch {
      setToast('❌ Gagal kirim notifikasi.');
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = visitorEmail.trim();
    if (!cleanEmail) {
      setToast('❌ Email wajib diisi.');
      return;
    }

    if (!navigator.geolocation) {
      bypassAccess(cleanEmail, null);
      return;
    }

    // 🔥 SOLUSI UTAMA SAMSUNG: Panggil Geolocation SEGERA di baris pertama tanpa interupsi state
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        
        // State diubah HANYA setelah sukses mendapatkan koordinat
        sessionStorage.setItem('visitorEmail', cleanEmail);
        setShowEmailPopup(false);
        setLocationDenied(false);
        setIsRequestingLocation(false);
        
        sendNotification(cleanEmail, loc);
      },
      (err) => {
        console.warn("Geolocation bermasalah/ditolak perangkat:", err.message);
        // Fallback bypass jika perangkat memblokir pop-up izin browser
        bypassAccess(cleanEmail, null);
      },
      { 
        enableHighAccuracy: false, // Diset false agar HP Samsung tidak hang/timeout saat mengunci sinyal GPS
        timeout: 6000, 
        maximumAge: 0 
      }
    );

    // Set indikator loading setelah geolokasi dipicu secara sinkron
    setIsRequestingLocation(true);
    setToast('📍 Meminta izin lokasi...');
  };

  // Fungsi helper bypass khusus perangkat ketat (Menghapus parameter 'pesanLog' agar lolos build)
  const bypassAccess = (email: string, loc: null) => {
    sessionStorage.setItem('visitorEmail', email);
    setShowEmailPopup(false);
    setLocationDenied(false); 
    setIsRequestingLocation(false);
    setToast('⚠️ Melanjutkan dengan akses standar.');
    sendNotification(email, loc);
  };

  // Load produk dari Firestore setelah verifikasi lolos
  useEffect(() => {
    if (showEmailPopup || locationDenied) return;

    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchProductsFromFirestore();
        if (data.length === 0) {
          setError('📭 Collection "products" kosong.');
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
  }, [showEmailPopup, locationDenied]);

  // 🔍 FILTER SEARCH GLOBAL AMAN (Anti-Crash & Sensitif)
  const filtered = products.filter(p => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const name = String(p.name ?? '').toLowerCase();
    const desc = String(p.desc ?? '').toLowerCase();
    const gender = String(p.gender ?? '').toLowerCase();
    const size = String(p.size ?? '').toLowerCase();
    // @ts-ignore
    const aroma = String(p.aroma ?? '').toLowerCase();

    return (
      name.includes(query) ||
      desc.includes(query) ||
      gender.includes(query) ||
      size.includes(query) ||
      aroma.includes(query)
    );
  });

  const SHOP_LINK = 'https://shop.example.com'; 

  // ========== RENDER LOGIC ==========
  let content;

  if (locationDenied) {
    content = (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.95)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, padding: '1rem',
      }}>
        <div style={{
          background: 'white', borderRadius: '16px', padding: '2rem',
          maxWidth: '400px', width: '100%', textAlign: 'center',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🚫</div>
          <h3 style={{ color: '#1f2937', margin: '0 0 0.5rem' }}>Akses Ditolak</h3>
          <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1.5rem' }}>
            Anda wajib memberikan izin lokasi untuk dapat mengakses dan melihat katalog produk kami.
          </p>
          <button
            onClick={() => {
              setLocationDenied(false);
              setShowEmailPopup(true);
            }}
            style={{
              padding: '0.75rem 2rem', background: '#ef4444', color: 'white',
              border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer',
              width: '100%', fontWeight: 'bold'
            }}
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  } else if (showEmailPopup) {
    content = (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, padding: '1rem',
      }}>
        <div style={{
          background: 'white', borderRadius: '16px', padding: '2rem',
          maxWidth: '400px', width: '100%', textAlign: 'center',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
        }}>
          <h3 style={{ color: '#1f2937', margin: '0 0 0.5rem' }}>📧 Verifikasi Akses</h3>
          <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1.5rem' }}>
            Silakan masukkan email Anda untuk melanjutkan ke halaman katalog.
          </p>
          <form onSubmit={handleEmailSubmit}>
            <input
              type="email"
              placeholder="contoh@email.com"
              value={visitorEmail}
              onChange={(e) => setVisitorEmail(e.target.value)}
              disabled={isRequestingLocation}
              required
              style={{
                width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb',
                borderRadius: '8px', fontSize: '1rem', marginBottom: '1.25rem',
                outline: 'none', boxSizing: 'border-box'
              }}
            />
            <button
              type="submit"
              disabled={isRequestingLocation}
              style={{
                width: '100%', padding: '0.75rem', 
                background: isRequestingLocation ? '#9ca3af' : '#3b82f6',
                color: 'white', border: 'none', borderRadius: '8px',
                fontSize: '1rem', cursor: isRequestingLocation ? 'not-allowed' : 'pointer', 
                fontWeight: 'bold'
              }}
            >
              {isRequestingLocation ? '📍 Memverifikasi...' : 'Masuk Katalog'}
            </button>
          </form>
        </div>
      </div>
    );
  } else if (loading) {
    content = <div style={{ padding: '3rem', textAlign: 'center', color: '#4b5563' }}>⏳ Memuat katalog produk...</div>;
  } else if (error) {
    content = (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ background: '#fef2f2', color: '#991b1b', padding: '1.5rem', borderRadius: '8px', maxWidth: '600px', margin: '0 auto' }}>
          <h3>❌ Terjadi Error</h3>
          <p style={{ color: '#ef4444', fontWeight: '500' }}>{error}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: '1rem', padding: '0.6rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Muat Ulang</button>
        </div>
      </div>
    );
  } else {
    content = (
      <>
        <div style={{ marginBottom: '1.5rem', maxWidth: '500px', margin: '1.5rem auto' }}>
          <input
            type="text"
            placeholder="🔍 Cari produk, ukuran, atau aroma..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '0.75rem 1rem', border: '2px solid #e5e7eb',
              borderRadius: '8px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem', maxWidth: '800px', margin: '0 auto', padding: '0 1rem 5rem'
        }}>
          {filtered.map((p) => (
            <div
              key={p.id}
              style={{
                background: 'white', borderRadius: '12px',
                overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <img
                src={p.coverUrl}
                alt={p.name}
                style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' }}
              />
              <div style={{ padding: '0.75rem' }}>
                <h3 style={{ fontSize: '1rem', margin: '0 0 0.25rem 0', color: '#1f2937' }}>{p.name}</h3>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#e5e7eb', color: '#374151' }}>{p.gender}</span>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#f3f4f6', color: '#374151' }}>{p.size}</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedProduct(p);
                    setShowPreview(true);
                  }}
                  style={{
                    width: '100%', padding: '0.5rem', background: '#3b82f6',
                    color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'
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

        <button
          onClick={() => window.open(SHOP_LINK, '_blank')}
          style={{
            position: 'fixed', bottom: '1.5rem', right: '1.5rem',
            background: '#25d366', color: 'white', border: 'none',
            borderRadius: '50%', width: '56px', height: '56px',
            fontSize: '1.8rem', cursor: 'pointer', zIndex: 999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          title="Chat dengan kami"
        >
          💬
        </button>

        {showPreview && selectedProduct && (
          <div
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.7)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem',
            }}
            onClick={() => setShowPreview(false)}
          >
            <div
              style={{
                background: 'white', borderRadius: '16px', maxWidth: '500px',
                width: '100%', maxHeight: '90vh', overflow: 'auto', position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowPreview(false)}
                style={{
                  position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.1)',
                  border: 'none', borderRadius: '50%', width: 36, height: 36,
                  fontSize: '1.2rem', cursor: 'pointer',
                }}
              >
                ✕
              </button>
              <img
                src={selectedProduct.coverUrl}
                alt={selectedProduct.name}
                style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' }}
              />
              <div style={{ padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>{selectedProduct.name}</h2>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', padding: '0.25rem 0.75rem', borderRadius: '4px', background: '#e5e7eb' }}>{selectedProduct.gender}</span>
                  <span style={{ fontSize: '0.85rem', padding: '0.25rem 0.75rem', borderRadius: '4px', background: '#f3f4f6' }}>{selectedProduct.size}</span>
                </div>
                <p style={{ fontSize: '1rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', color: '#4b5563' }}>{selectedProduct.desc}</p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <Header />
      {toast && (
        <div style={{
          position: 'fixed', top: '1rem', left: '50%', transform: 'translateX(-50%)',
          background: toast.includes('✅') ? '#10b981' : (toast.includes('⚠️') ? '#f59e0b' : '#ef4444'), color: 'white',
          padding: '0.75rem 1.5rem', borderRadius: '8px', zIndex: 10000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)', maxWidth: '90%', textAlign: 'center',
          animation: 'fadeInDown 0.3s ease-out', fontWeight: '500'
        }}>
          {toast}
        </div>
      )}
      {content}
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>
  );
}
