export function oracleMock(resultRows: any) {
  return {
    getConnection: function () {
      return {
        execute: function () {
          return {
            rows: resultRows
          }
        },
        close: function () {}
      }
    }
  };
}
