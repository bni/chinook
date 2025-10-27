import { CollapseDesktop } from "../components/CollapseDesktop";
import { Group } from "@mantine/core";
import { EmployeeTable } from "../components/employees/EmployeeTable";
import { listEmployees } from "@lib/employees/listEmployees";
import { Employee } from "@lib/employees/types";

export async function getServerSideProps() {
  return {
    props: {
      employees: await listEmployees()
    }
  };
}

export default function EmployeesPage({ employees }: { employees: Employee[] }) {
  return (
    <CollapseDesktop>
      <Group mt={25} ml={25} mr={25} justify="space-between" grow>
        <EmployeeTable employees={ employees }/>
      </Group>
    </CollapseDesktop>
  );
}
