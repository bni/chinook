import { logger } from "@lib/util/logger";
import { query } from "@lib/util/postgres";

export async function deleteAlbum(albumId: string): Promise<void> {
  logger.warn("Deleting album");

  try {
    await query(`

      DELETE FROM
        album
      WHERE
        album_id = $1

    `, [ albumId ]);
  } catch (error) {
    logger.error(error, "Failed to delete album");

    throw error;
  }
}
