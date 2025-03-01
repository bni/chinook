import { Table, TableData } from '@mantine/core';

export function ArtistTable({ artists }: any) {
  const tableData: TableData = {
    head: ['Id', 'Name', 'Number albums'],
    body: [
      ...artists
    ]
  };

  return <Table m={100} data={tableData} />;
}
