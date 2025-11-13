import { CollapseDesktop } from "@components/CollapseDesktop";
import { HeadComponent } from "@components/HeadComponent";
import { ComplexTableWrapper } from "@components/complex/ComplexTableWrapper";
import { ComplexTable } from "@components/complex/ComplexTable";
import { Group } from "@mantine/core";

export default function ComplexPage() {
  return (
    <CollapseDesktop>
      <HeadComponent pageName={"Complex"}/>
      <Group mt={25} ml={25} mr={25} justify="space-between" grow>
        <ComplexTableWrapper>
          <ComplexTable />
        </ComplexTableWrapper>
      </Group>
    </CollapseDesktop>
  );
}
