# Terraform Configuration to provision Veloura cloud resources (AWS provider)

terraform {
  required_version = ">= 1.2.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }
  backend "s3" {
    bucket         = "veloura-terraform-state-bucket"
    key            = "production/state.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "veloura-tflocks"
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

# VPC Definition
resource "aws_vpc" "veloura_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags = {
    Name = "veloura-prod-vpc"
  }
}

# RDS Postgres Database instance
resource "aws_db_instance" "postgres_db" {
  allocated_storage      = 20
  max_allocated_storage  = 100
  db_name                = "veloura_prod_db"
  engine                 = "postgres"
  engine_version         = "15.3"
  instance_class         = "db.t4g.micro"
  username               = "veloura_admin"
  password               = var.db_password
  parameter_group_name   = "default.postgres15"
  skip_final_snapshot    = true
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.db_subnet.name
}

# AWS ECS cluster for container orchestration
resource "aws_ecs_cluster" "veloura_cluster" {
  name = "veloura-production-cluster"
}

# Database security group
resource "aws_security_group" "db_sg" {
  name        = "veloura-db-security-group"
  description = "Allow inbound connections to PostgreSQL from VPC"
  vpc_id      = aws_vpc.veloura_vpc.id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Subnet groups and variables
resource "aws_db_subnet_group" "db_subnet" {
  name       = "veloura-db-subnet-group"
  subnet_ids = [aws_subnet.private_1.id, aws_subnet.private_2.id]
}

resource "aws_subnet" "private_1" {
  vpc_id            = aws_vpc.veloura_vpc.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-east-1a"
}

resource "aws_subnet" "private_2" {
  vpc_id            = aws_vpc.veloura_vpc.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "us-east-1b"
}

variable "db_password" {
  type      = string
  sensitive = true
}
