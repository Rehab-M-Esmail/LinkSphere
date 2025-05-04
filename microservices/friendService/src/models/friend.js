const driver = require("../config/neo4j");

class FriendModel {
  async createUserNode(userId) {
    const session = driver.session({ database: "friend" });
    try {
      await session.executeWrite(async (txc) => {
        var result = await txc.run(
          `MERGE (u:User {userId: $userId})
            ON CREATE SET u.createdAt = datetime() RETURN u.userId AS userId`,
          { userId }
        );
        //console.log(`User node created for userId: ${result.records}`);
      });
    } catch (error) {
      console.error("Error creating user node:", error.message);
    } finally {
      await session.close();
    }
  }

  async addFriendship(userId1, userId2) {
    const session = driver.session({ database: "friend" });
    try {
      await session.executeWrite(async (txc) => {
        var result = await txc.run(
          //This will be modified to check if there is already a relationship to avoid duplicate relationships
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

  async removeFriendship(userId1, userId2) {
    const session = driver.session({ database: "friend" });
    try {
      await session.executeWrite(async (txc) => {
        var result = await txc.run(
          `MATCH (u1:User {userId: $userId1})-[r:FRIENDS]->(u2:User {userId: $userId2})
         DELETE r`,
          { userId1, userId2 }
        );
        console.log(`Friendship removed between ${userId1} and ${userId2}`);
      });
    } catch (error) {
      console.error("Error removing friendship:", error.message);
    } finally {
      await session.close();
    }
  }
  async getFriends(userId) {
    const session = driver.session({ database: "friend" });
    //console.log('Getting friends for userId:', userId);
    try {
      //await driver.executeQuery(async txc => {
      const friends = await session.executeRead(async (txc) => {
        const result = await txc.run(
          `MATCH (u:User {userId: $userId})-[:FRIENDS]->(friend:User)
         RETURN friend.userId AS userId`,
          { userId }
        );
        console.log("Query Result:", result.records);
        return result.records.map((record) => record.get("userId"));
      });
      return friends;
    } finally {
      await session.close();
    }
  }

  // async getFriends(userId) {
  //     const session = driver.session({ database: 'friend' });
  //     try {
  //         console.log(`Fetching friends for userId: ${userId}`);
  //         const result = await session.run(
  //             `MATCH (u:User {userId: $userId})-[:FRIENDS]->(friend:User)
  //              RETURN friend.userId AS userId`,
  //             { userId }
  //         );
  //         console.log('Raw Query Result:', result);
  //         console.log('Query Records:', result.records);
  //         const friends = result.records.map(record => record.get('userId'));
  //         console.log('Processed Result:', friends);
  //         return friends;
  //     } catch (error) {
  //         console.error('Error fetching friends:', error.message);
  //         return [];
  //     } finally {
  //         await session.close();
  //     }
  // }

  async getUserById(userId) {
    const session = driver.session({ database: "friend" });
    //here is the problem possibly
    // userId=String(userId);
    // console.log(typeof userId);
    userId = Number(userId);
    console.log("Getting user by ID:", userId);
    try {
      // userId = String(userId).trim(); Failed to solve the issue
      const result = await session.run(
        `MATCH (u:User {userId: $userId}) RETURN u`,
        { userId }
      );
      console.log(
        "Query Result for finding user:",
        result.records.map((record) => record.get("u"))
      );
      return result.records.length > 0 ? result.records[0].get("u") : null;
    } finally {
      await session.close();
    }
  }
}

module.exports = new FriendModel();
