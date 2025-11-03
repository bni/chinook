import { Artist, ArtistSearchResult } from "@lib/artists/types";

export const buildArtistSearchResult = (artists: Artist[], filter: string, page: number, pageSize: number): ArtistSearchResult => {
  const filteredArtists = artists.filter((artist) => {
    if (!filter) return true;

    return artist.artistName.toLowerCase().includes(filter.toLowerCase());
  });

  const startIndex = (page - 1 ) * pageSize;

  const endIndex = startIndex + pageSize;

  const artistsPage = filteredArtists.slice(startIndex, endIndex);

  return {
    artists: artistsPage,
    total: filteredArtists.length
  };
};
