const FOLDER_PATH = import.meta.env.VITE_IMAGEKIT_FOLDER_PATH || '/product';
const IMAGEKIT_PUBLIC_KEY = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || '';

export async function fetchImagesFromImageKit(): Promise<string[]> {
  if (!IMAGEKIT_PUBLIC_KEY) {
    console.warn('IMAGEKIT_PUBLIC_KEY tidak diset');
    return [];
  }
  try {
    const response = await fetch(
      `https://api.imagekit.io/v1/files?path=${FOLDER_PATH}`,
      {
        headers: {
          Authorization: 'Basic ' + btoa(IMAGEKIT_PUBLIC_KEY + ':'),
        },
      }
    );
    if (!response.ok) throw new Error('Gagal fetch dari ImageKit');
    const data = await response.json();
    return data
      .filter((file: any) => file.fileType === 'image')
      .sort((a: any, b: any) => a.name.localeCompare(b.name))
      .map((file: any) => file.url);
  } catch (error) {
    console.error(error);
    return [];
  }
}
