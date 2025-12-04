import { query, Result } from "@lib/util/postgres";
import { logger } from "@lib/util/logger";
import type { Album } from "@lib/albums/types";

interface ResultRow {
  albumId: string,
  albumTitle: string
}

export async function listAlbumsByArtist(artistId: string): Promise<Album[]> {
  const albums: Album[] = [];

  try {
    const result: Result<ResultRow> = await query(`

      SELECT
        al.album_id AS "albumId",
        al.title AS "albumTitle"
      FROM
        album al
      LEFT JOIN
        artist ar ON al.artist_id = ar.artist_id
      WHERE
        ar.artist_id = $1
      ORDER BY
        al.release DESC

    `, [ artistId ]);

    if (result.rows) {
      for (const row of result.rows) {
        const album: Album = {
          albumId: row.albumId,
          albumTitle: row.albumTitle
        };

        albums.push(album);
      }
    }
  } catch (error) {
    logger.error(error, "Failed to list albums");

    throw error;
  }

  return albums;
}
