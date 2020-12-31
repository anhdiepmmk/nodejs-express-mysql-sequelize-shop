const expect = require('chai').expect
const sino = require('sinon')
const mongoose = require('mongoose')

const User = require('./../src/models/user.model')
const FeedController = require('./../src/http/controllers/feed.controller')

describe('Feed Controller', () => {
    before(async () => {
        await mongoose.connect('mongodb://course:course2123@localhost:27017/test-messages?authSource=admin', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
    })

    after(async () => {
        await mongoose.disconnect()
    })

    it('should add a created post to the posts of the creator', async () => {
        const req = {
            userId: '5fede194c13bcee28c7d270a',
            body: {
                title: 'A title',
                content: 'A content',

            },
            file: {
                path: 'images/test.jpg'
            }
        }

        const res = {
            status: (code) => {
                res.code = code
                return res
            },
            json: (data) => {
                res.data = data
            }
        }

        await FeedController.createPost(req, res, () => { })
        expect(res.code).to.be.equal(201)
    })
})