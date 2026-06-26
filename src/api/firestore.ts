import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types/book';

export async function fetchProductsFromFirestore(): Promise<Product[]> {

  console.log("========== FIRESTORE DEBUG ==========");
  console.log("Database :", db.app.options.projectId);

  const snapshot = await getDocs(collection(db, "products"));

  console.log("Jumlah dokumen :", snapshot.size);

  snapshot.forEach(doc => {
    console.log("ID :", doc.id);
    console.log("DATA :", doc.data());
  });

  const products: Product[] = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Product[];

  return products;
}
