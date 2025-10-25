import { Artist } from "@lib/artists/artist";
import { query, Result } from "@lib/util/postgres";
import { logger } from "@lib/util/logger";
import sortBy from "lodash/sortBy";

interface ResultRow {
  artistId: number,
  artistName: string,
  mostRecentAlbum?: string,
  nrAlbums: number
}

export async function listArtists(): Promise<Artist[]> {
  const artists: Artist[] = [];

  try {
    const result: Result<ResultRow> = await query(`

      SELECT
        ar.artist_id AS "artistId",
        ar.name AS "artistName",
        (
          SELECT
            al2.title
          FROM
            album al2
          WHERE
            al2.artist_id = ar.artist_id
          ORDER BY
            al2.album_id DESC
          FETCH FIRST 1 ROWS ONLY
        ) AS "mostRecentAlbum",
        COUNT(al.album_id) AS "nrAlbums"
      FROM
        artist ar
      LEFT JOIN
        album al ON ar.artist_id = al.artist_id
      GROUP BY
        ar.artist_id, ar.name
      ORDER BY
        "artistName" ASC

    `);

    if (result.rows) {
      for (const row of result.rows) {
        const artist: Artist = {
          artistId: row.artistId,
          artistName: row.artistName,
          mostRecentAlbum: row.mostRecentAlbum,
          nrAlbums: row.nrAlbums
        };

        artists.push(artist);
      }
    }
  } catch (error) {
    logger.error(error, "Failed to list artists");

    throw error;
  }

  return sortBy(artists, "artistName");
}
