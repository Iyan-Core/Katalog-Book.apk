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
        imageUrl: data.imageUrl || '',
        description: data.description || '',
        gender: data.gender || 'Unisex',
        size: data.size || '',
      });
    });
    return products;
  } catch (error) {
    console.error('Error fetching products from Firestore:', error);
    throw error;
  }
}
