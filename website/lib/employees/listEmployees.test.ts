import { Pool, Result } from "pg";
import { afterAll, beforeAll, expect, test, vi } from "vitest";
import type { Employee } from "./types";
import { PGlite } from "@electric-sql/pglite";
import expectedResult from "./expectedResult.json" with { type: "json" };
import { listEmployees } from "./listEmployees";

let db: PGlite;

beforeAll(async () => {
  db = new PGlite();

  await db.exec(`

    CREATE TABLE customer (
      customer_id INT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      company TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      country TEXT,
      postal_code TEXT,
      phone TEXT,
      fax TEXT,
      email TEXT NOT NULL,
      support_rep_id INT
    );

    CREATE TABLE employee (
      employee_id INT PRIMARY KEY,
      last_name TEXT NOT NULL,
      first_name TEXT NOT NULL,
      title TEXT,
      reports_to INT,
      birth_date DATE,
      hire_date DATE,
      address TEXT,
      city TEXT,
      state TEXT,
      country TEXT,
      postal_code TEXT,
      phone TEXT,
      fax TEXT,
      email TEXT
    );

  `);

  await db.exec(`

    INSERT INTO employee (employee_id, last_name, first_name, title) VALUES
      (42, 'Doe', 'Sue', 'Developer'),
      (78, 'Bobson', 'Bob', 'Programmer');

    INSERT INTO customer (customer_id, first_name, last_name, company, email, support_rep_id) VALUES
      (4535, 'Customer', 'A', NULL, 'customer.a@test.com', 42),
      (8989, 'Customer', 'C', 'Company C', 'customer.c@test.com', 42),
      (786, 'Customer', 'B', NULL, 'customer.b@test.com', 78);

  `);

  vi.spyOn(Pool.prototype, "query").mockImplementation(async (queryText: string, values?: unknown[]) => {
    const result = await db.query(queryText, values);

    return {
      rows: result.rows,
      command: "",
      rowCount: result.rows.length,
      oid: 0,
      fields: []
    } as Result;
  });
});

afterAll(async () => {
  await db.close();

  vi.restoreAllMocks();
});

test("List employees", async () => {
  const employees: Employee[] = await listEmployees();

  expect(employees).toEqual(expectedResult);
});
