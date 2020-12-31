const expect = require('chai').expect
const sino = require('sinon')
const mongoose = require('mongoose')


const User = require('./../src/models/user.model')
const UserController = require('./../src/http/controllers/user.controller')

describe('User Controller', () => {
    before(async () => {
        await mongoose.connect('mongodb://course:course2123@localhost:27017/test-messages?authSource=admin', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
    })

    after(async () => {
        await mongoose.disconnect()
    })

    it('should send a response with a valid user status for an existing user', async () => {


        const user = new User({
            name: 'example',
            email: 'test@example.com',
            password: 'test',
            posts: []
        })

        const savedUser = await user.save()

        const req = {
            userId: savedUser._id
        }

        const res = {
            status: (code) => {
                res.code = code
                return res
            },
            json: (data) => {
                res.userStatus = data.status
            }
        }


        await UserController.getUser(req, res, () => { })
        await savedUser.deleteOne()

        expect(res.code).to.be.equal(200)
        expect(res.userStatus).to.be.equal('I am new!')
    })
})