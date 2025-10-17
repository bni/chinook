import { query } from "@lib/util/postgres";
import { warn, error } from "@lib/util/logger";

export async function deleteArtist(artistId: number): Promise<void> {
  warn("Deleting artist");

  try {
    await query(`

      DELETE FROM
        artist
      WHERE
        artist_id = $1

    `, [ artistId ]);
  } catch (e) {
    error(e, "Failed to delete artist");

    throw e;
  }
}
