import { extractEmbedding } from "@lib/util/extractor";
import { logger } from "@lib/util/logger";
import { pool } from "@lib/util/postgres";

export async function createArtist(artistName: string): Promise<void> {
  const client = await pool.connect();

  try {
    const newArtist = await client.query(`

      INSERT INTO artist (
        name
      ) VALUES (
        $1
      ) RETURNING artist_id

    `, [ artistName ]);

    const newArtistId: string = newArtist.rows[0]["artist_id"];

    const currentYear = new Date().getFullYear();

    const albumTitle = "TBD";

    const embedding = await extractEmbedding(`${artistName} ${albumTitle}`);

    await client.query(`

      INSERT INTO album (
        title,
        release,
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
        $6
      )

    `, [ albumTitle, currentYear, -1, -1, embedding, newArtistId]);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");

    logger.error(error, "Failed to create artist");

    throw error;
  } finally {
    client.release();
  }
}
