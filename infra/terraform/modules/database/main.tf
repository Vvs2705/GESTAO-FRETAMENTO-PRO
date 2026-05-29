terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.6.0"
}

# ──────────────────────────────────────────────
# Variables
# ──────────────────────────────────────────────
variable "environment" {
  type        = string
  description = "Deployment environment: staging | prod"
}

variable "db_name" {
  type        = string
  default     = "gestao_fretamento_pro"
  description = "PostgreSQL database name"
}

variable "db_username" {
  type        = string
  description = "Master database username"
}

variable "db_password" {
  type        = string
  sensitive   = true
  description = "Master database password — store in Secrets Manager, never in tfvars committed to git"
}

variable "instance_class" {
  type        = string
  default     = "db.t3.medium"
  description = "RDS instance class"
}

variable "subnet_ids" {
  type        = list(string)
  description = "Private subnet IDs for the DB subnet group"
}

variable "vpc_security_group_ids" {
  type        = list(string)
  description = "Security group IDs that allow inbound PostgreSQL (5432) from the app layer"
}

# ──────────────────────────────────────────────
# DB Subnet Group
# ──────────────────────────────────────────────
resource "aws_db_subnet_group" "main" {
  name        = "gfp-${var.environment}-db-subnet"
  subnet_ids  = var.subnet_ids
  description = "GFP ${var.environment} DB subnet group"

  tags = {
    Name        = "gfp-${var.environment}-db-subnet"
    Environment = var.environment
    Project     = "gestao-fretamento-pro"
    ManagedBy   = "terraform"
  }
}

# ──────────────────────────────────────────────
# Parameter Group
# ──────────────────────────────────────────────
resource "aws_db_parameter_group" "postgres" {
  family      = "postgres16"
  name        = "gfp-${var.environment}-pg16"
  description = "GFP ${var.environment} PostgreSQL 16 parameter group"

  parameter {
    name  = "shared_preload_libraries"
    value = "pg_stat_statements"
  }

  parameter {
    name  = "pg_stat_statements.track"
    value = "all"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000"
  }

  parameter {
    name  = "max_connections"
    value = "200"
  }

  parameter {
    name  = "log_statement"
    value = "none"
  }

  tags = {
    Environment = var.environment
    Project     = "gestao-fretamento-pro"
    ManagedBy   = "terraform"
  }
}

# ──────────────────────────────────────────────
# RDS Instance
# ──────────────────────────────────────────────
resource "aws_db_instance" "postgres" {
  identifier        = "gfp-${var.environment}-postgres"
  engine            = "postgres"
  engine_version    = "16.3"
  instance_class    = var.instance_class
  allocated_storage = 50
  max_allocated_storage = 500
  storage_encrypted = true
  storage_type      = "gp3"
  iops              = var.environment == "prod" ? 3000 : null

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = var.vpc_security_group_ids
  parameter_group_name   = aws_db_parameter_group.postgres.name
  publicly_accessible    = false

  # Backup & maintenance
  backup_retention_period   = 7
  backup_window             = "03:00-04:00"
  maintenance_window        = "sun:04:00-sun:05:00"
  copy_tags_to_snapshot     = true
  delete_automated_backups  = false

  # Protection
  deletion_protection       = var.environment == "prod"
  skip_final_snapshot       = var.environment != "prod"
  final_snapshot_identifier = var.environment == "prod" ? "gfp-prod-final-${formatdate("YYYY-MM-DD", timestamp())}" : null

  # Observability
  performance_insights_enabled          = true
  performance_insights_retention_period = 7
  monitoring_interval                   = 60
  enabled_cloudwatch_logs_exports       = ["postgresql", "upgrade"]

  tags = {
    Environment = var.environment
    Project     = "gestao-fretamento-pro"
    Service     = "database"
    ManagedBy   = "terraform"
  }

  lifecycle {
    # Never destroy in prod — requires explicit target
    prevent_destroy = false
  }
}

# ──────────────────────────────────────────────
# Outputs
# ──────────────────────────────────────────────
output "db_endpoint" {
  value       = aws_db_instance.postgres.endpoint
  description = "RDS endpoint (host:port)"
}

output "db_identifier" {
  value       = aws_db_instance.postgres.identifier
  description = "RDS instance identifier"
}

output "db_name" {
  value       = aws_db_instance.postgres.db_name
  description = "Database name"
}

output "db_arn" {
  value       = aws_db_instance.postgres.arn
  description = "RDS instance ARN"
}
