import { CollapseDesktop } from "@components/CollapseDesktop";
import { Group } from "@mantine/core";
import { EmployeeTable } from "@components/employees/EmployeeTable";
import { listEmployees } from "@lib/employees/listEmployees";
import { Employee } from "@lib/employees/types";
import { GetServerSideProps } from "next";

interface EmployeesPageProps {
  employees: Employee[]
}

export const getServerSideProps = (async () => {
  return {
    props: {
      employees: await listEmployees()
    }
  };
}) satisfies GetServerSideProps<EmployeesPageProps>;

export default function EmployeesPage({ employees }: EmployeesPageProps) {
  return (
    <CollapseDesktop>
      <Group mt={25} ml={25} mr={25} justify="space-between" grow>
        <EmployeeTable employees={employees}/>
      </Group>
    </CollapseDesktop>
  );
}
