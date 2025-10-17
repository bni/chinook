import { query } from "@lib/util/postgres";
import { error } from "@lib/util/logger";

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
  } catch (e) {
    error(e, "Failed to update customer support rep");

    throw e;
  }
}
