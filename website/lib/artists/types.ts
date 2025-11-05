import { z } from "zod";

const Artist = z.object({
  artistId: z.uuidv4(),
  artistName: z.string(),
  mostRecentAlbumTitle: z.string().optional(),
  mostRecentAlbumYear: z.number().optional(),
  nrAlbums: z.number()
});
export type Artist = z.infer<typeof Artist>;

const AlbumDetail = z.object({
  albumId: z.uuidv4(),
  albumTitle: z.string(),
  releaseYear: z.int(),
  label: z.string().nullable(),
  genre: z.string().nullable(),
  criticScore: z.int(),
  userScore: z.number()
});
export type AlbumDetail = z.infer<typeof AlbumDetail>;

const ArtistDetail = z.object({
  artistId: z.uuidv4(),
  artistName: z.string(),
  albums: AlbumDetail.array()
});
export type ArtistDetail = z.infer<typeof ArtistDetail>;

const ArtistSearchResult = z.object({
  artists: Artist.array(),
  total: z.number()
});
export type ArtistSearchResult = z.infer<typeof ArtistSearchResult>;
