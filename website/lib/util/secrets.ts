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
    const content = version.payload.data.toString("utf8");

    console.log(`SM Content: ${content}`);
  } else {
    console.error(`Could not fetch secret: ${version}`);
  }
}

const secret = async (name: string): Promise<string> => {
  return secrets[name] || "";
};

export { secret };
