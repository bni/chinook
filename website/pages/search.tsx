import { CollapseDesktop } from "../components/CollapseDesktop";
import { Stack, TextInput, Button, Card, Text, Group, Badge, Loader, Alert } from "@mantine/core";
import { IconSearch, IconAlertCircle } from "@tabler/icons-react";
import { useState } from "react";
import { AlbumSearchResult } from "@lib/albums/types";
import React from "react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AlbumSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Please enter a search query");

      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch("/api/internal/albums/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query: query.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to search");
      }

      const data = await response.json();

      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while searching");

      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      await handleSearch();
    }
  };

  return (
    <CollapseDesktop>
      <Stack mt={50} align="center" gap="xl" style={{ maxWidth: 800, margin: "0 auto", padding: "0 20px" }}>
        {/* Search Header */}
        <Text size="xl" fw={700}>
          Search Albums
        </Text>

        {/* Search Input */}
        <Group style={{ width: "100%" }} gap="md">
          <TextInput
            placeholder="Search for albums by mood..."
            size="lg"
            style={{ flex: 1 }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            leftSection={<IconSearch size={20} />}
          />
          <Button
            size="lg"
            onClick={handleSearch}
            loading={loading}
            leftSection={!loading ? <IconSearch size={20} /> : undefined}
          >
            Search
          </Button>
        </Group>

        {/* Error Alert */}
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} title="Notice" color="red" style={{ width: "100%" }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text c="dimmed">Searching...</Text>
          </Stack>
        )}

        {/* Results */}
        {!loading && hasSearched && results.length > 0 && (
          <Stack style={{ width: "100%" }} gap="md">
            <Text size="lg" fw={500}>
              Found {results.length} result{results.length !== 1 ? "s" : ""}
            </Text>
            {results.map((result) => (
              <Card key={result.albumId} shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between" mb="xs">
                  <Text fw={600} size="lg">
                    {result.albumTitle}
                  </Text>
                  <Group>
                    <Badge color="orange" variant="light">
                      Year: {result.releaseYear}
                    </Badge>
                    <Badge color="blue" variant="light">
                      Score: {(100 * result.similarity).toFixed(1) }%
                    </Badge>
                  </Group>
                </Group>
                <Group justify="space-between">
                  <Text size="md" c="dimmed">
                    {result.artistName}
                  </Text>
                  <Text size="md" c="dark">
                    {result.genre}
                  </Text>
                </Group>
              </Card>
            ))}
          </Stack>
        )}

        {/* No Results */}
        {!loading && hasSearched && results.length === 0 && !error && (
          <Card shadow="sm" padding="lg" radius="md" withBorder style={{ width: "100%" }}>
            <Text ta="center" c="dimmed">
              No results found for &#34;{query}&#34;. Try a different search term.
            </Text>
          </Card>
        )}
      </Stack>
    </CollapseDesktop>
  );
}
