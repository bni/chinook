import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";
import { secret } from "@lib/util/secrets";

export const auth = betterAuth({
  secret: await secret("BETTER_AUTH_SECRET"),
  baseURL: await secret("BETTER_AUTH_URL"),
  database: new Pool({
    user: await secret("PGUSER"),
    password: await secret("PGPASSWORD"),
    host: await secret("PGHOST"),
    port: parseInt(await secret("PGPORT"), 10),
    database: await secret("PGDATABASE")
  }),
  emailAndPassword: {
    enabled: true
  },
  socialProviders: {
    microsoft: {
      clientId: await secret("MICROSOFT_CLIENT_ID"),
      clientSecret: await secret("MICROSOFT_CLIENT_SECRET"),
      tenantId: await secret("MICROSOFT_TENANT_ID")
    },
    google: {
      clientId: await secret("GOOGLE_CLIENT_ID"),
      clientSecret: await secret("GOOGLE_CLIENT_SECRET")
    },
    github: {
      clientId: await secret("GITHUB_CLIENT_ID"),
      clientSecret: await secret("GITHUB_CLIENT_SECRET")
    }
  },
  advanced: {
    cookiePrefix: "chinook"
  },
  trustedOrigins: ["http://localhost:3000", "http://192.168.0.3:3000", "http://192.168.86.193:3000"],
  plugins: [nextCookies()]
});
