export type Customer = {
  customerId: number,
  firstName: string,
  lastName: string,
  companyName?: string
};

export type Employee = {
  employeeId: number,
  firstName: string,
  lastName: string,
  fullName: string,
  title?: string,
  city?: string,
  email?: string,
  phone?: string,
  supportRepForCustomers?: Customer[]
};
