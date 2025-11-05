export type Artist = {
  artistId: string,
  artistName: string,
  mostRecentAlbumTitle?: string,
  mostRecentAlbumYear?: number,
  nrAlbums: number
};

export type AlbumDetail = {
  albumId: string,
  albumTitle: string,
  releaseYear: number,
  label?: string,
  genre?: string,
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
