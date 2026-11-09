const express = require('express')
const requireAuth = require('../middleware/auth')

const router = express.Router()
router.use(requireAuth)

router.get('/', async (req, res) => {
    const { data, error } = await req.db
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false })
    if (error) return res.status(400).json({ error: error.message})
        res.json(data)
})

router.post('/', async (req, res) => {
    const { title, text, tag } = req.body
    if (!title || !text) return res.status(400).json({ error: 'Title and text are required'})
    
    const { data, error } = await req.db
    .from('notes')
    .insert({ title, text, tag: tag || 'Work'})
    .select()
    .single()
    if (error) return res.status(400).json({ error: error.message})
        res.status(201).json(data)
})

router.put('/:id', async (req, res) => {
    const { title, text, tag } = req.body
    if (!title || !text) return res.status(400).json({ error: 'Title and text are required'})

    const { data, error } = await req.db
    .from('notes')
    .update({ title, text, tag})
    .eq('id', req.params.id)
    .select()
    .single()
    if (error || !data) return res.status(404).json({ error: 'Note not found'})
        res.json(data)
})

router.delete('/:id', async (req, res) => {
    const { error } = await req.db.from('notes').delete().eq('id', req.params.id)
    if (error) return res.status(400).json({ error: error.message})
        res.json({ message: 'Note deleted'})
})

module.exports = router