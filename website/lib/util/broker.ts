import PgBoss from "pg-boss";
import { secret } from "@lib/util/secrets";

const broker = new PgBoss({
  user: await secret("BROKER_PGUSER"),
  password: await secret("BROKER_PGPASSWORD"),
  host: await secret("BROKER_PGHOST"),
  port: parseInt(await secret("BROKER_PGPORT"), 10),
  database: await secret("BROKER_PGDATABASE")
});

await broker.start();

export { broker };
