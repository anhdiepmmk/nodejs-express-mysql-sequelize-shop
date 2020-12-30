const bcrypt = require('bcryptjs')
const User = require('./../../models/user.model')
const Post = require('./../../models/post.model')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const path = require('path')

const storeFS = ({ stream, filename }) => {
    filename = uuidv4() + '.' + filename.split('.').pop()
    const uploadDir = './public/images';
    const path = `${uploadDir}/${filename}`;
    return new Promise((resolve, reject) =>
        stream
            .on('error', error => {
                if (stream.truncated)
                    // delete the truncated file
                    fs.unlinkSync(path);
                reject(error);
            })
            .pipe(fs.createWriteStream(path))
            .on('error', error => reject(error))
            .on('finish', () => resolve({ path }))
    );
}

const clearImage = filePath => {
    fs.unlink(path.join(__dirname, '..', '..', '..', 'public', filePath), (err) => {
        console.log(err);
    })
}

module.exports = {
    createUser: async function ({ userInput }, req) {
        const errors = []
        if (!validator.isEmail(userInput.email)) {
            errors.push({ message: 'E-Mail is invalid.' })
        }

        if (validator.isEmpty(userInput.password) ||
            !validator.isLength(userInput.password, { min: 5 })) {
            errors.push({ message: 'Password is empty or too short!' })
        }

        if (errors.length > 0) {
            const error = new Error('Invalid input.')
            error.data = errors
            error.code = 422
            throw error
        }

        const existingUser = await User.findOne({ email: userInput.email })

        if (existingUser) {
            throw new Error('User exists already!')
        }

        const hashedPassword = await bcrypt.hash(userInput.password, 12)

        const user = new User({
            name: userInput.name,
            password: hashedPassword,
            email: userInput.email
        })

        const createdUser = await user.save()

        return {
            ...createdUser._doc,
            _id: createdUser._id.toString()
        }
    },

    login: async function ({ email, password }, req) {
        const user = await User.findOne({ email: email })

        if (!user) {
            const error = new Error('User not found.')
            error.code = 401
            throw error
        }

        const isEqual = bcrypt.compare(password, user.password)

        if (!isEqual) {
            const error = new Error('Password is incorrect.')
            error.code = 401
            throw error
        }

        const token = jwt.sign({ email: user.email, userId: user._id.toString() }, 'a-secret-string', { expiresIn: '1h' });

        return {
            token: token,
            userId: user._id.toString()
        }
    },

    createPost: async function ({ postInput }, req) {
        if (!req.isAuth) {
            const error = new Error('Not authenticated!')
            error.code = 401
            throw error
        }

        const errors = []

        if (validator.isEmpty(postInput.title) ||
            !validator.isLength(postInput.title, { min: 5 })) {
            errors.push({
                message: 'Title is invalid.'
            })
        }

        if (validator.isEmpty(postInput.content) ||
            !validator.isLength(postInput.content, { min: 5 })) {
            errors.push({
                message: 'Content is invalid.'
            })
        }

        const file = postInput.file

        if (!file) {
            errors.push({
                message: 'File is required.'
            })
        }

        const { filename, mimetype, encoding, createReadStream } = file.file

        if (mimetype !== 'image/png' &&
            mimetype !== 'image/jpg' &&
            mimetype !== 'image/jpeg') {
            errors.push({
                message: 'File type not allowed.'
            })
        }

        if (errors.length > 0) {
            const error = new Error('Invalid input.')
            error.data = errors
            error.code = 422
            throw error
        }

        const user = await User.findById(req.userId)

        if (!user) {
            const error = new Error('Invalid user.')
            error.code = 401
            throw error
        }

        const stream = createReadStream();
        const { path } = await storeFS({ stream, filename });

        const post = new Post({
            title: postInput.title,
            content: postInput.content,
            imageUrl: path.substring(path.indexOf('images/')),
            creator: user
        })

        const createdPost = await post.save()
        user.posts.push(createdPost)
        await user.save()

        return {
            ...createdPost._doc,
            _id: createdPost._id.toString(),
            createdAt: createdPost.createdAt.toISOString(),
            updatedAt: createdPost.updatedAt.toISOString()
        }
    },

    updatePost: async function ({ id, postInput }, req) {
        if (!req.isAuth) {
            const error = new Error('Not authenticated!')
            error.code = 401
            throw error
        }

        const errors = []

        if (validator.isEmpty(postInput.title) ||
            !validator.isLength(postInput.title, { min: 5 })) {
            errors.push({
                message: 'Title is invalid.'
            })
        }

        if (validator.isEmpty(postInput.content) ||
            !validator.isLength(postInput.content, { min: 5 })) {
            errors.push({
                message: 'Content is invalid.'
            })
        }

        const file = postInput.file
        if (file && file.file) {
            const { mimetype } = file.file

            if (mimetype !== 'image/png' &&
                mimetype !== 'image/jpg' &&
                mimetype !== 'image/jpeg') {
                errors.push({
                    message: 'File type not allowed.'
                })
            }
        }

        if (errors.length > 0) {
            const error = new Error('Invalid input.')
            error.data = errors
            error.code = 422
            throw error
        }

        const post = await Post.findById(id).populate('creator')

        if (!post) {
            const error = new Error('Post not found.')
            error.code = 404
            throw error
        }

        if (post.creator._id.toString() !== req.userId.toString()) {
            const error = new Error('Not authorized!')
            error.code = 401
            throw error
        }

        post.title = postInput.title
        post.content = postInput.content

        if (file && file.file) {
            const { filename, createReadStream } = file.file
            const stream = createReadStream();
            const { path } = await storeFS({ stream, filename });
            //remove old image
            clearImage(post.imageUrl)
            post.imageUrl = path.substring(path.indexOf('images/'));
        }

        const updatedPost = await post.save()

        return {
            ...updatedPost._doc,
            _id: updatedPost._id.toString(),
            createdAt: updatedPost.createdAt.toISOString(),
            updatedAt: updatedPost.updatedAt.toISOString()
        }
    },

    posts: async function ({ page }, req) {
        if (!req.isAuth) {
            const error = new Error('Not authenticated!')
            error.code = 401
            throw error
        }

        if (!page) {
            page = 1
        }

        const perPage = 2

        const totalPosts = await Post.countDocuments()
        const posts = await Post.find({})
            .skip((page - 1) * perPage)
            .limit(perPage)
            .sort({ createdAt: - 1 })
            .populate('creator')

        return {
            totalPosts: totalPosts,
            posts: posts.map((value, index, array) => {
                return {
                    ...value._doc,
                    _id: value._id.toString(),
                    createdAt: value.createdAt.toISOString(),
                    updatedAt: value.updatedAt.toISOString()
                }
            })
        }
    },

    post: async function ({ id }, req) {
        if (!req.isAuth) {
            const error = new Error('Not authenticated!')
            error.code = 401
            throw error
        }

        const post = await Post.findById(id).populate('creator')

        if (!post) {
            const error = new Error('Post not found.')
            error.code = 404
            throw error
        }

        return {
            ...post._doc,
            _id: post._id.toString(),
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString()
        }
    },

    deletePost: async function ({ id }, req) {
        if (!req.isAuth) {
            const error = new Error('Not authenticated!')
            error.code = 401
            throw error
        }

        const user = await User.findById(req.userId)

        if (!user) {
            const error = new Error('User not found.')
            error.code = 401
            throw error
        }

        const post = await Post.findById(id).populate('creator')

        if (!post) {
            const error = new Error('Post not found.')
            error.code = 404
            throw error
        }

        if (post.creator._id.toString() !== req.userId.toString()) {
            const error = new Error('Not authorized!')
            error.code = 401
            throw error
        }

        const imageUrl = post.imageUrl

        return new Promise((resolve, reject) => {
            post.remove((async err => {
                if (err) {
                    reject(err)
                } else {
                    clearImage(imageUrl)
                    user.posts.pull(id)
                    await user.save()
                    resolve(true)
                }
            }));
        })
    },

    user: async function (args, req) {
        if (!req.isAuth) {
            const error = new Error('Not authenticated!')
            error.code = 401
            throw error
        }

        const user = await User.findById(req.userId)

        if (!user) {
            const error = new Error('User not found.')
            error.code = 401
            throw error
        }

        return user.toJSON()
    },

    updateStatus: async function ({ status }, req) {
        if (!req.isAuth) {
            const error = new Error('Not authenticated!')
            error.code = 401
            throw error
        }

        const user = await User.findById(req.userId)

        if (!user) {
            const error = new Error('User not found.')
            error.code = 401
            throw error
        }

        user.status = status
        const updatedUser = await user.save()

        return updatedUser.toJSON()
    },

    singleUpload: async function ({ file, message }, req) {
        const { filename, mimetype, encoding, createReadStream } = file.file
        const stream = createReadStream();
        const { path } = await storeFS({ stream, filename });
        return true
    }
}