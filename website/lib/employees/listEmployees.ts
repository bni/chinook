import { Customer, Employee } from "@lib/employees/employee";
import { query, Result } from "@lib/util/postgres";

interface ResultRow {
  employeeId: number,
  employeeFirstName: string,
  employeeLastName: string,
  employeeTitle: string | null,
  customerId: number | null,
  customerFirstName: string,
  customerLastName: string,
  customerCompanyName: string | null
}

export async function listEmployees(): Promise<Employee[]> {
  const employees: Employee[] = [];

  try {
    const result: Result<ResultRow> = await query(`

      SELECT
        e.employee_id AS "employeeId",
        e.first_name AS "employeeFirstName",
        e.last_name AS "employeeLastName",
        e.title AS "employeeTitle",
        c.customer_id AS "customerId",
        c.first_name AS "customerFirstName",
        c.last_name AS "customerLastName",
        c.company AS "customerCompanyName"
      FROM
        employee e
      LEFT JOIN
        customer c ON e.employee_id = c.support_rep_id
      ORDER BY
        e.employee_id ASC, c.customer_id ASC

    `);

    if (result.rows) {
      const rows = result.rows;

      let currentEmployee: Employee | undefined;

      for (const row of rows) {
        if (!currentEmployee || currentEmployee.employeeId !== row.employeeId) {
          currentEmployee = {
            employeeId: row.employeeId,
            firstName: row.employeeFirstName,
            lastName: row.employeeLastName,
            fullName: `${row.employeeFirstName} ${row.employeeLastName}`,
            ...(row.employeeTitle && { title: row.employeeTitle })
          };

          employees.push(currentEmployee);
        }

        if (row.customerId) {
          if (!currentEmployee.supportRepForCustomers) {
            currentEmployee.supportRepForCustomers = [];
          }

          const customer: Customer = {
            customerId: row.customerId,
            firstName: row.customerFirstName,
            lastName: row.customerLastName,
            ...(row.customerCompanyName && { companyName: row.customerCompanyName })
          };

          currentEmployee.supportRepForCustomers.push(customer);
        }
      }
    }
  } catch (error) {
    console.log(error);

    throw error;
  }

  return employees;
}
