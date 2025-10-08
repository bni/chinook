import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";

export const auth = betterAuth({
  database: new Pool(),
  emailAndPassword: {
    enabled: true
  },
  advanced: {
    cookiePrefix: "chinook"
  },
  plugins: [nextCookies()]
});
