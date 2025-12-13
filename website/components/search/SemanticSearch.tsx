import { Alert, Loader, Stack, Text, TextInput } from "@mantine/core";
import { IconAlertCircle, IconSearch } from "@tabler/icons-react";
import React, { useEffect, useRef, useState } from "react";
import type { AlbumSearchResult } from "@lib/albums/types";
import { EmptyState } from "@components/search/EmptyState";
import { RecordingComponent } from "@components/audio/RecordingComponent";
import { SearchResults } from "@components/search/SearchResults";

export function SemanticSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AlbumSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = async (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();

    // Require at least 2 characters
    if (trimmedQuery.length < 2) {
      setError(null);
      setResults([]);
      setHasSearched(false);
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
        body: JSON.stringify({ query: trimmedQuery })
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

  // Debounced search effect
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debounced search
    debounceTimerRef.current = setTimeout(async () => {
      await handleSearch(query);
    }, 250); // Debounce delay

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim().length >= 2) {
      // Clear debounce timer and search immediately
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      await handleSearch(query);
    }
  };

  return (
    <Stack mt={50} align="center" gap="xl" style={{ maxWidth: 800, margin: "0 auto", padding: "0 20px" }}>
      <Text size="xl" fw={700}>
        Search by feeling
      </Text>

      <TextInput
        placeholder="Start typing to search..."
        size="lg"
        style={{ width: "100%" }}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        leftSection={<IconSearch size={20} />}
        rightSection={loading ? <Loader size="xs" /> : undefined}
      />

      <RecordingComponent
        onRecordingStart={() => setQuery("")}
        onTranslation={(translation) => setQuery(translation.transcript || "")}
      />

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} title="Notice" color="red" style={{ width: "100%" }}>
          {error}
        </Alert>
      )}

      {hasSearched && results.length > 0 && (
        <SearchResults results={results} />
      )}

      {!loading && hasSearched && results.length === 0 && !error && (
        <EmptyState query={query} />
      )}
    </Stack>
  );
}
