# Notification Service - LinkSphere

This microservice handles user notifications.
It supports CRUD operations, listens to Kafka events, uses Redis for caching, and is containerized using Docker.

### Running

```bash
docker-compose up --build
```

Base URL: `http://localhost:5003/api/notifications`

This will be modified keda keda so that it's called when a user likes, comment on , follow, send a request for someone else and uses any messagw broker to send the notification to the other user.
