import { Pool, Result } from "pg";
import { secret } from "@lib/util/secrets";

const pool = new Pool({
  user: await secret("CHINOOK_PGUSER"),
  password: await secret("CHINOOK_PGPASSWORD"),
  host: await secret("CHINOOK_PGHOST"),
  port: parseInt(await secret("CHINOOK_PGPORT"), 10),
  database: await secret("CHINOOK_PGDATABASE")
});

console.log(`CREATED NEW POOL. totalCount: ${pool.totalCount} idleCount: ${pool.idleCount}`);

const query = (queryText: string, values?: unknown[]): Promise<Result> => {
  return pool.query(queryText, values);
};

export { query, pool, Result };
