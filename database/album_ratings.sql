--DROP TABLE ratings_album;

--DROP TABLE ratings_artist;

-- noinspection SqlResolve
CREATE TABLE ratings_album (
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
CREATE TABLE ratings_artist (
  artist_id UUID PRIMARY KEY DEFAULT uuidv7(),
  name TEXT
);

ALTER TABLE ratings_album ADD CONSTRAINT ratings_album_artist_id_fkey
  FOREIGN KEY (artist_id) REFERENCES ratings_artist (artist_id) ON DELETE NO ACTION ON UPDATE NO ACTION;

CREATE INDEX ratings_album_artist_id_idx ON ratings_album (artist_id);

CREATE INDEX ratings_artist_name_idx ON ratings_artist (name);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO chinook;
