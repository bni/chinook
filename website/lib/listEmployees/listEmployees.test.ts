import { Employee } from "@lib/types/employee";
import { listEmployees } from "@lib/listEmployees/listEmployees";
import oracledb from "oracledb";
import sinon from "sinon";
import testRows from "./testRows.json";
import expectedResult from "./expectedResult.json";

test("List employees", async () => {
  sinon.stub(oracledb, "getConnection").resolves({
    execute: function() {},
    close: function() {}
  });

  const connection = await oracledb.getConnection();

  sinon.stub(connection, "execute").resolves({
    rows: testRows
  });

  const employees: Employee[] = await listEmployees();

  expect(employees).toStrictEqual(expectedResult);
});
