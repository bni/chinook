import { Pool, Result } from "pg";
import { secret } from "@lib/util/secrets";

const pool = new Pool({
  user: await secret("PGUSER"),
  password: await secret("PGPASSWORD"),
  host: await secret("PGHOST"),
  port: parseInt(await secret("PGPORT"), 10),
  database: await secret("PGDATABASE")
});

const query = (queryText: string, values?: unknown[]): Promise<Result> => {
  return pool.query(queryText, values);
};

export { query, Result };
