import { Stack, Text } from "@mantine/core";
import { AlbumSearchResult } from "@lib/albums/types";
import { AlbumResultCard } from "./AlbumResultCard";

interface SearchResultsProps {
  results: AlbumSearchResult[];
}

export function SearchResults({ results }: SearchResultsProps) {
  return (
    <Stack style={{ width: "100%" }} gap="md">
      <Text size="lg" fw={500}>
        Found {results.length} result{results.length !== 1 ? "s" : ""}
      </Text>
      {results.map((result) => (
        <AlbumResultCard key={result.albumId} result={result} />
      ))}
    </Stack>
  );
}
