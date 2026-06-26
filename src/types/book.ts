export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  gender: 'Pria' | 'Wanita' | 'Unisex';
  size: string;
}

export interface Book {
  id: string;
  title: string;
  coverUrl: string;
  products: Product[];
}

export interface BookState {
  currentPage: number;
  totalPages: number;
  isFlipping: boolean;
}
