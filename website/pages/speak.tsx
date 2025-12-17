import { CollapseDesktop } from "@components/CollapseDesktop";
import { Group } from "@mantine/core";
import { HeadComponent } from "@components/HeadComponent";
import { SpeakComponent } from "@components/speak/SpeakComponent";

export default function SpeakPage() {
  return (
    <CollapseDesktop>
      <HeadComponent pageName={"Speak"}/>
      <Group mt={25} ml={25} mr={25} justify="space-between" grow>
        <SpeakComponent/>
      </Group>
    </CollapseDesktop>
  );
}
