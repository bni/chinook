import { Employee } from "@lib/types";
import { listEmployees } from "@lib/listEmployees/listEmployees";
import testRows from "./testRows.json";
import expectedResult from "./expectedResult.json";
import { oracleMock } from "@lib/util/oracleMock";

test("List employees", async () => {
  const oracledb = oracleMock(testRows);

  const employees: Employee[] = await listEmployees(oracledb);

  expect(employees).toStrictEqual(expectedResult);
});
