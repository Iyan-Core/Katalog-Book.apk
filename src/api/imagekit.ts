const IMAGEKIT_BASE_URL = 'https://ik.imagekit.io/your_account';
const FOLDER_PATH = '/nama-folder-buku'; // Ganti dengan folder kamu

export async function fetchImagesFromImageKit() {
  try {
    // Gunakan Public API Key ImageKit (bisa dilihat di dashboard)
    const response = await fetch(
      `https://api.imagekit.io/v1/files?path=${FOLDER_PATH}`,
      {
        headers: {
          'Authorization': 'Basic ' + btoa('YOUR_PUBLIC_KEY:'), 
          // Public key bisa dilihat di dashboard ImageKit -> Developer Options
        },
      }
    );
    const data = await response.json();
    
    // Ambil URL dari setiap file, urutkan berdasarkan nama
    const urls = data
      .filter((file: any) => file.fileType === 'image') // Hanya gambar
      .sort((a: any, b: any) => a.name.localeCompare(b.name)) // Urutkan nama
      .map((file: any) => file.url);
      
    return urls;
  } catch (error) {
    console.error('Gagal ambil daftar gambar:', error);
    return [];
  }
}
