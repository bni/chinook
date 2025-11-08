// Currently secrets is always read from env vars
// Could be fetched from a key vault with TTL depending on deployment environment
const secret = async (name: string): Promise<string> => {
  return process.env[name] || "";
};

export { secret };
