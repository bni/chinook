# Chinook

### The allowed values for NODE_ENV are:

| value       |                                   |
|-------------|-----------------------------------|
| development | When running with "npm run dev"   |
| test        | When unit tests run               |
| production  | When running with "npm run start" |

### The allowed values for APP_ENV are:

| value      |                                            |
|------------|--------------------------------------------|
| local      | When running on a developer machine        |
| staging    | When running in the pre-prod environment   |
| production | When running in the production environment |

### SQL query

```sql
WITH artists AS (
  SELECT
    ar.artist_id AS "artistId",
    ar.name AS "artistName",
    COUNT(al.album_id) AS "nrAlbums"
  FROM
    artist ar
      LEFT JOIN
    album al ON al.artist_id = ar.artist_id
  WHERE
    CASE WHEN ${filter} <> '' THEN
      ar.name ILIKE ${filter}
    ELSE
      TRUE
    END
  GROUP BY
    "artistId", "artistName"
)
SELECT
  "artistId",
  "artistName",
  "nrAlbums",
  COUNT(*) OVER() AS "totalRows"
FROM
  artists
ORDER BY
  (CASE WHEN ${sortColumn} = 'artistName' AND ${sortDirection} = 'asc' THEN "artistName" END) ASC,
  (CASE WHEN ${sortColumn} = 'artistName' AND ${sortDirection} = 'desc' THEN "artistName" END) DESC,
  (CASE WHEN ${sortColumn} = 'nrAlbums' AND ${sortDirection} = 'asc' THEN "nrAlbums" END) ASC,
  (CASE WHEN ${sortColumn} = 'nrAlbums' AND ${sortDirection} = 'desc' THEN "nrAlbums" END) DESC
LIMIT ${limit} OFFSET ${offset}
```

### TanStack query

```javascript
// Fetch artists when any search criteria changes
const { data, isFetching } = useQuery({
  queryKey: ["artists", searchFilter, sortColumn, sortDirection, page, recordsPerPage],
  queryFn: () => fetchArtists(
    searchFilter,
    sortColumn,
    sortDirection,
    page,
    recordsPerPage
  )
});
```

### TODO
* Drop in sst.config.ts to make it deployable in AWS, as well as in Google Cloud Run (Docker).
* Switch out pino logger to winston to see if it works better in Serverless env without using sync streams.
* npm workspaces?
