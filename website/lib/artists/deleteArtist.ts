import oracledb, { Connection, BindParameters } from "oracledb";

export async function deleteArtist(artistId: number): Promise<void> {
  let connection: Connection | undefined;
  try {
    connection = await oracledb.getConnection();

    const params: BindParameters = {
      artistId: artistId
    };

    await connection.execute(`

      DELETE FROM
        artist
      WHERE
        artistid = :artistId

    `, params, { autoCommit: true }
    );
  } catch (error) {
    console.error("Error deleting artist:", error);

    throw error;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}
