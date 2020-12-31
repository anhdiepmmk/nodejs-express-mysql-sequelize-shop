const jwt = require('jsonwebtoken')
const { JsonWebTokenError } = jwt
const sinon = require('sinon')

const expect = require('chai').expect

const authMiddleware = require('./../src/http/middleware/is-auth')

describe('Auth Middleware', () => {
    it('should throw an error if no authorization header is present', () => {
        const req = {
            get: (headerName) => {
                return null
            }
        }

        expect(authMiddleware.bind(this, req, {}, () => { })).to.throw('Authorization header not found.')
    })

    it('should throw an error if the authorization header is only one string', () => {
        const req = {
            get: (headerName) => {
                return 'xyz'
            }
        }

        expect(authMiddleware.bind(this, req, {}, () => { })).to.throw(JsonWebTokenError, 'jwt must be provided')
    })

    it('should yield a userId after decoding the token', () => {
        const req = {
            get: (headerName) => {
                return 'Bearer xyz'
            }
        }

        sinon.stub(jwt, 'verify')
        jwt.verify.returns({ userId: 'abc' })

        authMiddleware(req, {}, () => { })

        try {
            expect(req).to.have.property('userId')
            expect(req).to.have.property('userId', 'abc')
            expect(jwt.verify.called).to.be.true
        } catch (error) {
            throw error
        } finally {
            jwt.verify.restore()
        }
    })

    it('should throw an error if the token cannot be verified', () => {
        const req = {
            get: (headerName) => {
                return 'Bearer xyz'
            }
        }

        expect(authMiddleware.bind(this, req, {}, () => { })).to.throw(JsonWebTokenError, 'jwt malformed')
    })
})

