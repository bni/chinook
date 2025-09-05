import { Box } from "@mantine/core";
import { IconBuilding } from "@tabler/icons-react";
import classes from "./EmployeeTable.module.css";

interface Params {
  firstName: string,
  lastName: string,
  companyName: string | undefined
}

export function EmployeeCustomerRow({ params }: { params: Params }) {
  return (
    <Box component="span" ml={20}>
      <IconBuilding className={classes.icon} />
      <span>{ params.firstName } { params.lastName }{ params.companyName && ", " + params.companyName }</span>
    </Box>
  );
}
