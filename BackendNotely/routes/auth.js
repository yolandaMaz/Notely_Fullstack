const express = require('express')
const { supabase } = require('../config/supabase')
const requireAuth = require('../middleware/auth')

const router = express.Router()

const cookieOptions = {
    httpOnly: true,
    sameSite:'Lax',
    secure: false,
    maxAge: 60 * 60 * 1000,
}

router.post('/signup', async (req, res) => {
    const { email, password } = req.body
    if (!email || !password || password.length < 8) {
        return res.status(400).json({ error: 'Email and a password of 8+ characters are required'})
    }
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) return res.status(400).json({ error: error.message })
        res.status(201).json({ message: 'Account created. You can log in now.'})
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body
    const { data, error } = await supabase.auth.signInWithPassword({ email, password})
    if (error) return res.status(401).json({ error: 'Invalid email or password'})

    res.cookie('token', data.session.access_token, cookieOptions)
    res.json({ user: {id: data.user.id, email: data.user.email}})
})

router.post('/logout', requireAuth, (req, res) => {
    res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: false})
    res.json({ message: 'Logged out'})
})

router.get('/me', requireAuth, (req, res) => {
    res.json({ user: {id: req.user.id, email: req.user.email}})
})

module.exports = router