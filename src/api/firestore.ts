import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types/book';

export async function fetchProductsFromFirestore(): Promise<Product[]> {
  try {
    console.log('🔥 Mencoba koneksi ke Firestore...');
    
    if (!db) {
      throw new Error('❌ Firestore db tidak terinisialisasi. Periksa environment variables.');
    }

    // 🔥 Coba baca collection products
    console.log('📂 Mencoba membaca collection: products');
    const querySnapshot = await getDocs(collection(db, 'products'));
    
    console.log(`📄 Jumlah dokumen: ${querySnapshot.size}`);

    if (querySnapshot.empty) {
      return [];
    }

    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      products.push({
        id: doc.id,
        name: data.name || data.nama || 'Produk',
        coverUrl: data.coverUrl || data.imageUrl || '',
        gender: data.gender || data.category || 'Unisex',
        size: data.size ? String(data.size) : '-',
        desc: data.desc || data.description || 'Deskripsi belum tersedia',
      });
    });

    console.log(`✅ Total produk: ${products.length}`);
    return products;
  } catch (error) {
    console.error('❌ Error detail:', error);
    // Lempar error agar ditampilkan di UI
    throw new Error(`Gagal mengambil data: ${(error as Error).message}`);
  }
}
