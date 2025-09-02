import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useEffect, useState } from "react";

import sortBy from "lodash/sortBy";
import { Artist } from "@lib/types/artist";

export function ArtistTable({ artists }: { artists: Artist[] }) {
  const [ sortStatus, setSortStatus ] = useState<DataTableSortStatus<Artist>>({
    columnAccessor: "artistName",
    direction: "asc"
  });

  const [ records, setRecords ] = useState(artists);

  useEffect(() => {
    const data = sortBy(artists, sortStatus.columnAccessor) as Artist[];

    setRecords(sortStatus.direction === "desc" ? data.reverse() : data);
  }, [ artists, sortStatus ]);

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
          { accessor: "artistName", sortable: true },
          { accessor: "nrAlbums", sortable: true }
        ]
      }
      sortStatus={ sortStatus }
      onSortStatusChange={ setSortStatus }
    />
  );
}
