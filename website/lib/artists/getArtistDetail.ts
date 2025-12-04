import { query, Result } from "@lib/util/postgres";
import type { ArtistDetail, AlbumDetail } from "@lib/artists/types";

interface ResultRow {
  artistId: string;
  artistName: string;
  albumId: string;
  albumTitle: string;
  releaseYear: number;
  label?: string;
  genre?: string;
  criticScore: number;
  userScore: number;
}

export async function getArtistDetail(artistId: string): Promise<ArtistDetail | undefined> {
  const result: Result<ResultRow> = await query(`

    SELECT
      a.artist_id AS "artistId",
      a.name AS "artistName",
      al.album_id AS "albumId",
      al.title AS "albumTitle",
      al.release AS "releaseYear",
      al.label AS "label",
      al.genre AS "genre",
      al.critic_score AS "criticScore",
      al.user_score AS "userScore"
    FROM
      artist a
    INNER JOIN
      album al ON al.artist_id = a.artist_id
    WHERE
      a.artist_id = $1
    ORDER BY
      al.release DESC

  `, [artistId]);

  if (result.rows) {
    const rows = result.rows;

    const albums: AlbumDetail[] = [];

    // Get artist info from first row
    const artistDetail: ArtistDetail = {
      artistId: rows[0].artistId,
      artistName: rows[0].artistName,
      albums: albums
    };

    // Build albums array from all rows
    for (const row of rows) {
      const album: AlbumDetail = {
        albumId: row.albumId,
        albumTitle: row.albumTitle,
        releaseYear: row.releaseYear,
        criticScore: row.criticScore,
        userScore: row.userScore,
        ...(row.label && { label: row.label }),
        ...(row.genre && { genre: row.genre })
      };

      albums.push(album);
    }

    return artistDetail;
  }
}
