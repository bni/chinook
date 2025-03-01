import { CollapseDesktop } from "../components/CollapseDesktop";
import { Group } from "@mantine/core";
import { ArtistTable } from "../components/ArtistTable";
import oracledb from "oracledb";

interface Artist {
  artistId: number,
  artistName: string,
  nrAlbums: number
}

export async function getServerSideProps() {
  const artists = [];

  let connection;
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(`
      SELECT
        ar.artistid as "artistId",
        ar.name as "artistName",
        count(al.albumid) as "nrAlbums"
      FROM
        artist ar
      INNER JOIN
        album al ON ar.artistid = al.artistid
      GROUP BY
        ar.artistid, ar.name
      ORDER BY
        "nrAlbums" DESC
      `,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const rows: Artist[] = result.rows as Artist[];

    for (const row of rows) {
      artists.push([
        row.artistId,
        row.artistName,
        row.nrAlbums
      ]);
    }
  } catch (error) {
    console.log(error);
  } finally {
    if (connection) { await connection.close(); }
  }

  return {
    props: {
      artists
    }
  };
}

export default function IndexPage({ artists }: any) {
  return (
    <CollapseDesktop>
      <Group mt={25} justify="center">
        <ArtistTable artists={artists}/>
      </Group>
    </CollapseDesktop>
  );
}
