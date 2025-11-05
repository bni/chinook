import { query, Result } from "@lib/util/postgres";
import { ArtistDetail, AlbumDetail } from "@lib/artists/types";

export interface ResultRow1 {
  artistId: string;
  artistName: string;
}

export interface ResultRow2 {
  albumId: string,
  albumTitle: string,
  releaseYear: number,
  label: string,
  genre: string,
  criticScore: number,
  userScore: number
}

export async function getArtistDetail(artistId: string): Promise<ArtistDetail | null> {
  // First, get the artist information
  const artistResult: Result<ResultRow1> = await query(`
    SELECT
      artist_id AS "artistId",
      name AS "artistName"
    FROM
      artist
    WHERE
      artist_id = $1
  `, [artistId]);

  if (artistResult.rows.length === 0) {
    return null;
  }

  const artist = artistResult.rows[0];

  // Then, get all albums for this artist, sorted by release year descending
  const albumsResult: Result<ResultRow2> = await query(`
    SELECT
      album_id AS "albumId",
      title AS "albumTitle",
      release AS "releaseYear",
      label,
      genre,
      critic_score AS "criticScore",
      user_score AS "userScore"
    FROM
      album
    WHERE
      artist_id = $1
    ORDER BY
      release DESC
  `, [artistId]);

  const albums: AlbumDetail[] = albumsResult.rows.map(row => ({
    albumId: row.albumId as string,
    albumTitle: row.albumTitle as string,
    releaseYear: row.releaseYear as number,
    label: row.label as string | null,
    genre: row.genre as string | null,
    criticScore: row.criticScore as number,
    userScore: row.userScore as number
  }));

  return {
    artistId: artist.artistId as string,
    artistName: artist.artistName as string,
    albums
  };
}
