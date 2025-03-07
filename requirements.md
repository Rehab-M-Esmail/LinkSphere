# Social Networking Platform: Functional and Non-Functional Requirements

## Features

- **User Profiles**
- **Post Creation**
- **Real-Time Notifications**
- **Architecture**: Microservices with asynchronous event-based communication.

---

## Functional Requirements

### 1. User Profiles

1. **User Registration**:
   - Users can register using an email address.
2. **User Login**:
   - Users can log in using their email and password
3. **Profile Management**:
   - Users can create, update, and delete their profiles.
   - Profiles include fields such as name, bio, profile picture, and contact information.
4. **Privacy Settings**:
   - Users can set their profile visibility (public, private, or friends-only).
   - Users can block or report other users.
5. **Search and Discovery**:
   - Users can search for other users by name, email, or username.

### 2. Post Creation

1. **Create Posts**:
   - Users can create text-based posts, image posts, and video posts.
2. **Edit and Delete Posts**:
   - Users can edit or delete their own posts.
3. **Post Visibility**:
   - Users can set post visibility (public, friends-only, or private).
4. **Like, Comment, and Share**:
   - Users can like, comment on, and share posts.
   - Comments can include text, images, and emojis.

### 3. Real-Time Notifications

1. **Notification Types**:
   - Notifications for likes, comments, shares, and new followers.
   - Notifications for friend requests and messages.
2. **Real-Time Delivery**:
   - Notifications should be delivered in real-time using WebSocket or similar technology. => to be discused

### 4. Messaging

1. **Direct Messaging**:
   - Users can send direct messages to other users.
   - Messages can include text, images, and emojis.
2. **Group Chats**:
   - Users can create and participate in group chats.
3. **Message History**:
   - Users can view their message history.
   - Messages should be stored securely and encrypted.

### 5. Friends and Followers

1. **Friend Requests**:
   - Users can send and accept friend requests.
2. **Followers**:
   - Users can follow other users without requiring mutual approval.
3. **Friend List**:
   - Users can view their list of friends and followers.

---

## Non-Functional Requirements

### 1. Performance

1. **Response Time**:
   - The system should respond to user requests within **500ms** for 95% of requests.
2. **Scalability**:
   - The platform should support up to **100 k concurrent users**.
   - The system should scale horizontally to handle increased load.
3. **Throughput**:
   - The system should handle at least **10,000 requests per second**.

### 2. Availability

1. **Uptime**:
   - The platform should have **99.9% uptime**.
2. **Redundancy**:
   - Critical services should have redundancy and failover mechanisms.

### 3. Security

1. **Data Encryption**:
   - All sensitive data (e.g., passwords, messages) should be encrypted in transit and at rest.
2. **Authentication and Authorization**:
   - Use OAuth 2.0 for secure authentication.
3. **DDoS Protection**:
   - The platform should be protected against Distributed Denial of Service (DDoS) attacks.

### 4. Reliability

1. **Error Handling**:
   - The system should gracefully handle errors and provide meaningful error messages to users.
2. **Data Consistency**:
   - Ensure eventual consistency across microservices using event-based communication.

### 5. Maintainability

1. **Modular Design**:
   - The platform should be built using a microservices architecture for easy maintenance and updates.

### 6. Usability

1. **User Interface**:
   - The platform should have a responsive user interface.
   - Support for only web platform.
2. **Accessibility**:
   - The platform should comply with accessibility standards (e.g., WCAG).

### 7. Extensibility

1. **API Support**:
   - Provide RESTful APIs and WebSocket APIs for third-party integrations.
2. **Plugin Architecture**:
   - Support for plugins or extensions to add new features.

### 8. Compliance

1. **Data Privacy**:
   - Comply with data privacy regulations such as GDPR and CCPA.

---

## Architecture: Microservices with Async Event-Based Communication

### Key Components

1. **User Service**:
   - Handles user registration, login, and profile management.
2. **Post Service**:
   - Manages post creation, editing, and deletion.
3. **Notification Service**:
   - Sends real-time notifications to users.
4. **Messaging Service**:
   - Handles direct messages and group chats.
5. **Friend Service**:
   - Manages friend requests, followers, and friend lists.
6. **Event Bus**:
   - Facilitates asynchronous communication between microservices using an event-driven architecture (e.g., Kafka, RabbitMQ).

### Communication

- **Synchronous Communication**:
  - RESTful APIs for direct requests (e.g., user login, post creation).
- **Asynchronous Communication**:
  - Event-based communication for real-time updates (e.g., notifications, feed updates).

### Data Storage

- **Relational Database**:
  - Store structured data such as user profiles, posts, and friend lists (e.g., PostgreSQL).
- **NoSQL Database**:
  - Store unstructured data such as notifications and messages (e.g., MongoDB).
- **Caching**:
  - Use Redis for caching frequently accessed data (e.g., user sessions, feed data).
