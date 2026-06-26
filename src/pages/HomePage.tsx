import { useEffect, useState } from 'react';
import emailjs from '@emailjs/browser';
import Header from '../components/layout/Header';
import { fetchProductsFromFirestore } from '../api/firestore';
import { Product } from '../types/book';

// 🔥 Inisialisasi EmailJS
emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '');

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);

  // 🔥 Kirim notifikasi saat user membuka halaman
  useEffect(() => {
    const sendNotification = async () => {
      if (notificationSent) return;
      
      try {
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        
        if (!serviceId || !templateId) {
          console.warn('EmailJS not configured');
          return;
        }

        const templateParams = {
          to_email: 'walanton2@gmail.com', // Ganti dengan email Anda
          user_agent: navigator.userAgent,
          screen_size: `${window.screen.width}x${window.screen.height}`,
          referrer: document.referrer || 'Direct',
          timestamp: new Date().toLocaleString('id-ID'),
          url: window.location.href,
        };

        await emailjs.send(serviceId, templateId, templateParams);
        console.log('✅ Email notifikasi terkirim!');
        setNotificationSent(true);
      } catch (error) {
        console.error('❌ Gagal kirim email:', error);
      }
    };

    sendNotification();
  }, [notificationSent]);

  // 🔥 Ambil data produk dari Firestore
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
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
            <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{error}</p>
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
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>📚 Katalog Parfum</h2>
        <div style={{ marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
          <input
            type="text"
            placeholder="🔍 Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', outline: 'none' }}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', maxWidth: '800px', margin: '0 auto' }}>
          {filtered.map((p) => (
            <div key={p.id} style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <img src={p.coverUrl} alt={p.name} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover' }} />
              <div style={{ padding: '0.75rem' }}>
                <h3 style={{ fontSize: '1rem', margin: '0 0 0.25rem 0' }}>{p.name}</h3>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#e5e7eb' }}>{p.gender}</span>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#f3f4f6' }}>{p.size}</span>
                </div>
                <button onClick={() => { setSelectedProduct(p); setShowPreview(true); }} style={{ width: '100%', padding: '0.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  👁️ Preview
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {showPreview && selectedProduct && (
        <div style={{ position: 'fixed', top:0, left:0, right:0, bottom:0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }} onClick={() => setShowPreview(false)}>
          <div style={{ background: 'white', borderRadius: '16px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflow: 'auto', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowPreview(false)} style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.1)', border: 'none', borderRadius: '50%', width: 36, height: 36, fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            <img src={selectedProduct.coverUrl} alt={selectedProduct.name} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover' }} />
            <div style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>{selectedProduct.name}</h2>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', padding: '0.25rem 0.75rem', borderRadius: '4px', background: '#e5e7eb' }}>{selectedProduct.gender}</span>
                <span style={{ fontSize: '0.85rem', padding: '0.25rem 0.75rem', borderRadius: '4px', background: '#f3f4f6' }}>{selectedProduct.size}</span>
              </div>
              <p style={{ fontSize: '1rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{selectedProduct.desc}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
