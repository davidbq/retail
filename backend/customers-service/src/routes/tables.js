const express = require('express');
const router = express.Router();
const { getAllItems } = require('../config/database');

router.get('/', async (req, res) => {
	try {

        const allCustomers = await getAllItems('retail-customers-table');
		res.json(allCustomers);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;
