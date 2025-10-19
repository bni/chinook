import { query } from "@lib/util/postgres";
import { logger } from "@lib/util/logger";

export async function createArtist(artistName: string): Promise<void> {
  const artistId: number = Math.floor(Math.random() * 1000000);

  try {
    await query(`

      INSERT INTO artist (
        artist_id,
        name
      ) VALUES (
        $1, $2
      )

    `, [ artistId, artistName ]);
  } catch (error) {
    logger.error(error, "Failed to create artist");

    throw error;
  }
}
