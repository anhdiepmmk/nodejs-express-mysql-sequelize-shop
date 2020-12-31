const expect = require('chai').expect
const sino = require('sinon')


const User = require('./../src/models/user.model')
const AuthController = require('./../src/http/controllers/auth.controller')

describe('Auth Controller', () => {
    describe('Login', () => {
        it('should reach catch block and then call next function with an error parameter if accessing the database fails', function (done) {
            sino.stub(User, 'findOne')
            User.findOne.throws()
            //User.findOne.returns(null)

            const req = {
                body: {
                    email: 'bob@example.com',
                    password: '1'
                }
            }

            const res = {}

            let err;

            AuthController.login(req, res, (error) => {
                err = error
            })
                .then(() => {
                    expect(err).to.be.an('error')
                    done()
                })
                .catch(error => {
                    done(error)
                })
                .finally(() => {
                    User.findOne.restore()
                })
        })
    })
})