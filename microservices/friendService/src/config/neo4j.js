const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://neo4j:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USERNAME || 'neo4j', 
    process.env.NEO4J_PASSWORD || 'password'
  ),
  {
    database: 'friend', 
    encrypted: false,
    maxConnectionPoolSize: 10,
    connectionTimeout: 30000
  }
);
module.exports = driver;