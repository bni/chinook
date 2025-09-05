import { Artist } from "@lib/types/artist";

import oracledb, { Connection, Result } from "oracledb";

interface ResultRow {
  artistId: number,
  artistName: string,
  nrAlbums: number
}

export async function listArtists(): Promise<Artist[]> {
  let artists: Artist[] = [];

  let connection: Connection | undefined;
  try {
    connection = await oracledb.getConnection();

    const result: Result<ResultRow> = await connection.execute(`

      SELECT
        ar.artistid AS "artistId",
        ar.name AS "artistName",
        COUNT(al.albumid) AS "nrAlbums"
      FROM
        artist ar
      INNER JOIN
        album al ON ar.artistid = al.artistid
      GROUP BY
        ar.artistid, ar.name
      ORDER BY
        "artistName" ASC, "nrAlbums" ASC

      `, [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    artists = result.rows as Artist[];
  } catch (error) {
    console.log(error);

    throw error;
  } finally {
    if (connection) { await connection.close(); }
  }

  return artists;
}
