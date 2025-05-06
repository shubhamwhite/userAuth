const express = require('express')
const app = express()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const path = require('path')

const corsOptions = {
    origin: 'http://localhost:3005', // Replace with your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}

// Middleware
app.use(cors(corsOptions))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
    '/api/v1/uploads',
    express.static(path.join(__dirname, '/uploads/Profile-Pic')),
)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use('/api/v1', require('./routes/auth.route'))

app.get('/', (req, res) => {
    res.send('Hello from the Express app!')
})

module.exports = app
