import { Customer, Employee } from "@lib/types/employee";

import oracledb, { Connection, Result } from "oracledb";

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

  let connection: Connection | undefined;
  try {
    connection = await oracledb.getConnection();

    const result: Result<ResultRow> = await connection.execute(`

      SELECT
        e.employeeid AS "employeeId",
        e.firstname AS "employeeFirstName",
        e.lastname AS "employeeLastName",
        e.title AS "employeeTitle",
        c.customerid AS "customerId",
        c.firstname AS "customerFirstName",
        c.lastname AS "customerLastName",
        c.company AS "customerCompanyName"
      FROM
        employee e
      LEFT JOIN
        customer c ON e.employeeid = c.supportrepid
      ORDER BY
        e.employeeid ASC, c.customerid ASC

      `, [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

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
  } finally {
    if (connection) { await connection.close(); }
  }

  return employees;
}
