import { CollapseDesktop } from "../components/CollapseDesktop";
import { Group } from "@mantine/core";
import { ArtistTable } from "../components/artists/ArtistTable";
import { Artist } from "@lib/artists/artist";
import { listArtists } from "@lib/artists/listArtists";

export async function getServerSideProps() {
  return {
    props: {
      artists: await listArtists()
    }
  };
}

export default function ArtistsPage({ artists }: { artists: Artist[] }) {
  return (
    <CollapseDesktop>
      <Group mt={25} ml={25} mr={25} justify="space-between" grow>
        <ArtistTable artists={artists}/>
      </Group>
    </CollapseDesktop>
  );
}
