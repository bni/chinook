import crypto from "crypto";
import { type Output } from "./types.js";

export const search = async (query: string): Promise<Output> => {
  if (!query) {
    return {
      results: []
    };
  }

  try {
    const bodyString = JSON.stringify({
      query: query
    });

    const signature = crypto
      .createHmac("sha256", process.env.SHARED_SECRET_FOR_HMAC || "")
      .update(bodyString)
      .digest("base64");

    const response = await fetch(`${process.env.CHINOOK_BASE_URL}/api/external/v1/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-chinook-hmac-sha256": signature
      },
      body: bodyString
    });

    if (!response.ok) {
      console.error("Failed to search", await response.text());
    } else {
      type AlbumSearchResult = {
        albumId: string,
        albumTitle: string,
        artistName: string,
        releaseYear: number,
        label: string,
        genre: string,
        similarity: number
      };

      type AlbumSearchResultArray = {
        results: AlbumSearchResult[]
      };

      const body: AlbumSearchResultArray = await response.json() as AlbumSearchResultArray;

      const output: Output = {
        results: []
      };

      for (const result of body.results) {
        output.results.push(
          {
            albumTitle: result.albumTitle,
            artistName: result.artistName,
            releaseYear: result.releaseYear,
            label: result.label,
            genre: result.genre
          }
        );
      }

      // Only return the top 3 here
      output.results = output.results.slice(0, 3);

      return output;
    }
  } catch (error) {
    console.error("Failed to search", error);
  }

  return {
    results: []
  };
};
