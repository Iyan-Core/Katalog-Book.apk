import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types/book';

export async function fetchProductsFromFirestore(): Promise<Product[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      products.push({
        id: doc.id,
        name: data.name || 'Produk',
        coverUrl: data.coverUrl || '',
        gender: data.gender || data.category || 'Unisex',
        size: data.size ? String(data.size) : '-',
        desc: data.desc || data.description || 'Deskripsi belum tersedia',
      });
    });
    return products;
  } catch (error) {
    console.error('Error fetching products from Firestore:', error);
    throw error;
  }
}
