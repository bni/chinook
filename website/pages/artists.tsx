import { CollapseDesktop } from "@components/CollapseDesktop";
import { Group } from "@mantine/core";
import { ArtistTable } from "@components/artists/ArtistTable";
import { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { getPrefs } from "@lib/util/prefs";
import { HeadComponent } from "@components/HeadComponent";
import { ArtistSearchResult } from "@lib/artists/types";
import { uuidv7 } from "uuidv7";

interface ArtistsPageProps {
  fromYear: number,
  toYear: number,
  pageSize: number
}

export const getServerSideProps = (async (context: GetServerSidePropsContext) => {
  const prefs = await getPrefs(context.req, context.res);

  const artists = [];

  for (let i = 0; i < prefs.artistsPageSize; i++) {
    artists.push({
      artistId: uuidv7(),
      artistName: "",
      nrAlbums: 0
    });
  }

  const placeholderResult: ArtistSearchResult = {
    artists: artists,
    total: prefs.artistsPageSize
  };

  return {
    props: {
      fromYear: prefs.artistsFromYear,
      toYear: prefs.artistsToYear,
      pageSize: prefs.artistsPageSize,
      filter: prefs.artistsFilter,
      placeholderResult: placeholderResult
    }
  };
}) satisfies GetServerSideProps<ArtistsPageProps>;

export default function ArtistsPage({
  fromYear, toYear, filter, pageSize, placeholderResult
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <CollapseDesktop>
      <HeadComponent pageName={"Artists"}/>
      <Group mt={25} ml={25} mr={25} justify="space-between" grow>
        <ArtistTable
          fromYear={fromYear}
          toYear={toYear}
          filter={filter}
          pageSize={pageSize}
          placeholderResult={placeholderResult}/>
      </Group>
    </CollapseDesktop>
  );
}
