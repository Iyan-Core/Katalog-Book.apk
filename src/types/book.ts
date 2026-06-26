export interface ProductDetail {
  name: string;
  gender: string;
  size: string;
  description: string;
}

export interface Book {
  id: string;
  title: string;
  coverUrl: string;
  pages: string[];
  details: ProductDetail[];
}

export interface BookState {
  currentPage: number;
  totalPages: number;
  isFlipping: boolean;
}
