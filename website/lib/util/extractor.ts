import { pipeline } from "@xenova/transformers";

const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

const extractEmbedding = async (input: string) => {
  const response = await extractor([input],{ pooling: "mean", normalize: true });

  return JSON.stringify(Array.from(response.data));
};

export { extractEmbedding };
