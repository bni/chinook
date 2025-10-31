import { Card, Text } from "@mantine/core";

interface EmptyStateProps {
  query: string;
}

export function EmptyState({ query }: EmptyStateProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder style={{ width: "100%" }}>
      <Text ta="center" c="dimmed">
        No results found for &#34;{query}&#34;. Try a different search term.
      </Text>
    </Card>
  );
}
