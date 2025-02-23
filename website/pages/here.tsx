import { CollapseDesktop } from "../components/CollapseDesktop";
import { Button, Group } from "@mantine/core";

export default function HerePage() {
  return (
    <CollapseDesktop>
      <Group mt={50} justify="center">
        <Button size="xl">Welcome to Here!</Button>
      </Group>
    </CollapseDesktop>
  );
}
