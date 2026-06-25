import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Book } from '../types/book';

export async function fetchBooksFromFirestore(): Promise<Book[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'books'));
    const books: Book[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      books.push({
        id: doc.id,
        title: data.title || 'Katalog',
        coverUrl: data.coverUrl || data.pages?.[0] || '',
        pages: Array.isArray(data.pages) ? data.pages : [],
      });
    });
    return books;
  } catch (error) {
    console.error('Error fetching books from Firestore:', error);
    throw error;
  }
}
