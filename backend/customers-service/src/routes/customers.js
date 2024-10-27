const express = require('express');
const { CUSTOMERS } = require('../config/constants');
const { getAllItems } = require('../config/database');

const router = express.Router();

router.get('/', async (req, res) => {
	try {
        const allCustomers = await getAllItems(CUSTOMERS);
		res.json(allCustomers);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;
