import type { DataTableSortStatus } from "mantine-datatable";
import { get, sortBy } from "lodash";

import companyData from "./companies.json";
import departmentData from "./departments.json";
import employeeData from "./employees.json";

type Company = {
  id: string;
  name: string;
  streetAddress: string;
  city: string;
  state: string;
  missionStatement: string;
};

type Department = {
  id: string;
  name: string;
  company: Company;
};

export type Employee = {
  id: string;
  sex: "male" | "female";
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  department: Department;
};

export const companies: Company[] = companyData;

export const departments: Department[] = departmentData.map(({ companyId, ...rest }) => ({
  ...rest,
  company: companies.find(({ id }) => id === companyId)!
}));

export const employees = employeeData.map(({ departmentId, ...rest }) => ({
  ...rest,
  department: departments.find(({ id }) => id === departmentId)!
})) as Employee[];

export async function listEmployees({
  page,
  recordsPerPage,
  sortStatus: { columnAccessor: sortAccessor, direction: sortDirection }
}: {
  page: number;
  recordsPerPage: number;
  sortStatus: DataTableSortStatus<Employee>;
}) {
  let result = sortBy(employees, (employee) =>
    sortAccessor === "name"
      ? `${employee.firstName} ${employee.lastName}`
      : sortAccessor === "age"
        ? 10
        : get(employee, sortAccessor)
  );

  if (sortDirection === "desc") result.reverse();

  const total = result.length;
  const skip = (page - 1) * recordsPerPage;
  result = result.slice(skip, skip + recordsPerPage);

  return { total, employees: result as Employee[] };
}
