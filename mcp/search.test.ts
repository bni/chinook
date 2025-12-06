import nock from "nock";
import { expect, test } from "vitest";
import { search } from "./search.js";

test("Search for black metal", async () => {
  const simulatedResponseBody = {
    results: [
      {
        albumId: "019a3a45-9a1b-7ca4-b7dd-771ae58ff2f8",
        albumTitle: "Black Metal",
        artistName: "Venom",
        releaseYear: 1982,
        label: "Neat",
        genre: "Heavy Metal",
        similarity: 0.7587717545398577
      }
    ]
  };

  process.env.CHINOOK_BASE_URL = "https://example.com";

  nock("https://example.com")
    .post(/\/api\/external\/v1\/search/)
    .reply(200, simulatedResponseBody);

  const output = await search("black metal");

  const expectedOutput = {
    results: [
      {
        albumTitle: "Black Metal",
        artistName: "Venom",
        releaseYear: 1982,
        label: "Neat",
        genre: "Heavy Metal"
      }
    ]
  };

  expect(output).toEqual(expectedOutput);
});
