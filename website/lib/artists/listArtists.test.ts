import { Pool, Result } from "pg";
import { afterAll, beforeAll, expect, test, vi } from "vitest";
import type { ArtistSearchResult } from "./types";
import { PGlite } from "@electric-sql/pglite";
import { listArtists } from "./listArtists";

let db: PGlite;

beforeAll(async () => {
  db = new PGlite();

  // Create tables (simplified schema without vector type)
  await db.exec(`

    CREATE TABLE artist (
      artist_id TEXT PRIMARY KEY,
      name TEXT
    );

    CREATE TABLE album (
      album_id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      release INT NOT NULL,
      label TEXT,
      genre TEXT,
      critic_score INT NOT NULL,
      user_score FLOAT NOT NULL,
      artist_id TEXT NOT NULL REFERENCES artist(artist_id)
    );

    CREATE INDEX album_artist_id_idx ON album (artist_id);
    CREATE INDEX album_artist_id_release_idx ON album (artist_id, release DESC);
    CREATE INDEX album_release_idx ON album (release);
    CREATE INDEX artist_name_lower_idx ON artist (LOWER(name));

  `);

  // Insert test data for multiple test scenarios
  await db.exec(`

    INSERT INTO artist (artist_id, name) VALUES
      ('1', 'The Beatles'),
      ('2', 'Pink Floyd'),
      ('3', 'Led Zeppelin'),
      ('4', 'Queen');

    INSERT INTO album (album_id, title, release, label, genre, critic_score, user_score, artist_id) VALUES
      -- The Beatles albums (1963-1970)              
      ('a1', 'Please Please Me', 1963, 'Apple Records', 'Rock', 85, 4.5, '1'),
      ('a2', 'With the Beatles', 1963, 'Apple Records', 'Rock', 87, 4.6, '1'),
      ('a3', 'A Hard Day''s Night', 1964, 'Apple Records', 'Rock', 90, 4.7, '1'),
      ('a4', 'Beatles for Sale', 1964, 'Apple Records', 'Rock', 82, 4.4, '1'),
      ('a5', 'Help!', 1965, 'Apple Records', 'Rock', 88, 4.6, '1'),
      ('a6', 'Rubber Soul', 1965, 'Apple Records', 'Rock', 95, 4.8, '1'),
      ('a7', 'Revolver', 1966, 'Apple Records', 'Rock', 98, 4.9, '1'),
      ('a8', 'Sgt. Pepper''s', 1967, 'Apple Records', 'Rock', 100, 5.0, '1'),
      ('a9', 'Magical Mystery Tour', 1967, 'Apple Records', 'Rock', 85, 4.5, '1'),
      ('a10', 'The White Album', 1968, 'Apple Records', 'Rock', 92, 4.7, '1'),
      ('a11', 'Abbey Road', 1969, 'Apple Records', 'Rock', 97, 4.9, '1'),
      ('a12', 'Let It Be', 1970, 'Apple Records', 'Rock', 80, 4.3, '1'),

      -- Pink Floyd albums (1967-1994)
      ('b1', 'The Piper at the Gates of Dawn', 1967, 'EMI', 'Progressive Rock', 88, 4.5, '2'),
      ('b2', 'A Saucerful of Secrets', 1968, 'EMI', 'Progressive Rock', 85, 4.4, '2'),
      ('b3', 'More', 1969, 'EMI', 'Progressive Rock', 75, 4.0, '2'),
      ('b4', 'Ummagumma', 1969, 'EMI', 'Progressive Rock', 78, 4.2, '2'),
      ('b5', 'Atom Heart Mother', 1970, 'EMI', 'Progressive Rock', 80, 4.3, '2'),
      ('b6', 'Meddle', 1971, 'EMI', 'Progressive Rock', 88, 4.6, '2'),
      ('b7', 'Obscured by Clouds', 1972, 'EMI', 'Progressive Rock', 82, 4.4, '2'),
      ('b8', 'The Dark Side of the Moon', 1973, 'EMI', 'Progressive Rock', 100, 5.0, '2'),
      ('b9', 'Wish You Were Here', 1975, 'EMI', 'Progressive Rock', 95, 4.8, '2'),
      ('b10', 'Animals', 1977, 'EMI', 'Progressive Rock', 90, 4.7, '2'),
      ('b11', 'The Wall', 1979, 'EMI', 'Progressive Rock', 92, 4.7, '2'),
      ('b12', 'The Final Cut', 1983, 'EMI', 'Progressive Rock', 75, 4.0, '2'),
      ('b13', 'A Momentary Lapse of Reason', 1987, 'EMI', 'Progressive Rock', 70, 3.8, '2'),
      ('b14', 'The Division Bell', 1994, 'EMI', 'Progressive Rock', 78, 4.2, '2'),
      ('b15', 'Delicate Sound of Thunder', 1988, 'EMI', 'Progressive Rock', 72, 3.9, '2'),

      -- Led Zeppelin albums (1969-1982)
      ('c1', 'Led Zeppelin', 1969, 'Atlantic', 'Hard Rock', 92, 4.7, '3'),
      ('c2', 'Led Zeppelin II', 1969, 'Atlantic', 'Hard Rock', 95, 4.8, '3'),
      ('c3', 'Led Zeppelin III', 1970, 'Atlantic', 'Hard Rock', 88, 4.5, '3'),
      ('c4', 'Led Zeppelin IV', 1971, 'Atlantic', 'Hard Rock', 100, 5.0, '3'),
      ('c5', 'Houses of the Holy', 1973, 'Atlantic', 'Hard Rock', 90, 4.6, '3'),
      ('c6', 'Physical Graffiti', 1975, 'Atlantic', 'Hard Rock', 98, 4.9, '3'),
      ('c7', 'Presence', 1976, 'Atlantic', 'Hard Rock', 85, 4.4, '3'),
      ('c8', 'In Through the Out Door', 1979, 'Atlantic', 'Hard Rock', 82, 4.3, '3'),
      ('c9', 'Coda', 1982, 'Atlantic', 'Hard Rock', 75, 4.0, '3'),

      -- Queen albums (1973-1995)
      ('d1', 'Queen', 1973, 'EMI', 'Rock', 85, 4.4, '4'),
      ('d2', 'Queen II', 1974, 'EMI', 'Rock', 87, 4.5, '4'),
      ('d3', 'Sheer Heart Attack', 1974, 'EMI', 'Rock', 90, 4.6, '4'),
      ('d4', 'A Night at the Opera', 1975, 'EMI', 'Rock', 98, 4.9, '4'),
      ('d5', 'A Day at the Races', 1976, 'EMI', 'Rock', 88, 4.5, '4'),
      ('d6', 'News of the World', 1977, 'EMI', 'Rock', 92, 4.7, '4'),
      ('d7', 'Jazz', 1978, 'EMI', 'Rock', 80, 4.3, '4'),
      ('d8', 'The Game', 1980, 'EMI', 'Rock', 85, 4.4, '4'),
      ('d9', 'Hot Space', 1982, 'EMI', 'Rock', 75, 4.0, '4'),
      ('d10', 'The Works', 1984, 'EMI', 'Rock', 82, 4.3, '4'),
      ('d11', 'A Kind of Magic', 1986, 'EMI', 'Rock', 88, 4.5, '4'),
      ('d12', 'The Miracle', 1989, 'EMI', 'Rock', 80, 4.2, '4'),
      ('d13', 'Innuendo', 1991, 'EMI', 'Rock', 90, 4.6, '4'),
      ('d14', 'Made in Heaven', 1995, 'EMI', 'Rock', 85, 4.4, '4'),
      ('d15', 'Live Magic', 1986, 'EMI', 'Rock', 78, 4.1, '4');

  `);

  vi.spyOn(Pool.prototype, "query").mockImplementation(async (queryText: string, values?: unknown[]) => {
    const result = await db.query(queryText, values);

    return {
      rows: result.rows,
      command: "",
      rowCount: result.rows.length,
      oid: 0,
      fields: []
    } as Result;
  });
});

