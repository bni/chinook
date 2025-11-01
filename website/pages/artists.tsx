import { CollapseDesktop } from "@components/CollapseDesktop";
import { Group } from "@mantine/core";
import { ArtistTable } from "@components/artists/ArtistTable";
import { Artist } from "@lib/artists/types";
import { listArtists } from "@lib/artists/listArtists";
import { SliderProps } from "@components/artists/interfaces";
import { logger } from "@lib/util/logger";
import { GetServerSideProps, GetServerSidePropsContext } from "next";

const buildMarks = (start: number, end: number, steps: number) => {
  const minYear = start;

  const marks = [];
  for (let year = minYear; year <= end; year += steps) {
    marks.push({
      value: year, label: year.toString()
    });
  }

  const maxYear = marks[marks.length - 1].value;

  return { minYear, maxYear, marks };
};

export const getServerSideProps = (async (context: GetServerSidePropsContext) => {
  const { minYear, maxYear, marks } = buildMarks(1940, 2030, 10);

  const userId = context.req.headers["x-chinook-user-id"];

  logger.info({ userId });

  const defaultRange: [number, number] = [1991, 2004];

  const artists = await listArtists(defaultRange[0], defaultRange[1]);

  return {
    props: {
      minYear: minYear,
      maxYear: maxYear,
      marks: marks,
      defaultRange: defaultRange,
      artists: artists
    }
  };
}) satisfies GetServerSideProps<ArtistsPageProps>;

interface ArtistsPageProps extends SliderProps {
  artists: Artist[],
}

export default function ArtistsPage({ minYear, maxYear, marks, defaultRange, artists }: ArtistsPageProps) {
  return (
    <CollapseDesktop>
      <Group mt={25} ml={25} mr={25} justify="space-between" grow>
        <ArtistTable minYear={minYear} maxYear={maxYear} marks={marks} defaultRange={defaultRange} artists={artists}/>
      </Group>
    </CollapseDesktop>
  );
}
