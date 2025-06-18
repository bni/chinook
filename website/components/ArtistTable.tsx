import { DataTable } from "mantine-datatable";

export function ArtistTable({ artists }: any) {
  return (
    <DataTable
      withTableBorder
      withColumnBorders
      striped
      highlightOnHover
      fz="md"
      idAccessor="artistId"
      columns={
        [
          { accessor: "artistId", hidden: true },
          { accessor: "artistName" },
          { accessor: "nrAlbums" }
        ]
      }
      records={ artists }
    />
  );
}
