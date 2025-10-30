import { z } from "zod";

const AlbumArtist = z.object({
  artistId: z.number(),
  artistName: z.string()
});

const Album = z.object({
  albumId: z.number(),
  albumTitle: z.string(),
  artist: AlbumArtist,
  embedding: z.string().optional()
});

export type Album = z.infer<typeof Album>;

const AlbumSearchResult = z.object({
  albumId: z.number(),
  albumTitle: z.string(),
  artistName: z.string(),
  similarity: z.number()
});

export type AlbumSearchResult = z.infer<typeof AlbumSearchResult>;
