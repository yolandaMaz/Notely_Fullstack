const API = import.meta.env.PROD ? '/api' : 'http://localhost:3000/api'

async function request(path, options = {}) {
    const res = await fetch(`${API}${path}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        ...options
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Something went wrong ')
        return data
}
export const signup = (email, password) =>
    request('/auth/signup', { method: 'POST', body: JSON.stringify({ email, password}) })

export const login = (email, password) => 
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password}) })

export const logout = () => request('/auth/logout', { method: 'POST'})

export const getMe = () => request('/auth/me')

export const getNotes = () => request('/notes')

export const createNote = (note) => 
    request('/notes', { method: 'POST', body: JSON.stringify(note) })

export const updateNote = (id, note) =>
    request(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(note) })

export const deleteNote = (id) => request(`/notes/${id}`, { method: 'DELETE'})