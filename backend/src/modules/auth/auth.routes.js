const express = require('express');
const router = express.Router();
const { loginUser, setupAdmin } = require('./auth.controller');

router.post('/login', loginUser);
router.post('/setup', setupAdmin);

module.exports = router;
