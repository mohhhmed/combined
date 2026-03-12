import { useState, useRef, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import KeysPage from './pages/KeysPage'
import './index.css'
import './App.css'

// RSA Cryptographic Imports
import { encryptBinary } from '@root-lib/encryptor'
import { decryptBinaryCRT } from '@root-lib/decryptor'
import { signWithCRT } from '@root-lib/signature'
import { verifySignature } from '@root-lib/verify'

/* ── PROTECTED ROUTES ───────────────────── */
function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  if (user) return <Navigate to="/" replace />
  return children
}

/* ── SVG ICONS ──────────────────────────── */
const Icons = {
  Logo: () => (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <defs>
        <linearGradient id="ssi-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <rect width="26" height="26" rx="6" fill="url(#ssi-grad)" />
      <path d="M7 17L13 7L19 17" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="13" cy="15" r="1.5" fill="#fff" />
    </svg>
  ),
  Alert: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Home: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Search: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Upload: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  Download: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  ),
  Edit: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  LogOut: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  File: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
      <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
      <polyline points="13 2 13 9 20 9" />
    </svg>
  ),
  Folder: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
  ),
  Key: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.778-7.778zM12 7l.34 1.58 1.12.34 1.58.34M9 22H4v-5l7-7 5 5-7 7z" />
    </svg>
  ),
  Grid: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
  List: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  Refresh: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
    </svg>
  ),
  Moon: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  Sun: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
}

