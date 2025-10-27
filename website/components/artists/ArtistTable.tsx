import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useEffect, useState } from "react";
import { ActionIcon, TextInput, Group, Button, Box } from "@mantine/core";
import { IconEdit, IconCheck, IconX, IconTrash, IconPlus, IconSearch } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import orderBy from "lodash/orderBy";
import { Artist } from "@lib/artists/types";

const PAGE_SIZES = [10, 50, 100];
const DEFAULT_PAGE_SIZE = 50;

export function ArtistTable({ artists }: { artists: Artist[] }) {
  const [ sortStatus, setSortStatus ] = useState<DataTableSortStatus<Artist>>({
    columnAccessor: "nrAlbums",
    direction: "desc"
  });

  const [ records, setRecords ] = useState(artists);
  const [ editingId, setEditingId ] = useState<number | null>(null);
  const [ editingName, setEditingName ] = useState("");
  const [ isLoading, setIsLoading ] = useState(false);
  const [ page, setPage ] = useState(1);
  const [ searchQuery, setSearchQuery ] = useState("");
  const [ pageSize, setPageSize ] = useState(() => {
    return DEFAULT_PAGE_SIZE;
  });

  useEffect(() => {
    if (sortStatus.columnAccessor === "nrAlbums") {
      setRecords(orderBy(artists, (artist: Artist) => { return Number(artist.nrAlbums); }, sortStatus.direction));
    } else {
      setRecords(orderBy(artists, sortStatus.columnAccessor, sortStatus.direction));
    }
  }, [ artists, sortStatus ]);

  // Filter records based on search query
  const filteredRecords = records.filter((artist) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return artist.artistName.toLowerCase().includes(query);
  });

  // Calculate paginated records from filtered results
  const from = (page - 1) * pageSize;
  const to = from + pageSize;
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

  const handleSave = async (artistId: number) => {
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
      setRecords(prev => prev.map(artist =>
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
          setRecords(prev => prev.filter(a => a.artistId !== artist.artistId));
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

          // Refresh the page to show the new artist
          window.location.reload();
        } catch (error) {
          console.error("Failed to create artist", error);
        }
      }
    });
  };

  return (
    <Box>
      <Group justify="space-between" mb="md">
        <TextInput
          placeholder="Search artists..."
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
        recordsPerPage={ pageSize }
        recordsPerPageOptions={ PAGE_SIZES }
        onRecordsPerPageChange={ setPageSize }
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
              accessor: "mostRecentAlbum",
              title: "Most Recent Album",
              sortable: true,
              width: "300px",
              ellipsis: true
            },
            {
              accessor: "nrAlbums",
              title: "Albums",
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
