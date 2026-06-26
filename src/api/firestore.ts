import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types/book';

export async function fetchProductsFromFirestore(): Promise<Product[]> {
  try {
    // 🔥 Cek koneksi Firebase
    if (!db) {
      throw new Error('Firestore tidak terinisialisasi. Periksa environment variables.');
    }

    const querySnapshot = await getDocs(collection(db, 'products'));
    
    // 🔥 Jika tidak ada dokumen
    if (querySnapshot.empty) {
      console.warn('Collection "products" kosong.');
      return [];
    }

    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Data dokumen:', data); // 🔥 Cek di console browser
      
      products.push({
        id: doc.id,
        name: data.name || data.nama || 'Produk',
        coverUrl: data.coverUrl || data.imageUrl || data.gambar || '',
        gender: data.gender || data.category || 'Unisex',
        size: data.size ? String(data.size) : '-',
        desc: data.desc || data.description || 'Deskripsi belum tersedia',
      });
    });

    return products;
  } catch (error) {
    console.error('Error detail:', error);
    throw new Error(`Gagal ambil data: ${(error as Error).message}`);
  }
}
