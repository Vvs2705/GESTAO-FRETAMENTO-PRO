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

variable "image_api_core" {
  type        = string
  description = "Full Docker image URI for api-core (e.g. ghcr.io/org/repo/api-core:sha)"
}

variable "image_worker" {
  type        = string
  description = "Full Docker image URI for worker"
}

variable "subnet_ids" {
  type        = list(string)
  description = "Private subnet IDs for ECS tasks"
}

variable "security_group_ids" {
  type        = list(string)
  description = "Security group IDs for ECS tasks"
}

variable "task_role_arn" {
  type        = string
  description = "IAM role ARN for ECS task (both task role and execution role)"
}

variable "env_vars" {
  type        = map(string)
  description = "Environment variables injected into every container (non-sensitive only)"
  default     = {}
}

variable "api_core_cpu" {
  type    = number
  default = 512
}

variable "api_core_memory" {
  type    = number
  default = 1024
}

variable "worker_cpu" {
  type    = number
  default = 256
}

variable "worker_memory" {
  type    = number
  default = 512
}

# ──────────────────────────────────────────────
# CloudWatch Log Groups
# ──────────────────────────────────────────────
resource "aws_cloudwatch_log_group" "api_core" {
  name              = "/ecs/gfp-${var.environment}/api-core"
  retention_in_days = var.environment == "prod" ? 30 : 7

  tags = {
    Environment = var.environment
    Service     = "api-core"
    ManagedBy   = "terraform"
  }
}

resource "aws_cloudwatch_log_group" "worker" {
  name              = "/ecs/gfp-${var.environment}/worker"
  retention_in_days = var.environment == "prod" ? 30 : 7

  tags = {
    Environment = var.environment
    Service     = "worker"
    ManagedBy   = "terraform"
  }
}

# ──────────────────────────────────────────────
# ECS Cluster
# ──────────────────────────────────────────────
resource "aws_ecs_cluster" "main" {
  name = "gfp-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Environment = var.environment
    Project     = "gestao-fretamento-pro"
    ManagedBy   = "terraform"
  }
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name       = aws_ecs_cluster.main.name
  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    capacity_provider = var.environment == "prod" ? "FARGATE" : "FARGATE_SPOT"
    weight            = 1
  }
}

# ──────────────────────────────────────────────
# Task Definition — api-core
# ──────────────────────────────────────────────
resource "aws_ecs_task_definition" "api_core" {
  family                   = "gfp-${var.environment}-api-core"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.api_core_cpu
  memory                   = var.api_core_memory
  task_role_arn            = var.task_role_arn
  execution_role_arn       = var.task_role_arn

  container_definitions = jsonencode([
    {
      name      = "api-core"
      image     = var.image_api_core
      essential = true

      portMappings = [
        { containerPort = 3000, protocol = "tcp", name = "http" },
        { containerPort = 9464, protocol = "tcp", name = "metrics" }
      ]

      environment = [for k, v in var.env_vars : { name = k, value = v }]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.api_core.name
          "awslogs-region"        = "us-east-1"
          "awslogs-stream-prefix" = "api-core"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:3000/v1/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 15
      }

      readonlyRootFilesystem = false
      user                   = "1001:1001"
    }
  ])

  tags = {
    Environment = var.environment
    Service     = "api-core"
    ManagedBy   = "terraform"
  }
}

# ──────────────────────────────────────────────
# Task Definition — worker
# ──────────────────────────────────────────────
resource "aws_ecs_task_definition" "worker" {
  family                   = "gfp-${var.environment}-worker"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.worker_cpu
  memory                   = var.worker_memory
  task_role_arn            = var.task_role_arn
  execution_role_arn       = var.task_role_arn

  container_definitions = jsonencode([
    {
      name      = "worker"
      image     = var.image_worker
      essential = true

      portMappings = [
        { containerPort = 3001, protocol = "tcp", name = "health" }
      ]

      environment = [for k, v in var.env_vars : { name = k, value = v }]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.worker.name
          "awslogs-region"        = "us-east-1"
          "awslogs-stream-prefix" = "worker"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:3001/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 15
      }

      readonlyRootFilesystem = false
      user                   = "1001:1001"
    }
  ])

  tags = {
    Environment = var.environment
    Service     = "worker"
    ManagedBy   = "terraform"
  }
}

# ──────────────────────────────────────────────
# ECS Service — api-core
# ──────────────────────────────────────────────
resource "aws_ecs_service" "api_core" {
  name            = "gfp-${var.environment}-api-core"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api_core.arn
  desired_count   = var.environment == "prod" ? 2 : 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = var.security_group_ids
    assign_public_ip = false
  }

  deployment_controller {
    type = "ECS"
  }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  deployment_maximum_percent         = 200
  deployment_minimum_healthy_percent = 100

  tags = {
    Environment = var.environment
    Service     = "api-core"
    ManagedBy   = "terraform"
  }

  lifecycle {
    ignore_changes = [task_definition, desired_count]
  }
}

# ──────────────────────────────────────────────
# ECS Service — worker
# ──────────────────────────────────────────────
resource "aws_ecs_service" "worker" {
  name            = "gfp-${var.environment}-worker"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.worker.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = var.security_group_ids
    assign_public_ip = false
  }

  deployment_controller {
    type = "ECS"
  }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  tags = {
    Environment = var.environment
    Service     = "worker"
    ManagedBy   = "terraform"
  }

  lifecycle {
    ignore_changes = [task_definition]
  }
}

# ──────────────────────────────────────────────
# Auto Scaling — api-core
# ──────────────────────────────────────────────
resource "aws_appautoscaling_target" "api_core" {
  max_capacity       = var.environment == "prod" ? 10 : 3
  min_capacity       = var.environment == "prod" ? 2 : 1
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.api_core.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "api_core_cpu" {
  name               = "gfp-${var.environment}-api-core-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.api_core.resource_id
  scalable_dimension = aws_appautoscaling_target.api_core.scalable_dimension
  service_namespace  = aws_appautoscaling_target.api_core.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 65.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}

# ──────────────────────────────────────────────
# Outputs
# ──────────────────────────────────────────────
output "cluster_arn" {
  value       = aws_ecs_cluster.main.arn
  description = "ECS cluster ARN"
}

output "cluster_name" {
  value       = aws_ecs_cluster.main.name
  description = "ECS cluster name"
}

output "api_core_service_name" {
  value       = aws_ecs_service.api_core.name
  description = "ECS service name for api-core"
}

output "worker_service_name" {
  value       = aws_ecs_service.worker.name
  description = "ECS service name for worker"
}
