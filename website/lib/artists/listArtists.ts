import { Artist, ArtistSearchResult } from "@lib/artists/types";
import { query, Result } from "@lib/util/postgres";
import { logger } from "@lib/util/logger";
import { buildYearsList } from "@lib/artists/buildYearsList";

interface ResultRow {
  artistId: string,
  artistName: string,
  mainlyOnLabel?: string,
  mostlyInGenre?: string,
  minYear?: number,
  maxYear?: number,
  nrAlbums: number
}

export async function listArtists(
  fromYear: number,
  toYear: number,
  filter: string,
  pageSize: number,
  onlyFirstPage: boolean
): Promise<ArtistSearchResult> {
  const artists: Artist[] = [];

  const years = buildYearsList(fromYear, toYear);

  let comparator = "";
  if (filter) {
    comparator = `%${filter}%`;
  }

  let limit = undefined;
  if (onlyFirstPage) {
    limit = pageSize;
  }

  try {
    const result: Result<ResultRow> = await query(`

      SELECT
        ar.artist_id AS "artistId",
        ar.name AS "artistName",
        MODE() WITHIN GROUP (ORDER BY al.label DESC) AS "mainlyOnLabel",
        MODE() WITHIN GROUP (ORDER BY al.genre DESC) AS "mostlyInGenre",
        (
          SELECT
            MIN(al2.release)
          FROM
            album al2
          WHERE
            al2.artist_id = ar.artist_id AND
            al2.release = ANY($1::INT[])
        ) AS "minYear",
        (
          SELECT
            MAX(al2.release)
          FROM
            album al2
          WHERE
            al2.artist_id = ar.artist_id AND
            al2.release = ANY($1::INT[])
        ) AS "maxYear",
        (
          SELECT
            COUNT(al2.album_id)
          FROM
            album al2
          WHERE
            al2.artist_id = ar.artist_id AND
            al2.release = ANY($1::INT[])
        ) AS "nrAlbums"
      FROM
        artist ar
      LEFT JOIN
        album al ON al.artist_id = ar.artist_id
      WHERE
        EXISTS (
          SELECT
            1
          FROM
            album al2
          WHERE
            al2.artist_id = ar.artist_id AND
            al2.release = ANY($1::INT[])
        ) AND
        CASE WHEN $2 <> '' THEN
          ar.name ILIKE $2
        ELSE
          TRUE
        END
      GROUP BY
        ar.artist_id, ar.name
      ORDER BY
        "nrAlbums" DESC,
        "minYear" ASC,
        "maxYear" ASC
      FETCH FIRST $3 ROWS ONLY

    `, [ years, comparator, limit ]);

    if (result.rows) {
      for (const row of result.rows) {
        const artist: Artist = {
          artistId: row.artistId,
          artistName: row.artistName,
          mainlyOnLabel: row.mainlyOnLabel,
          mostlyInGenre: row.mostlyInGenre,
          minYear: row.minYear,
          maxYear: row.maxYear,
          nrAlbums: row.nrAlbums
        };

        artists.push(artist);
      }
    }
  } catch (error) {
    logger.error(error, "Failed to list artists");

    throw error;
  }

  return {
    artists: artists,
    total: artists.length
  };
}
