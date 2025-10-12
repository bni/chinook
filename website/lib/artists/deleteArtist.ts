import { query } from "@lib/util/postgres";

export async function deleteArtist(artistId: number): Promise<void> {
  try {
    await query(`

      DELETE FROM
        artist
      WHERE
        artist_id = $1

    `, [ artistId ]);
  } catch (error) {
    console.error("Error deleting artist:", error);

    throw error;
  }
}
