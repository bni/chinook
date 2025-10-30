// noinspection JSUnusedGlobalSymbols
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const os = await import("os");

    const { workJobs } = await import("@lib/worker/workJobs");
    await workJobs();

    console.log(`Album embeddings updated & job worker started. Running on ${ os.hostname }`);
  }
}
