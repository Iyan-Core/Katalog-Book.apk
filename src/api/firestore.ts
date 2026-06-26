import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types/book';

export async function fetchProductsFromFirestore(): Promise<Product[]> {
  console.log('🔥 Memulai fetch dari Firestore...');
  
  if (!db) {
    throw new Error('❌ Firestore tidak terinisialisasi. Periksa environment variables.');
  }

  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    console.log(`📄 Jumlah dokumen: ${querySnapshot.size}`);

    if (querySnapshot.empty) {
      console.warn('⚠️ Collection "products" kosong.');
      return [];
    }

    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      products.push({
        id: doc.id,
        name: data.name || 'Produk',
        coverUrl: data.coverUrl || '',
        gender: data.gender || 'Unisex',
        size: data.size ? String(data.size) : '-',
        desc: data.desc || data.description || 'Deskripsi belum tersedia',
      });
    });

    console.log(`✅ Total produk: ${products.length}`);
    return products;
  } catch (error: any) {
    console.error('❌ Error Firestore:', error);
    // Tangkap error spesifik
    if (error.code === 'permission-denied') {
      throw new Error('⛔ Firestore: Izin ditolak. Periksa Rules.');
    } else if (error.code === 'unavailable') {
      throw new Error('⛔ Firestore: Tidak tersedia. Periksa koneksi.');
    } else {
      throw new Error(`⛔ ${error.message}`);
    }
  }
}
