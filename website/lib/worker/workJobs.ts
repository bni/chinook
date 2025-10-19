import { boss } from "@lib/util/boss";
import { logger } from "@lib/util/logger";
import { artistQueue } from "@lib/worker/queues";

const workJobs = async () => {
  boss.on("error", (error) => {
    logger.error(error, "Got an error in Worker");
  });

  await boss.createQueue(artistQueue);
  logger.info({ queue: artistQueue }, "Worker created queue");

  await boss.work(artistQueue, async ([job]) => {
    logger.info({ id: job.id, data: job.data }, "Worker received job");

    await boss.deleteJob(artistQueue, job.id);

    logger.info({ id: job.id }, "Worker deleted job");
  });
};

export { workJobs };
