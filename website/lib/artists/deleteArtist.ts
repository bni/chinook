import { query } from "@lib/util/postgres";
import { logger } from "@lib/util/logger";

export async function deleteArtist(artistId: number): Promise<void> {
  logger.warn("Deleting artist");

  try {
    await query(`

      DELETE FROM
        artist
      WHERE
        artist_id = $1

    `, [ artistId ]);
  } catch (error) {
    logger.error(error, "Failed to delete artist");

    throw error;
  }
}
