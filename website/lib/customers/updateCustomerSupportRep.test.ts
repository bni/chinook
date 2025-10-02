import { updateCustomerSupportRep } from "@lib/customers/updateCustomerSupportRep";
import oracledb from "oracledb";
import sinon from "sinon";
import { removeRedundantWhitespace } from "@lib/util/removeRedundantWhitespace";

test("Update customer support rep", async () => {
  const executeStub = sinon.stub();
  const closeStub = sinon.stub();

  sinon.stub(oracledb, "getConnection").resolves({
    execute: executeStub,
    close: closeStub
  });

  executeStub.resolves({});

  await updateCustomerSupportRep(5, 3);

  expect(executeStub.calledOnce).toBe(true);

  const query = removeRedundantWhitespace(executeStub.firstCall.args[0]);
  expect(query).toBe("UPDATE customer SET supportrepid = :supportRepId WHERE customerid = :customerId");

  expect(executeStub.firstCall.args[1]).toStrictEqual({
    supportRepId: 3,
    customerId: 5
  });
  expect(executeStub.firstCall.args[2]).toStrictEqual({ autoCommit: true });

  expect(closeStub.calledOnce).toBe(true);
});
