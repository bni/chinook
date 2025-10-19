import PgBoss from "pg-boss";
import { secret } from "@lib/util/secrets";

const boss = new PgBoss({
  user: await secret("PGUSER"),
  password: await secret("PGPASSWORD"),
  host: await secret("PGHOST"),
  port: parseInt(await secret("PGPORT"), 10),
  database: await secret("PGDATABASE")
});

await boss.start();

export { boss };
