import { z } from "zod";

const Artist = z.object({
  artistId: z.uuidv4(),
  artistName: z.string(),
  mostRecentAlbumTitle: z.string().optional(),
  mostRecentAlbumYear: z.number().optional(),
  nrAlbums: z.number()
});

export type Artist = z.infer<typeof Artist>;

const ArtistSearchResult = z.object({
  artists: Artist.array(),
  total: z.number()
});

export type ArtistSearchResult = z.infer<typeof ArtistSearchResult>;
