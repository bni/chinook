import { expect, test, vi } from "vitest";
import type { ArtistSearchResult } from "./types";
import { Pool } from "pg";
import { listArtists } from "./listArtists";

test("List artists with filter and pagination", async () => {
  const testRows = [
    {
      artistId: "1",
      artistName: "The Beatles",
      mainlyOnLabel: "Apple Records",
      mostlyInGenre: "Rock",
      minYear: 1963,
      maxYear: 1970,
      nrAlbums: 12,
      total: 25
    },
    {
      artistId: "2",
      artistName: "Pink Floyd",
      mainlyOnLabel: "EMI",
      mostlyInGenre: "Progressive Rock",
      minYear: 1967,
      maxYear: 1994,
      nrAlbums: 15,
      total: 25
    }
  ];

  const queryResult = {
    rows: testRows
  };

  vi.spyOn(Pool.prototype, "query").mockImplementation(() => queryResult);

  const result: ArtistSearchResult = await listArtists(
    1960,
    2000,
    "Beatles",
    "artistName",
    "asc",
    1,
    10
  );

  const expectedResult: ArtistSearchResult = {
    artists: [
      {
        artistId: "1",
        artistName: "The Beatles",
        mainlyOnLabel: "Apple Records",
        mostlyInGenre: "Rock",
        minYear: 1963,
        maxYear: 1970,
        nrAlbums: 12
      },
      {
        artistId: "2",
        artistName: "Pink Floyd",
        mainlyOnLabel: "EMI",
        mostlyInGenre: "Progressive Rock",
        minYear: 1967,
        maxYear: 1994,
        nrAlbums: 15
      }
    ],
    total: 25
  };

  expect(result).toEqual(expectedResult);
});

test("List artists with no filter", async () => {
  const testRows = [
    {
      artistId: "3",
      artistName: "Led Zeppelin",
      mainlyOnLabel: "Atlantic",
      mostlyInGenre: "Hard Rock",
      minYear: 1969,
      maxYear: 1982,
      nrAlbums: 9,
      total: 100
    }
  ];

  const queryResult = {
    rows: testRows
  };

  vi.spyOn(Pool.prototype, "query").mockImplementation(() => queryResult);

  const result: ArtistSearchResult = await listArtists(
    1960,
    2000,
    "",
    "nrAlbums",
    "desc",
    1,
    10
  );

  const expectedResult: ArtistSearchResult = {
    artists: [
      {
        artistId: "3",
        artistName: "Led Zeppelin",
        mainlyOnLabel: "Atlantic",
        mostlyInGenre: "Hard Rock",
        minYear: 1969,
        maxYear: 1982,
        nrAlbums: 9
      }
    ],
    total: 100
  };

  expect(result).toEqual(expectedResult);
});

test("List artists with empty result", async () => {
  const queryResult = {
    rows: []
  };

  vi.spyOn(Pool.prototype, "query").mockImplementation(() => queryResult);

  const result: ArtistSearchResult = await listArtists(
    1960,
    2000,
    "NonExistentArtist",
    "artistName",
    "asc",
    1,
    10
  );

  const expectedResult: ArtistSearchResult = {
    artists: [],
    total: 0
  };

  expect(result).toEqual(expectedResult);
});

test("List artists handles pagination", async () => {
  const testRows = [
    {
      artistId: "4",
      artistName: "Queen",
      mainlyOnLabel: "EMI",
      mostlyInGenre: "Rock",
      minYear: 1973,
      maxYear: 1995,
      nrAlbums: 15,
      total: 50
    }
  ];

  const queryResult = {
    rows: testRows
  };

  const mockQuery = vi.spyOn(Pool.prototype, "query").mockImplementation(() => queryResult);

  await listArtists(
    1970,
    2000,
    "",
    "artistName",
    "asc",
    3,
    20
  );

  expect(mockQuery).toHaveBeenCalledWith(
    expect.any(String),
    expect.arrayContaining([
      expect.any(Array),
      "",
      "artistName",
      "asc",
      20,
      40
    ])
  );
});
