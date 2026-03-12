import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'

const Icons = {
    Key: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.778-7.778zM12 7l.34 1.58 1.12.34 1.58.34M9 22H4v-5l7-7 5 5-7 7z" />
        </svg>
    ),
    Copy: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
    ),
    Check: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    Download: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
    )
}

function KeyValue({ label, value }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase' }}>{label}</label>
                <button
                    onClick={handleCopy}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: copied ? '#22c55e' : 'var(--brand)', fontSize: '11px', fontWeight: 600 }}
                >
                    {copied ? <><Icons.Check /> Copied</> : <><Icons.Copy /> Copy</>}
                </button>
            </div>
            <div style={{
                background: 'rgba(0,0,0,0.2)',
                padding: '10px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontFamily: 'monospace',
                color: '#e2e8f0',
                wordBreak: 'break-all',
                border: '1px solid var(--border-dark)',
                maxHeight: '80px',
                overflowY: 'auto'
            }}>
                {value}
            </div>
        </div>
    )
}

function KeyPairCard({ pair, index }) {
    const downloadJSON = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(pair, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `rsa_keypair_${index + 1}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.removeChild(downloadAnchorNode);
    }

    return (
        <div style={{
            background: 'var(--bg-2)',
            borderRadius: '12px',
            border: '1px solid var(--border-dark)',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            flex: '1 1 450px',
            maxWidth: '100%'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-dark)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)' }}>
                        <Icons.Key />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text)' }}>Key Pair #{index + 1}</h3>
                </div>
                <button
                    onClick={downloadJSON}
                    className="ad-nav-item"
                    style={{ background: 'var(--brand)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', width: 'auto' }}
                >
                    <Icons.Download /> Download JSON
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <KeyValue label="Modulus (n)" value={pair.n} />
                    <KeyValue label="Public Exponent (e)" value={pair.e} />
                </div>
                <KeyValue label="Private Exponent (d)" value={pair.d} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <KeyValue label="Prime 1 (p)" value={pair.p} />
                    <KeyValue label="Prime 2 (q)" value={pair.q} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <KeyValue label="d mod (p-1) [dp]" value={pair.dp} />
                    <KeyValue label="d mod (q-1) [dq]" value={pair.dq} />
                </div>
                <KeyValue label="q⁻¹ mod p [qInv]" value={pair.qInv} />
            </div>
        </div>
    )
}

export default function KeysPage() {
    const { user } = useAuth()
    const keys = user?.rsaKeys || []

    return (
        <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '28px', color: 'var(--text)', marginBottom: '8px' }}>My RSA Key Pairs</h1>
                <p style={{ color: 'var(--text-3)', fontSize: '15px' }}>These secure RSA-2048 keys were generated during your registration and are used for your cryptographic operations.</p>
            </div>

            {keys.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '60px',
                    background: 'var(--bg-2)',
                    borderRadius: '12px',
                    border: '1px dashed var(--border-dark)'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔐</div>
                    <h2 style={{ color: 'var(--text)' }}>No Keys Found</h2>
                    <p style={{ color: 'var(--text-3)' }}>It seems you don't have any RSA keys generated yet.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {keys.map((pair, idx) => (
                        <KeyPairCard key={idx} pair={pair} index={idx} />
                    ))}
                </div>
            )}

            <div style={{ marginTop: '40px', padding: '20px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <h4 style={{ color: '#ef4444', margin: '0 0 8px 0' }}>⚠️ Security Warning</h4>
                <p style={{ color: 'var(--text-3)', fontSize: '14px', margin: 0 }}>
                    Never share your <b>Private Exponent (d)</b>, <b>Primes (p, q)</b>, or <b>CRT Parameters</b> with anyone.
                    These are stored only in your local browser storage and cannot be recovered if you clear your browser data.
                    Please download a backup for safe keeping.
                </p>
            </div>
        </div>
    )
}
