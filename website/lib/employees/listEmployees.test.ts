import { Employee } from "@lib/employees/types";
import { listEmployees } from "@lib/employees/listEmployees";
import { Pool } from "pg";
import testRows from "./testRows.json" with { type: "json" };
import expectedResult from "./expectedResult.json" with { type: "json" };

import { jest } from "@jest/globals";

test("List employees", async () => {
  const queryResult = {
    rows: testRows
  };

  jest.spyOn(Pool.prototype, "query").mockImplementation(() => queryResult);

  const employees: Employee[] = await listEmployees();

  expect(employees).toEqual(expectedResult);
});
