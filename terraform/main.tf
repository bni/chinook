variable "environment" {
  description = "Environment to deploy to (staging or production)"
  type        = string
  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "Environment must be either 'staging' or 'production'."
  }
}

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
  full_environment = "chinook-${var.environment}"
}

provider "google" {
  project = local.full_environment
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

# Enable Cloud Build API
resource "google_project_service" "cloudbuild_api" {
  service            = "cloudbuild.googleapis.com"
  disable_on_destroy = false
}

# Enable Artifact Registry API
resource "google_project_service" "artifactregistry_api" {
  service            = "artifactregistry.googleapis.com"
  disable_on_destroy = false
}

# Create Artifact Registry repository for Docker images
resource "google_artifact_registry_repository" "chinook_repo" {
  location      = "europe-north2"
  repository_id = "${local.full_environment}-repository"
  description   = "Docker repository for Chinook ${var.environment}"
  format        = "DOCKER"
  depends_on    = [google_project_service.artifactregistry_api]
}

# Creates DB instance
resource "google_sql_database_instance" "default" {
  name             = "${local.full_environment}-database"
  region           = "europe-north2"
  database_version = "POSTGRES_18"
  root_password    = var.postgres_password

  settings {
    edition = "ENTERPRISE"
    tier = "db-f1-micro"
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
  secret_id = "${local.full_environment}-secret"
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

# Grant service account permission to push to Artifact Registry
resource "google_artifact_registry_repository_iam_member" "cloudbuild_artifactregistry" {
  location   = google_artifact_registry_repository.chinook_repo.location
  repository = google_artifact_registry_repository.chinook_repo.name
  role       = "roles/artifactregistry.writer"
  member     = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"
}

# Grant service account permission to deploy to Cloud Run
resource "google_project_iam_member" "cloudbuild_cloudrun" {
  project = data.google_project.project.project_id
  role    = "roles/run.admin"
  member  = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"
}

# Cloud Build trigger for GitHub repository
resource "google_cloudbuild_trigger" "github_trigger" {
  name        = "${local.full_environment}-build"
  description = "Build and deploy Chinook ${var.environment} from GitHub"
  location    = "europe-north2"

  github {
    owner = "bni"
    name  = "chinook"
    push {
      branch = "^main$"
    }
  }

  build {
    step {
      name = "gcr.io/cloud-builders/docker"
      args = [
        "build",
        "-t",
        "${google_artifact_registry_repository.chinook_repo.location}-docker.pkg.dev/${data.google_project.project.project_id}/${google_artifact_registry_repository.chinook_repo.repository_id}/chinook-website:$COMMIT_SHA",
        "-t",
        "${google_artifact_registry_repository.chinook_repo.location}-docker.pkg.dev/${data.google_project.project.project_id}/${google_artifact_registry_repository.chinook_repo.repository_id}/chinook-website:latest",
        "-f",
        "website/Dockerfile",
        "./website"
      ]
    }

    step {
      name = "gcr.io/cloud-builders/docker"
      args = [
        "push",
        "--all-tags",
        "${google_artifact_registry_repository.chinook_repo.location}-docker.pkg.dev/${data.google_project.project.project_id}/${google_artifact_registry_repository.chinook_repo.repository_id}/chinook-website"
      ]
    }

    step {
      name = "gcr.io/google.com/cloudsdktool/cloud-sdk"
      entrypoint = "gcloud"
      args = [
        "run",
        "services",
        "update",
        google_cloud_run_v2_service.default.name,
        "--image=${google_artifact_registry_repository.chinook_repo.location}-docker.pkg.dev/${data.google_project.project.project_id}/${google_artifact_registry_repository.chinook_repo.repository_id}/chinook-website:$COMMIT_SHA",
        "--region=${google_cloud_run_v2_service.default.location}"
      ]
    }
  }

  depends_on = [
    google_project_service.cloudbuild_api,
    google_artifact_registry_repository.chinook_repo,
    google_cloud_run_v2_service.default
  ]
}

resource "google_cloud_run_v2_service" "default" {
  name     = "${local.full_environment}-service"
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
        value = var.environment
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
