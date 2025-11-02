import { CollapseDesktop } from "@components/CollapseDesktop";
import { Group } from "@mantine/core";
import { ArtistTable } from "@components/artists/ArtistTable";
import { Artist } from "@lib/artists/types";
import { listArtists } from "@lib/artists/listArtists";
import { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { getPrefs } from "@lib/util/prefs";
import { HeadComponent } from "@components/HeadComponent";

interface ArtistsPageProps {
  fromYear: number,
  toYear: number,
  pageSize: number,
  artists: Artist[]
}

export const getServerSideProps = (async (context: GetServerSidePropsContext) => {
  const prefs = await getPrefs(context.req, context.res);

  const artists = await listArtists(prefs.artistsFromYear, prefs.artistsToYear);

  return {
    props: {
      fromYear: prefs.artistsFromYear,
      toYear: prefs.artistsToYear,
      pageSize: prefs.artistsPageSize,
      artists: artists
    }
  };
}) satisfies GetServerSideProps<ArtistsPageProps>;

export default function ArtistsPage({
  fromYear, toYear, pageSize, artists
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <CollapseDesktop>
      <HeadComponent pageName={"Artists"}/>
      <Group mt={25} ml={25} mr={25} justify="space-between" grow>
        <ArtistTable fromYear={fromYear} toYear={toYear} pageSize={pageSize} artists={artists}/>
      </Group>
    </CollapseDesktop>
  );
}
