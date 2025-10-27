import { AlbumSearchResult } from "@lib/albums/types";
import { query, Result } from "@lib/util/postgres";
import { logger } from "@lib/util/logger";

import { extractEmbedding } from "@lib/util/extractor";

interface ResultRow {
  albumId: number,
  title: string,
  artist: string,
  similarity: number
}

export async function searchAlbums(searchQuery: string): Promise<AlbumSearchResult[]> {
  const embedding = await extractEmbedding(searchQuery);

  const albumSearchResults: AlbumSearchResult[] = [];

  try {
    const result: Result<ResultRow> = await query(`

      SELECT
        al.album_id AS "albumId",
        al.title AS "title",
        ar.name AS "artist",
        (al.embedding <=> $1) AS "similarity"
      FROM
        album al
      INNER JOIN
        artist ar ON ar.artist_id = al.artist_id
      ORDER BY
        "similarity" ASC
      FETCH FIRST 3 ROWS ONLY

    `, [ embedding ]);

    if (result.rows) {
      for (const row of result.rows) {
        const albumSearchResult: AlbumSearchResult = {
          albumId: row.albumId,
          title: row.title,
          artist: row.artist,
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
