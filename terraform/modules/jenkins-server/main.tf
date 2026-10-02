data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name   = "root-device-type"
    values = ["ebs"]
  }
}


resource "aws_instance" "jenkins" {

  ami           = data.aws_ami.ubuntu.id
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

    set -euxo pipefail

    export DEBIAN_FRONTEND=noninteractive


    # --------------------------------------------------
    # SYSTEM PACKAGES
    # --------------------------------------------------

    apt-get update

    apt-get install -y \
      curl \
      wget \
      unzip \
      git \
      ca-certificates \
      gnupg \
      lsb-release \
      apt-transport-https


    # --------------------------------------------------
    # JAVA 21
    # --------------------------------------------------

    apt-get install -y openjdk-21-jdk

    java -version


    # --------------------------------------------------
    # DOCKER
    # --------------------------------------------------

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


    # --------------------------------------------------
    # JENKINS
    # --------------------------------------------------

    curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key \
      -o /usr/share/keyrings/jenkins-keyring.asc

    echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" \
      > /etc/apt/sources.list.d/jenkins.list

    apt-get update

    apt-get install -y jenkins

    systemctl stop jenkins || true


    # --------------------------------------------------
    # JENKINS PLUGINS
    # --------------------------------------------------

    jenkins-plugin-cli --plugins \
      configuration-as-code \
      job-dsl \
      workflow-aggregator \
      git \
      github \
      docker-workflow \
      credentials-binding


    # --------------------------------------------------
    # DOCKER ACCESS FOR JENKINS
    # --------------------------------------------------

    usermod -aG docker jenkins


    # --------------------------------------------------
    # CLONE PROJECT FROM GITHUB
    # --------------------------------------------------

    rm -rf /opt/devops-project-1

    git clone \
      https://github.com/rohit-1204/devops-project-1.git \
      /opt/devops-project-1


    # --------------------------------------------------
    # JENKINS CASC DIRECTORY
    # --------------------------------------------------

    mkdir -p /var/lib/jenkins/casc_configs

    mkdir -p /var/lib/jenkins/jobdsl


    # --------------------------------------------------
    # COPY JCasC CONFIG FROM GIT
    # --------------------------------------------------

    cp \
      /opt/devops-project-1/jenkins/casc/jenkins.yaml \
      /var/lib/jenkins/casc_configs/jenkins.yaml


    # --------------------------------------------------
    # COPY JOB DSL FROM GIT
    # --------------------------------------------------

    cp \
      /opt/devops-project-1/jenkins/jobs/jobs.groovy \
      /var/lib/jenkins/jobdsl/jobs.groovy


    # --------------------------------------------------
    # PERMISSIONS
    # --------------------------------------------------

    chown -R jenkins:jenkins \
      /var/lib/jenkins/casc_configs

    chown -R jenkins:jenkins \
      /var/lib/jenkins/jobdsl


    # --------------------------------------------------
    # JCasC SYSTEMD CONFIG
    # --------------------------------------------------

    mkdir -p /etc/systemd/system/jenkins.service.d

    cat > /etc/systemd/system/jenkins.service.d/casc.conf <<'CASC_SERVICE'
[Service]
Environment="CASC_JENKINS_CONFIG=/var/lib/jenkins/casc_configs/jenkins.yaml"
Environment="JAVA_OPTS=-Djava.awt.headless=true -Djenkins.install.runSetupWizard=false"
CASC_SERVICE


    # --------------------------------------------------
    # AWS CLI
    # --------------------------------------------------

    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" \
      -o "/tmp/awscliv2.zip"

    unzip -q /tmp/awscliv2.zip -d /tmp

    /tmp/aws/install

    aws --version


    # --------------------------------------------------
    # KUBECTL
    # --------------------------------------------------

    curl -LO \
      "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

    install \
      -o root \
      -g root \
      -m 0755 \
      kubectl \
      /usr/local/bin/kubectl

    rm -f kubectl

    kubectl version --client


    # --------------------------------------------------
    # START JENKINS
    # --------------------------------------------------

    systemctl daemon-reload

    systemctl enable jenkins

    systemctl start jenkins

    systemctl restart jenkins


    # --------------------------------------------------
    # INSTALLATION COMPLETE
    # --------------------------------------------------

    echo "=============================================="
    echo " Jenkins installation completed"
    echo " Git repository cloned"
    echo " JCasC loaded from Git"
    echo " Job DSL loaded from Git"
    echo " Jenkins jobs will be created automatically"
    echo "=============================================="

  EOF


  tags = {
    Name        = "${var.project_name}-${var.environment}-jenkins"
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}
