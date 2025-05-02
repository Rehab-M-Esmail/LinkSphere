const driver = require('../config/neo4j');

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
      const writeTxResultPromise = await session.executeWrite(async txc =>{
        var result = await txc.run(
        `MATCH (u1:User {userId: $userId1})
         MATCH (u2:User {userId: $userId2})
         MERGE (u1)-[r:FRIENDS {since: datetime()}]->(u2)`,
        { userId1, userId2 }
      );
      console.log(`Friendship created between ${userId1} and ${userId2}`);
    });
    } finally {
      await session.close();
    }
  }

  async getFriends(userId) {
    const session = driver.session();
    try {
      const writeTxResultPromise = await session.executeWrite(async txc =>{
        var result = await txc.run(`MATCH (u:User {userId: $userId})-[:FRIENDS]->(friend:User)
         RETURN friend.userId AS userId`,
        { userId });
        console.log('Query Result:', result.records);
        return result.records.map(record => record.get('userId'));
    });
    } finally {
      await session.close();
    }
  }
  async getUserById(userId) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (u:User {userId: $userId})
         RETURN u`,
        { userId }
      );
      return result.records.length > 0 ? result.records[0].get('u') : null;
    } finally {
      await session.close();
    }
  }
}

module.exports = new FriendModel();