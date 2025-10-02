import { updateArtist } from "@lib/artists/updateArtist";
import oracledb from "oracledb";
import sinon from "sinon";
import { removeRedundantWhitespace } from "@lib/util/removeRedundantWhitespace";

test("Update artist", async () => {
  const executeStub = sinon.stub();
  const closeStub = sinon.stub();

  sinon.stub(oracledb, "getConnection").resolves({
    execute: executeStub,
    close: closeStub
  });

  executeStub.resolves({});

  await updateArtist(123, "Updated Artist Name");

  expect(executeStub.calledOnce).toBe(true);

  const query = removeRedundantWhitespace(executeStub.firstCall.args[0]);
  expect(query).toBe("UPDATE artist SET name = :artistName WHERE artistid = :artistId");

  expect(executeStub.firstCall.args[1]).toStrictEqual({
    artistName: "Updated Artist Name",
    artistId: 123
  });
  expect(executeStub.firstCall.args[2]).toStrictEqual({ autoCommit: true });

  expect(closeStub.calledOnce).toBe(true);
});
