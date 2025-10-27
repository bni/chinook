import { z } from "zod";

const Customer = z.object({
  customerId: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  companyName: z.string().optional()
});

export type Customer = z.infer<typeof Customer>;

const Employee = z.object({
  employeeId: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  fullName: z.string(),
  title: z.string().optional(),
  city: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  supportRepForCustomers: Customer.array().optional()
});

export type Employee = z.infer<typeof Employee>;
