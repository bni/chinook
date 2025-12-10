import type { Artist, ArtistSearchResult } from "@lib/artists/types";
import { Result, query } from "@lib/util/postgres";
import { buildYearsList } from "@lib/artists/buildYearsList";
import { logger } from "@lib/util/logger";

interface ResultRow {
  artistId: string,
  artistName: string,
  mainlyOnLabel?: string,
  mostlyInGenre?: string,
  minYear?: number,
  maxYear?: number,
  nrAlbums: number,
  total: number
}

export async function listArtists(
  fromYear: number,
  toYear: number,
  filter: string,
  sortColumn: string,
  sortDirection: string,
  page: number,
  pageSize: number
): Promise<ArtistSearchResult> {
  const artists: Artist[] = [];

  logger.info({ fromYear: fromYear, toYear: toYear }, "Listing artists");

  const years = buildYearsList(fromYear, toYear);

  let comparator = "";
  if (filter) {
    comparator = `%${filter}%`;
  }

  const limit = pageSize;
  const offset = (page - 1) * pageSize;

  let total = 0;

  try {
    const result: Result<ResultRow> = await query(`

      WITH artists AS (
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
      )
      SELECT
        "artistId",
        "artistName",
        "mainlyOnLabel",
        "mostlyInGenre",
        "minYear",
        "maxYear",
        "nrAlbums",
        COUNT(*) OVER() AS "total"
      FROM
        artists
      ORDER BY
        (CASE WHEN $3 = 'artistName' AND $4 = 'asc' THEN "artistName" END) ASC,
        (CASE WHEN $3 = 'artistName' AND $4 = 'desc' THEN "artistName" END) DESC,
        (CASE WHEN $3 = 'mainlyOnLabel' AND $4 = 'asc' THEN "mainlyOnLabel" END) ASC,
        (CASE WHEN $3 = 'mainlyOnLabel' AND $4 = 'desc' THEN "mainlyOnLabel" END) DESC,
        (CASE WHEN $3 = 'mostlyInGenre' AND $4 = 'asc' THEN "mostlyInGenre" END) ASC,
        (CASE WHEN $3 = 'mostlyInGenre' AND $4 = 'desc' THEN "mostlyInGenre" END) DESC,
        (CASE WHEN $3 = 'nrAlbums' AND $4 = 'asc' THEN "nrAlbums" END) ASC,
        (CASE WHEN $3 = 'nrAlbums' AND $4 = 'desc' THEN "nrAlbums" END) DESC
      LIMIT $5 OFFSET $6

    `, [ years, comparator, sortColumn, sortDirection, limit, offset ]);

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

        // Will be set on each row
        total = row.total;
      }
    }
  } catch (error) {
    logger.error(error, "Failed to list artists");

    throw error;
  }

  return {
    artists: artists,
    total: total
  };
}
