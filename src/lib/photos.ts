/**
 * Extrae la primera imagen de un álbum compartido de Google Photos.
 * El álbum debe ser público ("Cualquiera con el enlace puede ver").
 * Retorna una URL de alta calidad de lh3.googleusercontent.com
 */
export async function getFirstPhotoFromAlbum(
  albumUrl: string
): Promise<string | null> {
  try {
    const res = await fetch(albumUrl, {
      cache: "no-store",
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) return null;

    const html = await res.text();

    // Extraer URLs de fotos lh3.googleusercontent.com/pw/
    const matches = html.match(
      /https:\/\/lh3\.googleusercontent\.com\/pw\/[A-Za-z0-9_\-]+/g
    );
    if (!matches?.length) return null;

    // Deduplicar y tomar la primera URL de alta calidad (sin parámetros de resize)
    const unique = [...new Set(matches)];
    const photo = unique[0];

    // Añadir parámetros para obtener una imagen de buena resolución (1200px ancho)
    return `${photo}=w1200-h800-c`;
  } catch {
    return null;
  }
}
