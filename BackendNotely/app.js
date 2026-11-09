require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const app = express()
app.set('trust proxy', 1)

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true}));
app.use(express.json())
app.use(cookieParser())
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

app.get('/api/health', (req, res) => {
    res.json({ message: 'Notely server is running'})
})

app.listen(3000, () => console.log('Server is running on port 3000'))
