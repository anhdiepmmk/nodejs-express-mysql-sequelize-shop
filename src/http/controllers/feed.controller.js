const e = require('cors')
const { validationResult } = require('express-validator')
const Post = require('../../models/post.model')
const User = require('../../models/user.model')
const ValidationError = require('../errors/validation.error')
const NotfoundError = require('../errors/notfound.error')
const ForbiddenError = require('../errors/forbidden.error')
const path = require('path')
const fs = require('fs')
const io = require('../../utility/socket')

exports.getPosts = async (req, res, next) => {
    const currentPage = req.query.page || 1
    const perPage = 2
    try {
        const totalItems = await Post.countDocuments({})
        const posts = await Post.find()
            .skip((currentPage - 1) * perPage)
            .limit(perPage)
            .sort({ createdAt: -1 })
            .populate('creator', {
                name: 1
            })

        res.status(200).json({
            posts: posts,
            totalItems: totalItems
        })
    } catch (e) {
        next(e)
    }
}

exports.createPost = async (req, res, next) => {
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
    const userId = req.userId

    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: userId,
    })

    try {
        const result = await (await post.save()).populate('creator', { name: 1 }).execPopulate()

        //store new post id to user posts array attribute.
        const user = await User.findById(userId)
        user.posts.push(result)
        await user.save()

        io.getIO().emit('posts', { action: 'create', post: result })

        res.status(201).json({
            message: "Post created successfully!",
            post: result
        })
    } catch (error) {
        error.data = error.stack
        next(error)
    }
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
        const post = await Post.findById(postId).populate('creator', { name: 1 });
        if (!post) {
            throw new NotfoundError()
        }

        if (post.creator._id.toString() !== req.userId.toString()) {
            throw new ForbiddenError('Not authorized!');
        }

        post.title = title
        post.content = content

        if (req.file) {
            clearImage(post.imageUrl)
            post.imageUrl = req.file.path.substring(req.file.path.indexOf('images'))
        }

        const result = await post.save();
        io.getIO().emit('posts', { action: 'update', post: result })
        res.status(200).json({
            post: result
        })
    } catch (error) {
        next(error)
    }
}

exports.deletePost = async (req, res, next) => {
    const postId = req.params.postId

    try {
        const post = await Post.findById(postId);

        if (!post) {
            throw new NotfoundError();
        }

        if (post.creator.toString() !== req.userId.toString()) {
            throw new ForbiddenError('Not authorized!');
        }

        const user = await User.findById(req.userId)
        user.posts.pull(postId)
        await user.save()

        const imageUrl = post.imageUrl;
        post.remove((err => {
            if (err) {
                throw err;
            } else {
                clearImage(imageUrl)
                res.status(200).json({
                    message: "Deleted post."
                })

                io.getIO().emit('posts', { action: 'delete', post: postId })
            }
        }));


    } catch (error) {
        next(error);
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
        const post = await Post.findById(postId).populate('creator', { name: 1 }).exec()
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