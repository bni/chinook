let environment = "local";
if (process.env.APP_ENV) {
  environment = process.env.APP_ENV;
}
console.log(`APP_ENV: ${environment}`);

const secrets: { [index: string]: string } = {};

if (environment === "local") {
  // Local development, use dummy variables.
  // NOTE never put staging or production secrets here!

  secrets.PGUSER = "chinook";
  secrets.PGPASSWORD = "chinook";
  secrets.PGHOST = "192.168.86.193";
  secrets.PGPORT = "5432";
  secrets.PGDATABASE = "chinook";

  secrets.BETTER_AUTH_SECRET = "NkIksfP172phRLseuPPXl14X4g2H6osJ";
  secrets.BETTER_AUTH_URL = "http://192.168.86.193:3000";

  secrets.MICROSOFT_CLIENT_ID = "aaa333";
  secrets.MICROSOFT_CLIENT_SECRET = "fbzjklh34loi67j3458ysrfgkaz";
  secrets.MICROSOFT_TENANT_ID = "common";

  secrets.GOOGLE_CLIENT_ID = "bbb222";
  secrets.GOOGLE_CLIENT_SECRET = "sdvbuzsdgb7tfb879aszv82345ioq2hrjnkl";

  secrets.GITHUB_CLIENT_ID = "cccc111";
  secrets.GITHUB_CLIENT_SECRET = "5u2jk456b23hk,j6bw2345,h6b3456hjk3!4";
} else if (environment === "staging") {
  // Load from vault
} else if (environment === "production") {
  // Load from vault
}

const secret = async (name: string): Promise<string> => {
  // TODO When these are actual secrets fetch them from a key vault and put them in the secrets object with a TTL
  // TODO Check TTL to reload
  return secrets[name];
};

export { secret };
