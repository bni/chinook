import { type BetterAuthPlugin, betterAuth } from "better-auth";
import { Pool } from "pg";
import { logger } from "@lib/util/logger";
import { secret } from "@lib/util/secrets";

// Load nextCookies plugin only when in Next.js context, not when in Express WebSockets
const plugins: BetterAuthPlugin[] = [];
try {
  await import("next/headers");

  logger.debug("Loading nextCookies()");

  const { nextCookies } = await import("better-auth/next-js");

  plugins.push(nextCookies());
} catch {
  logger.debug("Not loading nextCookies()");
}

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
      prompt: "select_account",
      clientId: await secret("GOOGLE_CLIENT_ID"),
      clientSecret: await secret("GOOGLE_CLIENT_SECRET")
    }
  },
  advanced: {
    cookiePrefix: "chinook",
    useSecureCookies: process.env.APP_ENV !== "local",
    defaultCookieAttributes: {
      sameSite: "strict"
    },
    cookies: {
      state: {
        attributes: {
          sameSite: "none", // Required for Google social login
          secure: process.env.APP_ENV !== "local"
        }
      }
    }
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5
    }
  },
  trustedOrigins: [
    "http://localhost:3000",
    "https://chinook.loca.lt"
  ],
  plugins: plugins
});
