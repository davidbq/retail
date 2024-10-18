
# Retail Project

## Overview

This project consists of multiple services built using Node.js, DynamoDB and MongoDB, with infrastructure management handled by AWS CDK. Docker is used to orchestrate services, enabling easy local development and testing.

## Project Structure

```
backend/
├── customers-service/           # Service for handling customer-related operations
├── retail-service/              # Service for retail business logic
├── create-node-service.sh       # Script to generate a new Node.js service
├── node-template-service/       # Template for creating new Node.js services
cdk/                             # AWS CDK code (currently empty)
database/
├── customers-db/                # Database configuration for customers
├── retail-db/                   # Database configuration for retail
docker-compose.yml               # Docker Compose file to orchestrate services
```

## Requirements

- Docker
- Docker Compose
- Node.js (for local development)
- AWS CLI (for CDK deployment)

## Setup and Usage

### 1. Clone the repository

```bash
git clone <repository-url>
cd retail
```

### 2. Setup environment

Ensure you have the correct environment variables set for AWS credentials and other configurations. Example:

```bash
export AWS_ACCESS_KEY_ID='your-access-key'
export AWS_SECRET_ACCESS_KEY='your-secret-key'
```

### 3. Start Services

You can start the services locally using Docker Compose.

```bash
docker-compose up --build
```

This command will:

- Build and start the **retail-service** and **customers-service**.
- Start MongoDB containers for **retail-db**.
- Start DynamoDB containers for **customers-db**.

### 4. Creating New Services

To create a new Node.js microservice, you can use the provided script:

```bash
./backend/create-node-service.sh <service-name>
```

This will create a new service based on the `node-template-service`.

### 5. Deploying to AWS

Currently, the `cdk` folder is empty. To deploy this project to AWS, follow these steps:

1. Define the necessary AWS infrastructure using AWS CDK.
2. Install the required CDK modules and deploy with the following commands:

```bash
cd cdk
npm install
cdk deploy
```

Ensure your AWS CLI is configured correctly.

## License

This project is open-source and available under the [MIT License](LICENSE).
