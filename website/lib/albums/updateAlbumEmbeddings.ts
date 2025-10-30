import { logger } from "@lib/util/logger";
import { listAlbumsMissingEmbeddings } from "@lib/albums/listAlbumsMissingEmbeddings";
import { Album } from "@lib/albums/types";
import { updateAlbumEmbedding } from "@lib/albums/updateAlbumEmbedding";
import { extractEmbedding } from "@lib/util/extractor";

export async function updateAlbumEmbeddings(): Promise<void> {
  const albums: Album[] = await listAlbumsMissingEmbeddings();

  for (const album of albums) {
    const embeddingInput = `${album.artist.artistName} ${album.albumTitle}`;

    logger.info({ embeddingInput: embeddingInput }, "Embedding needs updating");

    const embedding = await extractEmbedding(embeddingInput);

    await updateAlbumEmbedding(album.albumId, embedding);
  }
}
