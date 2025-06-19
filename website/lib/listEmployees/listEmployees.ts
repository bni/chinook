import { Employee } from "@lib/types";

export async function listEmployees(oracledb: any): Promise<Employee[]> {
  const employees: Employee[] = [];

  let connection;
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(`
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
            FULL OUTER JOIN
          customer c ON e.employeeid = c.supportrepid
        ORDER BY
          e.employeeid
      `,
    [],
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows) {
      const rows = result.rows;

      let currentEmployee: Employee | undefined = undefined;

      for (const row of rows) {
        if (!currentEmployee || currentEmployee.employeeId !== row.employeeId) {
          currentEmployee = {
            employeeId: row.employeeId,
            firstName: row.employeeFirstName,
            lastName: row.employeeLastName,
            fullName: `${row.employeeFirstName} ${row.employeeLastName}`,
            title: row.employeeTitle
          };

          employees.push(currentEmployee);
        }

        if (row.customerId) {
          if (!currentEmployee.supporRepForCustomers) {
            currentEmployee.supporRepForCustomers = [];
          }

          const customer = {
            customerId: row.customerId,
            firstName: row.customerFirstName,
            lastName: row.customerLastName,
            companyName: row.customerCompanyName
          };

          currentEmployee.supporRepForCustomers.push(customer);
        }
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    if (connection) { await connection.close(); }
  }

  return employees;
}
