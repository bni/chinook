import { artistQueue } from "@lib/worker/queues";
import { broker } from "@lib/util/broker";
import { createArtist } from "@lib/artists/createArtist";
import { logger } from "@lib/util/logger";

const workJobs = async () => {
  broker.on("error", (error) => {
    logger.error(error, "Got an error in Worker");
  });

  await broker.createQueue(artistQueue);
  logger.info({ queue: artistQueue }, "Worker created queue");

  await broker.work(artistQueue, async ([job]) => {
    logger.info({ id: job.id, data: job.data }, "Worker received job");

    try {
      const data = job.data as { artistName: string };

      logger.info(data, "Worker received artist");

      await createArtist(data.artistName);

      await broker.deleteJob(artistQueue, job.id);
    } catch (error) {
      logger.error(error, "Failed to create artist form the queue");
    }

    logger.info({ id: job.id }, "Worker deleted job");
  });
};

export { workJobs };
