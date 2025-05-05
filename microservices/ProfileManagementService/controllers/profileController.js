const driver = require('../config/neo4j');

exports.getProfile = async (req, res) => {
    const userId = req.params.userId;
    const session = driver.session();

    try {
        const result = await session.run(
            'MATCH (u:User {id: $userId}) RETURN u',
            { userId }
        );

        if (result.records.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userNode = result.records[0].get('u').properties;
        res.status(200).json(userNode);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
    }
};

exports.updateProfile = async (req, res) => {
    const userId = req.params.userId;
    const { name, bio, location } = req.body;
    const session = driver.session();

    try {
        const result = await session.run(
            'MATCH (u:User {id: $userId}) SET u.name = $name, u.bio = $bio, u.location = $location RETURN u',
            { userId, name, bio, location }
        );

        const updatedUser = result.records[0].get('u').properties;
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
    }
};
