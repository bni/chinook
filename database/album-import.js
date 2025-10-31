import "dotenv/config";
import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const { Pool } = pg;
import { pipeline } from "@xenova/transformers";

// https://www.kaggle.com/datasets/kauvinlucas/30000-albums-aggregated-review-ratings
// TODO fix encoding errors: LC_ALL=C grep '[^ -~]' album_ratings.csv
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CSV_FILE = path.join(__dirname, "album_ratings.csv");

const pool = new Pool({
  user: process.env.CHINOOK_PGUSER,
  password: process.env.CHINOOK_PGPASSWORD,
  host: process.env.CHINOOK_PGHOST,
  port: parseInt(process.env.CHINOOK_PGPORT, 10),
  database: process.env.CHINOOK_PGDATABASE
});

const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

const parseCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === "\"") {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);

  return result;
}

const fetchOrCreateArtist = async (client, artistName) => {
  const existingArtist = await client.query(`

    SELECT
      artist_id
    FROM
      artist
    WHERE
      name = $1

  `, [artistName]);

  if (existingArtist.rows.length > 0) {
    return existingArtist.rows[0]["artist_id"];
  }

  const newArtist = await client.query(`

    INSERT INTO artist (
      name
    ) VALUES (
      $1
    ) RETURNING artist_id

  `, [artistName]);

  return newArtist.rows[0]["artist_id"];
}

const importData = async () => {
  console.log(`Reading CSV file: ${CSV_FILE}`);
  const fileContent = fs.readFileSync(CSV_FILE, "utf-8");
  const lines = fileContent.split("\n").filter(line => line.trim());

  console.log(`Found ${lines.length - 1} albums to import`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    try {
      const values = parseCSVLine(line);

      const artist = values[0];
      const title = values[1];
      const release = parseInt(values[4], 10);
      const label = values[6];
      const genre = values[7];
      const criticscore = parseInt(values[12], 10);
      const userscore = parseInt(values[14], 10);

      if (!title || !artist) {
        console.warn(`Skipping row ${i + 1}: Missing title or artist`);

        skipped++;

        continue;
      }

      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const artistId = await fetchOrCreateArtist(client, artist);

        const existingAlbum = await client.query(`

          SELECT
            album_id
          FROM
            album
          WHERE
            title = $1 AND
            artist_id = $2

        `, [title, artistId]);

        if (existingAlbum.rows.length > 0) {
          console.log(`Skipping duplicate album: ${title} by ${artist}`);

          skipped++;

          await client.query("ROLLBACK");

          continue;
        }

        const embeddingInput = `${artist} ${title}`;

        // noinspection JSValidateTypes
        const response = await extractor([embeddingInput], { pooling: "mean", normalize: true });

        const embedding = JSON.stringify(Array.from(response.data));

        await client.query(`

          INSERT INTO album (
            title,
            release,
            label,
            genre,
            critic_score,
            user_score,
            embedding,
            artist_id
          ) VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8
          )

        `, [title, release, label, genre, criticscore, userscore, embedding, artistId]);

        await client.query("COMMIT");

        imported++;

        if (imported % 100 === 0) {
          console.log(`Imported ${imported} albums...`);
        }
      } catch (error) {
        await client.query("ROLLBACK");

        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error(`Error processing row ${i + 1}:`, error.message);

      errors++;
    }
  }

  console.log("\n=== Import Summary ===");
  console.log(`Successfully imported: ${imported} albums`);
  console.log(`Skipped (duplicates): ${skipped} albums`);
  console.log(`Errors: ${errors} albums`);
  console.log("=====================\n");
}

const main = async () => {
  try {
    await importData();
    console.log("Import completed successfully!");

    process.exit(0);
  } catch (error) {
    console.error("Import failed:", error);

    process.exit(1);
  } finally {
    await pool.end();
  }
}

await main();
