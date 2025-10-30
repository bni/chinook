import { Album } from "@lib/albums/types";
import { query, Result } from "@lib/util/postgres";
import { logger } from "@lib/util/logger";

interface ResultRow {
  albumId: number,
  albumTitle: string,
  artistId: number,
  artistName: string,
  embedding?: string
}

export async function listAlbumsMissingEmbeddings(): Promise<Album[]> {
  const albums: Album[] = [];

  try {
    const result: Result<ResultRow> = await query(`

      SELECT
        al.album_id AS "albumId",
        al.title AS "albumTitle",
        at.artist_id AS "artistId",
        at.name AS "artistName",
        al.embedding AS "embedding"
      FROM
        album al
      INNER JOIN
        artist at ON at.artist_id = al.artist_id
      WHERE
        al.embedding IS NULL
      ORDER BY
        al.album_id ASC

    `);

    if (result.rows) {
      for (const row of result.rows) {
        const album: Album = {
          albumId: row.albumId,
          albumTitle: row.albumTitle,
          artist: {
            artistId: row.artistId,
            artistName: row.artistName
          },
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
