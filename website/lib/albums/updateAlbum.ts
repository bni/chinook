import { extractEmbedding } from "@lib/util/extractor";
import { logger } from "@lib/util/logger";
import { query } from "@lib/util/postgres";

export interface UpdateAlbumParams {
  albumId: string;
  albumTitle: string;
  artistName: string;
  releaseYear?: number;
  label?: string;
  genre?: string;
  criticScore?: number;
  userScore?: number;
}

export async function updateAlbum(params: UpdateAlbumParams): Promise<void> {
  try {
    const embedding = await extractEmbedding(`${params.artistName} ${params.albumTitle}`);

    await query(`

      UPDATE
        album
      SET
        title = $1,
        release = $2,
        label = $3,
        genre = $4,
        critic_score = $5,
        user_score = $6,
        embedding = $7
      WHERE
        album_id = $8

    `, [
      params.albumTitle,
      params.releaseYear,
      params.label || null,
      params.genre || null,
      params.criticScore ?? -1,
      params.userScore ?? -1,
      embedding,
      params.albumId
    ]);
  } catch (error) {
    logger.error(error, "Failed to update album");

    throw error;
  }
}
