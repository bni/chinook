import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { Employee, Customer } from "@lib/employees/employee";
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
    const data = sortBy(employees, [
      (employee) => !(employee.supportRepForCustomers && employee.supportRepForCustomers.length > 0),
      sortStatus.columnAccessor
    ]) as Employee[];

    setRecords(sortStatus.direction === "desc" ? data.reverse() : data);
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
      const response = await fetch(`/api/customers/${customer.customerId}`, {
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
      console.error("Error updating customer:", error);
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
              <EmployeeRow params={{
                hasCustomers: !!supportRepForCustomers && supportRepForCustomers.length > 0,
                isExpanded: expandedCustomerIds.includes(employeeId),
                fullName: fullName
              }}/>
            </div>
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
                render: (customer) => (
                  <div
                    draggable
                    onDragStart={() => handleCustomerDragStart(customer, employee.record.employeeId)}
                    onDragEnd={() => setDraggedCustomer(null)}
                    style={{ cursor: "grab" }}
                  >
                    <EmployeeCustomerRow params={{
                      firstName: customer.firstName,
                      lastName: customer.lastName,
                      companyName: customer.companyName
                    }}/>
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
