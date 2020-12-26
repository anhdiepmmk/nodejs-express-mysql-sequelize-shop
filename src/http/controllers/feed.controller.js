const e = require('cors')
const { validationResult } = require('express-validator')
const Post = require('../../models/post.model')
const ValidationError = require('../errors/validation.error')
const NotfoundError = require('../errors/notfound.error')

exports.getPosts = async (req, res, next) => {
    try {
        const totalItems = await Post.countDocuments({})
        const posts = await Post.find();

        res.status(200).json({
            posts: posts,
            totalItems: totalItems
        })
    } catch (e) {
        next(e)
    }
}

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return next(new ValidationError("Validation failed, entered data is incorrect."));
    }

    if (!req.file) {
        return next(new ValidationError("No image provided."));
    }

    const title = req.body.title
    const content = req.body.content
    const imageUrl = req.file.path

    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: {
            name: "Diep"
        },
    })

    post.save()
        .then(result => {
            res.status(201).json({
                message: "Post created successfully!",
                post: result
            })
        }).catch(e => {
            next(e)
        })
}

exports.getPost = async (req, res, next) => {
    const postId = req.params.postId
    try {
        const post = await Post.findById(postId)
        if (post) {
            res.json({
                message: 'Post fetched.',
                post: post
            })
        } else {
            throw new NotfoundError()
        }
    } catch (e) {
        next(e)
    }
}