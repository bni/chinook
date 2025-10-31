import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { Employee, Customer } from "@lib/employees/types";
import { useEffect, useState } from "react";
import orderBy from "lodash/orderBy";
import { EmployeeRow } from "./EmployeeRow";
import { EmployeeCustomerRow } from "./EmployeeCustomerRow";

interface EmployeeTableProps {
  employees: Employee[]
}

export function EmployeeTable({ employees }: EmployeeTableProps) {
  const [ sortStatus, setSortStatus ] = useState<DataTableSortStatus<Employee>>({
    columnAccessor: "title",
    direction: "asc"
  });

  const [ records, setRecords ] = useState(employees);

  useEffect(() => {
    setRecords(orderBy(employees, sortStatus.columnAccessor, sortStatus.direction));
  }, [ employees, sortStatus ]);

  const [expandedCustomerIds, setExpandedCustomerIds] = useState<number[]>([]);
  const [draggedCustomer, setDraggedCustomer] = useState<{ customer: Customer, sourceEmployeeId: number } | null>(null);

  const handleCustomerDragStart = (customer: Customer, employeeId: number) => {
    setDraggedCustomer({ customer, sourceEmployeeId: employeeId });
  };

  const handleEmployeeRowDrop = async (targetEmployeeId: number) => {
    if (!draggedCustomer) return;

    const { customer, sourceEmployeeId } = draggedCustomer;

    // Don't do anything if dropping on the same employee
    if (targetEmployeeId === sourceEmployeeId) {
      setDraggedCustomer(null);

      return;
    }

    try {
      const response = await fetch(`/api/internal/customers/${customer.customerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ supportRepId: targetEmployeeId })
      });

      if (!response.ok) {
        console.error("Failed to update customer support rep");
      } else {
        // Reload the page to reflect the changes
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to update customer", error);
    }

    setDraggedCustomer(null);
  };

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
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={ async (e) => {
                e.preventDefault();
                await handleEmployeeRowDrop(employeeId);
              }}
            >
              <EmployeeRow
                hasCustomers={!!supportRepForCustomers && supportRepForCustomers.length > 0}
                isExpanded={expandedCustomerIds.includes(employeeId)}
                fullName={fullName}
              />
            </div>
          ),
          width: 400
        },
        { accessor: "title", title: "Title", sortable: true, width: 400 },
        { accessor: "city", title: "City", sortable: true, width: 200 },
        { accessor: "email", title: "E-mail", sortable: true, width: 200 },
        { accessor: "phone", title: "Phone", sortable: true, width: 200 }
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
                render: (customer) => (
                  <div
                    draggable
                    onDragStart={() => handleCustomerDragStart(customer, employee.record.employeeId)}
                    onDragEnd={() => setDraggedCustomer(null)}
                    style={{ cursor: "grab" }}
                  >
                    <EmployeeCustomerRow
                      firstName={customer.firstName}
                      lastName={customer.lastName}
                      companyName={customer.companyName}
                    />
                  </div>
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
