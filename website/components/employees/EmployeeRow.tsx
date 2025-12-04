import { IconChevronRight, IconUser, IconX } from "@tabler/icons-react";
import { Fragment } from "react";
import classes from "./EmployeeTable.module.css";
import clsx from "clsx";

interface EmployeeRowProps {
  hasCustomers: boolean,
  isExpanded: boolean,
  fullName: string
}

export function EmployeeRow({ hasCustomers, isExpanded, fullName }: EmployeeRowProps) {
  return (
    <Fragment>
      { hasCustomers ?
        <IconChevronRight
          className={ clsx(classes.icon, classes.expandIcon, { [classes.expandIconRotated]: isExpanded }) }
        />
        :
        <IconX className={classes.icon} />
      }
      <IconUser className={classes.icon} />

      <span>{ fullName }</span>
    </Fragment>
  );
}
