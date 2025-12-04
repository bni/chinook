import { ActionIcon, Badge, Box, Button, Group, NumberInput, TextInput, Title } from "@mantine/core";
import { DataTable, type DataTableSortStatus } from "mantine-datatable";
import { IconCheck, IconEdit, IconPlus, IconTrash, IconX } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import type { AlbumDetail } from "@lib/artists/types";
import { modals } from "@mantine/modals";
import orderBy from "lodash/orderBy";

interface ArtistSummaryProps {
  artistId: string;
  artistName: string;
  artistsAlbums: AlbumDetail[];
}

export function ArtistDetailTable({ artistId, artistName, artistsAlbums }: ArtistSummaryProps) {
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<AlbumDetail>>({
    columnAccessor: "releaseYear",
    direction: "desc"
  });

  const [ albums, setAlbums ] = useState<AlbumDetail[]>(artistsAlbums);
  const [ records, setRecords ] = useState<AlbumDetail[]>(artistsAlbums);

  const [ editingId, setEditingId ] = useState<string | undefined>(undefined);
  const [ editingAlbum, setEditingAlbum ] = useState<AlbumDetail | null>(null);

  // Sort records when albums or sortStatus changes
  useEffect(() => {
    setRecords(orderBy(albums, sortStatus.columnAccessor, sortStatus.direction));
  }, [albums, sortStatus]);

  const handleEdit = (album: AlbumDetail) => {
    setEditingId(album.albumId);
    setEditingAlbum({ ...album });
  };

  const handleCancel = () => {
    setEditingId(undefined);
    setEditingAlbum(null);
  };

  const handleSave = async (albumId: string) => {
    if (!editingAlbum || !editingAlbum.albumTitle.trim()) {
      return;
    }

    try {
      const response = await fetch(`/api/internal/albums/${albumId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          albumTitle: editingAlbum.albumTitle,
          artistName: artistName,
          releaseYear: editingAlbum.releaseYear,
          label: editingAlbum.label,
          genre: editingAlbum.genre,
          criticScore: editingAlbum.criticScore,
          userScore: editingAlbum.userScore
        })
      });

      if (!response.ok) {
        throw new Error("Failed to update album");
      }

      // Update local state
      setAlbums(prev => prev.map(album =>
        album.albumId === albumId ? editingAlbum : album
      ));

      setEditingId(undefined);
      setEditingAlbum(null);
    } catch (error) {
      console.error("Failed to save album", error);
    }
  };

  const handleDelete = (album: AlbumDetail) => {
    modals.openConfirmModal({
      title: "Delete Album",
      children: `Are you sure you want to delete "${album.albumTitle}"? This action cannot be undone.`,
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/internal/albums/${album.albumId}`, {
            method: "DELETE"
          });

          if (!response.ok) {
            throw new Error("Failed to delete album");
          }

          // Remove from local state
          setAlbums(prev => prev.filter(a => a.albumId !== album.albumId));
        } catch (error) {
          console.error("Failed to delete album", error);
        }
      }
    });
  };

  const handleCreate = () => {
    const currentYear = new Date().getFullYear();

    modals.openConfirmModal({
      title: "Create Album",
      children: (
        <Box>
          <TextInput
            label="Album Title"
            placeholder="Enter album title"
            data-autofocus
            id="create-album-title"
            mb="sm"
          />
          <NumberInput
            label="Release Year"
            placeholder="Enter release year"
            id="create-album-year"
            defaultValue={currentYear}
            mb="sm"
          />
          <TextInput
            label="Label"
            placeholder="Enter label (optional)"
            id="create-album-label"
            mb="sm"
          />
          <TextInput
            label="Genre"
            placeholder="Enter genre (optional)"
            id="create-album-genre"
            mb="sm"
          />
          <NumberInput
            label="Critic Score"
            placeholder="Enter critic score"
            id="create-album-critic-score"
            defaultValue={-1}
            mb="sm"
          />
          <NumberInput
            label="User Score"
            placeholder="Enter user score"
            id="create-album-user-score"
            defaultValue={-1}
            step={0.1}
            decimalScale={1}
          />
        </Box>
      ),
      labels: { confirm: "Create", cancel: "Cancel" },
      onConfirm: async () => {
        const titleInput = document.getElementById("create-album-title") as HTMLInputElement;
        const yearInput = document.getElementById("create-album-year") as HTMLInputElement;
        const labelInput = document.getElementById("create-album-label") as HTMLInputElement;
        const genreInput = document.getElementById("create-album-genre") as HTMLInputElement;
        const criticScoreInput = document.getElementById("create-album-critic-score") as HTMLInputElement;
        const userScoreInput = document.getElementById("create-album-user-score") as HTMLInputElement;

        const albumTitle = titleInput?.value.trim();
        const releaseYear = parseInt(yearInput?.value || `${currentYear}`, 10);
        const label = labelInput?.value.trim();
        const genre = genreInput?.value.trim();
        const criticScore = parseInt(criticScoreInput?.value || "-1", 10);
        const userScore = parseFloat(userScoreInput?.value || "-1");

        if (!albumTitle) {
          return;
        }

        try {
          const response = await fetch("/api/internal/albums", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              albumTitle,
              artistId,
              artistName,
              releaseYear,
              label: label || undefined,
              genre: genre || undefined,
              criticScore,
              userScore
            })
          });

          if (!response.ok) {
            throw new Error("Failed to create album");
          }

          const result = await response.json();

          // Add new album to the table
          const newAlbum: AlbumDetail = {
            albumId: result.albumId,
            albumTitle,
            releaseYear,
            label: label || undefined,
            genre: genre || undefined,
            criticScore,
            userScore
          };

          setAlbums([newAlbum, ...albums]);
        } catch (error) {
          console.error("Failed to create album", error);
        }
      }
    });
  };

  return (
    <Box>
      <Group justify="space-between" mb="md">
        <Title order={2}>{artistName}</Title>
        <Button
          leftSection={ <IconPlus size={ 16 } /> }
          onClick={ handleCreate }
        >
          Create Album
        </Button>
      </Group>

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
            textAlign: "left",
            ellipsis: true,
            render: (album: AlbumDetail) => {
              if (editingId === album.albumId && editingAlbum) {
                return (
                  <TextInput
                    value={ editingAlbum.albumTitle }
                    onChange={ (e) => setEditingAlbum({ ...editingAlbum, albumTitle: e.currentTarget.value }) }
                    onKeyDown={ async (e) => {
                      if (e.key === "Enter") {
                        await handleSave(album.albumId);
                      } else if (e.key === "Escape") {
                        handleCancel();
                      }
                    } }
                    autoFocus
                  />
                );
              }
              return album.albumTitle;
            }
          },
          {
            accessor: "label",
            title: "Label",
            sortable: true,
            textAlign: "left",
            width: "250px",
            ellipsis: true,
            render: (album: AlbumDetail) => {
              if (editingId === album.albumId && editingAlbum) {
                return (
                  <TextInput
                    value={ editingAlbum.label || "" }
                    onChange={ (e) => setEditingAlbum({ ...editingAlbum, label: e.currentTarget.value }) }
                    placeholder="Label"
                  />
                );
              }
              return album.label || "";
            }
          },
          {
            accessor: "genre",
            title: "Genre",
            sortable: true,
            textAlign: "left",
            width: "250px",
            ellipsis: true,
            render: (album: AlbumDetail) => {
              if (editingId === album.albumId && editingAlbum) {
                return (
                  <TextInput
                    value={ editingAlbum.genre || "" }
                    onChange={ (e) => setEditingAlbum({ ...editingAlbum, genre: e.currentTarget.value }) }
                    placeholder="Genre"
                  />
                );
              }
              return album.genre || "";
            }
          },
          {
            accessor: "releaseYear",
            title: "Release Year",
            sortable: true,
            textAlign: "right",
            width: "150px",
            render: (album: AlbumDetail) => {
              if (editingId === album.albumId && editingAlbum) {
                return (
                  <NumberInput
                    value={ editingAlbum.releaseYear }
                    onChange={ (value) => setEditingAlbum({ ...editingAlbum, releaseYear: Number(value) }) }
                    placeholder="Year"
                  />
                );
              }
              return (
                <Group justify="flex-end">
                  <Badge color="orange" variant="light">
                    {album.releaseYear}
                  </Badge>
                </Group>
              );
            }
          },
          {
            accessor: "criticScore",
            title: "Critic Score",
            sortable: true,
            textAlign: "center",
            width: "130px",
            render: (album: AlbumDetail) => {
              if (editingId === album.albumId && editingAlbum) {
                return (
                  <NumberInput
                    value={ editingAlbum.criticScore }
                    onChange={ (value) => setEditingAlbum({ ...editingAlbum, criticScore: Number(value) }) }
                    placeholder="Score"
                  />
                );
              }
              return album.criticScore;
            }
          },
          {
            accessor: "userScore",
            title: "User Score",
            sortable: true,
            textAlign: "center",
            width: "130px",
            render: (album: AlbumDetail) => {
              if (editingId === album.albumId && editingAlbum) {
                return (
                  <NumberInput
                    value={ editingAlbum.userScore }
                    onChange={ (value) => setEditingAlbum({ ...editingAlbum, userScore: Number(value) }) }
                    placeholder="Score"
                    step={0.1}
                    decimalScale={1}
                  />
                );
              }
              return album.userScore.toFixed(1);
            }
          },
          {
            accessor: "actions",
            title: "",
            textAlign: "center",
            width: "80px",
            render: (album: AlbumDetail) => {
              if (editingId === album.albumId) {
                return (
                  <Group gap="xs" justify="center" wrap="nowrap">
                    <ActionIcon
                      color="green"
                      onClick={ () => handleSave(album.albumId) }
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
                    onClick={ () => handleEdit(album) }
                  >
                    <IconEdit size={ 16 } />
                  </ActionIcon>
                  <ActionIcon
                    color="red"
                    onClick={ () => handleDelete(album) }
                  >
                    <IconTrash size={ 16 } />
                  </ActionIcon>
                </Group>
              );
            }
          }
        ]}
      />
    </Box>
  );
}
