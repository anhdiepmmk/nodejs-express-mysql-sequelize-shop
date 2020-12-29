const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const mongoose = require('mongoose')
const path = require('path')
const { graphqlHTTP } = require('express-graphql')
const { graphqlUploadExpress } = require('graphql-upload')

const graphqlSchema = require('./http/graphql/schema')
const graphqlResolvers = require('./http/graphql/resolvers')
const auth = require('./http/middleware/auth')

// app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')))

app.use(auth)

app.use('/graphql',
    graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }),
    graphqlHTTP({
        schema: graphqlSchema,
        rootValue: graphqlResolvers,
        graphiql: true,
        formatError(err) {
            if (!err.originalError) {
                return err
            }

            const data = err.originalError.data
            const message = err.originalError.message || 'An error occurred.'
            const code = err.originalError.code || 500
            return {
                message: message,
                status: code,
                data: data
            }
        }
    }))

app.use((error, req, res, next) => {
    const httpStatusCode = error.httpStatusCode || 500
    const message = error.message
    const data = error.data

    res.status(httpStatusCode).json({
        message: message,
        data: data
    })
})

mongoose.connect('mongodb://course:course2123@localhost:27017/messages?authSource=admin', { useNewUrlParser: true })
    .then(e => console.log('Mongodb connected'))
    .catch(e => console.log('Mongodb connection failed'))

const server = app.listen(8081, () => {
    console.log('Express running at 8081 port!');
})
