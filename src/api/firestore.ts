import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types/book';

export async function fetchProductsFromFirestore(): Promise<Product[]> {
  try {
    console.log('🔥 Mencoba koneksi ke Firestore...');
    
    if (!db) {
      throw new Error('Firestore db tidak terinisialisasi.');
    }

    // 🔥 Coba baca dari collection "products"
    console.log('📂 Mencoba membaca collection: products');
    let querySnapshot = await getDocs(collection(db, 'products'));
    
    // 🔥 Jika kosong, coba dari "product" (tanpa s)
    if (querySnapshot.empty) {
      console.warn('⚠️ Collection "products" kosong, mencoba "product"...');
      querySnapshot = await getDocs(collection(db, 'product'));
    }

    console.log(`📄 Jumlah dokumen ditemukan: ${querySnapshot.size}`);

    if (querySnapshot.empty) {
      return [];
    }

    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`📦 Dokumen ${doc.id}:`, data);
      
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
    throw new Error(`Gagal mengambil data: ${(error as Error).message}`);
  }
}
