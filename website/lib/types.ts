export interface Employee {
  employeeId: number,
  firstName: string,
  lastName: string,
  fullName: string,
  title?: string,
  supporRepForCustomers?: Customer[]
}

export interface Customer {
  customerId: number,
  firstName: string,
  lastName: string,
  companyName?: string
}
