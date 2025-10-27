import { z } from "zod";

const Album = z.object({
  albumId: z.number(),
  title: z.string(),
  embedding: z.string().optional()
});

export type Album = z.infer<typeof Album>;

const AlbumSearchResult = z.object({
  albumId: z.number(),
  title: z.string(),
  artist: z.string(),
  similarity: z.number()
});

export type AlbumSearchResult = z.infer<typeof AlbumSearchResult>;
