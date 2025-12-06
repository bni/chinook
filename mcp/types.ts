import { z } from "zod";

export const InputZod = z.object({
  query: z.string().describe('The album search query')
});

export type Input = z.infer<typeof InputZod>;

export const OutputZod = z.object({
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

export type Output = z.infer<typeof OutputZod>;
