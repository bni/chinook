import { query } from "@lib/util/postgres";

export async function deleteArtist(artistId: number): Promise<void> {
  try {
    const params = [
      artistId
    ];

    await query(`

      DELETE FROM
        artist
      WHERE
        artist_id = $1

    `, params
    );
  } catch (error) {
    console.error("Error deleting artist:", error);

    throw error;
  }
}
