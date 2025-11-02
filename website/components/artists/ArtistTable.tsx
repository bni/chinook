import { DataTable, DataTableSortStatus } from "mantine-datatable";
import React, { useEffect, useState } from "react";
import { ActionIcon, TextInput, Group, Button, Box, Text, Badge } from "@mantine/core";
import { IconEdit, IconCheck, IconX, IconTrash, IconPlus, IconSearch } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import orderBy from "lodash/orderBy";
import { Artist } from "@lib/artists/types";
import { YearSlider } from "./YearSlider";

interface ArtistTableProps {
  fromYear: number,
  toYear: number,
  filter: string,
  pageSize: number,
  artists: Artist[]
}

export function ArtistTable({ fromYear, toYear, filter, pageSize, artists }: ArtistTableProps) {
  const [ sortStatus, setSortStatus ] = useState<DataTableSortStatus<Artist>>({
    columnAccessor: "mostRecentAlbumTitle",
    direction: "asc"
  });

  const [ artistsData, setArtistsData ] = useState(artists);
  const [ records, setRecords ] = useState(artists);
  const [ editingId, setEditingId ] = useState<string | null>(null);
  const [ editingName, setEditingName ] = useState("");
  const [ isLoading, setIsLoading ] = useState(false);
  const [ page, setPage ] = useState(1);
  const [ searchQuery, setSearchQuery ] = useState(filter);
  const [ currentPageSize, setCurrentPageSize ] = useState(pageSize);

  // When user changes filter
  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams({
          filter: searchQuery
        });

        const response = await fetch(`/api/internal/artists/prefs/filter?${params.toString()}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          console.error("Failed to save filter");
        } else {
          console.info("Saved filter");
        }
      } catch (error) {
        console.error("Failed to save filter", error);
      }
    })();
  }, [ searchQuery, setSearchQuery ]);

  // When user changes page size
  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams({
          pageSize: currentPageSize.toString()
        });

        const response = await fetch(`/api/internal/artists/prefs/pagesize?${params.toString()}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          console.error("Failed to save pagesize");
        } else {
          console.info("Saved pagesize");
        }
      } catch (error) {
        console.error("Failed to save pagesize", error);
      }
    })();
  }, [ currentPageSize, setCurrentPageSize ]);

  const [selectedRange, setSelectedRange] = useState<[number, number]>([fromYear, toYear]);

  // Fetch artists when selectedRange changes
  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams({
          fromYear: selectedRange[0].toString(),
          toYear: selectedRange[1].toString()
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
          const responseBody = await response.json();
          setArtistsData(responseBody);
        }
      } catch (error) {
        console.error("Failed to fetch artists", error);
      }
    })();
  }, [ selectedRange ]);

  // Sort records when artistsData or sortStatus changes
  useEffect(() => {
    if (sortStatus.columnAccessor === "nrAlbums") {
      setRecords(orderBy(artistsData, (artist: Artist) => { return Number(artist.nrAlbums); }, sortStatus.direction));
    } else if (sortStatus.columnAccessor === "mostRecentAlbumTitle") {
      setRecords(orderBy(artistsData, "mostRecentAlbumYear", sortStatus.direction));
    } else {
      setRecords(orderBy(artistsData, sortStatus.columnAccessor, sortStatus.direction));
    }
  }, [ artistsData, sortStatus ]);

  // Filter records based on search query
  const filteredRecords = records.filter((artist) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return artist.artistName.toLowerCase().includes(query);
  });

  // Calculate paginated records from filtered results
  const from = (page - 1) * currentPageSize;
  const to = from + currentPageSize;
  const paginatedRecords = filteredRecords.slice(from, to);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setPage(1);
  }, [ searchQuery ]);

  const handleEdit = (artist: Artist) => {
    setEditingId(artist.artistId);
    setEditingName(artist.artistName);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleSave = async (artistId: string) => {
    if (!editingName.trim()) {
      return;
    }

    setIsLoading(true);

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
      setArtistsData(prev => prev.map(artist =>
        artist.artistId === artistId
          ? { ...artist, artistName: editingName }
          : artist
      ));

      setEditingId(null);
      setEditingName("");
    } catch (error) {
      console.error("Failed to save artist", error);
    } finally {
      setIsLoading(false);
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
          setArtistsData(prev => prev.filter(a => a.artistId !== artist.artistId));
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
          setArtistsData([ { artistId: "", artistName, nrAlbums: 0 }, ...artistsData ]);
        } catch (error) {
          console.error("Failed to create artist", error);
        }
      }
    });
  };

  const PAGE_SIZES = [10, 20, 30, 40, 50, 100];

  return (
    <Box>
      <Group ml="md" mr="md" grow>
        <YearSlider selectedRange={selectedRange} setSelectedRange={setSelectedRange}/>
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
          value={ searchQuery }
          onChange={ (e) => setSearchQuery(e.currentTarget.value) }
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
        withTableBorder
        withColumnBorders
        striped
        highlightOnHover
        fz="md"
        idAccessor="artistId"
        records={ paginatedRecords }
        page={ page }
        onPageChange={ setPage }
        totalRecords={ filteredRecords.length }
        recordsPerPage={ currentPageSize }
        recordsPerPageOptions={ PAGE_SIZES }
        onRecordsPerPageChange={ setCurrentPageSize }
        columns={
          [
            { accessor: "artistId", hidden: true },
            {
              accessor: "artistName",
              title: "Artist",
              sortable: true,
              width: "500px",
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
                      disabled={ isLoading }
                    />
                  );
                }
                return artist.artistName;
              }
            },
            {
              accessor: "mostRecentAlbumTitle",
              title: "Most recent release",
              sortable: true,
              width: "300px",
              noWrap: true,
              render: (artist: Artist) => {
                return (
                  <Group justify="space-between">
                    <Text>
                      {artist.mostRecentAlbumTitle}
                    </Text>
                    <Badge color="orange" variant="light">
                      {artist.mostRecentAlbumYear}
                    </Badge>
                  </Group>
                );
              }
            },
            {
              accessor: "nrAlbums",
              title: "Nr releases",
              sortable: true,
              noWrap: true,
              width: "80px"
            },
            {
              accessor: "actions",
              title: "",
              textAlign: "center",
              width: "60px",
              render: (artist: Artist) => {
                if (editingId === artist.artistId) {
                  return (
                    <Group gap="xs" justify="center" wrap="nowrap">
                      <ActionIcon
                        color="green"
                        onClick={ () => handleSave(artist.artistId) }
                        disabled={ isLoading }
                      >
                        <IconCheck size={ 16 } />
                      </ActionIcon>
                      <ActionIcon
                        color="red"
                        onClick={ handleCancel }
                        disabled={ isLoading }
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
        sortStatus={ sortStatus }
        onSortStatusChange={ setSortStatus }
      />
    </Box>
  );
}
