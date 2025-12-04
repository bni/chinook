import { Card, Text, Group, Badge } from "@mantine/core";
import type { AlbumSearchResult } from "@lib/albums/types";

interface AlbumResultCardProps {
  result: AlbumSearchResult;
}

export function AlbumResultCard({ result }: AlbumResultCardProps) {
  return (
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
            Score: {(100 * result.similarity).toFixed(1)}%
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
  );
}
