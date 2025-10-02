import oracledb, { Connection, BindParameters } from "oracledb";

export async function updateCustomerSupportRep(customerId: number, supportRepId: number): Promise<void> {
  let connection: Connection | undefined;
  try {
    connection = await oracledb.getConnection();

    const params: BindParameters = {
      supportRepId: supportRepId,
      customerId: customerId
    };

    await connection.execute(`

      UPDATE
        customer
      SET
        supportrepid = :supportRepId
      WHERE
        customerid = :customerId

    `, params, { autoCommit: true }
    );
  } catch (error) {
    console.error("Error updating customer support rep:", error);

    throw error;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}
