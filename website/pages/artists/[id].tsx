import { ActionIcon, Group } from "@mantine/core";
import type { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useEffect, useState } from "react";
import type { ArtistDetail } from "@lib/artists/types";
import { ArtistDetailTable } from "@components/artists/ArtistDetailTable";
import { CollapseDesktop } from "@components/CollapseDesktop";
import { HeadComponent } from "@components/HeadComponent";
import { IconArrowLeft } from "@tabler/icons-react";
import { getArtistDetail } from "@lib/artists/getArtistDetail";
import { useRouter } from "next/router";

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
  const router = useRouter();

  const [hasHistory, setHasHistory] = useState<boolean>(false);

  useEffect(() => {
    setHasHistory(!!(window.history?.length && window.history.length > 1));
  }, [ hasHistory ]);

  return (
    <CollapseDesktop>
      <HeadComponent pageName={"Artists"} subPageName={artistDetail.artistName}/>
      <ActionIcon
        mt={25} ml={25}
        variant="subtle" aria-label="Go back"
        size="lg"
        onClick={() => {
          if (hasHistory) {
            router.back();
          }
        }}
        disabled={!hasHistory}
      >
        <IconArrowLeft stroke={1.5} />
      </ActionIcon>
      <Group mt={25} ml={25} mr={25} justify="space-between" grow>
        <ArtistDetailTable
          artistId={artistDetail.artistId}
          artistName={artistDetail.artistName}
          artistsAlbums={artistDetail.albums}
        />
      </Group>
    </CollapseDesktop>
  );
}