afterAll(async () => {
  await db.close();

  vi.restoreAllMocks();
});

test("List artists with filter and pagination", async () => {
  const result: ArtistSearchResult = await listArtists(1960, 2000, "Beatles", "artistName", "asc", 1, 10);

  expect(result.artists).toHaveLength(1);
  expect(result.artists[0].artistName).toBe("The Beatles");
  expect(result.artists[0].mainlyOnLabel).toBe("Apple Records");
  expect(result.artists[0].mostlyInGenre).toBe("Rock");
  expect(result.artists[0].minYear).toBe(1963);
  expect(result.artists[0].maxYear).toBe(1970);
  expect(result.artists[0].nrAlbums).toBe(12);
  expect(result.total).toBe(1);
});

test("List artists with no filter", async () => {
  const result: ArtistSearchResult = await listArtists(1960, 2000, "", "nrAlbums", "desc", 1, 10);

  // Should return all artists sorted by number of albums descending
  expect(result.artists).toHaveLength(4);
  expect(result.artists[0].artistName).toBe("Pink Floyd"); // 15 albums
  expect(result.artists[0].nrAlbums).toBe(15);
  expect(result.artists[1].artistName).toBe("Queen"); // 15 albums
  expect(result.artists[1].nrAlbums).toBe(15);
  expect(result.artists[2].artistName).toBe("The Beatles"); // 12 albums
  expect(result.artists[2].nrAlbums).toBe(12);
  expect(result.artists[3].artistName).toBe("Led Zeppelin"); // 9 albums
  expect(result.artists[3].nrAlbums).toBe(9);
  expect(result.total).toBe(4);
});

test("List artists with empty result", async () => {
  const result: ArtistSearchResult = await listArtists(1960, 2000, "Not Existing", "artistName", "asc", 1, 10);

  expect(result.artists).toHaveLength(0);
  expect(result.total).toBe(0);
});

test("List artists handles pagination", async () => {
  const result: ArtistSearchResult = await listArtists(1970, 2000, "", "artistName", "asc", 1, 2);

  // Page 1 with page size 2 should return first 2 artists
  expect(result.artists).toHaveLength(2);
  expect(result.total).toBe(4); // Total of 4 artists in the year range

  const result2: ArtistSearchResult = await listArtists(1970, 2000, "", "artistName", "asc", 2, 2);

  // Page 2 with page size 2 should return next 2 artists
  expect(result2.artists).toHaveLength(2);
  expect(result2.total).toBe(4);
});

test("List artists filters by year range", async () => {
  // Only Led Zeppelin and Queen released albums in the 1970s
  const result: ArtistSearchResult = await listArtists(1970, 1979, "", "artistName", "asc", 1, 10);

  expect(result.artists).toHaveLength(4);

  // Check that year ranges are within the filter
  for (const artist of result.artists) {
    expect(artist.minYear).toBeGreaterThanOrEqual(1970);
    expect(artist.minYear).toBeLessThanOrEqual(1979);
  }
});
