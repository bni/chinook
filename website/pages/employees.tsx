import { CollapseDesktop } from "../components/CollapseDesktop";
import { Group } from "@mantine/core";
import { EmployeeTable } from "../components/EmployeeTable";
import { listEmployees } from "@lib/listEmployees/listEmployees";
import oracledb from "oracledb";

export async function getServerSideProps() {
  return {
    props: {
      employees: await listEmployees(oracledb)
    }
  };
}

export default function EmployeesPage({ employees }: any) {
  return (
    <CollapseDesktop>
      <Group mt={25} justify="center">
        <EmployeeTable employees={employees}/>
      </Group>
    </CollapseDesktop>
  );
}
