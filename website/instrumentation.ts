// noinspection JSUnusedGlobalSymbols
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const oracledb = await import("oracledb");
    const os = await import("os");

    await oracledb.createPool({
      user: "c##chinooked",
      password: "chinook",
      connectString: "localhost:1521/FREE"
    });

    console.log(`Pool created. Running on ${ os.hostname }`);
  }
}
