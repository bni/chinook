import type { Customer, Employee } from "@lib/employees/types";
import { Result, query } from "@lib/util/postgres";
import { logger } from "@lib/util/logger";
import orderBy from "lodash/orderBy";

interface ResultRow {
  employeeId: number,
  employeeFirstName: string,
  employeeLastName: string,
  employeeTitle: string | null,
  employeeCity: string | null,
  employeeEmail: string | null,
  employeePhone: string | null,
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
        e.city AS "employeeCity",
        e.email AS "employeeEmail",
        e.phone AS "employeePhone",
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
            ...(row.employeeTitle && { title: row.employeeTitle }),
            ...(row.employeeCity && { city: row.employeeCity }),
            ...(row.employeeEmail && { email: row.employeeEmail }),
            ...(row.employeePhone && { phone: row.employeePhone })
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
    logger.error(error, "Failed to list employees");

    throw error;
  }

  return orderBy(employees, "title", "asc");
}
