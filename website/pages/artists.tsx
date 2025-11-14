import { CollapseDesktop } from "@components/CollapseDesktop";
import { Group } from "@mantine/core";
import { ArtistTable } from "@components/artists/ArtistTable";
import { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { getPrefs } from "@lib/util/prefs";
import { HeadComponent } from "@components/HeadComponent";
import { ArtistTableWrapper } from "@components/artists/ArtistTableWrapper";

interface ArtistsPageProps {
  fromYear: number,
  toYear: number,
  pageSize: number
}

export const getServerSideProps = (async (context: GetServerSidePropsContext) => {
  const prefs = await getPrefs(context.req, context.res);

  return {
    props: {
      fromYear: prefs.artistsFromYear,
      toYear: prefs.artistsToYear,
      pageSize: prefs.artistsPageSize,
      filter: prefs.artistsFilter
    }
  };
}) satisfies GetServerSideProps<ArtistsPageProps>;

export default function ArtistsPage({
  fromYear, toYear, filter, pageSize
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <CollapseDesktop>
      <HeadComponent pageName={"Artists"}/>
      <Group mt={25} ml={25} mr={25} justify="space-between" grow>
        <ArtistTableWrapper>
          <ArtistTable fromYear={fromYear} toYear={toYear} filter={filter} pageSize={pageSize}/>
        </ArtistTableWrapper>
      </Group>
    </CollapseDesktop>
  );
}
