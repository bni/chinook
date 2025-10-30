import { AlbumSearchResult } from "@lib/albums/types";
import { query, Result } from "@lib/util/postgres";
import { logger } from "@lib/util/logger";

import { extractEmbedding } from "@lib/util/extractor";

interface ResultRow {
  albumId: number,
  albumTitle: string,
  artistName: string,
  releaseYear: string,
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
          1 - (al.embedding <=> $1) AS similarity
        FROM
          ratings_album al
        INNER JOIN
          ratings_artist ar ON ar.artist_id = al.artist_id
      )
      SELECT
        album_id AS "albumId",
        title AS "albumTitle",
        name AS "artistName",
        release AS "releaseYear",
        similarity AS "similarity"
      FROM
        similarity_calculation
      WHERE
        similarity > 0.5
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
