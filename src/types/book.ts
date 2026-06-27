export interface Product {
  id: string;
  name: string;
  coverUrl: string;
  gender: string;
  size: string;
  desc: string;
  kategori: string;
}

export interface BookState {
  currentPage: number;
  totalPages: number;
  isFlipping: boolean;
}
