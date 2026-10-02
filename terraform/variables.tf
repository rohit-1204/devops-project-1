variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment"
  type        = string
}

variable "vpc_cidr" {
  description = "VPC CIDR"
  type        = string
}

variable "eks_cluster_version" {
  description = "EKS Kubernetes version"
  type        = string
}

variable "node_instance_types" {
  description = "EKS node instance types"
  type        = list(string)
}

variable "node_min_size" {
  description = "Minimum EKS nodes"
  type        = number
}

variable "node_max_size" {
  description = "Maximum EKS nodes"
  type        = number
}

variable "node_desired_size" {
  description = "Desired EKS nodes"
  type        = number
}

variable "jenkins_key_name" {
  description = "EC2 key pair name for Jenkins"
  type        = string
}

variable "admin_cidr" {
  description = "CIDR allowed to access Jenkins"
  type        = string
}