import { Employee } from "@lib/employees/employee";
import { listEmployees } from "@lib/employees/listEmployees";
import { Pool } from "pg";
import testRows from "./testRows.json";
import expectedResult from "./expectedResult.json";

test("List employees", async () => {
  const queryResult = {
    rows: testRows
  };

  jest.spyOn(Pool.prototype, "query").mockImplementation(() => queryResult);

  const employees: Employee[] = await listEmployees();

  expect(employees).toStrictEqual(expectedResult);
});
