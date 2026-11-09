import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LuNotebookPen } from 'react-icons/lu';
import { FiSearch, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { getMe, getNotes, createNote, updateNote, deleteNote, logout } from '../api';

const TAG_NAMES = ['Work', 'Ideas', 'Personal', 'Study']

const TAG_COLORS = {
    Work: { card: 'bg-blue-100', chip: 'text-blue-900', dot: 'bg-blue-400'},
    Ideas: { card: 'bg-amber-100', chip: 'text-amber-900', dot: 'bg-amber-400'},
    Personal: { card: 'bg-green-100', chip: 'text-green-900', dot: 'bg-green-400'},
    Study: { card: 'bg-pink-100', chip: 'text-pink-900', dot: 'bg-pink-400'},
}

function DashboardPage() {
    const navigate = useNavigate()

    const [ notes, setNotes ] = useState([])
    const [ email, setEmail ] = useState('')
    const [ error, setError] = useState('')
    const [ search, setSearch ] = useState('')
    const [ activeTag, setActiveTag ] = useState('All')

    const [ title, setTitle ] = useState('')
    const [ text, setText ] = useState('')
    const [ tag, setTag ] = useState('Work')
    const [ editingId, setEditingId ] = useState(null)

    useEffect(function () {
        async function loadData() {
            try {
                const me = await getMe()
                setEmail(me.user.email)
                const savedNotes = await getNotes()
                setNotes(savedNotes)
            } catch (err) {
                setError(err.message)
            }
        }
        loadData()
    }, [])

    const visibleNotes = notes.filter(function (note) {
        const matchesTag = activeTag === 'All' || note.tag === activeTag
        const allText = (note.title + '' + note.text).toLowerCase()
        const matchesSearch = allText.includes(search.toLocaleLowerCase())
        return matchesTag && matchesSearch
    })

    function clearForm() {
        setTitle('')
        setText('')
        setTag('Work')
        setEditingId(null)
    }

    function handleNewNote() {
        clearForm()
        document.getElementById('title').focus()
    }

    async function handleSave(e) {
        e.preventDefault()
        setError('')
        const noteData = { title: title, text: text, tag: tag }

        try {
            if (editingId) {
                const updated = await updateNote(editingId, noteData)
                const newList = notes.map(function (note) {
                    if (note.id === editingId) {
                        return updated
                    }
                    return note
                })
                setNotes(newList)
            } else {
                const created = await createNote(noteData)
                setNotes([created, ...notes])
            }
            clearForm()
        } catch (err) {
            setError(err.message)
        }
    }

    function startEdit(note) {
        setEditingId(note.id)
        setTitle(note.title)
        setText(note.text)
        setTag(note.tag)
    }

    async function handleDelete(id) {
        try {
            await deleteNote(id)
            const newList = notes.filter(function (note) {
                return note.id !== id
            })
            setNotes(newList)
            if (editingId === id) {
                clearForm()
            }
        } catch (err) {
            setError(err.message)
        }
    }

    async function handleLogout() {
        try {
            await logout()
        } catch (err) {
            console.log(err)
        }
        navigate('/')
    }

    function navClass(name) {
        let style = 'flex h-11 w-full items-center justify-between rounded-lg px-3 text-left text-sm font-medium '
        if (activeTag === name) {
            style = style + 'bg-slate-800 text-white'
        } else {
            style = style + 'text-slate-300 hover:bg-slate-800'
        }
        return style
    }

    return(
        <div className='flex min-h-screen bg-slate-50'>
            {/* Sidebar (large screens only) */}
            <aside className='hidden w-60 shrink-0 flex-col bg-slate-900 p-4 lg:flex'>
                <div className='flex items-center gap-2 px-3 pb-5 text-xl font-extrabold text-white'>
                    <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600'>
                        <LuNotebookPen className='text-indigo-200' />
                    </span>
                    Notely
                </div>

                <button onClick={() => setActiveTag('All')} className={navClass('All')}>
                    <span>All notes</span>
                    <span className='text-xs opacity-80'>{notes.length}</span>
                </button>

                <p className='mb-1 mt-5 px-3 text-xs font-semibold tracking-wider text-slate-400'>TAGS</p>
                {TAG_NAMES.map((name) => (
                    <button key={name} onClick={() => setActiveTag(name)} className={navClass(name)}>
                        <span className='flex items-center gap-2'>
                            <span className={'h-2.5 w-2.5 rounded-full ' + TAG_COLORS[name].dot} />
                            {name}
                        </span>
                    </button>
                ))}

                <div className='mt-auto flex items-center gap-3 rounded-xl bg-slate-800 p-3'>
                    <span className='flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white'>
                        { email.charAt(0).toUpperCase()}
                    </span>
                    <span className='min-w-0 flex-1 truncate text-sm font-medium text-white'>{email}</span>
                    <button 
                    onClick={handleLogout}
                    className='flex h-11 items-center rounded-lg border border-slate-600 px-3 text-x3 font-medium text-slate-200 h0ver:bg-slate-700'>
                        Logout
                    </button>
                </div>
            </aside>

            <div className='flex min-w-0 flex-1 flex-col lg:flex-row'>
                {/* Main area */}
                <main className='min-w-0 flex-1 p-4 sm:p-7'>
                    {/* Top bar (small screens only) */}
                    <div className='mb-4 flex items-center justify-between lg:hidden'>
                        <span className='flex items-center gap-2 text-lg font-extrabold text-slate-900'>
                            <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600'>
                                <LuNotebookPen className='text-indigo-200' />
                            </span>
                            Notely
                        </span>
                        <button 
                        onClick={handleLogout}
                        className='flex h-11 items-center rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700'>
                            Logout
                        </button>
                    </div>

                    {/* Search + new note */}
                    <div className='flex gap-3'>
                        <div className='relative flex-1'>
                            <FiSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-500' />
                            <input 
                            type="search"
                            aria-label='Search notes'
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder='Search your notes'
                            className='h-12 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 outline-none focus:border-indigo-600' />
                        </div>
                        <button 
                        onClick={handleNewNote}
                        className='flex h-12 items-center gap-1 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-500'>
                            <FiPlus /> 
                            <span className='hidden sm:inline'>New note</span>
                        </button>
                    </div>

                    { error && <p className='mt-3 text-sm text-red-700'>{error}</p>}

                    {/* Tag filter(small screens only) */}
                    <div className='mt-4 flex gap-2 overflow-x-auto lg:hidden'>
                        {[ 'All', 'Work', 'Ideas', 'Personal', 'Study'].map((name) => (
                           <button 
                           key={name}
                           onClick={() => setActiveTag(name)} 
                           className={
                            activeTag === name ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white text-slate-700'
                            } >
                            {name}
                           </button>
                         ))}
                    </div>

                    <h1 className='mt-6 text-2xl font-extrabold text-slate-900'>
                        {activeTag === 'All' ? 'All notes' : activeTag}
                    </h1>

                    {/* Notes grid */}
                    <div className='mt-4 grid gap-4 sm:grid-cols-2'>
                        {visibleNotes.map(function (note) {
                           const colors = TAG_COLORS[note.tag] || TAG_COLORS.Work
                           return (
                            <div key={note.id} className={'flex flex-col gap-2 rounded-2xl p-4 ' + colors.card}>
                                <div className='flex items-center justify-between'>
                                    <span className={'rounded-full bg-white px-2.5 py-1 text-xs font-semibold ' + colors.chip}>
                                        {note.tag}
                                    </span>
                                    <span className='text-xs text-slate-700'>
                                        { new Date(note.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h2 className='text-lg font-bold text-slate-900'>{note.title}</h2>
                                <p className='line-clamp-3 text-sm text-slate-800'>{note.text}</p>
                                <div className='mt-1 flex gap-2'>
                                    <button 
                                    aria-label="Edit note"
                                    onClick={() => startEdit(note)}
                                    className='flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700'>
                                        <FiEdit2 />
                                    </button>
                                    <button 
                                    aria-label="Delete note"
                                    onClick={() => handleDelete(note.id)}
                                    className='flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-red-700'>
                                        <FiTrash2 />
                                    </button>
                                </div>
                                </div>
                        )
                       })}
                    </div>

                    {visibleNotes.length === 0 && (
                        <p className='mt-6 text-slate-600'>No notes found. Write one in the form.</p>
                    )}
                </main>

                {/* Editor panel */}
                <aside className='w-full shrink-0 border-t border-slate-200 bg-white p-6 lg:w-80 lg:border-l lg:border-t-0'>
                    <h2 className='text-lg font-bold text-slate-900'>
                        {editingId ? 'Edit note' : 'New note'}
                    </h2>
                    <form onSubmit={handleSave} className='mt-4 flex flex-col gap-4'>
                        <div>
                            <label htmlFor="title" className='mb-1 block text-sm font-medium text-slate-700'>Title</label>
                            <input 
                            id="title"
                            required value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder='Note title'
                            className='h-12 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-indigo-600' />
                        </div>
                        <div>
                            <label htmlFor="text" className='mb-1 block text-sm font-medium text-slate-700'>Note</label>
                            <textarea 
                            id="text"
                            required value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder='Write something private...'
                            className='h-40 w-full resize-none rounded-lg border border-slate-300 p-3 outline-none focus:border-indigo-600' />
                        </div>
                        <div>
                            <label htmlFor="tag" className='mb-1 block text-sm font-medium text-slate-700'>Tag</label>
                            <select 
                            id="tag"
                            value={tag}
                            onChange={(e) => setTag(e.target.value)}
                            className='h-12 w-full rounded-lg border border-slate-300 bg-white px-3 outline-none focus:border-indigo-600'>
                                {TAG_NAMES.map((name) => (
                                    <option key={name}>{name}</option>
                                ))}
                            </select>
                        </div>
                        <button 
                        type="submit"
                        className='h-12 rounded-lg bg-indigo-600 font-semibold text-white hover:bg-indigo-500'>
                            {editingId ? 'Save changes' : 'Add note'}
                        </button>
                    </form>
                </aside>
            </div>
        </div>
    )
} 

export default DashboardPage;