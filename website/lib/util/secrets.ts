const secret = async (name: string): Promise<string> => {
  return process.env[name] || "";
};

export { secret };
