const express = require('express');
const { getOperators, createOperator, disableOperator } = require('../controllers/operatorController');

const router = express.Router();

// Route pour récupérer la liste des opérateurs
router.get('/list', getOperators);

// Route to create a new operator
router.post('/create', createOperator);

// Route to disable an operator
router.put('/disable/:id', disableOperator);

module.exports = router;