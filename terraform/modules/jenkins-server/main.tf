
data "aws_ssm_parameter" "ubuntu_ami" {
  name = "/aws/service/canonical/ubuntu/server/24.04/stable/current/amd64/hvm/ebs-gp3/ami-id"
}

resource "aws_instance" "jenkins" {
  ami = data.aws_ssm_parameter.ubuntu_ami.value

  instance_type = "t3.medium"

  subnet_id = var.public_subnet_id

  key_name = var.jenkins_key_name

  vpc_security_group_ids = [
    aws_security_group.jenkins.id
  ]

  iam_instance_profile = aws_iam_instance_profile.jenkins.name

  associate_public_ip_address = true

  root_block_device {
    volume_size = 30
    volume_type = "gp3"
    encrypted   = true
  }

  user_data = <<-EOF
              #!/bin/bash

              set -e

              export DEBIAN_FRONTEND=noninteractive

              apt-get update

              # Java 21
              apt-get install -y openjdk-21-jdk

              # Basic packages
              apt-get install -y \
                curl \
                wget \
                unzip \
                git \
                ca-certificates \
                gnupg \
                lsb-release

              # Docker
              install -m 0755 -d /etc/apt/keyrings

              curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
                -o /etc/apt/keyrings/docker.asc

              chmod a+r /etc/apt/keyrings/docker.asc

              echo \
                "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
                $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
                > /etc/apt/sources.list.d/docker.list

              apt-get update

              apt-get install -y \
                docker-ce \
                docker-ce-cli \
                containerd.io \
                docker-buildx-plugin \
                docker-compose-plugin

              systemctl enable docker
              systemctl start docker

              # Jenkins repository
              curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key \
                -o /usr/share/keyrings/jenkins-keyring.asc

              echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" \
                > /etc/apt/sources.list.d/jenkins.list

              apt-get update

              apt-get install -y jenkins

              systemctl enable jenkins
              systemctl start jenkins

              # Jenkins needs Docker access
              usermod -aG docker jenkins

              systemctl restart jenkins

              # AWS CLI
              curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" \
                -o "/tmp/awscliv2.zip"

              unzip -q /tmp/awscliv2.zip -d /tmp

              /tmp/aws/install

              # kubectl
              curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

              install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

              rm -f kubectl

              EOF

  tags = {
    Name        = "${var.project_name}-${var.environment}-jenkins"
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}