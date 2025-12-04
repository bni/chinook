export type Artist = {
  artistId: string,
  artistName: string,
  mainlyOnLabel?: string | undefined,
  mostlyInGenre?: string | undefined,
  minYear?: number | undefined,
  maxYear?: number | undefined,
  nrAlbums: number
};

export type AlbumDetail = {
  albumId: string,
  albumTitle: string,
  releaseYear: number,
  label?: string | undefined,
  genre?: string | undefined,
  criticScore: number,
  userScore: number
};

export type ArtistDetail = {
  artistId: string,
  artistName: string,
  albums: AlbumDetail[]
};

export type ArtistSearchResult = {
  artists: Artist[],
  total: number
};
