import { Employee } from "@lib/employees/employee";
import { listEmployees } from "@lib/employees/listEmployees";
import { Pool } from "pg";
import sinon from "sinon";
import testRows from "./testRows.json";
import expectedResult from "./expectedResult.json";

test("List employees", async () => {
  sinon.stub(Pool.prototype, "query").resolves({
    rows: testRows
  });

  const employees: Employee[] = await listEmployees();

  expect(employees).toStrictEqual(expectedResult);
});
