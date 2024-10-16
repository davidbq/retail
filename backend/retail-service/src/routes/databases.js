const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
	try {
		const mongoClient = req.mongoClient;
		const adminDb = mongoClient.db().admin();
		const databaseList = await adminDb.listDatabases();
		res.json(databaseList.databases);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;