/* ═══════════════════════════════════════════
   CLOUD DRIVE PAGE
═══════════════════════════════════════════ */
function CloudDrivePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Storage Info
  const limit = user?.storageMax || 100
  const used = user?.storageUsed || 20
  const remaining = (limit - used).toFixed(1)
  const percentage = Math.min((used / limit) * 100, 100).toFixed(1)

  // Files State
  const [files, setFiles] = useState([
    { id: '1', name: 'Project_Proposal.pdf', size: '2.1 MB', date: '2026-03-01' },
    { id: '2', name: 'design_specs.docx', size: '1.5 MB', date: '2026-03-05' },
    { id: '3', name: 'financial_report_Q1.xlsx', size: '4.8 MB', date: '2026-03-06' },
  ])

  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [uploadStatus, setUploadStatus] = useState(null)
  const [viewMode, setViewMode] = useState('table') // 'grid' | 'table'
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 680)

  // Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('cloud_theme') || 'dark')

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light')
    } else {
      document.documentElement.classList.remove('light')
    }
    localStorage.setItem('cloud_theme', theme)
  }, [theme])

  // File Persistence
  useEffect(() => {
    if (!user) return
    const key = `cloud_files_${user.username}`
    const stored = localStorage.getItem(key)
    if (stored) {
      try {
        setFiles(JSON.parse(stored))
      } catch (e) {
        console.error("Failed to load files:", e)
      }
    }
  }, [user])

  useEffect(() => {
    if (!user) return
    const key = `cloud_files_${user.username}`
    localStorage.setItem(key, JSON.stringify(files))
  }, [files, user])

  // Dialog States
  const [renamingFile, setRenamingFile] = useState(null)
  const [newName, setNewName] = useState('')
  const [deletingFile, setDeletingFile] = useState(null)
  const [downloadingFile, setDownloadingFile] = useState(null)
  const [bulkDownloadConfirm, setBulkDownloadConfirm] = useState(false)

  const fileInputRef = useRef(null)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  /* Actions */
  const handleUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadStatus('uploading')
    console.log("🚀 Starting Secure Upload for:", file.name)

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target.result
        const data = new Uint8Array(arrayBuffer)
        console.log("📄 File read complete. Size:", data.length, "bytes")

        // RSA Keys (expecting 2 pairs: pair1=Enc/Dec, pair2=Sig/Ver)
        const keys = user?.rsaKeys || []
        if (keys.length < 2) {
          throw new Error("Missing cryptographic keys. Please ensure you are logged in and have keys generated.")
        }

        const k1 = keys[0] // Key for Encryption
        const k2 = keys[1] // Key for Signing

        // 1. RSA Encryption (Client)
        console.log("🔐 Step 1: RSA Encrypting file chunks...")
        const encryptedChunks = encryptBinary(
          data,
          BigInt(k1.e),
          BigInt(k1.n)
        )
        console.log("✅ Encryption complete. Chunks generated:", encryptedChunks.length)

        // 2. Digital Signature (Client)
        console.log("✍️ Step 2: Generating Digital Signature (SHA-256 + RSA)...")
        const encryptedStrings = encryptedChunks.map(c => c.toString())
        const encDataString = JSON.stringify(encryptedStrings)
        const encDataBytes = new TextEncoder().encode(encDataString)

        const signature = signWithCRT(
          encDataBytes,
          BigInt(k2.p),
          BigInt(k2.q),
          BigInt(k2.dp),
          BigInt(k2.dq),
          BigInt(k2.qInv)
        )
        console.log("✅ Signature generated successfully.")

        const newFile = {
          id: Date.now().toString(),
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
          date: new Date().toISOString().split('T')[0],
          encryptedData: encryptedStrings,
          signature: signature,
          originalLength: data.length,
          isSecure: true
        }

        // 💡 NEW: Automatically "Save to Disk" (Desktop) as a bundle
        console.log("💾 Step 3: Saving encrypted bundle to Desktop...")
        const bundle = {
          fileMetadata: { name: file.name, size: newFile.size, originalLength: data.length },
          encryption: { data: encryptedStrings, signature: signature }
        }
        const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${file.name}.rsa.json`
        a.click()
        URL.revokeObjectURL(url)

        setFiles(prev => [newFile, ...prev])
        setUploadStatus('success')
        console.log("🏁 Secure Upload & Desktop Save complete.")
        setTimeout(() => setUploadStatus(null), 3000)
      } catch (err) {
        console.error("❌ Secure Upload Error:", err)
        setUploadStatus('error')
        alert("Secure upload failed: " + err.message)
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const confirmDelete = () => {
    if (!deletingFile) return
    setFiles(files.filter(f => f.id !== deletingFile.id))
    const updatedSet = new Set(selectedIds)
    updatedSet.delete(deletingFile.id)
    setSelectedIds(updatedSet)
    setDeletingFile(null)
  }

  const startRename = (f) => {
    setRenamingFile(f)
    setNewName(f.name)
  }

  const saveRename = (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    setFiles(files.map(f => f.id === renamingFile.id ? { ...f, name: newName } : f))
    setRenamingFile(null)
  }

  const toggleSelect = (id) => {
    const updated = new Set(selectedIds)
    if (updated.has(id)) updated.delete(id)
    else updated.add(id)
    setSelectedIds(updated)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredFiles.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredFiles.map(f => f.id)))
    }
  }

  const confirmBulkDownload = () => {
    // Execute download logic
    setSelectedIds(new Set())
    setBulkDownloadConfirm(false)
  }

  const confirmSingleDownload = () => {
    const f = downloadingFile
    if (!f) return

    // 💡 FIX: Close modal immediately to avoid glitching
    setDownloadingFile(null)

    console.log("📂 Initiating Secure Download for:", f.name)

    // If it's a seed/mock file without encrypted data, just exit
    if (!f.encryptedData) {
      console.warn("⚠️ File is a mock/placeholder and lacks encrypted data.")
      alert("This is a mock file without encrypted data. Please upload a new file to test encryption.")
      setDownloadingFile(null)
      return
    }

    const keys = user?.rsaKeys || []
    if (keys.length < 2) {
      console.error("❌ Keys missing during download attempt.")
      alert("Cryptographic keys missing. Please re-login.")
      setDownloadingFile(null)
      return
    }

    const k1 = keys[0] // Key for Decryption
    const k2 = keys[1] // Key for Verification

    try {
      const encryptedChunks = f.encryptedData.map(s => BigInt(s))
      const encDataString = JSON.stringify(f.encryptedData)
      const encDataBytes = new TextEncoder().encode(encDataString)

      // 1. Verify Signature (Server -> Client Verification)
      console.log("🛡️ Step 1: Verifying Digital Signature...")
      const isValid = verifySignature(
        encDataBytes,
        f.signature,
        BigInt(k2.e),
        BigInt(k2.n)
      )

      if (!isValid) {
        console.error("🛑 CRITICAL: Signature verification failed!")
        alert("CRITICAL ERROR: Digital signature verification failed! Data integrity compromised.")
        setDownloadingFile(null)
        return
      }
      console.log("✅ Signature Verified. Integrity confirmed.")

      // 2. RSA Decryption (CRT Optimized)
      console.log("🔓 Step 2: Decrypting data via CRT...")
      const decrypted = decryptBinaryCRT(
        encryptedChunks,
        BigInt(k1.p),
        BigInt(k1.q),
        BigInt(k1.dp),
        BigInt(k1.dq),
        BigInt(k1.qInv),
        f.originalLength
      )
      console.log("✅ Decryption successful.")

      // 3. Restore and Download
      console.log("💾 Step 3: Reconstruction and browser download trigger.")
      const blob = new Blob([decrypted])
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = f.name
      a.click()
      URL.revokeObjectURL(url)

      console.log("🏁 Secure Download complete.")
    } catch (err) {
      console.error("❌ Secure Download Error:", err)
      alert("Secure decryption failed: " + err.message)
    }
  }

  const handleDecryptFromDisk = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const bundle = JSON.parse(event.target.result)
        const { encryption, fileMetadata } = bundle
        if (!encryption || !fileMetadata) throw new Error("Invalid .rsa.json bundle")

        console.log("📂 Opening Encrypted Bundle from Disk:", fileMetadata.name)

        const keys = user?.rsaKeys || []
        if (keys.length < 2) throw new Error("Keys missing. Please re-login.")

        const k1 = keys[0] // Decryption
        const k2 = keys[1] // Verification

        const encDataString = JSON.stringify(encryption.data)
        const encDataBytes = new TextEncoder().encode(encDataString)

        // 1. Verify
        console.log("🛡️ Step 1: Verifying Digital Signature...")
        const isValid = verifySignature(encDataBytes, encryption.signature, BigInt(k2.e), BigInt(k2.n))
        if (!isValid) throw new Error("Signature verification failed! Bundle might be corrupted.")
        console.log("✅ Signature Verified.")

        // 2. Decrypt
        console.log("🔓 Step 2: Decrypting via CRT...")
        const encryptedChunks = encryption.data.map(s => BigInt(s))
        const decrypted = decryptBinaryCRT(
          encryptedChunks,
          BigInt(k1.p), BigInt(k1.q), BigInt(k1.dp), BigInt(k1.dq), BigInt(k1.qInv),
          fileMetadata.originalLength
        )
        console.log("✅ Decryption successful.")

        // 3. Download original
        const blob = new Blob([decrypted])
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileMetadata.name
        a.click()
        URL.revokeObjectURL(url)
        console.log("🏁 File restored from disk.")
      } catch (err) {
        console.error("❌ Decryption Error:", err)
        alert("Restore failed: " + err.message)
      }
    }
    reader.readAsText(file)
  }

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))

  // Drag & Drop
  const handleDragOver = (e) => e.preventDefault()
  const handleDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      fileInputRef.current.files = e.dataTransfer.files
      const event = new Event('change', { bubbles: true })
      fileInputRef.current.dispatchEvent(event)
      handleUpload({ target: { files: e.dataTransfer.files } })
    }
  }

  return (
    <div className="ad-layout" onDragOver={handleDragOver} onDrop={handleDrop}>
      <div className={`mobile-overlay${sidebarOpen ? ' active' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* SIDEBAR PRESERVING PREVIOUS STYLE */}
      <aside className={`ad-sidebar${sidebarOpen ? '' : ' closed'}`}>
        <div className="ad-sidebar-logo">
          <Icons.Logo />
          <span>SSI_CR</span>
        </div>

        <nav className="ad-nav">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <button className="ad-nav-item active" onClick={() => navigate('/')}>
              <Icons.Folder />
              <span>My Files</span>
            </button>
            <button className="ad-nav-item" onClick={() => navigate('/keys')}>
              <Icons.Key />
              <span>RSA Keys</span>
            </button>
          </div>
        </nav>

        <div className="ad-sidebar-footer">
          <div className="storage" style={{ margin: '8px 0 4px', background: 'transparent', padding: '10px 4px', border: 'none', boxShadow: 'none' }}>
            <div className="storage-top">
              <span style={{ color: 'var(--text-inv-2)' }}>Storage</span>
              <span style={{ color: '#818cf8', fontWeight: 700, fontSize: 11 }}>Limit: {limit} MB</span>
            </div>
            <div className="storage-bar" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="storage-fill" style={{ width: `${percentage}%` }} />
            </div>
            <div className="storage-info" style={{ color: 'var(--text-inv-3)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Used: {used} MB</span>
              <span>Rem: {remaining} MB</span>
            </div>
          </div>

          <div style={{ padding: '4px 10px', marginTop: 10 }}>
            <div style={{ color: 'var(--text-inv-2)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, opacity: 0.8 }}>Storage Path</div>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ color: 'var(--brand)', fontSize: 10, fontWeight: 700, marginBottom: 4 }}>PC STORAGE:</div>
              <div style={{ color: 'var(--text-inv-3)', fontSize: 9, wordBreak: 'break-all', fontFamily: 'monospace', marginBottom: 8, lineHeight: 1.4 }}>
                C:\Users\khebb\OneDrive\Desktop
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 8 }}>
                All encrypted files (.rsa.json) are saved here.
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="ad-main">
        {/* Modals */}
        {renamingFile && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'var(--bg-2)', padding: 24, borderRadius: 12, width: 320, border: '1px solid var(--border-dark)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
              <h3 style={{ margin: '0 0 16px', color: 'var(--text)', fontSize: 18 }}>Rename File</h3>
              <form onSubmit={saveRename}>
                <input
                  autoFocus
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-1)', border: '1px solid var(--border-dark)', borderRadius: 8, color: 'var(--text)', marginBottom: 16 }}
                />
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setRenamingFile(null)} style={{ padding: '8px 16px', borderRadius: 6, background: 'transparent', color: 'var(--text-2)', border: '1px solid var(--border-dark)', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '8px 16px', borderRadius: 6, background: 'var(--brand)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Save</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {deletingFile && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'var(--bg-2)', padding: 24, borderRadius: 12, width: 340, border: '1px solid var(--border-dark)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{ color: '#ef4444' }}><Icons.Alert /></div>
                <div>
                  <h3 style={{ margin: '0 0 8px', color: 'var(--text)', fontSize: 18 }}>Delete File?</h3>
                  <p style={{ margin: 0, color: 'var(--text-3)', fontSize: 13, lineHeight: '1.5' }}>
                    Are you sure you want to delete <strong>{deletingFile.name}</strong>? This action cannot be undone.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setDeletingFile(null)} style={{ padding: '8px 16px', borderRadius: 6, background: 'transparent', color: 'var(--text-2)', border: '1px solid var(--border-dark)', cursor: 'pointer' }}>Cancel</button>
                <button type="button" onClick={confirmDelete} style={{ padding: '8px 16px', borderRadius: 6, background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
              </div>
            </div>
          </div>
        )}

        {downloadingFile && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'var(--bg-2)', padding: 24, borderRadius: 12, width: 340, border: '1px solid var(--border-dark)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{ color: '#60a5fa' }}><Icons.Download /></div>
                <div>
                  <h3 style={{ margin: '0 0 8px', color: 'var(--text)', fontSize: 18 }}>Download File?</h3>
                  <p style={{ margin: 0, color: 'var(--text-3)', fontSize: 13, lineHeight: '1.5' }}>
                    Proceed to download <strong>{downloadingFile.name}</strong>?
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setDownloadingFile(null)} style={{ padding: '8px 16px', borderRadius: 6, background: 'transparent', color: 'var(--text-2)', border: '1px solid var(--border-dark)', cursor: 'pointer' }}>Cancel</button>
                <button type="button" onClick={confirmSingleDownload} style={{ padding: '8px 16px', borderRadius: 6, background: 'var(--brand)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Download</button>
              </div>
            </div>
          </div>
        )}

        {bulkDownloadConfirm && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'var(--bg-2)', padding: 24, borderRadius: 12, width: 340, border: '1px solid var(--border-dark)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{ color: '#60a5fa' }}><Icons.Download /></div>
                <div>
                  <h3 style={{ margin: '0 0 8px', color: 'var(--text)', fontSize: 18 }}>Download Selected?</h3>
                  <p style={{ margin: 0, color: 'var(--text-3)', fontSize: 13, lineHeight: '1.5' }}>
                    Proceed to download <strong>{selectedIds.size}</strong> selected file{selectedIds.size > 1 ? 's' : ''}?
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setBulkDownloadConfirm(false)} style={{ padding: '8px 16px', borderRadius: 6, background: 'transparent', color: 'var(--text-2)', border: '1px solid var(--border-dark)', cursor: 'pointer' }}>Cancel</button>
                <button type="button" onClick={confirmBulkDownload} style={{ padding: '8px 16px', borderRadius: 6, background: 'var(--brand)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Download All</button>
              </div>
            </div>
          </div>
        )}

        {/* TOPBAR */}
        <div className="ad-topbar">
          <div className="ad-topbar-left" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button className="bc-icon-btn" style={{ background: 'transparent', border: 'none', color: 'var(--text-inv)', padding: 0 }} onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
              )}
            </button>
            <div className="ad-breadcrumb">My Files</div>
          </div>

          <div className="ad-topbar-right">

            {/* Theme Toggle */}
            <button className="bc-icon-btn" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} style={{ background: 'transparent', border: 'none', color: 'var(--text-inv-3)', padding: 8, cursor: 'pointer', marginRight: 10 }}>
              {theme === 'dark' ? <Icons.Sun /> : <Icons.Moon />}
            </button>

            {/* Avatar + Dropdown */}
            <div className="ad-topbar-user" ref={menuRef} onClick={() => setShowMenu(p => !p)}>
              <div className="ad-av" style={{ background: 'linear-gradient(135deg, var(--brand), #8b5cf6)' }}>{user?.avatar || 'U'}</div>
              <span className="ad-topbar-name">{user?.username}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>

              {showMenu && (
                <div className="ad-user-menu">
                  <div className="ad-user-menu-info">
                    <div className="ad-av sm" style={{ background: 'linear-gradient(135deg, var(--brand), #8b5cf6)' }}>{user?.avatar || 'U'}</div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#f1f5f9' }}>{user?.username}</div>
                    </div>
                  </div>
                  <div className="ad-user-menu-divider" />
                  <button onClick={() => { logout(); navigate('/login') }} className="danger">
                    <Icons.LogOut /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FILES AREA */}
        <div className="ad-content" style={{ padding: 0, display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
          <div className="file-area" style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-1)' }}>

            {/* Action Bar from Previous Design */}
            <div className="ad-content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-dark)', background: 'var(--bg-2)' }}>

              {/* Search + Bulk Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 15, flex: 1 }}>
                <div className="ad-search-wrap" style={{ maxWidth: 300 }}>
                  <Icons.Search />
                  <input
                    className="ad-search"
                    placeholder="Search files..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  <span className="search-shortcut" style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>/</span>
                </div>

                {selectedIds.size > 0 && (
                  <button onClick={() => setBulkDownloadConfirm(true)} style={{ background: 'transparent', color: '#60a5fa', border: '1px solid rgba(96, 165, 250, 0.4)', padding: '6px 12px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                    <Icons.Download /> Download ({selectedIds.size})
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {uploadStatus === 'uploading' && <div style={{ color: '#fbbf24', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}><span className="auth-spinner" style={{ width: 14, height: 14, borderBottomColor: 'transparent', borderColor: '#fbbf24', borderRightColor: 'transparent' }} /> Uploading...</div>}
                {uploadStatus === 'success' && <div style={{ color: '#22c55e', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>✓ Success</div>}

                <div className="bc-icon-btn" onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')} title="Toggle View">
                  {viewMode === 'grid' ? <Icons.List /> : <Icons.Grid />}
                </div>

                <div style={{ width: 1, height: 20, background: 'var(--border-dark)', margin: '0 4px' }} />

                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleUpload} />
                <button className="btn-new" style={{ padding: '8px 16px' }} onClick={() => fileInputRef.current.click()}>
                  <Icons.Upload /> Upload
                </button>
              </div>
            </div>

            <div style={{ padding: '20px' }}>
              <div className="section">
                <div className="sec-title">Files ({files.length})</div>

                {filteredFiles.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '60px 0', border: '1px dashed var(--border-dark)', borderRadius: 8, background: 'var(--bg-2)' }}>
                    <Icons.File />
                    <div style={{ marginTop: 12, fontSize: 15 }}>No files exactly matched</div>
                    <div style={{ marginTop: 4, fontSize: 13 }}>Tweak your search or upload a new file.</div>
                  </div>
                ) : viewMode === 'table' ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: 'var(--bg-2)', borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <thead style={{ borderBottom: '1px solid var(--border-dark)', background: 'rgba(255,255,255,0.02)' }}>
                      <tr>
                        <th style={{ padding: '16px', width: 40, borderBottom: '1px solid var(--border-dark)' }}>
                          <input type="checkbox" checked={selectedIds.size === filteredFiles.length && filteredFiles.length > 0} onChange={toggleSelectAll} style={{ cursor: 'pointer' }} />
                        </th>
                        <th style={{ padding: '16px', color: 'var(--text-2)', fontSize: 13, borderBottom: '1px solid var(--border-dark)' }}>Filename</th>
                        <th style={{ padding: '16px', color: 'var(--text-2)', fontSize: 13, borderBottom: '1px solid var(--border-dark)' }}>Security</th>
                        <th style={{ padding: '16px', color: 'var(--text-2)', fontSize: 13, borderBottom: '1px solid var(--border-dark)', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFiles.map(f => (
                        <tr key={f.id} style={{ borderBottom: '1px solid var(--border-dark)', background: selectedIds.has(f.id) ? 'rgba(79, 70, 229, 0.1)' : 'transparent' }}>
                          <td style={{ padding: '16px' }}><input type="checkbox" checked={selectedIds.has(f.id)} onChange={() => toggleSelect(f.id)} style={{ cursor: 'pointer' }} /></td>
                          <td style={{ padding: '16px', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 10 }}><Icons.File /> {f.name}</td>
                          <td style={{ padding: '16px', color: 'var(--text-3)' }}>{f.size}</td>
                          <td style={{ padding: '16px', color: 'var(--text-3)' }}>{f.date}</td>
                          <td style={{ padding: '16px' }}>
                            {f.isSecure ? (
                              <span style={{ fontSize: 11, background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', padding: '4px 8px', borderRadius: 100, border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                                🔒 RSA + SIG
                              </span>
                            ) : (
                              <span style={{ fontSize: 11, color: 'var(--text-4)' }}>Standard</span>
                            )}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                              <button onClick={() => setDownloadingFile(f)} title="Download" style={{ background: 'transparent', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: 4 }}><Icons.Download /></button>
                              <button onClick={() => startRename(f)} title="Rename" style={{ background: 'transparent', border: 'none', color: '#a78bfa', cursor: 'pointer', padding: 4 }}><Icons.Edit /></button>
                              <button onClick={() => setDeletingFile(f)} title="Delete" style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: 6, borderRadius: 4, display: 'flex' }}><Icons.Trash /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="file-grid">
                    {filteredFiles.map(f => (
                      <div key={f.id} className={`file-card${selectedIds.has(f.id) ? ' sel' : ''}`} style={{ background: 'var(--bg-2)', borderColor: selectedIds.has(f.id) ? 'var(--brand)' : 'var(--border-dark)' }}>
                        <div className="file-thumb" onClick={() => toggleSelect(f.id)}>
                          <div className="file-thumb-inner" style={{ background: 'var(--bg-1)' }}>📎</div>
                        </div>
                        <div className="file-foot" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className="file-fname" style={{ color: '#e2e8f0' }}>{f.name}</span>
                            {f.isSecure && (
                              <span title="Securely Encrypted & Signed" style={{ display: 'flex', color: '#22c55e' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--text-3)' }}>
                            <span>{f.size}</span>
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button onClick={(e) => { e.stopPropagation(); setDownloadingFile(f) }} style={{ background: 'transparent', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: 4 }}><Icons.Download /></button>
                              <button onClick={(e) => { e.stopPropagation(); startRename(f) }} style={{ background: 'transparent', border: 'none', color: '#a78bfa', cursor: 'pointer', padding: 4 }}><Icons.Edit /></button>
                              <button onClick={(e) => { e.stopPropagation(); setDeletingFile(f) }} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: 4 }}><Icons.Trash /></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   APP ROUTER
═══════════════════════════════════════════ */
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><CloudDrivePage /></ProtectedRoute>} />
      <Route path="/keys" element={<ProtectedRoute><KeysPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
