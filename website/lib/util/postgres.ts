import { Pool, Result } from "pg";

const pool = new Pool();

const query = (queryText: string, values?: unknown[]): Promise<Result> => {
  return pool.query(queryText, values);
};

export { query, Result };
