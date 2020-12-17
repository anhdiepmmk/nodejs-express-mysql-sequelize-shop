const express = require('express')
const router = express.Router()

const feedController = require('../controllers/feed.controller')

router.get('/posts', feedController.getPosts)
router.post('/posts', feedController.createPost)

module.exports = router