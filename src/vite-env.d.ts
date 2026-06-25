/// <reference types="vite/client" />

// (Opsional) Tambahan tipe untuk environment variables jika Anda pakai .env
interface ImportMetaEnv {
  readonly VITE_IMAGEKIT_URL?: string;
  readonly VITE_API_BASE?: string;
  // Tambahkan variabel .env lain di sini jika ada
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// (Opsional) Agar TypeScript tidak error saat mengimpor file gambar
declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}
