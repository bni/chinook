import oracledb, { Connection, BindParameters } from "oracledb";

export async function updateArtist(artistId: number, artistName: string): Promise<void> {
  let connection: Connection | undefined;
  try {
    connection = await oracledb.getConnection();

    const params: BindParameters = {
      artistName: artistName,
      artistId: artistId
    };

    await connection.execute(`

      UPDATE
        artist
      SET
        name = :artistName
      WHERE
        artistid = :artistId

    `, params, { autoCommit: true }
    );
  } catch (error) {
    console.error("Error updating artist:", error);

    throw error;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}
