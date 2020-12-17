const express = require('express')
const router = express.Router()

const feedController = require('../controllers/feed.controller')

router.get('/', feedController.getIndex)

module.exports = router