import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { CollapseDesktop } from "@components/CollapseDesktop";
import type { Employee } from "@lib/employees/types";
import { EmployeeTable } from "@components/employees/EmployeeTable";
import { Group } from "@mantine/core";
import { HeadComponent } from "@components/HeadComponent";
import { listEmployees } from "@lib/employees/listEmployees";

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

export default function EmployeesPage({
  employees
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <CollapseDesktop>
      <HeadComponent pageName={"Employees"}/>
      <Group mt={25} ml={25} mr={25} justify="space-between" grow>
        <EmployeeTable employees={employees}/>
      </Group>
    </CollapseDesktop>
  );
}
