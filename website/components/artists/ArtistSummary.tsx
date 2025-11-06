import { DataTable, DataTableSortStatus } from "mantine-datatable";
import React, { useState, useEffect } from "react";
import { Badge, Box, Group, Title } from "@mantine/core";
import orderBy from "lodash/orderBy";
import { AlbumDetail } from "@lib/artists/types";

interface ArtistSummaryProps {
  artistId: string;
  artistName: string;
  artistsAlbums: AlbumDetail[];
}

export function ArtistSummary({ artistName, artistsAlbums }: ArtistSummaryProps) {
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<AlbumDetail>>({
    columnAccessor: "releaseYear",
    direction: "desc"
  });

  const [ albums ] = useState<AlbumDetail[]>(artistsAlbums);
  const [ records, setRecords ] = useState<AlbumDetail[]>(artistsAlbums);

  // Sort records when albums or sortStatus changes
  useEffect(() => {
    setRecords(orderBy(albums, sortStatus.columnAccessor, sortStatus.direction));
  }, [albums, sortStatus]);

  return (
    <Box>
      <Title order={2} mb="xl">{artistName}</Title>

      <DataTable
        withTableBorder
        withColumnBorders
        striped
        highlightOnHover
        fz="md"
        idAccessor="albumId"
        records={ records }
        sortStatus={ sortStatus }
        onSortStatusChange={ setSortStatus }
        columns={[
          {
            accessor: "albumTitle",
            title: "Album",
            sortable: true,
            width: "40%"
          },
          {
            accessor: "releaseYear",
            title: "Release Year",
            sortable: true,
            width: "15%",
            render: (albumDetail: AlbumDetail) => {
              return (
                <Group justify="flex-end">
                  <Badge color="orange" variant="light">
                    {albumDetail.releaseYear}
                  </Badge>
                </Group>
              );
            }
          },
          {
            accessor: "label",
            title: "Label",
            sortable: true,
            width: "20%",
            render: (album: AlbumDetail) => album.label
          },
          {
            accessor: "genre",
            title: "Genre",
            sortable: true,
            width: "15%",
            render: (album: AlbumDetail) => album.genre
          },
          {
            accessor: "criticScore",
            title: "Critic Score",
            sortable: true,
            textAlign: "center",
            width: "10%"
          },
          {
            accessor: "userScore",
            title: "User Score",
            sortable: true,
            textAlign: "center",
            width: "10%",
            render: (album: AlbumDetail) => album.userScore.toFixed(1)
          }
        ]}
      />
    </Box>
  );
}
