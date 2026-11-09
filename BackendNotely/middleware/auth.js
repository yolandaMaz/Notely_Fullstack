const { supabase, supabaseForUser } = require('../config/supabase')

async function requireAuth(req, res, next) {
    const token = req.cookies.token
    if (!token) return res.status(401).json({ error: 'Not logged in'})

    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data.user) {
        return res.status(401).json({ error: 'Invalid or expired session'})
    }
    req.user = data.user
    req.db = supabaseForUser(token)
    next()
}

module.exports = requireAuth