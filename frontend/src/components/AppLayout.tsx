import { ReactNode, useEffect, useRef, useState } from 'react'
import { Check, Copy, LogOut, Menu, Network, Wallet, X } from 'lucide-react'
import { shortAddress } from '../lib/genlayer'
import { useWearline } from '../context/WearlineContext'

export function routeHref(path: string, id: string) {
  return id ? `${path}?id=${encodeURIComponent(id)}` : path
}

export function navigate(path: string) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function NavLink({ to, active, children, onClick }: { to: string; active: boolean; children: ReactNode; onClick?: () => void }) {
  return <a className={active ? 'active' : ''} href={to} onClick={(event) => {
    event.preventDefault()
    navigate(to)
    onClick?.()
  }}>{children}</a>
}

export function AppLayout({ path, children }: { path: string; children: ReactNode }) {
  const {
    wallet,
    caseId,
    connect,
    disconnect,
    switchNetwork,
    wrongNetwork,
    error,
    notice,
    txHash,
    explorerTx,
    explorerAddress,
    live,
  } = useWearline()
  const [open, setOpen] = useState(false)
  const [walletOpen, setWalletOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const walletMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => setOpen(false), [path])
  useEffect(() => {
    if (!walletOpen) return
    const outside = (event: MouseEvent) => {
      if (walletMenuRef.current && !walletMenuRef.current.contains(event.target as Node)) setWalletOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setWalletOpen(false)
    }
    document.addEventListener('mousedown', outside)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('mousedown', outside)
      document.removeEventListener('keydown', escape)
    }
  }, [walletOpen])

  useEffect(() => {
    if (!wallet) setWalletOpen(false)
  }, [wallet])

  const href = (target: string) => routeHref(target, caseId)

  async function copyAddress() {
    if (!wallet) return
    await navigator.clipboard.writeText(wallet)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href={href('/')} onClick={(event) => {
        event.preventDefault()
        navigate(href('/'))
      }}><span className="brand-mark">W</span><span>Wearline</span></a>
      <button className="mobile-menu" aria-label="Toggle navigation" onClick={() => setOpen((value) => !value)}>{open ? <X/> : <Menu/>}</button>
      <nav className={`nav-links ${open ? 'open' : ''}`}>
        <NavLink to={href('/')} active={path === '/'} onClick={() => setOpen(false)}>Home</NavLink>
        <NavLink to={href('/case')} active={path === '/case'} onClick={() => setOpen(false)}>Case</NavLink>
        <NavLink to={href('/evidence')} active={path === '/evidence'} onClick={() => setOpen(false)}>Evidence</NavLink>
        <NavLink to={href('/report')} active={path === '/report'} onClick={() => setOpen(false)}>Report</NavLink>
        <a href="https://github.com/BeatyXO/Wearline-" target="_blank" rel="noreferrer">GitHub</a>
      </nav>
      <div className="wallet-control" ref={walletMenuRef}>
        <button
          className={`wallet-button ${wrongNetwork ? 'wrong-network' : ''}`}
          aria-haspopup={wallet ? 'menu' : undefined}
          aria-expanded={wallet ? walletOpen : undefined}
          onClick={() => wallet ? setWalletOpen((value) => !value) : void connect()}
        >
          <Wallet size={17}/>{wallet ? shortAddress(wallet) : 'Connect wallet'}
          {wallet && wrongNetwork && <span className="network-dot" aria-label="Wrong network"/>}
        </button>
        {wallet && walletOpen && <div className="wallet-popover" role="menu">
          <div className="wallet-popover-address"><span>Connected wallet</span><code>{shortAddress(wallet)}</code></div>
          <button role="menuitem" onClick={() => void copyAddress()}>{copied ? <Check size={16}/> : <Copy size={16}/>}<span>{copied ? 'Copied' : 'Copy address'}</span></button>
          <button role="menuitem" onClick={() => { setWalletOpen(false); void disconnect() }}><LogOut size={16}/><span>Disconnect</span></button>
        </div>}
      </div>
    </header>

    {(wrongNetwork || error || notice || txHash) && <div className={`notice-bar ${error ? 'error' : ''} ${wrongNetwork ? 'network-warning' : ''}`} role="status">
      <span>{error || (wrongNetwork ? 'Wallet connected on another network. GenLayer StudioNet 61999 is required.' : notice)}</span>
      {wrongNetwork && <button className="notice-action" onClick={() => void switchNetwork()}><Network size={15}/>Switch to StudioNet</button>}
      {txHash && <a href={explorerTx} target="_blank" rel="noreferrer">View transaction {shortAddress(txHash)} ↗</a>}
    </div>}

    <main>{children}</main>
    <footer className="footer section-pad">
      <div className="brand"><span className="brand-mark">W</span><span>Wearline</span></div>
      <p>GenLayer StudioNet · chain 61999 · one Intelligent Contract</p>
      {live && explorerAddress
        ? <a href={explorerAddress} target="_blank" rel="noreferrer">Contract explorer ↗</a>
        : <span className="pending-contract">Contract address pending deployment</span>}
    </footer>
  </div>
}
