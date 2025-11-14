import { DataTable, DataTableSortStatus } from "mantine-datatable";
import React, { useEffect, useState } from "react";
import { ActionIcon, TextInput, Group, Button, Box, Text, Badge, Anchor } from "@mantine/core";
import { IconEdit, IconCheck, IconX, IconTrash, IconPlus, IconSearch } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import { Artist, ArtistSearchResult } from "@lib/artists/types";
import { YearSlider } from "./YearSlider";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";

const RECORDS_PER_PAGE_OPTIONS = [10, 20, 30, 40, 50, 100];

interface ArtistTableProps {
  fromYear: number,
  toYear: number,
  filter: string,
  pageSize: number
}

export function ArtistTable({ fromYear, toYear, filter, pageSize }: ArtistTableProps) {
  const router = useRouter();

  const [ sortStatus, setSortStatus ] = useState<DataTableSortStatus<Artist>>({
    columnAccessor: "nrAlbums",
    direction: "desc"
  });

  const [ selectedRange, setSelectedRange ] = useState<[number, number]>([fromYear, toYear]);

  const [ searchFilter, setSearchFilter ] = useState(filter);

  const [ page, setPage ] = useState(1);
  const [ recordsPerPage, setRecordsPerPage ] = useState(pageSize);

  const [ editingId, setEditingId ] = useState<string | undefined>(undefined);
  const [ editingName, setEditingName ] = useState("");

  const fetchArtists = async (
    fromYear: number,
    toYear: number,
    searchFilter: string,
    sortColumn: string,
    sortDirection: string,
    page: number,
    pageSize: number
  ) => {
    try {
      const params = new URLSearchParams({
        fromYear: fromYear.toString(),
        toYear: toYear.toString(),
        searchFilter: searchFilter,
        sortColumn: sortColumn,
        sortDirection: sortDirection,
        page: page.toString(),
        pageSize: pageSize.toString()
      });

      const response = await fetch(`/api/internal/artists/?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        console.error("Failed to list artists");
      } else {
        const artistSearchResult: ArtistSearchResult = await response.json();

        return artistSearchResult;
      }
    } catch (error) {
      console.error("Failed to fetch artists", error);
    }
  };

  // Fetch artists when any search criteria changes
  const { data, isFetching } = useQuery({
    queryKey: ["artists", selectedRange, searchFilter, sortStatus, page, recordsPerPage],
    queryFn: () => fetchArtists(
      selectedRange[0],
      selectedRange[1],
      searchFilter,
      sortStatus.columnAccessor,
      sortStatus.direction,
      page,
      recordsPerPage
    )
  });

  // When user use filter or change the number of records to display we need to reset to page 1
  useEffect(() => {
    setPage(1);
  }, [ searchFilter, recordsPerPage ]);

  const handleEdit = (artist: Artist) => {
    setEditingId(artist.artistId);
    setEditingName(artist.artistName);
  };

  const handleCancel = () => {
    setEditingId(undefined);
    setEditingName("");
  };

  const handleSave = async (artistId: string) => {
    if (!editingName.trim()) {
      return;
    }

    try {
      const response = await fetch(`/api/internal/artists/${artistId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ artistName: editingName })
      });

      if (!response.ok) {
        throw new Error("Failed to update artist");
      }

      // Update local state
      /*setArtists(prev => prev.map(artist =>
        artist.artistId === artistId
          ? { ...artist, artistName: editingName }
          : artist
      ));*/

      setEditingId(undefined);
      setEditingName("");
    } catch (error) {
      console.error("Failed to save artist", error);
    }
  };

  const handleDelete = (artist: Artist) => {
    modals.openConfirmModal({
      title: "Delete Artist",
      children: `Are you sure you want to delete ${artist.artistName}? This action cannot be undone.`,
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/internal/artists/${artist.artistId}`, {
            method: "DELETE"
          });

          if (!response.ok) {
            throw new Error("Failed to delete artist");
          }

          // Remove from local state
          //setArtists(prev => prev.filter(a => a.artistId !== artist.artistId));
        } catch (error) {
          console.error("Failed to delete artist", error);
        }
      }
    });
  };

  const handleCreate = () => {
    modals.openConfirmModal({
      title: "Create Artist",
      children: (
        <TextInput
          label="Artist Name"
          placeholder="Enter artist name"
          data-autofocus
          id="create-artist-input"
        />
      ),
      labels: { confirm: "Create", cancel: "Cancel" },
      onConfirm: async () => {
        const input = document.getElementById("create-artist-input") as HTMLInputElement;
        const artistName = input?.value.trim();

        if (!artistName) {
          return;
        }

        try {
          const response = await fetch("/api/internal/artists", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ artistName })
          });

          if (!response.ok) {
            throw new Error("Failed to create artist");
          }

          // Add it first in the table
          //setArtists([ { artistId: "", artistName, nrAlbums: 0 }, ...artists ]);
        } catch (error) {
          console.error("Failed to create artist", error);
        }
      }
    });
  };

  return (
    <Box>
      <Group ml="md" mr="md" grow>
        <YearSlider selectedRange={ selectedRange } setSelectedRange={ setSelectedRange }/>
      </Group>
      <Group>
        <Text size="lg">
          &nbsp;
        </Text>
      </Group>
      <Group justify="space-between" mt="xl" mb="md">
        <TextInput
          placeholder="Filter..."
          leftSection={ <IconSearch size={ 16 } /> }
          value={ searchFilter }
          onChange={ (e) => setSearchFilter(e.currentTarget.value) }
          w={ 300 }
        />
        <Button
          leftSection={ <IconPlus size={ 16 } /> }
          onClick={ handleCreate }
        >
          Create Artist
        </Button>
      </Group>
      <DataTable
        minHeight={950}
        withTableBorder
        withColumnBorders
        striped
        highlightOnHover
        fz="md"
        idAccessor="artistId"
        fetching={ isFetching }
        loaderType="dots"
        loaderSize="xs"
        loaderColor="orange"
        loaderBackgroundBlur={4}
        records={ data?.artists }
        totalRecords={ data?.total }
        page={ page }
        onPageChange={ setPage }
        recordsPerPageOptions={ RECORDS_PER_PAGE_OPTIONS }
        recordsPerPage={ recordsPerPage }
        onRecordsPerPageChange={ setRecordsPerPage }
        sortStatus={ sortStatus }
        onSortStatusChange={ setSortStatus }
        onCellClick={ async ({ record, columnIndex }) => {
          if (!editingId && columnIndex <= 3) {
            await router.push(`/artists/${record.artistId}`);
          }
        } }
        columns={
          [
            { accessor: "artistId", hidden: true },
            {
              accessor: "artistName",
              title: "Artist",
              sortable: true,
              textAlign: "left",
              ellipsis: true,
              render: (artist: Artist) => {
                if (editingId === artist.artistId) {
                  return (
                    <TextInput
                      value={ editingName }
                      onChange={ (e) => setEditingName(e.currentTarget.value) }
                      onKeyDown={ async (e) => {
                        if (e.key === "Enter") {
                          await handleSave(artist.artistId);
                        } else if (e.key === "Escape") {
                          handleCancel();
                        }
                      } }
                      autoFocus
                    />
                  );
                } else {
                  return (
                    <Anchor href={`/artists/${artist.artistId}`}>
                      {artist.artistName}
                    </Anchor>
                  );
                }
              }
            },
            {
              accessor: "mainlyOnLabel",
              title: "Mainly on Label",
              sortable: true,
              textAlign: "left",
              width: "350px",
              ellipsis: true
            },
            {
              accessor: "mostlyInGenre",
              title: "Mostly in genre",
              sortable: true,
              textAlign: "left",
              width: "250px",
              ellipsis: true
            },
            {
              accessor: "yearRange",
              title: "Years",
              sortable: false,
              textAlign: "right",
              width: "150px",
              render: (artist: Artist) => {
                if (artist.minYear === artist.maxYear) {
                  return (
                    <Badge color="orange" variant="light">
                      {artist.minYear}
                    </Badge>
                  );
                } else {
                  return (
                    <Badge color="orange" variant="light">
                      {artist.minYear} - {artist.maxYear}
                    </Badge>
                  );
                }
              }
            },
            {
              accessor: "nrAlbums",
              title: "Releases",
              sortable: true,
              textAlign: "right",
              width: "130px"
            },
            {
              accessor: "actions",
              title: "",
              textAlign: "center",
              width: "80px",
              render: (artist: Artist) => {
                if (editingId === artist.artistId) {
                  return (
                    <Group gap="xs" justify="center" wrap="nowrap">
                      <ActionIcon
                        color="green"
                        onClick={ () => handleSave(artist.artistId) }
                      >
                        <IconCheck size={ 16 } />
                      </ActionIcon>
                      <ActionIcon
                        color="red"
                        onClick={ handleCancel }
                      >
                        <IconX size={ 16 } />
                      </ActionIcon>
                    </Group>
                  );
                }
                return (
                  <Group gap="xs" justify="center" wrap="nowrap">
                    <ActionIcon
                      color="blue"
                      onClick={ () => handleEdit(artist) }
                    >
                      <IconEdit size={ 16 } />
                    </ActionIcon>
                    <ActionIcon
                      color="red"
                      onClick={ () => handleDelete(artist) }
                    >
                      <IconTrash size={ 16 } />
                    </ActionIcon>
                  </Group>
                );
              }
            }
          ]
        }
      />
    </Box>
  );
}
