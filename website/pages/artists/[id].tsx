import { CollapseDesktop } from "@components/CollapseDesktop";
import { Group } from "@mantine/core";
import { ArtistSummary } from "@components/artists/ArtistSummary";
import { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { HeadComponent } from "@components/HeadComponent";
import { getArtistDetail } from "@lib/artists/getArtistDetail";
import { ArtistDetail } from "@lib/artists/types";

interface ArtistDetailPageProps {
  artistDetail: ArtistDetail
}

export const getServerSideProps = (async (context: GetServerSidePropsContext) => {
  const { id } = context.query;

  if (!id || typeof id !== "string") {
    return {
      notFound: true
    };
  }

  const artistDetail = await getArtistDetail(id);

  if (!artistDetail) {
    return {
      notFound: true
    };
  }

  return {
    props: {
      artistDetail
    }
  };
}) satisfies GetServerSideProps<ArtistDetailPageProps>;

export default function ArtistDetailPage({
  artistDetail
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <CollapseDesktop>
      <HeadComponent pageName={"Artists"} subPageName={artistDetail.artistName}/>
      <Group mt={25} ml={25} mr={25} justify="space-between" grow>
        <ArtistSummary
          artistId={artistDetail.artistId}
          artistName={artistDetail.artistName}
          artistsAlbums={artistDetail.albums}
        />
      </Group>
    </CollapseDesktop>
  );
}
