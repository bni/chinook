import { logger } from "@lib/util/logger";
import { listAlbumsMissingEmbeddings } from "@lib/albums/listAlbumsMissingEmbeddings";
import { Album } from "@lib/albums/types";
import { updateAlbumEmbedding } from "@lib/albums/updateAlbumEmbedding";
import { extractEmbedding } from "@lib/util/extractor";

export async function updateAlbumEmbeddings(): Promise<void> {
  const albums: Album[] = await listAlbumsMissingEmbeddings();

  for (const album of albums) {
    logger.info({ title: album.title }, "Embedding needs updating");

    const embedding = await extractEmbedding(album.title);

    await updateAlbumEmbedding(album.albumId, embedding);
  }
}
