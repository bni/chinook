import { z } from "zod";

const Artist = z.object({
  artistId: z.uuidv4(),
  artistName: z.string(),
  mostRecentAlbum: z.string().optional(),
  nrAlbums: z.number()
});

export type Artist = z.infer<typeof Artist>;
