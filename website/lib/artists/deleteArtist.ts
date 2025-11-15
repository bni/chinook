import { pool } from "@lib/util/postgres";
import { logger } from "@lib/util/logger";

export async function deleteArtist(artistId: string): Promise<void> {
  logger.warn("Deleting artist");

  const client = await pool.connect();

  try {
    await client.query(`

      DELETE FROM
        album
      WHERE
        artist_id = $1

    `, [ artistId ]);

    await client.query(`

      DELETE FROM
        artist
      WHERE
        artist_id = $1

    `, [ artistId ]);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");

    logger.error(error, "Failed to delete artist");

    throw error;
  } finally {
    client.release();
  }
}
