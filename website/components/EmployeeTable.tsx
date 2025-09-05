import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { Employee } from "@lib/types/employee";
import { useEffect, useState } from "react";
import sortBy from "lodash/sortBy";
import { EmployeeRow } from "./EmployeeRow";
import { EmployeeCustomerRow } from "./EmployeeCustomerRow";

export function EmployeeTable({ employees }: { employees: Employee[] }) {
  const [ sortStatus, setSortStatus ] = useState<DataTableSortStatus<Employee>>({
    columnAccessor: "fullName",
    direction: "asc"
  });

  const [ records, setRecords ] = useState(employees);

  useEffect(() => {
    const data = sortBy(employees, sortStatus.columnAccessor) as Employee[];

    setRecords(sortStatus.direction === "desc" ? data.reverse() : data);
  }, [ employees, sortStatus ]);

  const [expandedCustomerIds, setExpandedCustomerIds] = useState<number[]>([]);

  return (
    <DataTable
      withTableBorder
      withColumnBorders
      striped
      highlightOnHover
      fz="md"
      idAccessor="employeeId"
      columns={[
        { accessor: "employeeId", hidden: true },
        {
          accessor: "fullName",
          title: "Name / Customer",
          noWrap: true,
          sortable: true,
          render: ({ employeeId, fullName, supportRepForCustomers }) => (
            <EmployeeRow params={{
              hasCustomers: !!supportRepForCustomers && supportRepForCustomers.length > 0,
              isExpanded: expandedCustomerIds.includes(employeeId),
              fullName: fullName
            }}/>
          ),
          width: 400
        },
        { accessor: "title", sortable: true, width: 400 }
      ]}
      records={ records }
      rowExpansion={{
        allowMultiple: true,
        expanded: { recordIds: expandedCustomerIds, onRecordIdsChange: setExpandedCustomerIds },
        "expandable": ({ record: { supportRepForCustomers } }) => !!supportRepForCustomers,
        "content": (employee) => (
          <DataTable
            noHeader
            withColumnBorders
            idAccessor="customerId"
            columns={[
              { accessor: "customerId", hidden: true },
              {
                accessor: "firstName",
                noWrap: true,
                render: ({ firstName, lastName, companyName }) => (
                  <EmployeeCustomerRow params={{
                    firstName: firstName,
                    lastName: lastName,
                    companyName: companyName
                  }}/>
                )
              }
            ]}
            records={ employee.record.supportRepForCustomers }
          />
        )
      }}
      sortStatus={ sortStatus }
      onSortStatusChange={ setSortStatus }
    />
  );
}
