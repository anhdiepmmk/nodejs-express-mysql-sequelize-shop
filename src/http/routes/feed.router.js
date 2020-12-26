const express = require('express')
const router = express.Router()
const { body } = require('express-validator')

const feedController = require('../controllers/feed.controller')

// GET /feed/posts
router.get('/posts', feedController.getPosts)

// POST /feed/post
router.post('/post',
    [
        body('title').trim().isLength({ min: 5, max: 255 }),
        body('content').trim().isLength({ min: 5, max: 255 })
    ],
    feedController.createPost)

router.get('/post/:postId', feedController.getPost)

module.exports = router