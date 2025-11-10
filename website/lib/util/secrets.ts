const secrets: { [index: string]: string | undefined } = {};

// Put all env vars into the map
Object.entries(process.env).map(([key, value]) => secrets[key] = value);

if (process.env.GOOGLE_SECRETS_PATH) {
  // Read additional properties (secrets) from Secret Manager (Google Cloud)
  const { SecretManagerServiceClient } = await import("@google-cloud/secret-manager");

  const client = new SecretManagerServiceClient();

  const [version] = await client.accessSecretVersion({
    name: process.env.GOOGLE_SECRETS_PATH
  });

  if (version?.payload?.data) {
    let content;
    try {
      content = JSON.parse(version.payload.data.toString("utf8"));
    } catch (error) {
      console.log("Could not parse the secret as JSON", error);

      content = {};
    }

    // Everything becomes strings. Overwrite if already there
    Object.entries(content).map(([key, value]) => secrets[key] = `${value}`);
  }
}

const secret = async (name: string): Promise<string> => {
  return secrets[name] || "";
};

export { secret };
