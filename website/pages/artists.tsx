import { CollapseDesktop } from "@components/CollapseDesktop";
import { Group } from "@mantine/core";
import { ArtistTable } from "@components/artists/ArtistTable";
import { Artist } from "@lib/artists/types";
import { listArtists } from "@lib/artists/listArtists";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { getPrefs, savePrefs } from "@lib/util/prefs";
import { HeadComponent } from "@components/HeadComponent";

const DEFAULT_FROM_YEAR = 1991;
const DEFAULT_TO_YEAR = 2004;

export const getServerSideProps = (async (context: GetServerSidePropsContext) => {
  const prefs = await getPrefs(context.req, context.res);

  if (!prefs.fromYear || !prefs.toYear) {
    // None existed, save defaults
    prefs.fromYear = DEFAULT_FROM_YEAR;
    prefs.toYear = DEFAULT_TO_YEAR;

    await savePrefs(prefs);
  }

  const artists = await listArtists(prefs.fromYear, prefs.toYear);

  return {
    props: {
      fromYear: prefs.fromYear,
      toYear: prefs.toYear,
      artists: artists
    }
  };
}) satisfies GetServerSideProps<ArtistsPageProps>;

interface ArtistsPageProps {
  fromYear: number,
  toYear: number,
  artists: Artist[]
}

export default function ArtistsPage({ fromYear, toYear, artists }: ArtistsPageProps) {
  return (
    <CollapseDesktop>
      <HeadComponent pageName={"Artists"}/>
      <Group mt={25} ml={25} mr={25} justify="space-between" grow>
        <ArtistTable fromYear={fromYear} toYear={toYear} artists={artists}/>
      </Group>
    </CollapseDesktop>
  );
}
