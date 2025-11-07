// noinspection JSUnusedGlobalSymbols
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const os = await import("os");

    //const { workJobs } = await import("@lib/worker/workJobs");
    //await workJobs();

    const mode = process.env.NODE_ENV;
    const env = process.env.APP_ENV;

    console.log(`Running on ${os.hostname}, in ${mode} mode, ${env} env.`);
  }
}
