import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useEffect, useState } from "react";
import { ActionIcon, TextInput, Group } from "@mantine/core";
import { IconEdit, IconCheck, IconX, IconTrash } from "@tabler/icons-react";
import { modals } from "@mantine/modals";

import sortBy from "lodash/sortBy";
import { Artist } from "@lib/artists/artist";
import { logger } from "@lib/util/logger";

export function ArtistTable({ artists }: { artists: Artist[] }) {
  const [ sortStatus, setSortStatus ] = useState<DataTableSortStatus<Artist>>({
    columnAccessor: "artistName",
    direction: "asc"
  });

  const [ records, setRecords ] = useState(artists);
  const [ editingId, setEditingId ] = useState<number | null>(null);
  const [ editingName, setEditingName ] = useState("");
  const [ isLoading, setIsLoading ] = useState(false);

  useEffect(() => {
    const data = sortBy(artists, sortStatus.columnAccessor) as Artist[];

    setRecords(sortStatus.direction === "desc" ? data.reverse() : data);
  }, [ artists, sortStatus ]);

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
      logger.error(error, "Failed to save artist");
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
          logger.error(error, "Failed to delete artist");
        }
      }
    });
  };

  return (
    <DataTable
      withTableBorder
      withColumnBorders
      striped
      highlightOnHover
      fz="md"
      idAccessor="artistId"
      records={ records }
      columns={
        [
          { accessor: "artistId", hidden: true },
          {
            accessor: "artistName",
            sortable: true,
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
          { accessor: "nrAlbums", sortable: true },
          {
            accessor: "actions",
            title: "Actions",
            textAlign: "center",
            render: (artist: Artist) => {
              if (editingId === artist.artistId) {
                return (
                  <Group gap="xs" justify="center">
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
                <Group gap="xs" justify="center">
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
  );
}
