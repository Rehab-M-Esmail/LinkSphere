const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
  'bolt://localhost:7687',
  neo4j.auth.basic('neo4j', 'password'),
  {
    database: 'friend', 
    encrypted: false,
  }
);
const connectToDatabase = async () => {
    try {
        const serverInfo = await driver.getServerInfo();
        console.log('Connected to Neo4j:', serverInfo);
    } catch (error) {
        console.error('Database Connection error:', error.message);
        process.exit(1);
    }
};

module.exports = connectToDatabase;