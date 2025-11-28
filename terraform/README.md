## Common Issues

### Cloud Build Trigger Fails

The Cloud Build trigger requires GitHub authentication to be set up in Google Cloud Console. Visit the Cloud Build > Triggers page and connect your GitHub repository.

### Permission Denied Errors

Ensure your GCP service account has the following roles:
- Compute Admin
- Cloud SQL Admin
- Secret Manager Admin
- Cloud Run Admin
- Cloud Build Editor
- Artifact Registry Admin
