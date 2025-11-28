variable "postgres_password" {
  description = "Postgres root user password"
  type        = string
  sensitive   = true
  validation {
    condition     = var.postgres_password != ""
    error_message = "Postgres password must be set."
  }
}

locals {
  project_id = "chinook-${terraform.workspace}"
}

provider "google" {
  project = local.project_id
  region  = "europe-north2"
  zone    = "europe-north2-c"
}

data "google_project" "project" {
}

# Enable Secret Manager API
resource "google_project_service" "secretmanager_api" {
  service            = "secretmanager.googleapis.com"
  disable_on_destroy = false
}

# Enable SQL Admin API
resource "google_project_service" "sqladmin_api" {
  service            = "sqladmin.googleapis.com"
  disable_on_destroy = false
}

# Enable Cloud Run API
resource "google_project_service" "cloudrun_api" {
  service            = "run.googleapis.com"
  disable_on_destroy = false
}

# Creates DB instance
resource "google_sql_database_instance" "default" {
  name             = "${local.project_id}-database"
  region           = "europe-north2"
  database_version = "POSTGRES_18"
  root_password    = var.postgres_password

  settings {
    edition = "ENTERPRISE"
    tier    = "db-f1-micro"
    password_validation_policy {
      min_length                  = 6
      complexity                  = "COMPLEXITY_DEFAULT"
      reuse_interval              = 2
      disallow_username_substring = true
      enable_password_policy      = true
    }
  }
  deletion_protection = false
  depends_on          = [google_project_service.sqladmin_api]
}

# Create chinook_secret secret
resource "google_secret_manager_secret" "chinook_secret" {
  secret_id = "${local.project_id}-secret"
  replication {
    auto {}
  }
  depends_on = [google_project_service.secretmanager_api]
}

# Attaches secret data for chinook_secret secret
resource "google_secret_manager_secret_version" "chinook_secret_data" {
  secret      = google_secret_manager_secret.chinook_secret.id
  secret_data = "{ \"DUMMY\": \"dummy\" }"
}

# Update service account for chinook_secret secret
resource "google_secret_manager_secret_iam_member" "secretaccess_compute_chinook_secret" {
  secret_id = google_secret_manager_secret.chinook_secret.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"
}

resource "google_cloud_run_v2_service" "default" {
  name     = "${local.project_id}-service"
  location = "europe-north2"

  deletion_protection = false

  template {
    containers {
      # Image from Artifact Registry - will be updated by Cloud Build trigger
      # image = "${google_artifact_registry_repository.chinook_repo.location}-docker.pkg.dev/${data.google_project.project.project_id}/${google_artifact_registry_repository.chinook_repo.repository_id}/chinook-website:latest"
      image = "us-docker.pkg.dev/cloudrun/container/hello:latest" # Temporary

      # Set environment variables (only non-secrets!)
      env {
        name  = "APP_ENV"
        value = terraform.workspace
      }

      volume_mounts {
        name       = "cloudsql"
        mount_path = "/cloudsql"
      }
    }
    volumes {
      name = "cloudsql"
      cloud_sql_instance {
        instances = [google_sql_database_instance.default.connection_name]
      }
    }
  }
  client     = "terraform"
  depends_on = [google_project_service.secretmanager_api, google_project_service.sqladmin_api, google_project_service.cloudrun_api]
}
