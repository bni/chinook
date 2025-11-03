import { Artist, ArtistSearchResult } from "@lib/artists/types";

export const buildArtistSearchResult = (artists: Artist[], filter: string): ArtistSearchResult => {
  const filteredArtists = artists.filter((artist) => {
    if (!filter) return true;

    return artist.artistName.toLowerCase().includes(filter.toLowerCase());
  });

  return {
    artists: filteredArtists,
    total: filteredArtists.length
  };
};
