import { CollapseDesktop } from "../components/CollapseDesktop";
import { Group } from "@mantine/core";
import { EmployeeTable } from "../components/EmployeeTable";
import { listEmployees } from "@lib/listEmployees/listEmployees";
import { Employee } from "@lib/types/employee";

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
      <Group mt={25} justify="center">
        <EmployeeTable employees={ employees }/>
      </Group>
    </CollapseDesktop>
  );
}
