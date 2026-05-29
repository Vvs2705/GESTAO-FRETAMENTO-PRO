terraform {
  required_version = ">= 1.6.0"

  backend "s3" {
    bucket         = "gfp-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "gfp-terraform-locks"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = "gestao-fretamento-pro"
      Environment = "prod"
      ManagedBy   = "terraform"
      CostCenter  = "infra"
    }
  }
}

# ──────────────────────────────────────────────
# Variables (provided via secrets in CI/CD — NEVER in committed tfvars)
# ──────────────────────────────────────────────
variable "db_username" {
  type      = string
  sensitive = true
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "image_api_core" {
  type        = string
  description = "Docker image URI for api-core (injected by CI/CD)"
}

variable "image_worker" {
  type        = string
  description = "Docker image URI for worker (injected by CI/CD)"
}

variable "private_subnet_ids" {
  type        = list(string)
  description = "Private subnet IDs from the production VPC"
}

variable "db_security_group_id" {
  type        = string
  description = "Security group ID that permits PostgreSQL access"
}

variable "app_security_group_id" {
  type        = string
  description = "Security group ID for ECS tasks"
}

variable "task_role_arn" {
  type        = string
  description = "IAM role ARN for ECS tasks"
}

variable "redis_url" {
  type      = string
  sensitive = true
}

variable "jwt_secret" {
  type      = string
  sensitive = true
}

variable "jwt_refresh_secret" {
  type      = string
  sensitive = true
}

# ──────────────────────────────────────────────
# Database module
# ──────────────────────────────────────────────
module "database" {
  source = "../../modules/database"

  environment            = "prod"
  db_username            = var.db_username
  db_password            = var.db_password
  instance_class         = "db.t3.large"  # Larger instance for production load
  subnet_ids             = var.private_subnet_ids
  vpc_security_group_ids = [var.db_security_group_id]
}

# ──────────────────────────────────────────────
# Compute module
# ──────────────────────────────────────────────
module "compute" {
  source = "../../modules/compute"

  environment            = "prod"
  image_api_core         = var.image_api_core
  image_worker           = var.image_worker
  subnet_ids             = var.private_subnet_ids
  security_group_ids     = [var.app_security_group_id]
  task_role_arn          = var.task_role_arn

  # Production gets more resources
  api_core_cpu    = 1024
  api_core_memory = 2048
  worker_cpu      = 512
  worker_memory   = 1024

  env_vars = {
    NODE_ENV          = "production"
    DATABASE_URL      = "postgresql://${var.db_username}:${var.db_password}@${module.database.db_endpoint}/${module.database.db_name}"
    DIRECT_URL        = "postgresql://${var.db_username}:${var.db_password}@${module.database.db_endpoint}/${module.database.db_name}"
    REDIS_URL         = var.redis_url
    APP_URL           = "https://api.gestao-fretamento.com.br"
    FRONTEND_URL      = "https://app.gestao-fretamento.com.br"
    CORS_ORIGINS      = "https://app.gestao-fretamento.com.br"
    LOG_LEVEL         = "warn"
    OTEL_SERVICE_NAME = "api-core"
    PORT              = "3000"
  }
}

# ──────────────────────────────────────────────
# Outputs
# ──────────────────────────────────────────────
output "db_endpoint" {
  value     = module.database.db_endpoint
  sensitive = true
}

output "db_identifier" {
  value = module.database.db_identifier
}

output "cluster_name" {
  value = module.compute.cluster_name
}

output "api_core_service" {
  value = module.compute.api_core_service_name
}
