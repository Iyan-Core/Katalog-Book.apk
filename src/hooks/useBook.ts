import { useState, useCallback } from 'react';
import { BookState } from '../types/book';

export function useBook(totalPages: number) {
  const [state, setState] = useState<BookState>({
    currentPage: 0,
    totalPages,
    isFlipping: false,
  });

  // 📌 Pakai useCallback agar fungsi tidak berubah
  const goToPage = useCallback((page: number) => {
    if (page < 0 || page >= totalPages || state.isFlipping) return;
    setState((prev) => ({ ...prev, currentPage: page }));
  }, [totalPages, state.isFlipping]);

  const nextPage = useCallback(() => goToPage(state.currentPage + 1), [goToPage, state.currentPage]);
  const prevPage = useCallback(() => goToPage(state.currentPage - 1), [goToPage, state.currentPage]);

  const setFlipping = useCallback((flipping: boolean) => {
    setState((prev) => ({ ...prev, isFlipping: flipping }));
  }, []);

  return { state, goToPage, nextPage, prevPage, setFlipping };
}
