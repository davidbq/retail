const express = require('express');
const router = express.Router();
const { listAllTables } = require('../config/database');

router.get('/', async (req, res) => {
	try {
		const tables = await listAllTables();
		res.json(tables);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;
