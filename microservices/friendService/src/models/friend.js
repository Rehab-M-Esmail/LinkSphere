const driver = require('../config/db');

class FriendModel {
  async createUserNode(userId) {
    const session = driver.session();
    try {
      await session.run(
        `MERGE (u:User {userId: $userId})
         ON CREATE SET u.createdAt = datetime()`,
        { userId }
      );
    } finally {
      await session.close();
    }
}

async addFriendship(userId1, userId2) {
    const session = driver.session();
    try {
    await session.run(
        `MATCH (u1:User {userId: $userId1})
         MATCH (u2:User {userId: $userId2})
         MERGE (u1)-[r:FRIENDS {since: datetime()}]->(u2)`,
        { userId1, userId2 }
      );
    } finally {
      await session.close();
    }
  }

  async getFriends(userId) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (u:User {userId: $userId})-[:FRIENDS]->(friend)
         RETURN friend.userId AS userId`,
        { userId }
      );
      return result.records.map(record => record.get('userId'));
    } finally {
      await session.close();
    }
  }
}

module.exports = new FriendModel();