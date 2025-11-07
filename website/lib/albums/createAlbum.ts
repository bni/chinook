import { query } from "@lib/util/postgres";
import { logger } from "@lib/util/logger";
import { extractEmbedding } from "@lib/util/extractor";

export interface CreateAlbumParams {
  albumTitle: string;
  artistId: string;
  artistName: string;
  releaseYear?: number;
  label?: string;
  genre?: string;
  criticScore?: number;
  userScore?: number;
}

export async function createAlbum(params: CreateAlbumParams): Promise<string> {
  try {
    const currentYear = new Date().getFullYear();
    const releaseYear = params.releaseYear || currentYear;
    const criticScore = params.criticScore ?? -1;
    const userScore = params.userScore ?? -1;

    const embedding = await extractEmbedding(`${params.artistName} ${params.albumTitle}`);

    const result = await query(`

      INSERT INTO album (
        title,
        release,
        label,
        genre,
        critic_score,
        user_score,
        embedding,
        artist_id
      ) VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8
      ) RETURNING album_id

    `, [
      params.albumTitle,
      releaseYear,
      params.label || null,
      params.genre || null,
      criticScore,
      userScore,
      embedding,
      params.artistId
    ]);

    return result.rows[0]["album_id"];
  } catch (error) {
    logger.error(error, "Failed to create album");

    throw error;
  }
}
