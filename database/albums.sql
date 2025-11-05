--DROP TABLE album;

--DROP TABLE artist;

-- noinspection SqlResolve
CREATE TABLE album (
  album_id UUID PRIMARY KEY DEFAULT uuidv7(),
  title TEXT NOT NULL,
  release INT NOT NULL,
  label TEXT,
  genre TEXT,
  critic_score INT NOT NULL,
  user_score FLOAT NOT NULL,
  embedding VECTOR(384),
  artist_id UUID NOT NULL
);

-- noinspection SqlResolve
CREATE TABLE artist (
  artist_id UUID PRIMARY KEY DEFAULT uuidv7(),
  name TEXT
);

ALTER TABLE album ADD CONSTRAINT album_artist_id_fkey
  FOREIGN KEY (artist_id) REFERENCES artist (artist_id) ON DELETE NO ACTION ON UPDATE NO ACTION;

CREATE INDEX album_artist_id_idx ON album (artist_id);

-- Composite index for finding most recent album per artist (optimizes subqueries in listArtists)
CREATE INDEX album_artist_id_release_idx ON album (artist_id, release DESC);

-- Index for filtering albums by release year (optimizes EXISTS clause with ANY)
CREATE INDEX album_release_idx ON album (release);

-- Case-insensitive index for artist name searches (optimizes ILIKE queries)
CREATE INDEX artist_name_lower_idx ON artist (LOWER(name));

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO chinook;
