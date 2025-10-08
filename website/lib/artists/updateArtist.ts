import { query } from "@lib/util/postgres";

export async function updateArtist(artistId: number, artistName: string): Promise<void> {
  try {
    const params = [
      artistName,
      artistId
    ];

    await query(`

      UPDATE
        artist
      SET
        name = $1
      WHERE
        artist_id = $2

    `, params
    );
  } catch (error) {
    console.error("Error updating artist:", error);

    throw error;
  }
}
