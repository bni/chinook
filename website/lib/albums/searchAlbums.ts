import { AlbumSearchResult } from "@lib/albums/types";
import { query, Result } from "@lib/util/postgres";
import { logger } from "@lib/util/logger";

import { extractEmbedding } from "@lib/util/extractor";

interface ResultRow {
  albumId: string,
  albumTitle: string,
  artistName: string,
  releaseYear: number,
  label: string;
  genre: string;
  similarity: number
}

export async function searchAlbums(searchQuery: string): Promise<AlbumSearchResult[]> {
  const embedding = await extractEmbedding(searchQuery);

  const albumSearchResults: AlbumSearchResult[] = [];

  try {
    const result: Result<ResultRow> = await query(`

      WITH similarity_calculation AS (
        SELECT
          al.album_id,
          al.title,
          ar.name,
          al.release,
          al.label,
          al.genre,
          1 - (al.embedding <=> $1) AS similarity
        FROM
          album al
        INNER JOIN
          artist ar ON ar.artist_id = al.artist_id
      )
      SELECT
        album_id AS "albumId",
        title AS "albumTitle",
        name AS "artistName",
        release AS "releaseYear",
        label AS "label",
        genre AS "genre",
        similarity AS "similarity"
      FROM
        similarity_calculation
      WHERE
        similarity > 0.4
      ORDER BY
        similarity DESC

    `, [ embedding ]);

    if (result.rows) {
      for (const row of result.rows) {
        const albumSearchResult: AlbumSearchResult = {
          albumId: row.albumId,
          albumTitle: row.albumTitle,
          artistName: row.artistName,
          releaseYear: row.releaseYear,
          label: row.label,
          genre: row.genre,
          similarity: row.similarity
        };

        albumSearchResults.push(albumSearchResult);
      }
    }
  } catch (error) {
    logger.error(error, "Failed to search albums");

    throw error;
  }

  return albumSearchResults;
}
