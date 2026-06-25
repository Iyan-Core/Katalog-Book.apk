export interface Book {
  id: string;
  title: string;
  coverUrl: string;
  pages: string[]; // array gambar atau konten halaman
}

export interface BookState {
  currentPage: number;
  totalPages: number;
  isFlipping: boolean;
}
