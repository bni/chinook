import { Artist } from "@lib/artists/artist";
import { query, Result } from "@lib/util/postgres";

interface ResultRow {
  artistId: number,
  artistName: string,
  nrAlbums: number
}

export async function listArtists(): Promise<Artist[]> {
  let artists: Artist[] = [];

  try {
    const result: Result<ResultRow> = await query(`

      SELECT
        ar.artist_id AS "artistId",
        ar.name AS "artistName",
        COUNT(al.album_id) AS "nrAlbums"
      FROM
        artist ar
      INNER JOIN
        album al ON ar.artist_id = al.artist_id
      GROUP BY
        ar.artist_id, ar.name
      ORDER BY
        "artistName" ASC, "nrAlbums" ASC

      `, []
    );

    artists = result.rows as Artist[];
  } catch (error) {
    console.log(error);

    throw error;
  }

  return artists;
}
