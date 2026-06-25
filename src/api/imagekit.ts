const FOLDER_PATH = import.meta.env.VITE_IMAGEKIT_FOLDER_PATH || '/product';
const PRIVATE_KEY = import.meta.env.VITE_IMAGEKIT_PRIVATE_KEY || '';

export async function fetchImagesFromImageKit(): Promise<string[]> {
  if (!PRIVATE_KEY) {
    throw new Error('VITE_IMAGEKIT_PRIVATE_KEY tidak diisi. Ambil dari Dashboard ImageKit → Developer Options.');
  }

  try {
    const response = await fetch(
      `https://api.imagekit.io/v1/files?path=${FOLDER_PATH}`,
      {
        headers: {
          Authorization: 'Basic ' + btoa(PRIVATE_KEY + ':'),
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
