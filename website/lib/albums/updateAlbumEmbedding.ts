import { query } from "@lib/util/postgres";
import { logger } from "@lib/util/logger";

export async function updateAlbumEmbedding(albumId: number, embedding: string): Promise<void> {
  try {
    await query(`

      UPDATE
        album
      SET
        embedding = $1
      WHERE
        album_id = $2

    `, [ embedding, albumId ]);
  } catch (error) {
    logger.error(error, "Failed to update album embedding");

    throw error;
  }
}
