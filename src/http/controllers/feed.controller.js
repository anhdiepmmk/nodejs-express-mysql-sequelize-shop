const e = require('cors')
const { validationResult } = require('express-validator')
const Post = require('../../models/post.model')
const ValidationError = require('../errors/validation.error')
const NotfoundError = require('../errors/notfound.error')
const path = require('path')
const fs = require('fs')

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
    const imageUrl = req.file.path.substring(req.file.path.indexOf('images'))

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

exports.updatePost = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return next(new ValidationError("Validation failed, entered data is incorrect."));
    }

    const postId = req.params.postId
    const title = req.body.title
    const content = req.body.content

    try {
        const post = await Post.findById(postId);
        if (!post) {
            throw new NotfoundError()
        }

        post.title = title
        post.content = content

        if (req.file) {
            clearImage(post.imageUrl)
            post.imageUrl = req.file.path.substring(req.file.path.indexOf('images'))
        }

        const result = await post.save();
        res.status(200).json({
            post: result
        })
    } catch (error) {
        next(error)
    }
}

const clearImage = filePath => {
    fs.unlink(path.join(__dirname, '..', '..', '..', 'public', filePath), (err) => {
        console.log(err);
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