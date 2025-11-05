export type Album = {
  albumId: string,
  albumTitle: string
};

export type AlbumSearchResult = {
  albumId: string,
  albumTitle: string,
  artistName: string,
  releaseYear: number,
  label: string,
  genre: string,
  similarity: number
};
