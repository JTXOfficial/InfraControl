# Kubernetes Configurations for InfraControl

This directory contains Kubernetes manifests for deploying InfraControl in different environments.

## Directory Structure

- `dev/` - Development environment configurations
- `test/` - Testing environment configurations (to be added)
- `prod/` - Production environment configurations (to be added)

## Development Setup

### Prerequisites

- Minikube or kind installed locally
- kubectl configured to use your local cluster

### Getting Started

1. Start your local Kubernetes cluster:
   ```
   minikube start
   ```
   or
   ```
   kind create cluster --name infracontrol
   ```

2. Apply the namespace configuration:
   ```
   kubectl apply -f dev/namespace.yaml
   ```

3. Build and load the Docker images:
   ```
   # Build frontend image
   docker build -t infracontrol-frontend:dev -f frontend/Dockerfile.dev frontend/
   
   # Build backend image
   docker build -t infracontrol-backend:dev -f backend/Dockerfile.dev backend/
   
   # Load images into Minikube
   minikube image load infracontrol-frontend:dev
   minikube image load infracontrol-backend:dev
   ```
   or for kind:
   ```
   # Build frontend image
   docker build -t infracontrol-frontend:dev -f frontend/Dockerfile.dev frontend/
   
   # Build backend image
   docker build -t infracontrol-backend:dev -f backend/Dockerfile.dev backend/
   
   # Load images into kind
   kind load docker-image infracontrol-frontend:dev --name infracontrol
   kind load docker-image infracontrol-backend:dev --name infracontrol
   ```

4. Apply the Kubernetes configurations:
   ```
   kubectl apply -f dev/mongodb.yaml
   kubectl apply -f dev/backend.yaml
   kubectl apply -f dev/frontend.yaml
   ```

5. Access the application:
   ```
   # For Minikube
   minikube service frontend -n infracontrol-dev
   
   # For kind, port-forward the frontend service
   kubectl port-forward svc/frontend 3000:3000 -n infracontrol-dev
   ``` 