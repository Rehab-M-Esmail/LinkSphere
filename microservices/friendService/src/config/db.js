const neo4j = require('neo4j-driver')
const driver = neo4j.driver('neo4j://localhost:7687', neo4j.auth.basic('neo4j', 'letmein'))

const connectToDatabase = async () => {
    try {
    await driver.getServerInfo();
    console.log('Connected to Neo4j');
    console.log(serverInfo);
} catch (error) {
    console.error('Database Connection error:', error);
    process.exit(1);
}
}
module.exports = connectToDatabase;