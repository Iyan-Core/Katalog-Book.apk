import React from 'react';

interface BookControlsProps {
  currentPage: number;
  totalPages: number;
  onNext: () => void;
  onPrev: () => void;
  onPageInput?: (page: number) => void;
}

export default function BookControls({
  currentPage,
  totalPages,
  onNext,
  onPrev,
}: BookControlsProps) {
  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center', marginTop: '1rem' }}>
      <button onClick={onPrev} disabled={currentPage === 0}>
        ⬅ Sebelumnya
      </button>
      <span>
        Halaman {currentPage + 1} dari {totalPages}
      </span>
      <button onClick={onNext} disabled={currentPage === totalPages - 1}>
        Selanjutnya ➡
      </button>
    </div>
  );
}
