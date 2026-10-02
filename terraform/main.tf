module "vpc" {
  source = "./modules/vpc"

  project_name = var.project_name
  environment  = var.environment
  vpc_cidr     = var.vpc_cidr
  aws_region   = var.aws_region
}

module "ecr" {
  source = "./modules/ecr"

  project_name = var.project_name
  environment  = var.environment
}

module "eks" {
  source = "./modules/eks"

  project_name = var.project_name
  environment  = var.environment

  eks_cluster_version = var.eks_cluster_version

  node_instance_types = var.node_instance_types
  node_min_size       = var.node_min_size
  node_max_size       = var.node_max_size
  node_desired_size   = var.node_desired_size

  vpc_id = module.vpc.vpc_id

  private_subnet_ids = module.vpc.private_subnet_ids
}

module "jenkins" {
  source = "./modules/jenkins"

  project_name = var.project_name
  environment  = var.environment

  vpc_id           = module.vpc.vpc_id
  public_subnet_id = module.vpc.public_subnet_ids[0]

  jenkins_key_name = var.jenkins_key_name
  admin_cidr       = var.admin_cidr

  frontend_ecr_repository_arn = module.ecr.frontend_repository_arn
  backend_ecr_repository_arn  = module.ecr.backend_repository_arn
}