import { Box } from "@mantine/core";
import { IconBuilding } from "@tabler/icons-react";
import classes from "./EmployeeTable.module.css";

interface EmployeeCustomerRowProps {
  firstName: string,
  lastName: string,
  companyName: string | undefined
}

export function EmployeeCustomerRow({ firstName, lastName, companyName }: EmployeeCustomerRowProps) {
  return (
    <Box component="span" ml={20}>
      <IconBuilding className={classes.icon} />
      <span>{ firstName } { lastName }{ companyName && ", " + companyName }</span>
    </Box>
  );
}
