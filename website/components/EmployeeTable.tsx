import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { Employee } from "@lib/types/employee";
import { useEffect, useState } from "react";
import sortBy from "lodash/sortBy";
import { IconChevronRight, IconX, IconUser, IconBuilding } from "@tabler/icons-react";
import clsx from "clsx";
import classes from './EmployeeTable.module.css';
import { Box } from "@mantine/core";

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
          accessor: 'fullName',
          title: 'Name / Customer',
          noWrap: true,
          sortable: true,
          render: ({ employeeId, fullName, supporRepForCustomers }) => (
            <>
              {supporRepForCustomers && supporRepForCustomers.length > 0 ?
                  <IconChevronRight
                    className={clsx(classes.icon, classes.expandIcon, {
                      [classes.expandIconRotated]: expandedCustomerIds.includes(employeeId),
                    })}
                  />
                :
                <IconX className={classes.icon} />
              }
              <IconUser className={classes.icon} />
              <span>{fullName}</span>
            </>
          ),
          width: 400
        },
        { accessor: "title", sortable: true, width: 400 }
      ]}
      records={ records }
      rowExpansion={{
        allowMultiple: true,
        expanded: { recordIds: expandedCustomerIds, onRecordIdsChange: setExpandedCustomerIds },
        "expandable": ({ record: { supporRepForCustomers } }) => !!supporRepForCustomers,
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
                  <Box component="span" ml={20}>
                    <IconBuilding className={classes.icon} />
                    <span>{firstName} {lastName}{companyName && ', ' + companyName}</span>
                  </Box>
                )
              }
            ]}
            records={ employee.record.supporRepForCustomers }
          />
        )
      }}
      sortStatus={ sortStatus }
      onSortStatusChange={ setSortStatus }
    />
  );
}
