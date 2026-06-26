import { useState } from 'react';
import { BookState } from '../types/book';

export function useBook(totalPages: number) {
  const [state, setState] = useState<BookState>({
    currentPage: 0,
    totalPages,
    isFlipping: false,
  });

  const goToPage = (page: number) => {
    if (page < 0 || page >= totalPages || state.isFlipping) return;
    setState((prev: BookState) => ({ ...prev, currentPage: page }));
  };

  const nextPage = () => goToPage(state.currentPage + 1);
  const prevPage = () => goToPage(state.currentPage - 1);

  const setFlipping = (flipping: boolean) => {
    setState((prev: BookState) => ({ ...prev, isFlipping: flipping }));
  };

  return { state, goToPage, nextPage, prevPage, setFlipping };
}
