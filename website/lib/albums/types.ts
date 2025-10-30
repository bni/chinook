import { z } from "zod";

const AlbumSearchResult = z.object({
  albumId: z.number(),
  albumTitle: z.string(),
  artistName: z.string(),
  releaseYear: z.string(),
  label: z.string(),
  genre: z.string(),
  similarity: z.number()
});

export type AlbumSearchResult = z.infer<typeof AlbumSearchResult>;
