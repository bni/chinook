import { IconChevronRight, IconUser, IconX } from "@tabler/icons-react";
import clsx from "clsx";
import classes from "./EmployeeTable.module.css";
import { Fragment } from "react";

interface Params {
  hasCustomers: boolean,
  isExpanded: boolean,
  fullName: string
}

export function EmployeeRow({ params }: { params: Params }) {
  return (
    <Fragment>
      { params.hasCustomers ?
        <IconChevronRight
          className={ clsx(classes.icon, classes.expandIcon, { [classes.expandIconRotated]: params.isExpanded }) }
        />
        :
        <IconX className={classes.icon} />
      }
      <IconUser className={classes.icon} />

      <span>{ params.fullName }</span>
    </Fragment>
  );
}
