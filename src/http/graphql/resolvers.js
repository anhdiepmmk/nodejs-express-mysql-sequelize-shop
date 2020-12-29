const bcrypt = require('bcryptjs')
const User = require('./../../models/user.model')
const Post = require('./../../models/post.model')
const validator = require('validator')
const jwt = require('jsonwebtoken')
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

        const post = new Post({
            title: postInput.title,
            content: postInput.content,
            imageUrl: postInput.imageUrl,
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
    }
}