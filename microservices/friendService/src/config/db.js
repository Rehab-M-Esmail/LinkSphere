const driver = require('./neo4j')
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