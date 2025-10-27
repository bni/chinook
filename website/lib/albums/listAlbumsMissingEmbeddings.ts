import { Album } from "@lib/albums/types";
import { query, Result } from "@lib/util/postgres";
import { logger } from "@lib/util/logger";

interface ResultRow {
  albumId: number,
  title: string,
  embedding?: string
}

export async function listAlbumsMissingEmbeddings(): Promise<Album[]> {
  const albums: Album[] = [];

  try {
    const result: Result<ResultRow> = await query(`

      SELECT
        a.album_id AS "albumId",
        a.title AS "title",
        a.embedding AS "embedding"
      FROM
        album a
      WHERE
        a.embedding IS NULL
      ORDER BY
          a.album_id ASC

    `);

    if (result.rows) {
      for (const row of result.rows) {
        const album: Album = {
          albumId: row.albumId,
          title: row.title,
          embedding: row.embedding
        };

        albums.push(album);
      }
    }
  } catch (error) {
    logger.error(error, "Failed to list albums that is missing embeddings");

    throw error;
  }

  return albums;
}
