# InfraControl Platform

InfraControl is a comprehensive infrastructure management platform designed to provide centralized control, monitoring, and automation for cloud and on-premises resources.

## Features

- Multi-cloud infrastructure management (AWS, GCP, Azure)
- Real-time monitoring and alerting
- User and permission management
- Event logging and auditing
- Automation and scheduling

## Project Structure

- `frontend/` - React-based UI application
- `backend/` - Express.js API gateway and microservices
- `docs/` - Project documentation
- `k8s/` - Kubernetes deployment configurations

## Development Setup

### Prerequisites

- Node.js (v18+)
- Docker and Docker Compose
- Kubernetes cluster (local development with Minikube or kind)
- Git

### Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/infracontrol.git
   cd infracontrol
   ```

2. Install dependencies:
   ```
   # Install frontend dependencies
   cd frontend
   npm install
   
   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. Set up environment variables:
   ```
   # Copy example environment files
   cp frontend/.env.example frontend/.env
   cp backend/.env.example backend/.env
   ```

4. Start development servers:
   ```
   # Start frontend development server
   cd frontend
   npm run dev
   
   # Start backend development server
   cd ../backend
   npm run dev
   ```

5. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000

## Docker Development

```
docker-compose up -d
```

## License

[MIT](LICENSE) 