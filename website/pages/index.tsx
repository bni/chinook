import { Button, Group } from "@mantine/core";
import ColorSchemeToggler from "../components/ColorSchemeToggler";

export default function IndexPage() {
  return (
    <Group mt={50} justify="center">
      <Button size="xl">Welcome to Mantine!</Button>

      <ColorSchemeToggler></ColorSchemeToggler>
    </Group>
  );
}
