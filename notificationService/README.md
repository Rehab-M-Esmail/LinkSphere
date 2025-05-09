# Notification Service - LinkSphere

This microservice handles user notifications.
It supports CRUD operations, listens to Kafka events, uses Redis for caching, and is containerized using Docker.

### Running
```bash
docker-compose up --build
```

Base URL: `http://localhost:5003/api/notifications`
