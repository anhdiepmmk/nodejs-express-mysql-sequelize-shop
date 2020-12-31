const expect = require('chai').expect
const sino = require('sinon')


const User = require('./../src/models/user.model')
const AuthController = require('./../src/http/controllers/auth.controller')

describe('Auth Controller', () => {
    describe('Login', () => {
        it('should reach catch block and then call next function with an error parameter if accessing the database fails', async () => {
            sino.stub(User, 'findOne')
            User.findOne.throws()

            const req = {
                body: {
                    email: 'bob@example.com',
                    password: '1'
                }
            }

            const res = {}

            await AuthController.login(req, res, (error) => {
                this.error = error
            })


            User.findOne.restore()

            expect(this.error).to.be.an('error')
        })
    })
})