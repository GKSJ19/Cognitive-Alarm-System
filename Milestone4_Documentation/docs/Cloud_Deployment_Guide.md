# Cloud Deployment Guide (Milestone 4)

This guide provides the exact configuration and commands to deploy the Intelligent Cognitive Alarm Platform to cloud providers.

## Pre-requisites
- Docker installed locally
- Docker Hub account (or AWS ECR / Azure ACR)
- Cloud CLI tools configured (`aws` or `az`)

## AWS Deployment (EC2 + Docker Compose)

1. **Launch EC2 Instance**: Amazon Linux 2 or Ubuntu 22.04 LTS. Open port 80 and 443 in the Security Group.
2. **Install Docker on EC2**:
   ```bash
   sudo apt update
   sudo apt install docker.io docker-compose -y
   sudo usermod -aG docker ubuntu
   ```
3. **Deploy**:
   ```bash
   # On your local machine, copy the project files to the EC2 instance
   scp -i your-key.pem -r ./* ubuntu@<EC2-IP-ADDRESS>:/home/ubuntu/app
   
   # SSH into the instance
   ssh -i your-key.pem ubuntu@<EC2-IP-ADDRESS>
   
   # Run Docker Compose
   cd app
   docker-compose -f docker-compose.yml up -d --build
   
   # Run Migrations
   docker-compose exec backend alembic upgrade head
   ```

## Azure Deployment (App Service Container)

1. **Build and push images**:
   ```bash
   # Build images locally
   docker build -t yourregistry.azurecr.io/icap-backend ./backend
   docker build -t yourregistry.azurecr.io/icap-frontend ./frontend
   
   # Push to Azure Container Registry
   docker push yourregistry.azurecr.io/icap-backend
   docker push yourregistry.azurecr.io/icap-frontend
   ```
2. **Deploy using Azure CLI**:
   ```bash
   # Create a resource group
   az group create --name ICAP-Group --location eastus
   
   # Create a multi-container App Service using Docker Compose
   az webapp create --resource-group ICAP-Group \
       --plan ICAP-AppServicePlan \
       --name icap-platform \
       --multicontainer-config-type compose \
       --multicontainer-config-file docker-compose.yml
   ```

## Environment Variables
Ensure the following variables are set in your cloud provider's secret manager or `.env` file on the server:
- `DATABASE_URL` (Point to managed PostgreSQL like AWS RDS or Azure Database for PostgreSQL)
- `MONGODB_URL`
- `SECRET_KEY`
- `ALGORITHM`
