import { broker } from "@lib/util/broker";
import { logger } from "@lib/util/logger";
import { artistQueue } from "@lib/worker/queues";

const workJobs = async () => {
  broker.on("error", (error) => {
    logger.error(error, "Got an error in Worker");
  });

  await broker.createQueue(artistQueue);
  logger.info({ queue: artistQueue }, "Worker created queue");

  await broker.work(artistQueue, async ([job]) => {
    logger.info({ id: job.id, data: job.data }, "Worker received job");

    await broker.deleteJob(artistQueue, job.id);

    logger.info({ id: job.id }, "Worker deleted job");
  });
};

export { workJobs };
