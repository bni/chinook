import { test, expect, vi } from "vitest";
import type { Employee } from "./types";
import { listEmployees } from "./listEmployees";
import { Pool } from "pg";
import testRows from "./testRows.json" with { type: "json" };
import expectedResult from "./expectedResult.json" with { type: "json" };

test("List employees", async () => {
  const queryResult = {
    rows: testRows
  };

  vi.spyOn(Pool.prototype, "query").mockImplementation(() => queryResult);

  const employees: Employee[] = await listEmployees();

  expect(employees).toEqual(expectedResult);
});
