import { CollapseDesktop } from "@components/CollapseDesktop";
import { Group } from "@mantine/core";
import { ArtistTable } from "@components/artists/ArtistTable";
import { Artist } from "@lib/artists/types";
import { listArtists } from "@lib/artists/listArtists";

export async function getServerSideProps() {
  const defaultRange: [number, number] = [1991, 2004];

  return {
    props: {
      artists: await listArtists(defaultRange[0], defaultRange[1]),
      defaultRange: defaultRange
    }
  };
}

interface Params {
  artists: Artist[],
  defaultRange: [number, number]
}

export default function ArtistsPage({ artists, defaultRange }: Params) {
  return (
    <CollapseDesktop>
      <Group mt={25} ml={25} mr={25} justify="space-between" grow>
        <ArtistTable artists={artists} defaultRange={defaultRange}/>
      </Group>
    </CollapseDesktop>
  );
}
