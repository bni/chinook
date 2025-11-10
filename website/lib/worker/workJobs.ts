import { broker } from "@lib/util/broker";
import { artistQueue } from "@lib/worker/queues";
import { createArtist } from "@lib/artists/createArtist";

const workJobs = async () => {
  broker.on("error", (error) => {
    console.error("Got an error in Worker", error);
  });

  await broker.createQueue(artistQueue);
  console.info("Worker created queue", { queue: artistQueue });

  await broker.work(artistQueue, async ([job]) => {
    console.info("Worker received job", { id: job.id, data: job.data });

    try {
      const data = job.data as { artistName: string };

      console.info("Worker received artist", data);

      await createArtist(data.artistName);

      await broker.deleteJob(artistQueue, job.id);
    } catch (error) {
      console.error("Failed to create artist from the queue", error);
    }

    console.info("Worker deleted job", { id: job.id });
  });
};

export { workJobs };
