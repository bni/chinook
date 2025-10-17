const secrets: { [index: string]: string | undefined } = {};

let environment = "local";
if (process.env.APP_ENV) {
  environment = process.env.APP_ENV;
}

if (environment === "local") {
  // Local development, use .env.local variables.
  Object.entries(process.env).map(([key, value]) => secrets[key] = value);
} else if (environment === "staging") {
  // Load from vault
  console.log("Not yet implemented."); process.exit(1); // TODO for now exit as its not yet implemented
} else if (environment === "production") {
  // Load from vault
  console.log("Not yet implemented."); process.exit(1); // TODO for now exit as its not yet implemented
}

const secret = async (name: string): Promise<string> => {
  // TODO When these are actual secrets fetch them from a key vault and put them in the secrets object with a TTL
  // TODO Check TTL to reload
  return secrets[name] || "";
};

export { secret };
