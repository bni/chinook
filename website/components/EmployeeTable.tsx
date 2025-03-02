import { DataTable } from "mantine-datatable";

export function EmployeeTable({ employees }: any) {
  return (
    <DataTable
      withTableBorder
      withColumnBorders
      striped
      highlightOnHover
      fz="md"
      idAccessor="employeeId"
      columns={
        [
          { accessor: "employeeId", hidden: true },
          { accessor: "fullName" },
          { accessor: "title" }
        ]
      }
      records={ employees }
    />
  );
}
