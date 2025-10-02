import { z } from "zod";

const Artist = z.object({
  artistId: z.number(),
  artistName: z.string(),
  nrAlbums: z.number()
});

export type Artist = z.infer<typeof Artist>;
