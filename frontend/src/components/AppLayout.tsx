import { ReactNode, useEffect, useState } from 'react'
import { Menu, Wallet, X } from 'lucide-react'
import { shortAddress } from '../lib/genlayer'
import { useWearline } from '../context/WearlineContext'

export function routeHref(path:string,id:string){return id?`${path}?id=${encodeURIComponent(id)}`:path}
export function navigate(path:string){window.history.pushState({},'',path);window.dispatchEvent(new PopStateEvent('popstate'))}

function NavLink({to,active,children,onClick}:{to:string;active:boolean;children:ReactNode;onClick?:()=>void}){
  return <a className={active?'active':''} href={to} onClick={e=>{e.preventDefault();navigate(to);onClick?.()}}>{children}</a>
}

export function AppLayout({path,children}:{path:string;children:ReactNode}){
  const {wallet,agreementId,connect,error,notice,txHash,explorerTx,explorerAddress}=useWearline()
  const [open,setOpen]=useState(false)
  useEffect(()=>setOpen(false),[path])
  const href=(p:string)=>routeHref(p,agreementId)
  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href={href('/')} onClick={e=>{e.preventDefault();navigate(href('/'))}}><span className="brand-mark">W</span><span>Wearline</span></a>
      <button className="mobile-menu" aria-label="Toggle navigation" onClick={()=>setOpen(v=>!v)}>{open?<X/>:<Menu/>}</button>
      <nav className={`nav-links ${open?'open':''}`}>
        <NavLink to={href('/')} active={path==='/' } onClick={()=>setOpen(false)}>Home</NavLink>
        <NavLink to={href('/agreement')} active={path==='/agreement'} onClick={()=>setOpen(false)}>Agreement</NavLink>
        <NavLink to={href('/evidence')} active={path==='/evidence'} onClick={()=>setOpen(false)}>Evidence</NavLink>
        <NavLink to={href('/settlement')} active={path==='/settlement'} onClick={()=>setOpen(false)}>Settlement</NavLink>
        <a href="https://github.com/BeatyXO/Wearline-" target="_blank" rel="noreferrer">GitHub</a>
      </nav>
      <button className="wallet-button" onClick={()=>void connect()}><Wallet size={17}/>{wallet?shortAddress(wallet):'Connect wallet'}</button>
    </header>
    {(error||notice||txHash)&&<div className={`notice-bar ${error?'error':''}`} role="status">{error||notice}{txHash&&<a href={explorerTx} target="_blank" rel="noreferrer">View transaction {shortAddress(txHash)} ↗</a>}</div>}
    <main>{children}</main>
    <footer className="footer section-pad"><div className="brand"><span className="brand-mark">W</span><span>Wearline</span></div><p>GenLayer StudioNet · chain 61999 · one Intelligent Contract</p><a href={explorerAddress} target="_blank" rel="noreferrer">Contract explorer ↗</a></footer>
  </div>
}
