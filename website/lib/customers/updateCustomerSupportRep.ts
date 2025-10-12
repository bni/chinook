import { query } from "@lib/util/postgres";

export async function updateCustomerSupportRep(customerId: number, supportRepId: number): Promise<void> {
  try {
    await query(`

      UPDATE
        customer
      SET
        support_rep_id = $1
      WHERE
        customer_id = $2

    `, [ supportRepId, customerId ]);
  } catch (error) {
    console.error("Error updating customer support rep:", error);

    throw error;
  }
}
