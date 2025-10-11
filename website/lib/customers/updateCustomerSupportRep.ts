import { query } from "@lib/util/postgres";

export async function updateCustomerSupportRep(customerId: number, supportRepId: number): Promise<void> {
  try {
    const params = [
      supportRepId,
      customerId
    ];

    await query(`

      UPDATE
        customer
      SET
        support_rep_id = $1
      WHERE
        customer_id = $2

    `, params
    );
  } catch (error) {
    console.error("Error updating customer support rep:", error);

    throw error;
  }
}
