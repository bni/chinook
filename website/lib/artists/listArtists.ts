import { Artist } from "@lib/artists/types";
import { query, Result } from "@lib/util/postgres";
import { logger } from "@lib/util/logger";

interface ResultRow {
  artistId: string,
  artistName: string,
  mostRecentAlbumTitle?: string,
  mostRecentAlbumYear?: number,
  nrAlbums: number
}

const buildYearsList = (fromYear: number, toYear: number) => {
  const years: number[] = [];

  if (fromYear < toYear) {
    for (let i = fromYear; i <= toYear; i++) {
      years.push(i);
    }
  } else if (toYear < fromYear) {
    for (let i = toYear; i <= fromYear; i++) {
      years.push(i);
    }
  } else {
    years.push(fromYear);
  }

  return years;
};

export async function listArtists(fromYear: number, toYear: number): Promise<Artist[]> {
  const artists: Artist[] = [];

  const years = buildYearsList(fromYear, toYear);

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
            al2.release DESC
          FETCH FIRST 1 ROWS ONLY
        ) AS "mostRecentAlbumTitle",
        (
          SELECT
            al2.release
          FROM
            album al2
          WHERE
            al2.artist_id = ar.artist_id
          ORDER BY
            al2.release DESC
          FETCH FIRST 1 ROWS ONLY
        ) AS "mostRecentAlbumYear",
        COUNT(al.album_id) AS "nrAlbums"
      FROM
        artist ar
      LEFT JOIN
        album al ON ar.artist_id = al.artist_id
      WHERE
        EXISTS (
          SELECT
            1
          FROM
            album al2
          WHERE
            al2.artist_id = ar.artist_id AND
            al2.release = ANY($1::INT[])
        )
      GROUP BY
        ar.artist_id, ar.name
      ORDER BY
        "mostRecentAlbumYear" ASC

    `, [ years ]);

    if (result.rows) {
      for (const row of result.rows) {
        const artist: Artist = {
          artistId: row.artistId,
          artistName: row.artistName,
          mostRecentAlbumTitle: row.mostRecentAlbumTitle,
          mostRecentAlbumYear: row.mostRecentAlbumYear,
          nrAlbums: row.nrAlbums
        };

        artists.push(artist);
      }
    }
  } catch (error) {
    logger.error(error, "Failed to list artists");

    throw error;
  }

  return artists;
}
