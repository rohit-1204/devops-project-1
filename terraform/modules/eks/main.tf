
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "21.26.0"

  name               = "${var.project_name}-${var.environment}-eks"
  kubernetes_version = var.eks_cluster_version

  vpc_id = var.vpc_id

  subnet_ids = var.private_subnet_ids

  endpoint_public_access = true

  authentication_mode = "API_AND_CONFIG_MAP"

  enable_cluster_creator_admin_permissions = true

  addons = {
    coredns = {
      most_recent = true
    }

    kube-proxy = {
      most_recent = true
    }

    vpc-cni = {
      most_recent = true
    }

    eks-pod-identity-agent = {
      most_recent = true
    }
  }

  eks_managed_node_groups = {
    main = {
      name = "${var.project_name}-${var.environment}-nodes"

      instance_types = var.node_instance_types

      min_size     = var.node_min_size
      max_size     = var.node_max_size
      desired_size = var.node_desired_size

      subnet_ids = var.private_subnet_ids

      capacity_type = "ON_DEMAND"

      disk_size = 30

      labels = {
        Environment = var.environment
        Application = var.project_name
      }
    }
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}