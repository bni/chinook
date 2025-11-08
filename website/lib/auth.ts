import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";
import { secret } from "@lib/util/secrets";

export const auth = betterAuth({
  secret: await secret("BETTER_AUTH_SECRET"),
  baseURL: await secret("BETTER_AUTH_URL"),
  database: new Pool({
    user: await secret("BETTER_AUTH_PGUSER"),
    password: await secret("BETTER_AUTH_PGPASSWORD"),
    host: await secret("BETTER_AUTH_PGHOST"),
    port: parseInt(await secret("BETTER_AUTH_PGPORT"), 10),
    database: await secret("BETTER_AUTH_PGDATABASE")
  }),
  emailAndPassword: {
    enabled: true
  },
  socialProviders: {
    google: {
      clientId: await secret("GOOGLE_CLIENT_ID"),
      clientSecret: await secret("GOOGLE_CLIENT_SECRET")
    }
  },
  advanced: {
    cookiePrefix: "chinook",
    useSecureCookies: process.env.APP_ENV !== "local",
    defaultCookieAttributes: {
      sameSite: "strict"
    }
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5
    }
  },
  trustedOrigins: [
    "http://localhost:4000",
    "https://chinook.loca.lt"
  ],
  plugins: [nextCookies()]
});
