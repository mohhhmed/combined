import { useState, useEffect } from 'react'
import { generateRSAKeyPair } from '../lib/rsaEngine'
import { AuthContext } from './AuthContext'

/* ── SEED USERS ─────────────────────────── */
const SEED_USERS = [
    {
        id: 'u1',
        username: 'alice',
        password: 'alice123',
        active: true,
        avatar: 'AL',
        storageUsed: 45.6,
        storageMax: 100,
        filesCount: 38,
        joined: '2024-03-15',
        rsaKeys: null,
    }
]

function initUsers() {
    const stored = localStorage.getItem('cloud_users')
    if (stored) {
        try {
            const parsed = JSON.parse(stored)
            if (parsed.length > 0 && !parsed[0].username) {
                localStorage.setItem('cloud_users', JSON.stringify(SEED_USERS))
                return SEED_USERS
            }
            return parsed
        } catch (e) { /* parsing error, fallback */ }
    }
    localStorage.setItem('cloud_users', JSON.stringify(SEED_USERS))
    return SEED_USERS
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const s = localStorage.getItem('cloud_session')
        return s ? JSON.parse(s) : null
    })
    const [users, setUsers] = useState(initUsers)

    useEffect(() => {
        localStorage.setItem('cloud_users', JSON.stringify(users))
    }, [users])

    /* LOGIN */
    const login = (username, password) => {
        const found = users.find(
            u => (u.username || '').toLowerCase() === (username || '').toLowerCase() && u.password === password
        )
        if (!found) return { error: 'Invalid username or password.' }
        if (!found.active) return { error: 'Your account has been deactivated.' }
        const session = { ...found, password: undefined }
        setUser(session)
        localStorage.setItem('cloud_session', JSON.stringify(session))
        return { user: session }
    }

    /* REGISTER — generates 2 RSA-2048 key pairs */
    const register = async (username, password) => {
        const exists = users.find(u => (u.username || '').toLowerCase() === (username || '').toLowerCase())
        if (exists) return { error: 'Username already taken.' }

        // Generate 2 full RSA-2048 key pairs (CRT params included)
        const keyPair1 = generateRSAKeyPair()
        const keyPair2 = generateRSAKeyPair()

        const newUser = {
            id: 'u' + Date.now(),
            username,
            password,
            active: true,
            avatar: username.slice(0, 2).toUpperCase(),
            storageUsed: 0,
            storageMax: 100,
            filesCount: 0,
            joined: new Date().toISOString().split('T')[0],
            rsaKeys: [keyPair1, keyPair2],
        }

        const updated = [...users, newUser]
        setUsers(updated)
        localStorage.setItem('cloud_users', JSON.stringify(updated))

        const session = { ...newUser, password: undefined }
        setUser(session)
        localStorage.setItem('cloud_session', JSON.stringify(session))
        return { user: session }
    }

    /* LOGOUT */
    const logout = () => {
        setUser(null)
        localStorage.removeItem('cloud_session')
    }

    return (
        <AuthContext.Provider value={{ user, users, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}
