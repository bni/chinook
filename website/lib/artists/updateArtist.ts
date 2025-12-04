import type { Album } from "@lib/albums/types";
import { extractEmbedding } from "@lib/util/extractor";
import { listAlbumsByArtist } from "@lib/albums/listAlbumsByArtist";
import { logger } from "@lib/util/logger";
import { pool } from "@lib/util/postgres";

export async function updateArtist(artistId: string, artistName: string): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query(`

      UPDATE
        artist
      SET
        name = $1
      WHERE
        artist_id = $2

    `, [ artistName, artistId ]);

    // Update the embedding for all albums by the artist
    const albumsByArtist: Album[] = await listAlbumsByArtist(artistId);

    for (const album of albumsByArtist) {
      const embedding = await extractEmbedding(`${artistName} ${album.albumTitle}`);

      await client.query(`

        UPDATE
          album
        SET
          embedding = $1
        WHERE
          album_id = $2

      `, [ embedding, album.albumId ]);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");

    logger.error(error, "Failed to update artist");

    throw error;
  } finally {
    client.release();
  }
}
