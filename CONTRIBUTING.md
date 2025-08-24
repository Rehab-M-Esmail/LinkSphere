# Contributing to Nexus

First off, thank you for considering contributing to Nexus! It’s people like you that make this project such a great tool.

## How Can I Contribute?

### Reporting Bugs
Bugs are tracked as [GitHub issues](https://github.com/Rehab-M-Esmail/LinkSphere/issues). Please use the **Bug Report** template and provide as much detail as possible.

### Suggesting Enhancements
We welcome enhancement suggestions. Open an issue and use the **Feature Request** template to clearly describe the proposed functionality.

### Pull Requests
1.  Fork the repo and create your branch from `main`. Use a descriptive branch name (e.g., `feat/add-comments-api`, `fix/notification-bug`).
2.  If you've added code, add tests. If you've changed APIs, update the documentation.
3.  Ensure the test suite passes.
4.  Make sure your code lints and follows the project's style.
5.  Issue that pull request!

## Development Setup

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Go 1.19+

### Getting Started
1.  **Fork and Clone**
    ```bash
    git clone https://github.com/Rehab-M-Esmail/LinkSphere.git
    ```

2.  **Start Dependencies**
    This starts databases, Redis, and the message broker without the services.
    ```bash
    docker-compose up -d postgres mongodb redis rabbitmq Neo4j
    ```

3.  **Set Up a Service**
    Each service has its own setup instructions. See the service-specific READMEs in their directories (e.g., `./microservices/user-service/README.md`).

    A general pattern for a Node.js service:
    ```bash
    cd services/user-service
    npm install
    npm run dev
    ```

4.  **Run Tests**
    Run tests for a specific service from its directory:
    ```bash
    npm test  # for Node.js services
    go test ./... # for Go services
    ```

## Style Guides

### Git Commit Messages
*   Use the present tense ("Add feature" not "Added feature")
*   Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
*   Limit the first line to 72 characters or less
*   Reference issues and pull requests liberally after the first line

### Code Style
*   **JavaScript/TypeScript**: We use ESLint and Prettier. Configuration is in the root.
*   **Go**: Use `gofmt`.

Run `npm run lint` in the root directory to check styles for all services.

## Recognition
Your contribution will be recognized in our release notes and the list of contributors on GitHub.
