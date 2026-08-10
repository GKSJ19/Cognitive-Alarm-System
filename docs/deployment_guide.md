# Deployment Guide

This guide provides instructions to deploy the Intelligent Cognitive Alarm System backend using Docker to AWS and Azure.

---

## 1. Deploying to AWS (ECS + Fargate)

AWS Elastic Container Service (ECS) Fargate is recommended for running the Dockerized FastAPI backend in a serverless container environment.

### Steps:
1. **Push Image to ECR:**
   * Create an Amazon ECR registry:
     ```bash
     aws ecr create-repository --repository-name cognitive-alarm-backend
     ```
   * Authenticate and push:
     ```bash
     aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
     docker build -t cognitive-alarm-backend ./backend
     docker tag cognitive-alarm-backend:latest <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/cognitive-alarm-backend:latest
     docker push <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/cognitive-alarm-backend:latest
     ```
2. **Deploy Container on ECS Fargate:**
   * Set up an ECS Cluster in AWS Web Console.
   * Define a new Task Definition referencing the ECR image URI, specifying environment variables (`DATABASE_URL`, `JWT_SECRET_KEY`).
   * Configure port mapping for port `8000`.
   * Spawn a Service using Fargate, matching target security groups and load balancers.

---

## 2. Deploying to Azure (App Services)

Azure Web App for Containers provides an easy way to deploy and host the containerized API.

### Steps:
1. **Push Container to ACR:**
   * Create an Azure Container Registry (ACR):
     ```bash
     az acr create --resource-group AlarmRG --name cognitivealarmregistry --sku Basic
     az acr login --name cognitivealarmregistry
     ```
   * Build and push:
     ```bash
     docker tag cognitive-alarm-backend:latest cognitivealarmregistry.azurecr.io/backend:latest
     docker push cognitivealarmregistry.azurecr.io/backend:latest
     ```
2. **Create Web App for Containers:**
   * Provision the Azure App Service Plan:
     ```bash
     az appservice plan create --name alarmAppPlan --resource-group AlarmRG --sku B1 --is-linux
     ```
   * Launch Web App pointing to ACR image:
     ```bash
     az webapp create --name cognitive-alarm-api --resource-group AlarmRG --plan alarmAppPlan --deployment-container-image-name cognitivealarmregistry.azurecr.io/backend:latest
     ```
   * Configure environment variables in Azure App Configurations:
     * `WEBSITES_PORT` = `8000`
     * `DATABASE_URL` = (e.g. Azure Database for PostgreSQL connection string)
     * `JWT_SECRET_KEY` = (Secure secret key)
