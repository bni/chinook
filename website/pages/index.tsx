import { CollapseDesktop } from "../components/CollapseDesktop";
import { Group } from "@mantine/core";
import { ArtistTable } from "../components/ArtistTable";
import { Artist } from "@lib/types/artist";
import { listArtists } from "@lib/listArtists/listArtists";

export async function getServerSideProps() {
  return {
    props: {
      artists: await listArtists()
    }
  };
}

export default function IndexPage({ artists }: { artists: Artist[] }) {
  return (
    <CollapseDesktop>
      <Group mt={25} justify="center">
        <ArtistTable artists={artists}/>
      </Group>
    </CollapseDesktop>
  );
}
