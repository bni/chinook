import { z } from "zod";

const Album = z.object({
  albumId: z.uuidv4(),
  albumTitle: z.string()
});

export type Album = z.infer<typeof Album>;

const AlbumSearchResult = z.object({
  albumId: z.uuidv4(),
  albumTitle: z.string(),
  artistName: z.string(),
  releaseYear: z.int(),
  label: z.string(),
  genre: z.string(),
  similarity: z.number()
});

export type AlbumSearchResult = z.infer<typeof AlbumSearchResult>;
