import { query } from "@lib/util/postgres";
import { logger } from "@lib/util/logger";

export async function createArtist(artistName: string): Promise<void> {
  try {
    await query(`

      INSERT INTO artist (
        name
      ) VALUES (
        $1
      )

    `, [ artistName ]);
  } catch (error) {
    logger.error(error, "Failed to create artist");

    throw error;
  }
}
