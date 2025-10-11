import { Pool, Result } from "pg";

const pool = new Pool();

const query = async (text: string, params: unknown[]): Promise<Result> => {
  return await pool.query(text, params);
};

export { query, Result };
