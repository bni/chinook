import { CollapseDesktop } from "../components/CollapseDesktop";
import { Group } from "@mantine/core";
import { EmployeeTable } from "../components/employees/EmployeeTable";
import { listEmployees } from "@lib/employees/listEmployees";
import { Employee } from "@lib/employees/employee";

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
