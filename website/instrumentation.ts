export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const oracledb = await import('oracledb');
    const os = await import('os');

    await oracledb.createPool({
      user: 'c##chinook',
      password: 'chinook',
      connectString: 'localhost:1522/ORCLCDB'
    });

    console.log(`Pool created. Running on ${os.hostname}`);
  }
}
