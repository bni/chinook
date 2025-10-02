export const removeRedundantWhitespace = (input: string) => {
  return input.replace(/\s+/g, " ").trim();
};
