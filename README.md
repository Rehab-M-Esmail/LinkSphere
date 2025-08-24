# LinkSphere - Social Networking Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/your-username/nexus-social-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/nexus-social-platform/actions)
[![Microservices](https://img.shields.io/badge/Architecture-Microservices-brightgreen)](https://microservices.io/)

LinkSphere is a modern, scalable social networking platform built with a microservices architecture. It enables users to connect, share content, and communicate in real-time.

In this platform, We don't silent infulencers who documents war crimes in Gaza, we don't support gendering and hate speeches. Here We obbey Islamic rules.

## 🚀 Key Features

*   **User Profiles**: Register, manage your profile, and control your privacy settings.
*   **Rich Post Creation**: Create text, image, and video posts with customizable visibility.
*   **Real-Time Interactions**: Like, comment, and share posts. Receive instant notifications.
*   **Connect with Others**: Send friend requests, build a follower base, and discover new people.
*   **Powerful Search**: Find users and content quickly and efficiently.
*   **Scalable by Design**: Built on a microservices architecture with event-driven communication for high performance and reliability.

## 📋 Architecture Overview

LinkSphere is built as a collection of loosely coupled microservices that communicate synchronously via REST APIs and asynchronously via message brokers (RabbitMQ) for event-driven workflows.

### Key Services

| Service | Responsibility | Tech Stack |
| :--- | :--- | :--- |
| **API Gateway** | Single entry point, routing, rate limiting | Node.js, Express |
| **Authentication Service** | User login, JWT issuance & validation | Node.js, Express, JWT |
| **User Service** | User registration and account CRUD | Node.js, Express, PostgreSQL |
| **Profile Service** | Managing user profile data and privacy | Node.js, Express, PostgreSQL |
| **Post Service** | Creation, editing, deletion of posts | Node.js, Express, MongoDB |
| **Feed Service** | Generating and serving user-specific feeds | Node.js, Express, Redis |
| **Notification Service** | Sending real-time notifications | Node.js, Socket.IO, Redis |
| **Friend Service** | Managing friend requests & follower relationships | Node.js, Express, Neo4j |
| **Search Service** | Indexing and searching for users and posts | Elasticsearch |
| **Media Service** | Handling uploads and storage of images/videos | Node.js, Express,S3/MinIO |

### Data Flow & Communication
*   **Synchronous (HTTP/REST)**: Used for direct requests like login, post creation, and profile updates.
*   **Asynchronous (Events)**: Used for decoupled actions like generating feeds, sending notifications, and updating search indexes. For example, when a user creates a post, the Post service emits a `PostCreated` event, which the Feed and Notification services consume.

## 🛠️ Installation & Quickstart

### Prerequisites
*   Docker & Docker Compose
*   Node.js (v18+)
*   Go (v1.2)

### Running with Docker Compose (Recommended)

The easiest way to run Nexus locally is using our `docker-compose` setup, which will spin up all necessary services and dependencies.

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Rehab-M-Esmail/LinkSphere.git
    cd microservices
    ```

2.  **Set up environment variables**
    ```bash
    cd any service
    # Edit .env with your desired configuration (e.g., secrets, API keys)
    ```

3.  **Start the application**
    ```bash
    cd ..
    docker-compose up -d
    ```
    This command will build and start all microservices, databases, and message queues.

4.  **Access the application**
    The API Gateway should be running at `http://localhost:8080`.
    Individual service endpoints and health checks are detailed in the tests/postman-collection file

### Running Services Individually (For Development)

Please see the [Contributing Guide](./CONTRIBUTING.md) for detailed instructions on setting up each service in a development environment.

## 📚 API Documentation

Once the application is running, you can access the interactive API documentation:
<!-- *   **Swagger/OpenAPI UI**: Available at `http://localhost:3000/api/docs` (via the API Gateway). -->
*   **Postman Collection**: A full Postman collection is available in the `/tests/postman-collection` folder for testing all endpoints.

## 🤝 Contributing

We love your input! We want to make contributing to Nexus as easy and transparent as possible.

Please read our [Contributing Guide](./CONTRIBUTING.md) for details on our code of conduct, the process for submitting pull requests, and how to set up your development environment.

### Development Setup
1.  Fork the repo and create your branch from `main`.
2.  Follow the service-specific setup guides in the `/docs` folder.
3.  Make your changes.
4.  Write tests and ensure all existing tests pass (`docker-compose run tests`).
5.  Submit a pull request, linking it to any relevant issues.

