const BASE_URL = import.meta.env.VITE_IMAGEKIT_BASE_URL || 'https://ik.imagekit.io/bn7fafwae';
const FOLDER_PATH = import.meta.env.VITE_IMAGEKIT_FOLDER_PATH || '/product';
const PUBLIC_KEY = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || '';

export async function fetchImagesFromImageKit(): Promise<string[]> {
  if (!PUBLIC_KEY) {
    throw new Error('VITE_IMAGEKIT_PUBLIC_KEY tidak diisi. Ambil dari Dashboard ImageKit → Developer Options.');
  }

  try {
    const response = await fetch(
      `${BASE_URL}/v1/files?path=${FOLDER_PATH}`,
      {
        headers: {
          Authorization: 'Basic ' + btoa(PUBLIC_KEY + ':'),
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const images = data
      .filter((file: any) => file.fileType === 'image')
      .sort((a: any, b: any) => a.name.localeCompare(b.name))
      .map((file: any) => file.url);

    if (images.length === 0) {
      throw new Error(`Tidak ada gambar di folder "${FOLDER_PATH}". Periksa path dan isi folder.`);
    }

    return images;
  } catch (error) {
    console.error('Error fetching from ImageKit:', error);
    throw error;
  }
}
