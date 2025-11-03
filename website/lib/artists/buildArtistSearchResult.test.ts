import { Artist, ArtistSearchResult } from "./types";
import { buildArtistSearchResult } from "./buildArtistSearchResult";

test("Build artists search results", async () => {
  const artists: Artist[] = [
    {
      artistId: "111",
      artistName: "AAA",
      nrAlbums: 0
    },
    {
      artistId: "222",
      artistName: "BBB",
      nrAlbums: 0
    },
    {
      artistId: "333",
      artistName: "CCC",
      nrAlbums: 0
    },
    {
      artistId: "444",
      artistName: "DDD",
      nrAlbums: 0
    },
    {
      artistId: "555",
      artistName: "EEE",
      nrAlbums: 0
    }
  ];

  const filter = "";
  const page = 2;
  const pageSize = 3;

  const expectedSearchResult: ArtistSearchResult = {
    artists: [
      {
        artistId: "444",
        artistName: "DDD",
        nrAlbums: 0
      },
      {
        artistId: "555",
        artistName: "EEE",
        nrAlbums: 0
      }
    ],
    total: 5
  };

  const searchResult: ArtistSearchResult = buildArtistSearchResult(artists, filter, page, pageSize);

  expect(searchResult).toEqual(expectedSearchResult);
});
