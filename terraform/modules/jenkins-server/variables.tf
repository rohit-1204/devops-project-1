
variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "public_subnet_id" {
  description = "Public subnet ID for Jenkins"
  type        = string
}

variable "jenkins_key_name" {
  description = "EC2 key pair name"
  type        = string
}

variable "admin_cidr" {
  description = "CIDR allowed to access Jenkins"
  type        = string
}

variable "frontend_ecr_repository_arn" {
  description = "Frontend ECR repository ARN"
  type        = string
}

variable "backend_ecr_repository_arn" {
  description = "Backend ECR repository ARN"
  type        = string
}