"use client";

import { useQuery } from "@tanstack/react-query";
import type { DataTableProps, DataTableSortStatus } from "mantine-datatable";
import { DataTable } from "mantine-datatable";
import { useState } from "react";
import { listEmployees, type Employee } from "@lib/complex/listEmployees";

const PAGE_SIZE = 25;

export function ComplexTable() {
  const [page, setPage] = useState(1);

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<Employee>>({
    columnAccessor: "name",
    direction: "asc"
  });

  const { data, isFetching } = useQuery({
    queryKey: ["employees", sortStatus.columnAccessor, sortStatus.direction, page],
    queryFn: () => listEmployees({ page, recordsPerPage: PAGE_SIZE, sortStatus })
  });

  const handleSortStatusChange = (status: DataTableSortStatus<Employee>) => {
    setPage(1);
    setSortStatus(status);
  };

  const columns: DataTableProps<Employee>["columns"] = [
    {
      accessor: "name",
      noWrap: true,
      sortable: true,
      render: ({ firstName, lastName }) => `${firstName} ${lastName}`
    },
    {
      accessor: "email",
      sortable: true
    },
    {
      accessor: "department.company.name",
      title: "Company",
      noWrap: true,
      sortable: true
    },
    {
      accessor: "department.name",
      title: "Department",
      sortable: true
    },
    {
      accessor: "department.company.city",
      title: "City",
      noWrap: true
    },
    {
      accessor: "department.company.state",
      title: "State"
    },
    {
      accessor: "age",
      width: 80,
      textAlign: "right",
      sortable: true,
      render: () => 5
    }
  ];

  return (
    <DataTable
      withTableBorder
      highlightOnHover
      withColumnBorders
      striped
      columns={columns}
      fetching={isFetching}
      records={data?.employees}
      page={page}
      onPageChange={setPage}
      totalRecords={data?.total}
      recordsPerPage={ PAGE_SIZE }
      sortStatus={sortStatus}
      onSortStatusChange={handleSortStatusChange}
    />
  );
}
