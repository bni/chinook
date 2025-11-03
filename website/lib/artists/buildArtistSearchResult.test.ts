import { Artist, ArtistSearchResult } from "./types";
import { buildArtistSearchResult } from "./buildArtistSearchResult";

test("Build artists search results", async () => {
  const artists: Artist[] = [
    {
      artistId: "111",
      artistName: "aaaAAAaaa",
      nrAlbums: 0
    },
    {
      artistId: "222",
      artistName: "bbbBBBbbb",
      nrAlbums: 0
    },
    {
      artistId: "333",
      artistName: "cccCCCccc",
      nrAlbums: 0
    },
    {
      artistId: "444",
      artistName: "xxxEEExxx",
      nrAlbums: 0
    },
    {
      artistId: "555",
      artistName: "yyyEEEyyy",
      nrAlbums: 0
    }
  ];

  const filter = "EEE";

  const expectedSearchResult: ArtistSearchResult = {
    artists: [
      {
        artistId: "444",
        artistName: "xxxEEExxx",
        nrAlbums: 0
      },
      {
        artistId: "555",
        artistName: "yyyEEEyyy",
        nrAlbums: 0
      }
    ],
    total: 2
  };

  const searchResult: ArtistSearchResult = buildArtistSearchResult(artists, filter);

  expect(searchResult).toEqual(expectedSearchResult);
});
