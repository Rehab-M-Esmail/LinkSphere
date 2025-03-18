# ADR 001: Using MongoDB and PostgreSQL in a Social Networking Platform

## Status

Proposed

## Context

Our social networking platform will manage structured data (e.g., user profiles, relationships, posts) and unstructured data (e.g., media files, activity logs, real-time notifications).

Given the diverse nature of the data and the need for high performance, we need to decide whether to use a single type of database (SQL or NoSQL) or a combination of both. After evaluating the options, we have decided to use **PostgreSQL** for structured data and **MongoDB** for unstructured data.

## Decision

We will use **PostgreSQL** and **MongoDB** in our social networking platform, leveraging the strengths of each to optimize performance, scalability, and flexibility.

### PostgreSQL (SQL Database)

- **Use Case**: Structured data such as user profiles, relationships, posts, comments, and metadata.
- **Examples**:
  - Storing user profiles with fields like name, email, and date of birth.
  - Managing friend relationships, follower networks, and group memberships.
  - Storing posts, comments, and their metadata (e.g., timestamps, likes).

### MongoDB (NoSQL Database)

- **Use Case**: Unstructured or semi-structured data such as media files, activity logs, real-time notifications, and cached data.
- **Examples**:
  - Storing media files (images, videos) and their metadata.
  - Managing real-time notifications and messaging.
  - Caching frequently accessed data to reduce latency.

## Consequences

### Benefits

- **Optimized Performance**: PostgreSQL excels at handling structured data with complex queries, while MongoDB is optimized for high-speed read/write operations and unstructured data.
- **Scalability**: MongoDB’s horizontal scaling capabilities make it ideal for handling large volumes of unstructured data and high traffic loads.
- **Flexibility**: MongoDB’s schema-less design allows for easy adaptation to changing data requirements, while PostgreSQL ensures data integrity and consistency for critical structured data.

### Trade-offs

- **Complexity**: Managing two different databases increases system complexity. We will need to implement robust data synchronization and integration mechanisms.
- **Operational Overhead**: Maintaining and monitoring both PostgreSQL and MongoDB will require additional resources and expertise.

## Alternatives Considered

1. **PostgreSQL Only**: Using only PostgreSQL would simplify the architecture but would limit our ability to handle unstructured data efficiently and scale for high traffic.
2. **MongoDB Only**: Using only MongoDB would provide scalability and flexibility but would lack the strong consistency and complex querying capabilities needed for structured data.
3. **NewSQL**: Exploring NewSQL databases (e.g., CockroachDB, TiDB) that aim to combine the benefits of SQL and NoSQL. However, these technologies are still evolving and may not yet offer the maturity and ecosystem support we need.

## Conclusion

Using **PostgreSQL** for structured data and **MongoDB** for unstructured data allows us to leverage the strengths of each database, optimizing performance, scalability, and flexibility. While this approach introduces additional complexity and operational overhead, the benefits outweigh the trade-offs for our specific use case.

# ADR 002: Choosing Microservices Architecture for the Social Networking Platform

## Status

Proposed

## Context

Linksphere is expected to handle a wide range of functionalities, including user management, post creation, real-time notifications, media storage, and more. As the platform grows, we need an architecture that can scale efficiently, support independent development and deployment, and ensure fault isolation.

After evaluating monolithic and microservices architectures, we have decided to adopt a **microservices architecture** to meet these requirements.

## Decision

We will use a **microservices architecture** for the social networking platform, breaking down the application into smaller, independent services that can be developed, deployed, and scaled independently.

### Key Characteristics of Microservices Architecture

- **Decentralized**: Each microservice is a self-contained unit with its own database (if needed) and business logic.
- **Independent Deployment**: Services can be deployed independently, allowing for faster iteration and reduced risk.
- **Scalability**: Individual services can be scaled independently based on demand.
- **Technology Agnostic**: Different services can use different technologies (e.g., programming languages, databases) as needed.
- **Fault Isolation**: Failures in one service are less likely to impact the entire system.

### Example Microservices for the Platform

1. **User Service**: Handles user registration, authentication, and profile management.
2. **Post Service**: Manages the creation, editing, and retrieval of posts and comments.
3. **Media Service**: Handles the storage and retrieval of media files (images, videos).
4. **Notification Service**: Manages real-time notifications and messaging.
5. **Relationship Service**: Manages friend relationships, follower networks, and group memberships.

## Consequences

### Benefits

- **Scalability**: Each service can be scaled independently based on its workload, ensuring efficient resource utilization.
- **Fault Isolation**: Failures in one service (e.g., Notification Service) do not affect the entire platform.
- **Independent Development**: Teams can work on different services simultaneously, enabling faster development cycles.
- **Technology Flexibility**: Different services can use the most appropriate technology stack for their specific needs.
- **Easier Maintenance**: Smaller, focused codebases are easier to maintain and debug.

### Trade-offs

- **Complexity**: Microservices introduce additional complexity in terms of service communication, data consistency, and deployment.
- **Operational Overhead**: Managing multiple services requires robust DevOps practices, including monitoring, logging, and orchestration.
- **Latency**: Inter-service communication (e.g., via APIs or message queues) can introduce latency compared to a monolithic architecture.
- **Data Management**: Maintaining data consistency across services can be challenging, especially in distributed transactions.

## Conclusion

The **microservices architecture** is the best choice for our social networking platform due to its scalability, fault isolation, and flexibility. While it introduces additional complexity and operational overhead, the long-term benefits of independent development, deployment, and scaling justify the decision.
