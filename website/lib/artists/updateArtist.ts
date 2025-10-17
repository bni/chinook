import { query } from "@lib/util/postgres";
import { error } from "@lib/util/logger";

export async function updateArtist(artistId: number, artistName: string): Promise<void> {
  try {
    await query(`

      UPDATE
        artist
      SET
        name = $1
      WHERE
        artist_id = $2

    `, [ artistName, artistId ]);
  } catch (e) {
    error(e, "Failed to update artist");

    throw e;
  }
}
