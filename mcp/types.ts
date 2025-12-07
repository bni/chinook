import { z } from "zod";

export const InputSchema = z.object({
  query: z.string().describe("The album search query")
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  results: z.array(
    z.object({
      albumTitle: z.string(),
      artistName: z.string(),
      releaseYear: z.int(),
      label: z.string(),
      genre: z.string()
    })
  )
});

export type Output = z.infer<typeof OutputSchema>;
