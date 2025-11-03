import { CollapseDesktop } from "@components/CollapseDesktop";
import { Group } from "@mantine/core";
import { ArtistTable } from "@components/artists/ArtistTable";
import { ArtistSearchResult } from "@lib/artists/types";
import { listArtists } from "@lib/artists/listArtists";
import { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { getPrefs } from "@lib/util/prefs";
import { HeadComponent } from "@components/HeadComponent";
import { logger } from "@lib/util/logger";

interface ArtistsPageProps {
  fromYear: number,
  toYear: number,
  pageSize: number,
  searchResult: ArtistSearchResult
}

export const getServerSideProps = (async (context: GetServerSidePropsContext) => {
  const prefs = await getPrefs(context.req, context.res);

  const searchResult: ArtistSearchResult = await listArtists(
    prefs.artistsFromYear,
    prefs.artistsToYear,
    prefs.artistsFilter,
    1, // TODO Remember ?
    prefs.artistsPageSize);

  return {
    props: {
      fromYear: prefs.artistsFromYear,
      toYear: prefs.artistsToYear,
      pageSize: prefs.artistsPageSize,
      filter: prefs.artistsFilter,
      searchResult: searchResult
    }
  };
}) satisfies GetServerSideProps<ArtistsPageProps>;

export default function ArtistsPage({
  fromYear, toYear, filter, pageSize, searchResult
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <CollapseDesktop>
      <HeadComponent pageName={"Artists"}/>
      <Group mt={25} ml={25} mr={25} justify="space-between" grow>
        <ArtistTable fromYear={fromYear} toYear={toYear} filter={filter} pageSize={pageSize} searchResult={searchResult}/>
      </Group>
    </CollapseDesktop>
  );
}
