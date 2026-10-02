aws_region  = "ap-south-1"

project_name = "todo-app"

environment = "dev"

vpc_cidr = "10.0.0.0/16"

eks_cluster_version = "1.33"

node_instance_types = [
  "t3.medium"
]

node_min_size     = 2
node_max_size     = 3
node_desired_size = 2

jenkins_key_name = "todo-jenkins-key"

admin_cidr = "YOUR_PUBLIC_IP/32"