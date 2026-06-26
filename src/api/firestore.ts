import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types/book';

export async function fetchProductsFromFirestore(): Promise<Product[]> {
  try {
    console.log('🔥 Mencoba koneksi ke Firestore...');
    
    if (!db) {
      throw new Error('Firestore db tidak terinisialisasi.');
    }

    const productsRef = collection(db, 'products');
    console.log('📂 Mengambil data dari collection: products');

    const querySnapshot = await getDocs(productsRef);
    console.log(`📄 Jumlah dokumen ditemukan: ${querySnapshot.size}`);

    if (querySnapshot.empty) {
      console.warn('⚠️ Collection products kosong.');
      return [];
    }

    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`📦 Dokumen ${doc.id}:`, data);
      
      // 🔥 Baca field dengan fallback
      const product: Product = {
        id: doc.id,
        name: data.name || data.nama || 'Produk',
        coverUrl: data.coverUrl || data.imageUrl || data.gambar || '',
        gender: data.gender || data.category || 'Unisex',
        size: data.size ? String(data.size) : '-',
        desc: data.desc || data.description || 'Deskripsi belum tersedia',
      };
      products.push(product);
    });

    console.log(`✅ Total produk: ${products.length}`);
    return products;
  } catch (error) {
    console.error('❌ Error detail:', error);
    // Lempar error dengan pesan jelas
    throw new Error(`Gagal mengambil data: ${(error as Error).message}`);
  }
}
