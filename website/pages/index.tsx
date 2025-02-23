import { CollapseDesktop } from "../components/CollapseDesktop";
import { Button, Group } from "@mantine/core";

export default function IndexPage() {
  return (
    <CollapseDesktop>
      <Group mt={50} justify="center">
        <Button size="xl">Welcome to Index!</Button>
      </Group>
    </CollapseDesktop>
  );
}
