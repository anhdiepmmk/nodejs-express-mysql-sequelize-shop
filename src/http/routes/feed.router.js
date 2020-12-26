const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const path = require('path')
const multer = require('multer')
const { v4: uuidv4 } = require('uuid');


const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', '..', '..', 'public', 'images'));
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4() + '.' + file.mimetype.split('/').pop());
    }
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const feedController = require('../controllers/feed.controller')

// GET /feed/posts
router.get('/posts', feedController.getPosts)

// POST /feed/post
router.post('/post',
    multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'),
    [
        body('title').trim().isLength({ min: 5, max: 255 }),
        body('content').trim().isLength({ min: 5, max: 255 })
    ],
    feedController.createPost)

// PUT /feed/post
router.put('/post/:postId',
    multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'),
    [
        body('title').trim().isLength({ min: 5, max: 255 }),
        body('content').trim().isLength({ min: 5, max: 255 })
    ],
    feedController.updatePost)

router.get('/post/:postId', feedController.getPost)

module.exports = router