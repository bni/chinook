# Website

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

### TODO
* Drop in sst.config.ts to make it deployable in AWS Lambda
* Keep Google Cloud Run (Docker) support if possible
* DSQL https://github.com/awsfundamentals-hq/aurora-dsql https://github.com/better-auth/better-auth/issues/6605
